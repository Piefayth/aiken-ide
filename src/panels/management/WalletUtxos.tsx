import { useEffect, useState } from "react"
import { Wallet } from "../../features/management/managementSlice"
import { shortenAddress } from "../../util/strings"
import { Lucid, UTxO } from "lucid-cardano"
import Copy from "../../components/Copy"

type WalletUtxosProps = {
    wallet: Wallet
    lucid: Lucid
}

type UtxoProps = {
    utxo: UTxO
}

function Utxo({ utxo }: UtxoProps) {
    return (
        <div className='utxo-container'>
            <div>
                {`${shortenAddress(utxo.txHash, 5, 5)}@${utxo.outputIndex}`} <Copy value={utxo.txHash}/>
            </div>
            <div>
                {
                    Object.keys(utxo.assets).map(asset => {
                        return (
                            <div key={asset} className='asset-container'>
                                <div className='asset-label'>{asset}: </div>
                                <div className='asset-value'>{utxo.assets[asset].toString()}</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function WalletUtxos({ wallet, lucid }: WalletUtxosProps) {
    const [utxos, setUtxos] = useState<UTxO[] | undefined>(undefined)
    const [utxoError, setUtxoError] = useState<string | undefined>(undefined)

    useEffect(() => {
        lucid.provider.getUtxos(wallet.address)
            .then(utxos => {
                setUtxos(utxos)
            })
            .catch((e: any) => {
                setUtxoError(e.message) // what type is e actually tho
            })
    }, [wallet])

    const shortAddress = shortenAddress(wallet.address)

    return (
        <div
            key={wallet.address}
            className='wallet-utxos-container'
        >
            <div
                className='wallet-utxos-address'
            >
                {shortAddress} <Copy value={wallet.address} />
            </div>
            {
                utxoError === undefined ?
                    (
                        <div
                            className='wallet-utxos'
                        >
                            {
                                utxos?.map(utxo => {
                                    return <Utxo key={utxo.txHash + utxo.outputIndex} utxo={utxo}/>
                                })
                            }
                        </div>
                    ) :
                    <div>utxoError</div>
            }
        </div>

    )
}

export { WalletUtxos }