import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { fromText, toText } from 'lucid-cardano'
import { useLucid } from "../../../components/LucidProvider"
import { shortenAddress } from "../../../util/strings"
import { useState } from "react"
import { addMint, removeMint } from "../../../features/management/transactSlice"

function Mints() {
    const dispatch = useDispatch()
    const contracts = useSelector((state: RootState) => state.management.contracts)
    const mints = useSelector((state: RootState) => state.transact.mints)

    const [policyId, setPolicyId] = useState<string | undefined>(() => {
        if (contracts.length > 0 && mints.length === 0) {
            return contracts[0].scriptHash
        }
    })
    const [assetName, setAssetName] = useState<string>('')
    const [amount, setAmount] = useState<number>(0)

    const { isLucidLoading, lucid: _lucid } = useLucid()
    const lucid = _lucid!!  // [safety] parent wont render this if (!lucid)

    const isFormComplete = !!policyId && !!assetName && !!amount

    return (
        <div className='transact-section transact-section-mint'>
            <div className='transact-spend-header'>Mint</div>
            <div className='transact-spend-message-container'>
                {`Minting ${mints.length} asset(s).`}
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


                                <div className='transact-mint-body-container'>
                                    <div className='transact-spend-source'>
                                        <div className='input-label'>Asset Name</div>
                                        <div className='transact-spend-source-text'>
                                            {toText(mint.assetName)}
                                        </div>
                                    </div>

                                    <div className='transact-spend-source'>
                                        <div className='input-label'>Amount</div>
                                        <div className='transact-spend-source-text'>
                                            {mint.amount}
                                        </div>
                                    </div>
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
                <div className='mint-quantity-selection-container'>
                    <div className='input-label'>Amount</div>
                    <input
                        className='text-input'
                        type='number'
                        value={amount}
                        onChange={(e) => {
                            try {
                                const amount = parseInt(e.target.value)
                                setAmount(amount)
                            } catch (e) {

                            }
                        }}
                    />
                </div>
                <div className='add-mint-button-container'>
                    <button
                        disabled={!isFormComplete}
                        className={`add-mint-button button ${isFormComplete ? '' : 'disabled'}`}
                        onClick={() => {
                            // TODO: Error if trying to mint the same policy + asset twice
                            dispatch(addMint({
                                policyId: policyId!!, // [safety] button is disabled if policyId is u/d
                                assetName: fromText(assetName),
                                amount
                            }))
                            setAmount(0)
                            setAssetName('')
                        }}
                    >Add Mint</button>
                </div>

            </div>

        </div>
    )
}

export { Mints }