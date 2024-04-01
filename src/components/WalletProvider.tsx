import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../app/store'
import { WalletApi } from 'lucid-cardano'
import { useLucid } from './LucidProvider'
import { addWallet, setConnectedWallet } from '../features/management/managementSlice'

interface WalletContextType {
    walletApi: WalletApi | null,
    onAccountChange: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet(): WalletContextType {
    const context = useContext(WalletContext)
    if (!context) throw new Error('useWallet must be used within a WalletProvider')
    return context
}

export function WalletProvider({ children }: React.PropsWithChildren<{}>) {
    const { lucid, isLucidLoading } = useLucid()
    const dispatch = useDispatch()
    const [walletApi, setWalletApi] = useState<WalletApi | null>(null)
    const [needsUpdated, setNeedsUpdated] = useState(false)
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const connectedWalletVendor = useSelector((state: RootState) => state.management.wallets)
        .filter(wallet => wallet.isCurrentlyConnected)
        .map(wallet => wallet.walletVendor)?.[0]

        const onAccountChange = useCallback(() => {
            setNeedsUpdated(true)
        }, [setNeedsUpdated])

        const walletContext = useMemo(() => {
            return { walletApi, onAccountChange }
        }, [walletApi, onAccountChange])


    useEffect(() => {
        async function enableWallet() {
            if (connectedWalletVendor && !walletApi) {
                const enabledWallet: WalletApi = await window.cardano[connectedWalletVendor].enable()
                setWalletApi(enabledWallet)
            }
        }

        enableWallet()
    }, [connectedWalletVendor, walletApi])

    useEffect(() => {
        const check = async () => {
            if(!needsUpdated || !lucid || !walletApi ||!connectedWalletVendor) {
               return
            }

            await window.cardano[connectedWalletVendor].enable()
            lucid.selectWallet(walletApi!!)

            const address = await lucid.wallet.address()
            const pkh = lucid.utils.getAddressDetails(address).paymentCredential?.hash!!
            const maybeExistingWallet = wallets.find(wallet => wallet.pkh === pkh)

            if (maybeExistingWallet) {
                dispatch(setConnectedWallet(pkh))
            } else {
                dispatch(addWallet({
                    address,
                    pkh,
                    seed: null,
                    isCurrentlyConnected: true,
                    walletVendor: connectedWalletVendor
                }))
            }
            
        }

        check()
    }, [needsUpdated, lucid === undefined, connectedWalletVendor, walletApi])




    return <WalletContext.Provider value={walletContext}>{children}</WalletContext.Provider>
}