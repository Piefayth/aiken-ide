import { useState } from "react"
import { Wallet } from "../../../features/management/managementSlice"
import { shortenAddress } from "../../../util/strings"
import { Assets, Lucid, UTxO } from "lucid-cardano"
import Copy from "../../../components/Copy"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { Utxos } from "../Utxos"
import { sumAssets } from "../../../util/utxo"

type WalletUtxosProps = {
    wallet: Wallet
}

type UtxoProps = {
    utxo: UTxO
    className?: string
    withCopy?: boolean
}

function WalletComponent({ wallet }: WalletUtxosProps) {
    const [balances, setBalances] = useState<Assets>({})
    const network = useSelector((state: RootState) => state.settings.network)
    const shortAddress = shortenAddress(wallet.address)
    const pkh = wallet.pkh

    return (
        <div
            key={wallet.address}
            className='wallet-container'
        >
            <div
                className='wallet-address'
            >
                {shortAddress} <Copy value={wallet.address} /> {wallet.isCurrentlyConnected ? <span title='Connected'>⚡</span> : null}
            </div>
            <div className='wallet-data'>
                <div className='wallet-info'>
                    <div className='wallet-info-content'>
                        <div
                            className='wallet-pkh'
                        >
                            <div className='wallet-card-label'>
                                Payment Key Hash
                            </div>
                            <div className='wallet-card-value'>
                                {shortenAddress(pkh, 6, 6)} <Copy value={pkh} />
                            </div>
                        </div>

                        <div
                            className='wallet-balance'
                        >
                            <div className='wallet-card-label'>
                                Balance
                            </div>
                            <div className='wallet-card-value'>
                                <span>{network === 'Mainnet' ? null : 't'}₳ {balances['lovelace'] ? (Number(balances['lovelace']) / 1000000).toFixed(6) : 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    <div className='wallet-utxos-wrapper'>
                        <div className='utxos-heading'>Unspent Outputs</div>
                        <Utxos
                            address={wallet.address}
                            onUtxoUpdate={(utxos) => {
                                const balances = sumAssets(utxos.map(utxo => utxo.assets))
                                setBalances(balances)
                            }}
                            source='wallet'
                        />
                    </div>
                }
            </div>
        </div>

    )
}

export { WalletComponent }