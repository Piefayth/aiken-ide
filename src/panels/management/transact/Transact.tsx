import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Transact.css'
import { useState } from "react"
import { UtxoSelector, UtxoSource } from "./UtxoSelector"
import { UTxO } from "lucid-cardano"
import { shortenAddress } from "../../../util/strings"
import { SerializableUTxO } from "../../../util/utxo"
import { removeSpend } from "../../../features/management/transactSlice"

export type Spend = {
    source: UtxoSource,
    redeemerFileName: string,
    utxos: SerializableUTxO[]
}

function Transact() {
    const spends = useSelector((state: RootState) => state.transact.spends)
    const dispatch = useDispatch()

    const { isLucidLoading, lucid: lucidOrNull } = useLucid()


    if (isLucidLoading || !lucidOrNull) {
        return (
            <div>{/* Please wait... */}</div>
        )
    }

    const lucid = lucidOrNull!!

    // spend sections need a delete button
    // spend sections should show the redeemer file
    // spend sections should show the address
    // spend sections should show the source type

    return (
        <div className='transact-content'>
            <div className='management-section-heading'><strong>Transact</strong></div>

            <div className='transact-spend-section'>
                <div className='transact-spend-header'>UTxO Selection</div>
                <div className='transact-spend-message-container'>
                    {
                        spends.length === 0 ?
                            <div
                                className='transact-no-spends-yet-message'
                            >
                                ⚠ Choose at least one UTxO to spend.
                            </div> :
                            <div
                                className='transact-spends-count-message'
                            >
                                {`${spends.length} spend(s) selected.`}
                            </div>
                    }
                </div>
                <div className='transact-spends-container'>
                    {
                        spends.map((spend, index) => {
                            return (
                                <div
                                    key={spend.utxos[0].txHash + spend.utxos[0].outputIndex}
                                    className='transact-spend-container'
                                >   
                                    <div className='transact-spend-address-and-close'>
                                        <div className='transact-spend-address'>
                                            {shortenAddress(spend.utxos[0].address)}
                                        </div>
                                        <div className='transact-spend-close'>
                                            <button 
                                                className='button' 
                                                style={{fontSize: 12}}
                                                onClick={() => {
                                                    dispatch(removeSpend(index))
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
 
                                    <div className='transact-spend-redeemer'>
                                        <div className='input-label'>Redeemer</div>
                                        <div className='transact-spend-redeemer-filename'>{` ${spend.redeemerFileName || 'None'}`}</div>
                                    </div>

                                    <div className='transact-spend-utxos'>
                                        <div className='input-label'>UTxOs</div>
                                        <div className='transact-spend-utxo-display'>
                                        {
                                            spend.utxos.map(spendingUtxo => {
                                                return (
                                                    <div
                                                        key={spendingUtxo.txHash + spendingUtxo.outputIndex}
                                                    >
                                                        {`${shortenAddress(spendingUtxo.txHash, 4, 6)}@${spendingUtxo.outputIndex}`}
                                                    </div>

                                                )
                                            })
                                        }
                                        </div>
                                    </div>

                                </div>
                            )
                        })
                    }
                </div>
                <UtxoSelector/>
            </div>

        </div>

    )
}

export { Transact }

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