import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { fromText, toText } from 'lucid-cardano'
import { useLucid } from "../../../components/LucidProvider"
import { shortenAddress } from "../../../util/strings"
import { useState } from "react"
import { Mint, addMint, removeMint } from "../../../features/management/transactSlice"
import { SerializableAssets } from "../../../util/utxo"

function Mints() {
    const dispatch = useDispatch()
    const contracts = useSelector((state: RootState) => state.management.contracts)
    const files = useSelector((state: RootState) => state.files.files)
    const mints = useSelector((state: RootState) => state.transact.mints)

    const [policyId, setPolicyId] = useState<string | undefined>(() => {
        if (contracts.length > 0 && mints.length === 0) {
            return contracts[0].scriptHash
        }
    })
    const [assetName, setAssetName] = useState<string>('')
    const [quantity, setQuantity] = useState<bigint>(0n)
    const [redeemerFileName, setRedeemerFileName] = useState<string>('None')
    const [addedAssets, setAddedAssets] = useState<SerializableAssets>({})

    const { isLucidLoading, lucid: _lucid } = useLucid()
    const lucid = _lucid!!  // [safety] parent wont render this if (!lucid)

    const isFormComplete = !!policyId && Object.keys(addedAssets).length > 0

    if (policyId === undefined) {
        if (contracts.length > 0) {
            setPolicyId(contracts[0].scriptHash)
        }
    }

    const redeemerChoices = files
        .filter(file => file.name.endsWith('.json'))
        .map(file => file.name)
        .concat('None')

    const isCurrentSelectionValid = quantity > 0 && assetName

    return (
        <div className='transact-section transact-section-mint'>
            <div className='transact-spend-header'>Mint</div>
            <div className='transact-spend-message-container'>
                {`Minting ${mints.length} set(s) of assets.`}
            </div>
            <div className='transact-mints-container'>
                {
                    mints.map((mint, index) => {
                        return (
                            <div
                                key={index}
                                className='transact-mint-container'
                            >
                                <div className='transact-mint-policy-and-close'>
                                    <div className='transact-mint-policy'>
                                        {shortenAddress(mint.policyId, 4, 6)}
                                    </div>
                                    <div className='transact-mint-close'>
                                        <button
                                            className='button'
                                            style={{ fontSize: 12 }}
                                            onClick={() => {
                                                dispatch(removeMint(index))
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className='transact-spend-source'>
                                        <div className='input-label'>Redeemer</div>
                                        <div className='transact-spend-source-text'>
                                            {mint.redeemerFileName}
                                        </div>
                                    </div>
                                
                                <div className='transact-mint-assets-container'>
                                            Assets:
                                </div>
                                <div className='transact-mint-body-container'>
                                    {
                                        Object.keys(mint.assets).map(assetName => {
                                            return (
                                                <div key={assetName}>
                                                    <div className='transact-mint-source'>
                                                        <div className='input-label'>{toText(assetName.substring(56))}</div>
                                                        <div className='transact-mint-source-text'>
                                                            {mint.assets[assetName]}
                                                        </div>
                                                        
                                                        </div>
                                                </div>
                                            )
                                        })
                                    }



                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className='mint-add-container'>
                <div className='mint-policy-selection-container'>
                    <div className='input-label'>Policy ID</div>
                    <select
                        className='mint-source-select'
                        value={policyId}
                        onChange={(e) => [
                            setPolicyId(e.target.value)
                        ]}
                    >
                        {
                            contracts.map(contract => {
                                return (
                                    <option
                                        key={contract.scriptHash}
                                        value={contract.scriptHash}
                                    >
                                        {shortenAddress(contract.scriptHash, 4, 6)}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>

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

                <div className='add-mint-button-container'>
                    <button
                        disabled={!isFormComplete}
                        className={`add-mint-button button ${isFormComplete ? '' : 'disabled'}`}
                        onClick={() => {
                            dispatch(addMint({
                                policyId: policyId!!, // [safety] button is disabled if policyId is u/d
                                assets: addedAssets,
                                redeemerFileName
                            }))
                            setQuantity(0n)
                            setAssetName('')
                            setRedeemerFileName('None')
                            setAddedAssets({})
                        }}
                    >Add Mint</button>
                </div>
            </div>
            <div className='payment-asset-add'>
                <div className='mint-asset-selection-container'>
                    <div className='input-label'>Asset Name</div>
                    <input
                        className='text-input'
                        type='text'
                        value={assetName}
                        onChange={(e) => {
                            setAssetName(e.target.value)
                        }}
                    />
                </div>

                <div className='selection-container'>
                    <div className='input-label'>Quantity</div>
                    <input
                        type='number'
                        className='text-input'
                        value={quantity.toString()}
                        onChange={(e) => {
                            try {
                                const value = parseInt(e.target.value)
                                setQuantity(value > 0 ? BigInt(value) : 0n)
                            } catch (e) {
                                setQuantity(0n)
                            }
                        }}
                    />
                </div>

                <div className='add-mint-button-container'>
                    <button
                        disabled={!isCurrentSelectionValid}
                        className={`add-mint-button button-secondary button ${isCurrentSelectionValid ? '' : 'disabled'}`}
                        onClick={() => {
                            const assetId = policyId + fromText(assetName)
                            if (!addedAssets[assetId]) {
                                setAddedAssets({
                                    ...addedAssets,
                                    [assetId]: quantity.toString()
                                })
                            } else {
                                setAddedAssets({
                                    ...addedAssets,
                                    [assetId]: (quantity + BigInt(addedAssets[assetId])).toString()
                                })
                            }
                        }}
                    >
                        Include Asset
                    </button>
                </div>
            </div>
            <div className='payments-added-assets-container'>
                {
                    Object.keys(addedAssets).length === 0 ?
                        (<div className='added-assets-empty'>To add a payment, add at least one asset.</div>) :
                        Object.keys(addedAssets).map((addedAsset) => {
                            return (
                                <div
                                    className='added-asset-container'
                                    key={addedAsset}
                                >
                                    <div className='added-asset-name'>{toText(addedAsset.substring(56))}</div>
                                    <div className='added-asset-quantity'>{addedAssets[addedAsset]}</div>
                                    <div
                                        className='added-asset-remove'
                                        onClick={() => {
                                            setAddedAssets(({ [addedAsset]: _, ...addedAssets }) => addedAssets)
                                        }}
                                    >❌</div>
                                </div>
                            )
                        })
                }

            </div>
        </div>
    )
}

export { Mints }