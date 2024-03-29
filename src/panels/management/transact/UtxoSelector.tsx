import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import React, { useEffect, useRef, useState } from "react"
import { shortenAddress } from "../../../util/strings"
import { Emulator, UTxO } from "lucid-cardano"
import { Utxo } from "../wallet/Wallet"
import { constructObject } from "../../../util/data"
import { Spend, addSpend, clearAddSpendError, setAddSpendError } from "../../../features/management/transactSlice"
import { useTooltip } from "../../../hooks/useTooltip"
import { SerializableUTxO, serializeUtxos } from "../../../util/utxo"

export type UtxoSource = 'wallet' | 'contract' | 'custom'

function UtxoSelector() {
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const contracts = useSelector((state: RootState) => state.management.contracts)
    const files = useSelector((state: RootState) => state.files.files)
    const addSpendError = useSelector((state: RootState) => state.transact.addSpendError)
    const spends = useSelector((state: RootState) => state.transact.spends)
    const numTransactions = useSelector((state: RootState) => state.transact.transactionHistory).length
    const [selectedUtxos, setSelectedUtxos] = useState<UTxO[]>([])
    const [redeemerFileName, setRedeemerFileName] = useState<string>('None')
    const dispatch = useDispatch()
    const buttonRef = useRef<HTMLButtonElement>(null)

    useTooltip(addSpendError || '', buttonRef, { x: 0, y: 0}, () => dispatch(clearAddSpendError()))
    const { isLucidLoading, lucid: lucidOrNull } = useLucid()

    const [sourceUtxos, setSourceUtxos] = useState<UTxO[]>([])
    const [utxoSource, setUtxoSource] = useState<UtxoSource>((() => {
        if (wallets.length > 0) {
            return 'wallet' as UtxoSource
        } else if (contracts.length > 0) {
            return 'contract' as UtxoSource
        } else {
            return 'custom' as UtxoSource
        }
    })())

    const [sourceAddress, setSourceAddress] = useState<string>((() => {
        if (utxoSource === 'wallet' && wallets.length) {
            return wallets[0].address
        } else if (utxoSource === 'contract' && contracts.length) {
            return contracts[0].address
        } else {
            return ''
        }
    })())

    const usedUtxos = spends.reduce((acc: string[], spend: Spend) => {
        return acc.concat(spend.utxos.map(utxo => utxo.txHash + utxo.outputIndex))
    }, [])

    const usableUtxos = sourceUtxos.filter(sourceUtxo => {
        return !usedUtxos.includes(sourceUtxo.txHash + sourceUtxo.outputIndex)
    })
    
    useEffect(() => {   // utxo fetching for selected address
        if (isLucidLoading) {
            return
        }

        const lucid = lucidOrNull!!
        if (utxoSource === 'wallet') {
            const selectedWallet = wallets.find(wallet => wallet.address === sourceAddress)

            if (!selectedWallet) {
                return // error?
            }

            lucid.selectWalletFromSeed(selectedWallet.seed)
            lucid.wallet.getUtxos()
                .then((utxos) => {
                    setSourceUtxos(utxos)
                })
                .catch(console.error)
        } else {
            if (utxoSource === 'custom') {
                try {
                    const _addressValidityCheck = lucid.utils.getAddressDetails(sourceAddress)
                } catch (_) {
                    return // don't search when the address isn't valid
                }
            }

            lucid.provider.getUtxos(sourceAddress)
                .then(setSourceUtxos)
                .catch(console.error)
        }
    }, [isLucidLoading, utxoSource, sourceAddress, numTransactions])

    const lucid = lucidOrNull!!

    const addresses = (() => {
        if (utxoSource === 'wallet') {
            return wallets.map(wallet => wallet.address)
        } else if (utxoSource === 'contract') {
            return contracts.map(contract => contract.address)
        } else {
            return []
        }
    })()

    const redeemerChoices = files
        .filter(file => file.name.endsWith('.json'))
        .map(file => file.name)
        .concat('None')

    const addressDropdownInput = (
        <select
            className='utxo-source-select'
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const chosenWallet = wallets.find(wallet => wallet.address === e.target.value)
                if (!chosenWallet) {
                    return
                }
                setSourceAddress(e.target.value)
            }}
        >
            {
                addresses.map(address => {
                    return (
                        <option
                            value={address}
                            key={address}
                        >
                            {shortenAddress(address)}
                        </option>
                    )
                })
            }
        </select>
    )
    const addressTextInput = (
        <input
            className='address-text-input'
            type='text'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSourceAddress(e.target.value)
            }}
        />
    )

    return isLucidLoading ? <div>Loading lol</div> : (
        <div className='utxo-selection-container'>
            <div className='utxo-selection-container-options'>
                <div className='utxo-source-selection-container'>
                    <div className='input-label'>Source</div>
                    <select
                        className='utxo-source-select'
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setUtxoSource(e.target.value as UtxoSource)
                            setRedeemerFileName('None')
                            setSourceUtxos([])

                            if (e.target.value === 'wallet' && wallets.length > 0) {
                                const chosenWallet = wallets[0]
                                lucid.selectWalletFromSeed(chosenWallet.seed)
                                setSourceAddress(chosenWallet.address)
                            } else if (e.target.value === 'contract' && contracts.length > 0) {
                                setSourceAddress(contracts[0].address)
                            } else {
                                setSourceAddress('')
                            }
                        }}
                    >
                        <option value='wallet'>Wallet</option>
                        <option value='contract'>Contract</option>
                        {/* <option value='custom'>Custom</option> */}
                    </select>
                </div>

                <div className='utxo-address-selection-container'>
                    <div className='input-label'>Address</div>
                    {
                        utxoSource === 'custom' ?
                            addressTextInput :
                            addressDropdownInput
                    }
                </div>

                {
                    utxoSource === 'wallet' ? null :
                        <div className='utxo-redeemer-selection-container'>
                            <div className='input-label'>Redeemer</div>
                            <select
                                className='utxo-source-select'
                                value={redeemerFileName}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setRedeemerFileName(e.target.value)
                                }}
                            >
                                {
                                    redeemerChoices.map(redeemerFileName => {
                                        return (
                                            <option
                                                value={redeemerFileName}
                                                key={redeemerFileName}
                                            >
                                                {redeemerFileName}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                }
                <div className='utxo-selection-submit-container'>
                    <button
                        ref={buttonRef}
                        className={`selection-submit-button button ${selectedUtxos.length === 0 ? 'disabled' : ''}`}
                        disabled={selectedUtxos.length === 0}
                        onClick={() => {
                            let redeemerFile = null
                            if (redeemerFileName && redeemerFileName !== 'None') {
                                redeemerFile = files.find(file => file.name === redeemerFileName)
                                try {
                                    const redeemerJson = JSON.parse(redeemerFile!!.content)
                                    constructObject(redeemerJson)
                                } catch (e: any) {
                                    if (e.message && e.message.includes('JSON.parse')) {
                                        return dispatch(setAddSpendError(`Invalid JSON in ${redeemerFile?.name}`))
                                    } else {
                                        return dispatch(setAddSpendError(`JSON in ${redeemerFile?.name} cannot be converted to Data`))
                                    }
                                }
                            }

                            dispatch(addSpend({
                                utxos: serializeUtxos(selectedUtxos),
                                redeemerFileName: redeemerFile?.name || 'None',
                                source: utxoSource,
                            }))

                            setSelectedUtxos([])
                        }}
                    >
                        Add Spend
                    </button>
                </div>
            </div>

            <div className='utxo-utxo-selection-container'>
                {
                    usableUtxos.length === 0 ? <div style={{fontSize: '13px'}}>⚠ No unused UTxOs found at selected address.</div> : null
                }
                {
                    usableUtxos.map(utxo => {
                        const isUtxoSelected = !!selectedUtxos.find(selectedUtxo => isSameUtxo(selectedUtxo, utxo))
                        const borderClassName = isUtxoSelected ? 'selected-utxo-border' : ''
                        return (
                            <div
                                key={utxo.txHash + utxo.outputIndex}
                                className='utxo-wrapper-with-checkbox'
                            >
                                <input
                                    className='utxo-selection-checkbox'
                                    type='checkbox'
                                    checked={isUtxoSelected}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        if (event.target.checked) {
                                            setSelectedUtxos([...selectedUtxos, utxo])
                                        } else {
                                            setSelectedUtxos(selectedUtxos.filter(selectedUtxo => !isSameUtxo(utxo, selectedUtxo)))
                                        }
                                    }}
                                />
                                <Utxo className={borderClassName} key={utxo.txHash + utxo.outputIndex} utxo={utxo} withCopy={false} />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function isSameUtxo(utxo1: UTxO, utxo2: UTxO) {
    return utxo1.txHash === utxo2.txHash && utxo1.outputIndex === utxo2.outputIndex
}

export { UtxoSelector }