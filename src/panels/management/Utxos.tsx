import { useEffect, useState } from "react"
import JsonPopup from "../../components/JsonPopup"
import { Data, UTxO, toText } from "lucid-cardano"
import { useLucid } from "../../components/LucidProvider"
import { isSameUtxo, sumAssets } from "../../util/utxo"
import { deconstructObject } from "../../util/data"
import { shortenAddress } from "../../util/strings"
import Copy from "../../components/Copy"
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { UtxoSource } from "./transact/BetterUtxoSelector"
import './Utxos.css'

type UtxosProps = {
    address: string
    source: UtxoSource
    onUtxoUpdate?: (utxos: UTxO[]) => void
    onSelectedUtxosUpdate?: (selectedUtxos: UTxO[]) => void
    selectable?: boolean
    excludeUtxos?: UTxO[]
    selectedUtxos?: UTxO[]
}

function Utxos({ address, source, selectable = false, onSelectedUtxosUpdate = () => {}, excludeUtxos = [], selectedUtxos= [], onUtxoUpdate = () => {} }: UtxosProps) {
    const wallets = useSelector((state: RootState) => state.management.wallets)
    const [utxos, setUtxos] = useState<UTxO[]>([])
    const [isLoadingUtxos, setIsLoadingUtxos] = useState(false)
    const [utxosError, setUtxosError] = useState('')
    const { lucid, isLucidLoading } = useLucid()

    useEffect(() => {
        async function getContractUtxos() {
            if (isLucidLoading) {
                return
            }

            const connectedWallet = source === 'wallet' && wallets.find(wallet => wallet.address === address && wallet.isCurrentlyConnected)

            try {
                setIsLoadingUtxos(true)
                setUtxosError('')
                
                let fetchedUtxos = undefined
                if (connectedWallet) {
                    fetchedUtxos = await lucid!!.wallet.getUtxos()
                } else {
                    fetchedUtxos = await lucid!!.provider.getUtxos(address)
                }

                onUtxoUpdate(fetchedUtxos)

                setUtxos(fetchedUtxos)
            } catch (e: any) {
                setUtxosError(e.message)
            } finally {
                setIsLoadingUtxos(false)
            }

        }

        getContractUtxos()
    }, [isLucidLoading, address])


    if (isLucidLoading) {
        return <></>
    }

    const loadingSpinner = <div className="utxo-loader">Fetching...<div className="lds-ring"><div></div><div></div><div></div><div></div></div></div>

    if (utxosError) {
        return (
            <div className='utxo-loader'>{utxosError}</div>
        )
    }

    const shownUtxos = utxos.filter(utxo => !excludeUtxos.find(excludedUtxo => isSameUtxo(excludedUtxo, utxo)))
    return (
        <div className='utxos'>
            {
                isLoadingUtxos ? loadingSpinner : shownUtxos.length > 0 ? shownUtxos.map(utxo => {
                    const parsedDatum = utxo.datum ? deconstructObject(Data.from(utxo.datum)) : null

                    return (
                        <div key={`${utxo.txHash}${utxo.outputIndex}`} className='utxo-card'>
                            <div className='header-shrinker'>
                                <div
                                    className='utxo-header'
                                >
                                    {`${shortenAddress(utxo.txHash)}@${utxo.outputIndex}`}<Copy value={utxo.txHash} />
                                </div>
                                {
                                    selectable ?
                                        <div
                                            className='utxo-select-container'
                                        >
                                            Add
                                            <input
                                                type='checkbox'
                                                checked={(selectedUtxos.find(selectedUtxo => isSameUtxo(selectedUtxo, utxo)) !== undefined)}
                                                onChange={(e) => {
                                                    const newSelection = e.target.checked ?
                                                        [...selectedUtxos, utxo] :
                                                        selectedUtxos.filter(selectedUtxo => !isSameUtxo(selectedUtxo, utxo))

                                                    onSelectedUtxosUpdate(newSelection)
                                                }}
                                            />
                                        </div> : null
                                }
                            </div>
                            <div
                                className='utxo'
                                key={`${utxo.txHash}${utxo.outputIndex}`}
                            >

                                <div className='datum-and-script-ref'>
                                    <div
                                        className='datum'
                                    >
                                        {
                                            utxo.datum ?
                                                <JsonPopup jsonString={JSON.stringify(parsedDatum, null, 2)}>
                                                    <span className='datum-indicator'>Datum</span>
                                                </JsonPopup> : '​'
                                            // <span className='no-datum-indicator'>No Datum</span>
                                        }
                                    </div>

                                    <div
                                        className='script-ref'
                                    >
                                        {
                                            utxo.scriptRef ?
                                                <JsonPopup jsonString={utxo.scriptRef.script}>
                                                    <span className='datum-indicator'>Ref</span>
                                                </JsonPopup> : null
                                            // <span className='no-datum-indicator'>No Reference Script</span>
                                        }
                                    </div>
                                </div>
                                <div className='assets-container'>
                                    {
                                        Object.entries(utxo.assets).map(([assetName, quantity]) => {
                                            return (
                                                <div key={assetName} className='asset'>
                                                    <div>{assetName === 'lovelace' ? assetName : `[${shortenAddress(assetName.substring(0, 55), 4, 4)}] ${toText(assetName.substring(56))}`}</div>
                                                    <div>{quantity.toString()}</div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }) : <div className='no-unspent-outputs'>No unspent outputs found at this address.</div>
            }
        </div>
    )
}

export { Utxos }
