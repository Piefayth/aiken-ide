import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Wallet.css'
import { WalletComponent } from "./Wallet"
import { addWallet } from "../../../features/management/managementSlice"
import { WalletApi, generateSeedPhrase } from "lucid-cardano"
import { useState } from "react"

const WALLET_CHOICES = ["eternl", "nami", "flint", "typhon", "yoroi", "lace", "vespr"]

const userWalletOptions = Object.keys(window.cardano)
    .filter(
        wallet => WALLET_CHOICES.includes(wallet.toLowerCase()));

function Wallets() {
    const { lucid: lucidOrUndefined } = useLucid()
    const providerKind = useSelector((state: RootState) => state.settings.providerConfig.kind)
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const [pickedWalletName, setPickedWalletName] = useState('')
    const [isEnablingWallet, setIsEnablingWallet] = useState(false)
    const dispatch = useDispatch()

    if (!pickedWalletName && userWalletOptions.length > 0) {
        setPickedWalletName(userWalletOptions[0])
    }

    const generateWalletButton = (
        <button
            className='button'
            onClick={() => {
                if (!lucidOrUndefined) {
                    return
                }
                const lucid = lucidOrUndefined!!
                const seed = generateSeedPhrase()
                lucid.selectWalletFromSeed(seed)
                lucid.wallet.address()
                    .then(address => {
                        const pkh = lucid.utils.getAddressDetails(address).paymentCredential?.hash!!
                        dispatch(addWallet({
                            seed,
                            address,
                            pkh,
                            isCurrentlyConnected: false,
                            walletVendor: null
                        }))
                    })
            }}
        >Generate New Wallet</button>
    )

    const connectWalletButton = (
        <button
            className={`button ${isEnablingWallet ? 'disabled' : ''}`}
            onClick={() => {
                if (pickedWalletName === '') {
                    console.error('No wallet selected')
                    return
                }

                const wallet = window.cardano[pickedWalletName]
                if (!wallet) {
                    console.log(pickedWalletName)
                    console.log(window.cardano)
                    console.error('Selected wallet not available in environment')
                    return
                }

                if (!lucidOrUndefined) {
                    console.error('Wallet connect attempt before loading finished')
                    return
                }

                setIsEnablingWallet(true)

                const lucid = lucidOrUndefined!!
                wallet.enable()
                    .then(api => {
                        lucid?.selectWallet(api)
                        return lucid.wallet.address()
                    })
                    .then(address => {
                        const pkh = lucid.utils.getAddressDetails(address).paymentCredential?.hash!!

                        dispatch(addWallet({
                            seed: null,
                            walletVendor: pickedWalletName,
                            address,
                            pkh,
                            isCurrentlyConnected: true
                        }))
                    })
                    .finally(() => {
                        setIsEnablingWallet(false)
                    })
            }}
        >
            Connect Wallet
        </button>
    )

    const selectWalletDropdown = (
        <select
            className='select'
            value={pickedWalletName}
            onChange={(e) => {
                setPickedWalletName(e.target.value)
            }}
        >
            {
                userWalletOptions.map(walletOption => {
                    return (
                        <option
                            value={walletOption}
                            key={walletOption}
                        >
                            {walletOption}
                        </option>
                    )
                })
            }
        </select>
    )

    return (
        <div className='wallets-content'>
            <div className="management-section-heading"><strong>Wallets</strong></div>
            <div className='wallet-buttons'>
                {
                    providerKind === 'emulator' ?
                        null :
                        selectWalletDropdown
                }
                {
                    providerKind === 'emulator' ?
                        generateWalletButton :
                        connectWalletButton
                }
            </div>
            {
                wallets.map(wallet => {
                    return <WalletComponent key={wallet.address} wallet={wallet} />
                })
            }
        </div>
    )
}

export { Wallets }