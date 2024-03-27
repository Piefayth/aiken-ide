import { useDispatch, useSelector } from "react-redux"
import { UtxoSelector } from "./UtxoSelector"
import { RootState } from "../../../app/store"
import { removeSpend } from "../../../features/management/transactSlice"
import { shortenAddress } from "../../../util/strings"

function Spends() {
    const spends = useSelector((state: RootState) => state.transact.spends)
    const dispatch = useDispatch()

    return (
        <div className='transact-section'>
            <div className='transact-spend-header'>UTxO Selection</div>
            <div className='transact-spend-message-container'>
                {
                    spends.length === 0 ?
                        <div>
                            <span style={{color: '#ff9353'}}>⚠</span> Choose at least one UTxO to spend.
                        </div> :
                        <div>
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
                                            style={{ fontSize: 12 }}
                                            onClick={() => {
                                                dispatch(removeSpend(index))
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className='transact-spend-source'>
                                    <div className='input-label'>Source</div>
                                    <div className='transact-spend-source-text'>
                                        {` ${spend.source ? (spend.source.charAt(0).toUpperCase() + spend.source.slice(1)) : 'Custom'}`}
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
            <UtxoSelector />
        </div>
    )
}

export { Spends }