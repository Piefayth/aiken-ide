import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Wallet.css'
import { WalletComponent } from "./Wallet"
import { addWallet } from "../../../features/management/managementSlice"
import { generateSeedPhrase } from "lucid-cardano"

function Wallets() {
    const { lucid: lucidOrUndefined} = useLucid()
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const dispatch = useDispatch()


    const lucid = lucidOrUndefined!!

    return (
        <div className='wallets-content'>
            <div className="management-section-heading"><strong>Wallets</strong></div>
                <button
                    className='button add-wallet-button'
                    onClick={() => {
                        const seed = generateSeedPhrase()
                        lucid.selectWalletFromSeed(seed)
                        lucid.wallet.address()
                            .then(address => {
                                dispatch(addWallet({ seed, address }))
                            })
                    }}
                >Generate New Wallet</button>
            {
                wallets.map(wallet => {
                    return <WalletComponent key={wallet.address} wallet={wallet} lucid={lucid} />
                })
            }
        </div>
    )
}

export { Wallets }