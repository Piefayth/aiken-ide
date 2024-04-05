import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { removeSpend } from "../../../features/management/transactSlice"
import { shortenAddress } from "../../../util/strings"
import { BetterUtxoSelector } from "./BetterUtxoSelector"
import { deserializeAssets, sumAssets } from "../../../util/utxo"
import { toText } from "lucid-cardano"

function Spends() {
    const spends = useSelector((state: RootState) => state.transact.spends)
    const dispatch = useDispatch()

    return (
        <div className='transact-section'>

            <div className='transact-spend-header'>UTxO Selection</div>

            <div className='spending-list-header'>Inputs</div>

            <div className='transact-spends-container'>
                {
                    spends.length === 0 ?
                        <div className='transact-spend-message-container'>
                            <span style={{ color: '#ff9353', marginRight: 5 }}>⚠</span> Choose at least one UTxO to spend.
                        </div> : null
                }

                {
                    spends.map((spend, index) => {
                        const spendAssets = sumAssets(spend.utxos.map(utxo => deserializeAssets(utxo.assets)))
                        return (
                            <div
                                key={spend.utxos[0].txHash + spend.utxos[0].outputIndex}
                                className='transact-spend-container'
                            >
                                <div className='transact-spend-data'>
                                    <div className='spend-data-label'>Assets</div>
                                    <div className='assets-container'>
                                        {

                                            Object.entries(spendAssets).map(([assetName, quantity]) => {
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
                                <div className='transact-spend-data'>
                                    <div className='spend-data-label'>Source</div>
                                    <div className='transact-spend-data-content'>
                                        {` ${spend.source ? (spend.source.charAt(0).toUpperCase() + spend.source.slice(1)) : 'Custom'}`}
                                        <div className='spend-data-wallet-address'>{`${shortenAddress(spend.utxos[0].address, 6, 6)}`}</div>
                                    </div>
                                </div>

                                <div className='transact-spend-data'>
                                    <div className='spend-data-label'>Redeemer</div>
                                    <div className='transact-spend-data-content'>{` ${spend.redeemerFileName || 'None'}`}</div>
                                </div>

                                <div className='spend-remove-input-container'>
                                    <button
                                        className='button danger-button'
                                        style={{ fontSize: 12 }}
                                        onClick={() => {
                                            dispatch(removeSpend(index))
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <BetterUtxoSelector />
        </div>
    )
}

export { Spends }