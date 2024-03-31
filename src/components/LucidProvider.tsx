import { useEffect, useState, createContext, useContext, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Blockfrost, Emulator, Lucid, generateSeedPhrase } from 'lucid-cardano'
import { RootState } from '../app/store'
import { addWallet } from '../features/management/managementSlice'

interface LucidContextState {
    lucid: Lucid | null
    isLucidLoading: boolean
}

const LucidContext = createContext<LucidContextState>({
    lucid: null,
    isLucidLoading: false,
})

const genesisSeed = generateSeedPhrase()

export const LucidProvider = ({ children }: { children: React.ReactNode }) => {
    const [lucid, setLucid] = useState<Lucid | null>(null)
    const [isLucidLoading, setIsLucidLoading] = useState(false)
    const [genesisAddress, setGenesisAddress] = useState('')
    const settings = useSelector((state: RootState) => state.settings)
    const dispatch = useDispatch()

    const lucidContext = useMemo(() => {
        return { lucid, isLucidLoading }
    }, [lucid, isLucidLoading])
    
    useEffect(() => {
        setIsLucidLoading(true)

        Lucid.new(undefined, 'Custom')
            .then(lucidInstance => {
                lucidInstance.selectWalletFromSeed(genesisSeed)
                return lucidInstance.wallet.address()
            })
            .then((address) => {
                setGenesisAddress(address)
            })
    }, [])

    useEffect(() => {
        if (!genesisAddress && settings.providerConfig.kind === "emulator") {
            return
        }

        const initializeLucid = async () => {
            setIsLucidLoading(true)

            const network = settings.providerConfig.kind === "emulator" ? "Custom" : settings.network

            let lucidInstance
            if (settings.providerConfig.kind === "emulator") {
                const emulator = new Emulator([{
                    address: genesisAddress,
                    assets: {
                        lovelace: 20000000000n
                    }
                }])

                lucidInstance = await Lucid.new(emulator, network)
            } else if (settings.providerConfig.kind === 'blockfrost') {
                lucidInstance = await Lucid.new(new Blockfrost(settings.providerConfig.url, settings.providerConfig.apiKey))
            } else {
                throw Error('not implemented')
            }

            if (!lucidInstance) {
                throw Error ('could not create lucid')
            }

            return lucidInstance
        }

        initializeLucid()
            .then(instance => {
                if (settings.providerConfig.kind === 'emulator') {
                    dispatch(addWallet({
                        address: genesisAddress,
                        seed: genesisSeed
                    }))
                }
                setLucid(instance!!)
                setIsLucidLoading(false)
            })
            .catch(err => {
                setIsLucidLoading(false)
                console.log('Unexpected problem with lucid...')
                console.error(err)
            })
        return
    }, [genesisAddress, settings.network, settings.providerConfig])

    return (
        <LucidContext.Provider value={lucidContext}>
            {children}
        </LucidContext.Provider>
    )
}

export function useLucid() {
    return useContext(LucidContext)
}