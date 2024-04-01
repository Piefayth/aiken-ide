import { useEffect, useState } from "react"
import { Wallet, addWallet, setConnectedWallet } from "../../../features/management/managementSlice"
import { shortenAddress } from "../../../util/strings"
import { Lucid, UTxO, toText } from "lucid-cardano"
import Copy from "../../../components/Copy"
import { useLucid } from "../../../components/LucidProvider"
import { useWallet } from "../../../components/WalletProvider"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"

type WalletUtxosProps = {
    wallet: Wallet
}

type UtxoProps = {
    utxo: UTxO
    className?: string
    withCopy?: boolean
}

function Utxo({ utxo, className, withCopy = true }: UtxoProps) {
    return (
        <div className={`utxo-container ${className || ''}`}>
            <div className='txid'>
                {`${shortenAddress(utxo.txHash, 5, 5)}@${utxo.outputIndex}`} <span>{withCopy ? <Copy value={utxo.txHash} /> : null}</span>
            </div>
            <div className='asset-container-container'>
                {
                    Object.keys(utxo.assets).map(asset => {
                        return (
                            <div key={asset} className='asset-container'>
                                <div className='asset-label'>{asset === 'lovelace' ? 'lovelace' : toText(asset.substring(56))} </div>
                                <div className='asset-value'>{utxo.assets[asset].toString()}</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function WalletComponent({ wallet }: WalletUtxosProps) {
    const { walletApi, onAccountChange} = useWallet()
    const [utxos, setUtxos] = useState<UTxO[] | undefined>(undefined)
    const [utxoError, setUtxoError] = useState<string | undefined>(undefined)
    const { lucid, isLucidLoading } = useLucid()

    useEffect(() => {
        if (!lucid || isLucidLoading) {
            return
        }
    
        const fetchUtxos = async () => {
            try {
                if (wallet.seed !== null) {
                    lucid.selectWalletFromSeed(wallet.seed)
                    const utxos = await lucid.wallet.getUtxos()
                    setUtxos(utxos)
                } else if (walletApi && wallet.isCurrentlyConnected) {
                    lucid.selectWallet(walletApi)
                    try {
                        const utxos = await lucid.wallet.getUtxos()
                        setUtxos(utxos)
                    } catch (e: any) {
                        if ((e.message as string).includes('account changed')) {
                            onAccountChange()
                        } else {
                            setUtxoError(e.message)
                        }
                    }
                } else if (!wallet.isCurrentlyConnected) {
                    const utxos = await lucid.provider.getUtxos(wallet.address)
                    setUtxos(utxos)
                }
            } catch (e: any) {
                setUtxoError(e.message)
            }
        }
    
        fetchUtxos()
    }, [wallet.isCurrentlyConnected, lucid, isLucidLoading, walletApi])

    if (!lucid || isLucidLoading) {
        return
    }

    const shortAddress = shortenAddress(wallet.address)
    const pkh = wallet.pkh

    return (
        <div
            key={wallet.address}
            className='wallet-utxos-container'
        >
            <div
                className='wallet-utxos-address'
            >
                {shortAddress} <Copy value={wallet.address} /> { wallet.isCurrentlyConnected ? <span title='Connected'>⚡</span> : null }
            </div>
            <div
                className='wallet-utxos-pkh'
            >
                <div className='input-label'>
                    pkh
                </div>
                <div>
                    {shortenAddress(pkh, 4, 4)} <Copy value={pkh} />
                </div>
            </div>
            {
                utxoError === undefined ?
                    (
                        <div
                            className='wallet-utxos'
                        >
                            {
                                utxos?.length ? utxos?.map(utxo => {
                                    return <Utxo key={utxo.txHash + utxo.outputIndex} utxo={utxo} />
                                }) : (<div>No UTxOs at this address.</div>)
                            }
                        </div>
                    ) :
                    <div>utxoError</div>
            }
        </div>

    )
}

export { WalletComponent, Utxo }