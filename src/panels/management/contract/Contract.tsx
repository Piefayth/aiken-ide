import { useDispatch } from "react-redux"
import Copy from "../../../components/Copy"
import { Contract, removeContract } from "../../../features/management/managementSlice"
import { shortenAddress } from "../../../util/strings"
import { useEffect, useState } from "react"
import { useLucid } from "../../../components/LucidProvider"
import { Data, Lucid, UTxO, toText } from "lucid-cardano"
import { serializeAssets, sumAssets } from "../../../util/utxo"
import JsonPopup from "../../../components/JsonPopup"
import { deconstructObject } from "../../../util/data"

type ContractViewParams = {
    contract: Contract
}

function ContractView({ contract }: ContractViewParams) {
    const dispatch = useDispatch()
    const [isExpanded, setIsExpanded] = useState(false)
    const [utxos, setUtxos] = useState<UTxO[]>([])
    const [isLoadingUtxos, setIsLoadingUtxos] = useState(false)
    const [utxosError, setUtxosError] = useState('')
    const { lucid, isLucidLoading } = useLucid()

    useEffect(() => {
        if (!isExpanded) {
            return // we dont need to update utxos for closed panels
        }

        async function getContractUtxos() {
            try {
                setIsLoadingUtxos(true)
                const fetchedUtxos = await lucid!!.provider.getUtxos(contract.address)
                setUtxos(fetchedUtxos)
            } catch (e: any) {
                setUtxosError(e.message)
            } finally {
                setIsLoadingUtxos(false)
            }

        }

        getContractUtxos()
    }, [isExpanded, isLucidLoading])

    if (isLucidLoading) {
        return <></>
    }

    const loadingSpinner = <div className="contracts-loader"><div className="lds-ring"><div></div><div></div><div></div><div></div></div></div>

    const balances = sumAssets(utxos.map(utxo => utxo.assets))

    return (
        <div
            key={`${contract.name}${contract.version}`}
            className={`contract-container ${isExpanded ? '' : 'contract-container-collapsed'}`}
        >
            <div className='contract-header'>
                <div className='contract-name'>
                    {contract.name} <span className='contract-version'>v{contract.version}</span>
                </div>
                <div className='contract-address'>{shortenAddress(contract.address)}<Copy value={contract.address} /></div>
                <div
                    className='expand'
                    onClick={() => {
                        setIsExpanded(!isExpanded)
                        // if we wait until the effect runs in reaction to the expansion
                        // there will be one render with stale data of utxos
                        // so we set the loading state "prematurely" here
                        setIsLoadingUtxos(true)
                    }}
                >
                    <div className='expand-words'>
                        {`${isExpanded ? 'Collapse' : 'Expand'}`}
                    </div>
                    <div className='expand-icon'>
                        {`${isExpanded ? '▼' : '◀'}`}
                    </div>
                </div> {/* here is the arrow ↔ */}
            </div>

            {
                isExpanded && isLoadingUtxos ? loadingSpinner : null
            }
            {
                isExpanded && !isLoadingUtxos ? (
                    <div className='contract-data'>
                        <div className='contract-info'>
                            <div className='contract-data-holder'>
                                <div className='contract-params'>
                                    <div className='contract-params-label'>Script Hash</div>
                                    <div className='contract-params-content'>
                                        {shortenAddress(contract.scriptHash)} <Copy value={contract.scriptHash} />
                                    </div>
                                </div>
                            </div>

                            <div className='contract-data-holder'>
                                {/* {JSON.stringify(serializeAssets(balances), null, 2)} */}
                            </div>


                            <div className='contract-params params-label-container'>
                                <div className='contract-params-label'>Parameters</div>
                                <div className='contract-params-content'>{contract.paramsFileName}</div>
                            </div>
                            <div className='delete-contract-button-container'>

                                <button
                                    className='button danger-button'
                                    onClick={() => dispatch(removeContract({
                                        version: contract.version,
                                        name: contract.name
                                    }))}
                                >
                                    Forget Contract
                                </button>
                            </div>
                        </div>
                        <div className='contract-utxos-wrapper'>
                            <div className='utxos-heading'>Unspent Outputs</div>
                            {
                                utxos.length > 0 ? <div className='contract-utxos'>
                                    {
                                        utxos.map(utxo => {
                                            const parsedDatum = utxo.datum ? deconstructObject(Data.from(utxo.datum)) : null

                                            return (
                                                <>  
                                                    <div className='header-shrinker'>
                                                    <div
                                                        className='utxo-header'
                                                    >
                                                        {`${shortenAddress(utxo.txHash)}@${utxo.outputIndex}`}<Copy value={utxo.txHash} />
                                                    </div>
                                                    </div>
                                                    <div
                                                        className='utxo'
                                                        key={`${utxo.txHash}${utxo.outputIndex}`}
                                                    >

                                                        <div className='datum-and-script-ref'>
                                                            <div
                                                                className='datum'
                                                            >
                                                                {utxo.datum ? <JsonPopup jsonString={JSON.stringify(parsedDatum, null, 2)}><span className='datum-indicator'>Show Datum</span></JsonPopup> : <span className='no-datum-indicator'>No Datum</span>}
                                                            </div>

                                                            <div
                                                                className='script-ref'
                                                            >
                                                                {utxo.scriptRef ? <JsonPopup jsonString={utxo.scriptRef.script}><span className='datum-indicator'>Show Ref</span></JsonPopup> : <span className='no-datum-indicator'>No Reference Script</span>}
                                                            </div>
                                                        </div>
                                                        <div className='assets-header'>
                                                            Assets
                                                        </div>
                                                        <div className='assets-container'>
                                                            {
                                                                Object.entries(utxo.assets).map(([assetName, quantity]) => {
                                                                    return (
                                                                        <div className='asset'>
                                                                            <div>{assetName === 'lovelace' ? assetName : `[${shortenAddress(assetName.substring(0, 55), 4, 4)}] ${toText(assetName.substring(56))}`}</div>
                                                                            <div>{quantity.toString()}</div>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        })
                                    }
                                </div> : <span className='no-unspent-outputs'>No unspent outputs found at this address.</span>
                            }
                        </div>
                    </div>
                ) : null
            }


        </div>
    )
}


export { ContractView }