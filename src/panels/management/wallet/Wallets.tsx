import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../hooks/useLucid"
import { WalletUtxos } from "./WalletUtxos"
import './Wallet.css'

function Wallets() {
    const { lucid: lucidOrUndefined} = useLucid()
    const wallets = useSelector((state: RootState) => state.management.wallets)


    const lucid = lucidOrUndefined!!

    return (
        <div className='wallets-content'>
            <div className="build-results-heading"><strong>Wallets</strong></div>

            {
                wallets.map(wallet => {
                    return <WalletUtxos key={wallet.address} wallet={wallet} lucid={lucid} />
                })
            }
        </div>
    )
}

export { Wallets }