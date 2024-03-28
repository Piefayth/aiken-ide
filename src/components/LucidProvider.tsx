import { useEffect, useState, createContext, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Emulator, Lucid, generateSeedPhrase } from 'lucid-cardano'
import { RootState } from '../app/store'
import { Wallet, addWallet, removeWallet } from '../features/management/managementSlice'

interface LucidContextState {
    lucid: Lucid | null
    isLucidLoading: boolean
}
  
const LucidContext = createContext<LucidContextState>({
    lucid: null,
    isLucidLoading: false,
})
  
export const LucidProvider = ({ children }: { children: React.ReactNode }) => {
    const [lucid, setLucid] = useState<Lucid | null>(null)
    const [isLucidLoading, setIsLucidLoading] = useState(false)
    const [genesisWalletOrUndefined, setGenesisWallet] = useState<Wallet | undefined>(undefined)
    const lucidConfig = useSelector((state: RootState) => state.lucid)
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const dispatch = useDispatch()
    
    const areSideEffectsSafe = useRef(true) // is this really the best way to prevent duplicate effect invocations?
    
    useEffect(() => {
        let genesisWallet = genesisWalletOrUndefined
        setIsLucidLoading(true)

        const initializeLucid = async () => {
            const network = lucidConfig.network === "Emulator" ? "Custom" : lucidConfig.network
            if (lucid && lucid.network === network) {
                // eventually we need to handle provider changes here
                return 
            }
            
            let lucidInstance = await Lucid.new(undefined, network)
            
            let genesisSeed: string | undefined = undefined
            let genesisWalletAddress = ''
            if (lucidConfig.network === "Emulator" && wallets.length === 0) {
                // need to have SOME wallet to provide the emulator provider
                genesisSeed = generateSeedPhrase()
                lucidInstance.selectWalletFromSeed(genesisSeed)
                genesisWalletAddress = await lucidInstance.wallet.address()
            } else if (wallets.length > 0) {
                lucidInstance.selectWalletFromSeed(wallets[0].seed)
            }

            if (lucidConfig.network === "Emulator") {
                if (areSideEffectsSafe.current) {
                    areSideEffectsSafe.current = false
                    genesisWallet = {
                        address: genesisWalletAddress,
                        seed: genesisSeed!!
                    }

                    dispatch(addWallet(genesisWallet))
                    setGenesisWallet(genesisWallet)

                    const emulator = new Emulator([{
                        address: genesisWallet?.address || '',
                        assets: {
                            lovelace: 20000000000n
                        }
                    }])
                    lucidInstance = await Lucid.new(emulator, network)

                    setLucid(lucidInstance)
                    setIsLucidLoading(false)
                } else {
                    areSideEffectsSafe.current = true
                }
            }
        }

        initializeLucid()

        return
    }, [lucidConfig])

    return (
        <LucidContext.Provider value={{ lucid, isLucidLoading }}>
            {children}
        </LucidContext.Provider>
    )
}

export function useLucid() {
    return useContext(LucidContext)
}