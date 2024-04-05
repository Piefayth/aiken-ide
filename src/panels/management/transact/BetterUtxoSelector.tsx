import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import React, { useEffect, useRef, useState } from "react"
import { shortenAddress } from "../../../util/strings"
import { UTxO, WalletApi } from "lucid-cardano"
import { constructObject } from "../../../util/data"
import { Spend, addSpend, clearAddSpendError, setAddSpendError } from "../../../features/management/transactSlice"
import { useTooltip } from "../../../hooks/useTooltip"
import { deserializeUtxos, serializeUtxos } from "../../../util/utxo"
import {  Utxos } from "../Utxos"

export type UtxoSource = 'wallet' | 'contract' | 'custom'

function BetterUtxoSelector() {
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const contracts = useSelector((state: RootState) => state.management.contracts)
    const files = useSelector((state: RootState) => state.files.files)
    const addSpendError = useSelector((state: RootState) => state.transact.addSpendError)
    const spends = useSelector((state: RootState) => state.transact.spends)
    const [selectedUtxos, setSelectedUtxos] = useState<UTxO[]>([])
    const [redeemerFileName, setRedeemerFileName] = useState<string>('None')
    const dispatch = useDispatch()
    const buttonRef = useRef<HTMLButtonElement>(null)

    useTooltip(addSpendError || '', buttonRef, { x: 0, y: 0}, () => dispatch(clearAddSpendError()))
    const { isLucidLoading, lucid: lucidOrNull } = useLucid()

    const [utxoSource, setUtxoSource] = useState<UtxoSource>((() => {
        if (wallets.length > 0) {
            return 'wallet' as UtxoSource
        } else if (contracts.length > 0) {
            return 'contract' as UtxoSource
        } else {
            return 'wallet' as UtxoSource
        }
    })())

    const [sourceAddress, setSourceAddress] = useState<string>((() => {
        if (utxoSource === 'wallet' && wallets.length) {
            return wallets.find(wallet => wallet.isCurrentlyConnected)?.address || wallets[0].address
        } else if (utxoSource === 'contract' && contracts.length) {
            return contracts[0].address
        } else {
            return ''
        }
    })())

    const usedUtxos = spends.reduce((acc: UTxO[], spend: Spend) => {
        return acc.concat(deserializeUtxos(spend.utxos))
    }, [])

    if (utxoSource === 'wallet' && wallets.length === 0 && contracts.length > 0) {
        setUtxoSource('contract')
    }

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
            className='select'
            value={sourceAddress}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
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

    return isLucidLoading ? <div>Loading lol</div> : (
        <div className='utxo-selection-container'>
            <div className='utxo-selection-container-options'>
                <div className='utxo-source-selection-container'>
                    <div className='input-label'>Source</div>
                    <select
                        className='select'
                        value={utxoSource}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            setUtxoSource(e.target.value as UtxoSource)
                            setRedeemerFileName('None')
                            setSelectedUtxos([])

                            if (e.target.value === 'wallet' && wallets.length > 0) {
                                setSourceAddress(wallets[0].address)
                            } else if (e.target.value === 'contract' && contracts.length > 0) {
                                setSourceAddress(contracts[0].address)
                            } else {
                                setSourceAddress('')
                            }
                        }}
                    >
                        <option value='wallet'>Wallet</option>
                        <option value='contract'>Contract</option>
                    </select>
                </div>

                <div className='utxo-address-selection-container'>
                    <div className='input-label'>Address</div>
                    { addressDropdownInput }
                </div>

                {
                    utxoSource === 'wallet' ? null :
                        <div className='utxo-redeemer-selection-container'>
                            <div className='input-label'>Redeemer</div>
                            <select
                                className='select'
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
                <Utxos 
                    address={sourceAddress}
                    source={utxoSource} 
                    selectable 
                    onSelectedUtxosUpdate={(utxos) => {
                        setSelectedUtxos(utxos)
                    }}
                    selectedUtxos={selectedUtxos}
                    excludeUtxos={usedUtxos}
                />
            </div>
        </div>
    )
}


export { BetterUtxoSelector }