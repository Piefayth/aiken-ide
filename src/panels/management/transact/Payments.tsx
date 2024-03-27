import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useState } from "react"
import { SerializableAssets } from "../../../util/utxo"
import { useLucid } from "../../../components/LucidProvider"
import { Mint, Payment, addPayment, removePayment } from "../../../features/management/transactSlice"
import { toText } from "lucid-cardano"
import { shortenAddress } from "../../../util/strings"

function Payments() {
    const dispatch = useDispatch()
    const payments = useSelector((state: RootState) => state.transact.payments)
    const spends = useSelector((state: RootState) => state.transact.spends)
    const mints = useSelector((state: RootState) => state.transact.mints)
    const files = useSelector((state: RootState) => state.files.files)

    const [toAddress, setToAddress] = useState<string>('')
    const [asset, setAsset] = useState<string>('lovelace')
    const [quantity, setQuantity] = useState<bigint>(0n)
    const [datumFileName, setDatumFileName] = useState<string>('None')

    const [addedAssets, setAddedAssets] = useState<SerializableAssets>({})

    const { isLucidLoading, lucid: _lucid } = useLucid()
    const lucid = _lucid!!  // [safety] parent wont render this if (!lucid)

    const isAddressValid = (() => {
        try {
            lucid.utils.getAddressDetails(toAddress)
            return true
        } catch (_) {
            return false
        }
    })()

    const isCurrentSelectionValid = quantity > 0 && asset



    const mintAssets = mints.reduce((acc: SerializableAssets, cur: Mint) => {
        const assetName = `${cur.policyId}${cur.assetName}`

        if (acc[assetName]) {
            acc[assetName] = (BigInt(acc[assetName]) + BigInt(cur.amount)).toString()
        } else {
            acc[assetName] = cur.amount.toString()
        }

        return acc
    }, {} as SerializableAssets)

    const allSpendableAssets = spends
        .flatMap(spend => spend.utxos)
        .reduce((acc, cur) => {
            Object.entries(cur.assets).forEach(([assetName, amount]) => {
                if (acc[assetName]) {
                    acc[assetName] = (BigInt(acc[assetName]) + BigInt(amount)).toString()
                } else {
                    acc[assetName] = amount.toString()
                }
            })
            return acc
        }, mintAssets as SerializableAssets)

    const canAffordTotal = (() => {
        const totalAssetCost = payments.reduce((acc, cur) => {
            Object.keys(cur.assets).forEach(assetName => {
                if (!acc[assetName]) {
                    acc[assetName] = '0'
                }
                acc[assetName] = (BigInt(acc[assetName]) + BigInt(cur.assets[assetName])).toString();
            });
            return acc
        }, {} as SerializableAssets)

        return Object.keys(totalAssetCost).every(assetName =>
            BigInt(allSpendableAssets[assetName] || '0') >= BigInt(totalAssetCost[assetName])
        )
    })()

    const atleastOneAssetInPayment = Object.keys(addedAssets).length > 0
    const isPaymentValid = isAddressValid && atleastOneAssetInPayment

    const jsonChoices = files
        .filter(file => file.type === 'json')
        .map(file => file.name)
        .concat(['None'])

    return (
        <div className='transact-section transact-section-payment'>
            <div className='transact-spend-header'>Payment</div>
            <div className='transact-payment-message-container'>
                {
                    payments.length === 0 ?
                        <div>
                            <span style={{ color: '#ff9353' }}>⚠</span> Make at least one payment.
                        </div> :
                        <div>
                            {`Making ${payments.length} payment(s).`}
                        </div>
                }
            </div>
            <div className='transact-payment-error-container'>
                {
                    canAffordTotal ? '' : 'You cannot afford the transaction.'
                }
            </div>
            <div className='transact-payments-container'>
                {
                    payments.map((payment, index) => {
                        return (
                            <div
                                className='payment-container'
                            >

                                <div className='transact-mint-policy-and-close'>
                                    <div className='transact-mint-policy'>
                                        {shortenAddress(payment.toAddress)}
                                    </div>
                                    <div className='transact-mint-close'>
                                        <button
                                            className='button'
                                            style={{ fontSize: 12 }}
                                            onClick={() => {
                                                dispatch(removePayment(index))
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className='transact-mint-body-container'>
                                    <div className='transact-spend-source'>
                                        <div className='input-label'>Datum</div>
                                        <div className='transact-spend-source-text'>
                                            {payment.datumFileName}
                                        </div>
                                    </div>

                                    <div className='transact-spend-source'>
                                        <div className='input-label'>Assets</div>
                                        <div className='transact-spend-source-text'>
                                            {
                                                Object.keys(payment.assets)
                                                    .map(assetName => {
                                                        return (
                                                            <div>{assetName === 'lovelace' ? assetName : toText(assetName.substring(56))} ({payment.assets[assetName]})</div>
                                                        )
                                                    })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className='payment-add-container'>
                <div className='selection-container'>
                    <div className='input-label'>To Address</div>
                    <input
                        type='text'
                        className='text-input'
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                    />
                </div>

                <div className='selection-container'>
                    <div className='input-label'>Datum</div>
                    <select
                        className='select'
                        value={datumFileName}
                        onChange={(e) => setDatumFileName(e.target.value)}
                    >
                        {
                            jsonChoices.map(fileName => {
                                return (
                                    <option
                                        key={fileName}
                                        value={fileName}
                                    >
                                        {fileName}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>

                <div className='add-mint-button-container'>
                    <button
                        disabled={!isPaymentValid}
                        className={`add-mint-button button ${isPaymentValid ? '' : 'disabled'}`}
                        onClick={() => {
                            dispatch(addPayment({
                                datumFileName,
                                assets: addedAssets,
                                toAddress,
                            }))
                            setToAddress('')
                            setDatumFileName('None')
                            setAddedAssets({})
                        }}
                    >
                        Add Payment
                    </button>
                </div>

            </div>

            <div className='payment-asset-add'>
                <div className='selection-container'>
                    <div className='input-label'>Asset</div>
                    <select
                        value={asset}
                        className='select'
                        onChange={(e) => {
                            setAsset(e.target.value)
                        }}
                    >
                        {
                            Object.keys(allSpendableAssets).map(spendableAssetName => {
                                return (
                                    <option
                                        value={spendableAssetName}
                                        key={spendableAssetName}
                                    >
                                        {shortenAddress(spendableAssetName.substring(0, 55), 4, 6) + toText(spendableAssetName.substring(56))}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>

                <div className='selection-container'>
                    <div className='input-label'>Quantity</div>
                    <input
                        type='number'
                        className='text-input'
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
                            if (!addedAssets[asset]) {
                                setAddedAssets({
                                    ...addedAssets,
                                    [asset]: quantity.toString()
                                })
                            } else {
                                setAddedAssets({
                                    ...addedAssets,
                                    [asset]: (quantity + BigInt(addedAssets[asset])).toString()
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
                                    <div className='added-asset-name'>{addedAsset === 'lovelace' ? addedAsset : toText(addedAsset.substring(56))}</div>
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

export { Payments }