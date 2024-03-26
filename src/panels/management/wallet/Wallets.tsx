import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Wallet.css'
import { WalletComponent } from "./Wallet"

function Wallets() {
    const { lucid: lucidOrUndefined} = useLucid()
    const wallets = useSelector((state: RootState) => state.management.wallets)


    const lucid = lucidOrUndefined!!

    return (
        <div className='wallets-content'>
            <div className="management-section-heading"><strong>Wallets</strong></div>

            {
                wallets.map(wallet => {
                    return <WalletComponent key={wallet.address} wallet={wallet} lucid={lucid} />
                })
            }
        </div>
    )
}

export { Wallets }