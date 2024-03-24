import { Emulator, Lucid, Network, generateSeedPhrase } from "lucid-cardano";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { useEffect, useState } from "react";
import { Wallet, addWallet } from "../features/management/managementSlice";

let lucidInstance: Lucid | undefined 
let genesisWallet: Wallet 

function useLucid() {
    const networkOrEmulator = useSelector((state: RootState) => state.management.network)
    const [isLucidLoading, setIsLucidLoading] = useState<boolean>(true)
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const dispatch = useDispatch()

    useEffect(() => {
        const network: Network = networkOrEmulator === "Emulator" ? "Custom" : networkOrEmulator 

        if (lucidInstance && lucidInstance.network === network) {
            setIsLucidLoading(false)
            return // nothing to change
        }

        let genesisSeed: string | undefined = undefined

        setIsLucidLoading(true)
        Lucid.new(undefined, network)
            .then(lucid => {
                lucidInstance = lucid
                if (networkOrEmulator === "Emulator" && wallets.length === 0) {
                    // need to have SOME wallet to provide the emulator provider
                    genesisSeed = generateSeedPhrase()
                    lucid.selectWalletFromSeed(genesisSeed)
                    return lucid.wallet.address()
                } else if (wallets.length === 0) {
                    lucid.selectWalletFromSeed(wallets[0].seed)
                    return lucid.wallet.address()
                } else {
                    return Promise.resolve('')
                }
            })
            .then((address) => {
                if (networkOrEmulator === "Emulator" && !genesisWallet) {
                    genesisWallet = {
                        address,
                        seed: genesisSeed!!
                    }

                    lucidInstance!!.provider = new Emulator([{
                        address: address,
                        assets: {
                            lovelace: 20000000000n
                        }
                    }])
                    if (genesisSeed && wallets.length === 0) {
                        dispatch(addWallet(genesisWallet))
                    }
                }
            })
            .finally(() => {
                setIsLucidLoading(false)
            })

        return () => {
            // cleanup?
        }

    }, [networkOrEmulator])

    return {
        isLucidLoading,
        lucid: lucidInstance
    }
}

export { useLucid }