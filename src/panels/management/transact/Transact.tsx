import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Transact.css'
import { useState } from "react"
import { UtxoSelector } from "./UtxoSelector"


function Transact() {
    const { isLucidLoading, lucid: lucidOrNull } = useLucid()


    if (isLucidLoading || !lucidOrNull) {
        return (
            <div>{/* Please wait... */}</div>
        )
    }

    const lucid = lucidOrNull!!


    return (
        <div className='transact-content'>
            <div className='management-section-heading'><strong>Transact</strong></div>
            <div className='transact-spend-section'>
                <div className='transact-spend-header'>Spend</div>
                    {
                        // select should have a list of know naddresses
                        // which is both wallets and contracts

                    }
                        <UtxoSelector onAddSpend={(selectedUtxos) => {
                            console.log(selectedUtxos)
                        }}/>

                    {
                        // in the emulator we can get contract utxos trivially
                        // but it is different in network
                        // paste in manually needs to work, in case they dont have a kupo
                        // we could link the contract on cardano scan LMAO
                        // um but notably that means we need to handle the wallet utxos differently
                        // so that you can still get them if you are not wired into network
                    }
                </div>
            </div>
            // {
                // can have multiples of ANYTHING from this section
                // what is the unified ui for multiples? 

                // utxo selection from account or known contract
                // with, potentially, a redeemer
                // selection from a known contract automagically attaches the contract

                // payment to address
                // with assets, potentially datum
                // one day, payment to a contract address could validate the datum...

                // mint assets
                // select contract from dropdown
                // then provide assetid
                // we will automatically attach the minting policy

                // additional signatures from a known wallet
            // }
    )
}

export { Transact }