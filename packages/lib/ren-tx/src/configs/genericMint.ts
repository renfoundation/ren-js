/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Improve typings.

import RenJS from "@renproject/ren";
import BigNumber from "bignumber.js";
import { Actor, assign, MachineOptions, Receiver, Sender, spawn } from "xstate";

import { depositMachine, DepositMachineContext } from "../machines/deposit";
import { GatewayMachineContext } from "../machines/mint";
import { GatewaySession, GatewayTransaction } from "../types/transaction";

/*
  Sample mintChainMap / lockChainMap implementations
  We don't implement these to prevent mandating specific chains

const mintChainMap: {
    [key in string]: (c: GatewayMachineContext) => MintChain<any>;
} = {
    binanceSmartChain: (context: GatewayMachineContext) => {
        const { destAddress, destNetwork } = context.tx;
        const { providers } = context;
        return new BinanceSmartChain(providers[destNetwork]).Account({
            address: destAddress,
        }) as MintChain<any>;
    },
    ethereum: (context: GatewayMachineContext): MintChain => {
        const { destAddress, destNetwork } = context.tx;
        const { providers } = context;

        return Ethereum(providers[destNetwork]).Account({
            address: destAddress,
        }) as MintChain<any>;
    },
};

const lockChainMap = {
    bitcoin: () => Bitcoin(),
    zcash: () => Zcash(),
    bitcoinCash: () => BitcoinCash(),
};
*/

export const renLockAndMint = async (context: GatewayMachineContext) => {
    const { nonce, destChain, sourceChain, sourceAsset } = context.tx;
    const { sdk, fromChainMap, toChainMap } = context;

    const mint = await sdk.lockAndMint({
        asset: sourceAsset.toUpperCase(),
        from: fromChainMap[sourceChain](context),
        to: toChainMap[destChain](context),
        nonce,
    });

    return mint;
};

// Format a transaction and get the gateway address
const txCreator = async (context: GatewayMachineContext) => {
    // TX may be in a state where the gateway address was provided,
    // but no deposit was picked up
    if (!context.tx.nonce) {
        context.tx.nonce = RenJS.utils.randomNonce().toString("hex");
    }

    const { targetAmount, sourceAsset, sourceChain, destChain } = context.tx;

    const to = context.toChainMap[destChain](context);
    const from = context.fromChainMap[sourceChain](context);

    const decimals = await from.assetDecimals(sourceAsset.toUpperCase());

    let suggestedAmount = new BigNumber(targetAmount).times(
        new BigNumber(10).exponentiatedBy(decimals),
    );

    if (context.autoFees) {
        // This will throw and be caught by the machine if we fail to get fees
        // If the user specifies that they want to have fees added,
        // we should not silently fail, as they will be prompted to deposit
        // an incorrect amount

        const fees = await context.sdk.getFees({
            asset: sourceAsset.toUpperCase(),
            from,
            to,
        });

        suggestedAmount = suggestedAmount
            .plus(fees.lock || 0)
            .plus(suggestedAmount.multipliedBy(fees.mint * 0.001));
    }

    const minter = await renLockAndMint(context);
    const gatewayAddress = minter?.gatewayAddress;
    const newTx: GatewaySession = {
        ...context.tx,
        suggestedAmount: suggestedAmount.decimalPlaces(0).toFixed(),
        gatewayAddress,
    };
    return newTx;
};

// Listen for confirmations on the source chain
const depositListener = (
    context: GatewayMachineContext | DepositMachineContext,
) => (callback: Sender<any>, receive: Receiver<any>) => {
    let cleanup = () => { };

    const targetDeposit = (context as DepositMachineContext).deposit;
    let listening = false;

    renLockAndMint(context)
        .then((minter) => {
            cleanup = () => minter.removeAllListeners();

            minter.on("deposit", (deposit) => {
                // Don't register listeners multiple times
                if (targetDeposit && listening) return;
                listening = true;

                // Register event handlers prior to setup in case events land early
                // If we don't have a targetDeposit, we won't handle events
                targetDeposit &&
                    receive((event) => {
                        switch (event.type) {
                            case "SETTLE":
                                deposit
                                    .confirmed()
                                    .on("target", (confs, targetConfs) => {
                                        const confirmedTx = {
                                            sourceTxConfs: confs,
                                            sourceTxConfTarget: targetConfs,
                                        };
                                        callback({
                                            type: "CONFIRMATION",
                                            data: confirmedTx,
                                        });
                                    })
                                    .on(
                                        "confirmation",
                                        (confs, targetConfs) => {
                                            const confirmedTx = {
                                                sourceTxConfs: confs,
                                                sourceTxConfTarget: targetConfs,
                                            };
                                            callback({
                                                type: "CONFIRMATION",
                                                data: confirmedTx,
                                            });
                                        },
                                    )
                                    .then(() => {
                                        callback({
                                            type: "CONFIRMED",
                                        });
                                    })
                                    .catch(console.error);
                                break;

                            case "SIGN":
                                deposit
                                    .signed()
                                    .on("status", (state) => console.log(state))
                                    .then((v) =>
                                        v._state.queryTxResult &&
                                        v._state.queryTxResult.out &&
                                        v._state.queryTxResult.out.revert !==
                                            undefined
                                            ? callback({
                                                  type: "SIGN_ERROR",
                                                  data: new Error(
                                                      v._state.queryTxResult.out.revert,
                                                  ),
                                              })
                                            : callback({
                                                  type: "SIGNED",
                                                  data: {
                                                      renResponse:
                                                          v._state.queryTxResult
                                                              ?.out,
                                                      signature:
                                                          v._state
                                                              .queryTxResult &&
                                                          v._state.queryTxResult
                                                              .out &&
                                                          v._state.queryTxResult
                                                              .out.revert ===
                                                              undefined
                                                              ? v._state
                                                                    .queryTxResult
                                                                    .out
                                                                    .signature
                                                              : undefined,
                                                  },
                                              }),
                                    )
                                    .catch((e) => {
                                        console.error(e)
                                        // If a tx has already been minted, we will get an error at this step
                                        // We can assume that a "utxo spent" error implies that the asset has been minted
                                        callback({
                                            type: "SIGN_ERROR",
                                            data: e,
                                        });
                                    });
                                break;

                            case "MINT":
                                deposit
                                    .mint()
                                    .on(
                                        "transactionHash",
                                        (transactionHash) => {
                                            const submittedTx = {
                                                destTxHash: transactionHash,
                                            };
                                            callback({
                                                type: "SUBMITTED",
                                                data: submittedTx,
                                            });
                                        },
                                    )
                                    .catch((e) => {
                                        callback({
                                            type: "SUBMIT_ERROR",
                                            data: e,
                                        })
                                        console.error(e)
                                    });
                                break;
                        }
                    });

                const txHash = deposit.txHash();
                const persistedTx = context.tx.transactions[txHash];

                // Prevent deposit machine tx listeners from interacting with other deposits
                if (targetDeposit) {
                    if (targetDeposit.sourceTxHash !== txHash) {
                        console.error(
                            "wrong deposit:",
                            targetDeposit.sourceTxHash,
                            txHash,
                        );
                        return;
                    }
                }

                // If we don't have a sourceTxHash, we haven't seen a deposit yet
                const rawSourceTx = deposit.depositDetails;
                const depositState: GatewayTransaction = persistedTx || {
                    sourceTxHash: txHash,
                    sourceTxAmount: parseInt(rawSourceTx.amount),
                    sourceTxConfs: 0,
                    rawSourceTx,
                };

                if (!persistedTx) {
                    callback({
                        type: "DEPOSIT",
                        data: { ...depositState },
                    });
                } else {
                    callback("DETECTED");
                }
            });

            receive((event) => {
                switch (event.type) {
                    case "RESTORE":
                        minter
                            .processDeposit(event.data)
                            .then(() => { })
                            .catch((e) => {
                                console.error(e);
                            });
                        break;
                }
            });

            callback("LISTENING");
        })
        .catch(console.error);
    return () => {
        cleanup();
    };
};

// Spawn an actor that will listen for either all deposits to a gatewayAddress,
// or to a single deposit if present in the context
const listenerAction = assign<GatewayMachineContext>({
    depositListenerRef: (
        c: GatewayMachineContext | DepositMachineContext,
        _e: any,
    ) => {
        let actorName = `${c.tx.id}SessionListener`;
        const deposit = (c as DepositMachineContext).deposit;
        if (deposit) {
            actorName = `${deposit.sourceTxHash}DepositListener`;
        }
        if (c.depositListenerRef && !deposit) {
            console.warn("listener already exists");
            return c.depositListenerRef;
        }
        const cb = depositListener(c);
        return spawn(cb, actorName);
    },
});

const spawnDepositMachine = (
    machineContext: DepositMachineContext,
    name: string,
) =>
    spawn(
        depositMachine.withContext(machineContext).withConfig({
            actions: {
                listenerAction: listenerAction as any,
            },
        }),
        {
            sync: true,
            name,
        },
    ) as Actor<any>;

export const mintConfig: Partial<MachineOptions<GatewayMachineContext, any>> = {
    services: {
        txCreator,
        depositListener,
    },
    actions: {
        spawnDepositMachine: assign({
            depositMachines: (context, evt) => {
                const machines = context.depositMachines || {};
                if (machines[evt.data?.sourceTxHash] || !evt.data) {
                    return machines;
                }
                const machineContext = {
                    ...context,
                    deposit: evt.data,
                };

                // We don't want child machines to have references to siblings
                delete (machineContext as any).depositMachines;
                machines[evt.data.sourceTxHash] = spawnDepositMachine(
                    machineContext,
                    `${String(evt.data.sourceTxHash)}DepositMachine`,
                );
                return machines;
            },
        }),
        depositMachineSpawner: assign({
            depositMachines: (context, _) => {
                const machines = context.depositMachines || {};
                for (const tx of Object.entries(
                    context.tx.transactions || {},
                )) {
                    const machineContext = {
                        ...context,
                        deposit: tx[1],
                    };

                    // We don't want child machines to have references to siblings
                    delete (machineContext as any).depositMachines;
                    machines[tx[0]] = spawnDepositMachine(
                        machineContext,
                        `${machineContext.deposit.sourceTxHash}DepositMachine`,
                    );
                }
                return machines;
            },
        }),
        listenerAction: listenerAction as any,
    },
    guards: {
        isRequestCompleted: ({ signatureRequest }, evt) =>
            evt.data?.sourceTxHash === signatureRequest && evt.data.destTxHash,
        isCompleted: ({ tx }, evt) =>
            evt.data?.sourceTxAmount >= tx.targetAmount,
        isExpired: ({ tx }) => tx.expiryTime < new Date().getTime(),
        isCreated: ({ tx }) => (tx.gatewayAddress ? true : false),
    },
};
