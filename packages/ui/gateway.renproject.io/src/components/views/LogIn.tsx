import * as React from "react";

import { Asset } from "@renproject/interfaces";

import { ReactComponent as Brave } from "../../images/brave.svg";
import { ReactComponent as Coinbase } from "../../images/coinbase.svg";
import { ReactComponent as Imtoken } from "../../images/imtoken.svg";
import { ReactComponent as Metamask } from "../../images/metamask.svg";
import { ReactComponent as Status } from "../../images/status.svg";
import { ReactComponent as Trust } from "../../images/trust.svg";
import { Container, ContainerBody, ContainerDetails } from "./Container";
import { ExternalLink } from "./ExternalLink";
import { Mini } from "./transfer-steps/Mini";

export const LogIn = ({ token, paused, wrongNetwork, correctNetwork }: { token: Asset, paused: boolean, wrongNetwork: number | undefined, correctNetwork: string }) => {
    if (paused) {
        return <Mini token={token} message="Connect Web3" />;
    }

    return <Container>
        <ContainerBody className="container--loading connect-web3">
            <div className="connect-web3--browsers">
                {/* tslint:disable: react-a11y-anchors */}
                <ExternalLink title="Metamask Web3 Browser" href="https://metamask.io/"><Metamask /></ExternalLink>
                <ExternalLink title="Coinbase Web3 Browser" href="https://wallet.coinbase.com/"><Coinbase /></ExternalLink>
                <ExternalLink title="Trust Web3 Browser" href="https://trustwallet.com/"><Trust /></ExternalLink>
                <ExternalLink title="Imtoken Web3 Browser" href="https://www.token.im/"><Imtoken /></ExternalLink>
                <ExternalLink title="Brave Web3 Browser" href="https://brave.com/"><Brave /></ExternalLink>
                <ExternalLink title="Status Web3 Browser" href="https://status.im"><Status /></ExternalLink>
                {/* tslint:enable: react-a11y-anchors */}
            </div>
            {wrongNetwork ? <>Please switch to the {correctNetwork} Ethereum network.</> : <>Connect your Ethereum Web3 wallet to continue</>}
        </ContainerBody>
    </Container>;
};
