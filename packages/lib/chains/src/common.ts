import {
    Networks as BNetworks,
    Opcode as BOpcode,
    Script as bScript,
} from "bitcore-lib";

export const UTXOGatewayScript = (
    opcode: typeof BOpcode,
    script: typeof bScript,
    gGubKey: Buffer,
    gHash: Buffer
) => {
    return new script()
        .add(gHash)
        .add(opcode.OP_DROP)
        .add(opcode.OP_DUP)
        .add(opcode.OP_HASH160)
        .add(gGubKey)
        .add(opcode.OP_EQUALVERIFY)
        .add(opcode.OP_CHECKSIG)
        .toScriptHashOut();
};

export const createAddress = (
    networks: typeof BNetworks,
    opcode: typeof BOpcode,
    script: typeof bScript
) => (isTestnet: boolean, gPubKey: Buffer, gHash: Buffer): string => {
    return UTXOGatewayScript(opcode, script, gPubKey, gHash)
        .toAddress(isTestnet ? networks.testnet : networks.mainnet)
        .toString();
};

export const UTXOGatewayPubKeyScript = (
    networks: typeof BNetworks,
    opcode: typeof BOpcode,
    script: typeof bScript,
    isTestnet: boolean,
    gPubKey: Buffer,
    gHash: Buffer
) => {
    const gatewayScript = UTXOGatewayScript(opcode, script, gPubKey, gHash)
        .toAddress(isTestnet ? networks.testnet : networks.mainnet)
        .toBuffer()
        // Remove prefix
        .slice(1);

    const buffer = new script()
        .add(opcode.OP_HASH160)
        .add(gatewayScript)
        .add(opcode.OP_EQUAL)
        .toScriptHashOut()
        .toBuffer();

    // FIXME: The gatewayScript bytes don't seem to get set correctly.
    const offset = 2;
    for (let i = 0; i < gatewayScript.length; i++) {
        buffer[i + offset] = gatewayScript[i];
    }

    return buffer;
};

export const pubKeyScript = (
    networks: typeof BNetworks,
    opcode: typeof BOpcode,
    script: typeof bScript
) => (isTestnet: boolean, gPubKey: Buffer, gHash: Buffer) => {
    return UTXOGatewayPubKeyScript(
        networks,
        opcode,
        script,
        isTestnet,
        gPubKey,
        gHash
    );
};
