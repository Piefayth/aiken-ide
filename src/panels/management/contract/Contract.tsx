import { useDispatch, useSelector } from "react-redux"
import Copy from "../../../components/Copy"
import { Contract, removeContract } from "../../../features/management/managementSlice"
import { shortenAddress } from "../../../util/strings"
import { useState } from "react"
import { Assets } from "lucid-cardano"
import { sumAssets } from "../../../util/utxo"
import JsonPopup from "../../../components/JsonPopup"
import { Utxos } from "../Utxos"
import { RootState } from "../../../app/store"

type ContractViewParams = {
    contract: Contract
}

function ContractView({ contract }: ContractViewParams) {
    const dispatch = useDispatch()
    const [isExpanded, setIsExpanded] = useState(false)
    const [balances, setBalances] = useState<Assets>({})
    const network = useSelector((state: RootState) => state.settings.network)

    return (
        <div
            key={`${contract.name}${contract.version}`}
            className={`contract-container ${isExpanded ? '' : 'contract-container-collapsed'}`}
        >
            <div className='contract-header'>
                <div className='flex-row'>
                    <div className='contract-name'>
                        {contract.name} <span className='contract-version'>v{contract.version}</span>
                    </div>

                </div>
                <div
                    className='expand'
                    onClick={() => {
                        setIsExpanded(!isExpanded)
                    }}
                >
                    <div className='expand-words'>
                        {`${isExpanded ? 'Collapse' : 'Expand'}`}
                    </div>
                    <div className='expand-icon'>
                        {`${isExpanded ? '▼' : '◀'}`}
                    </div>
                </div>
            </div>

            {
                isExpanded ? (
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
                                <div className='contract-params'>
                                    <div className='contract-params-label'>Address</div>
                                    <div className='contract-params-content'>
                                        <span>{shortenAddress(contract.address)}<Copy value={contract.address} /></span>
                                    </div>
                                </div>
                            </div>
                            <div className='contract-data-holder'>
                                <div className='contract-params'>
                                    <div className='contract-params-label'>Balance</div>
                                    <div className='contract-params-content'>
                                        <span>{network === 'Mainnet' ? null : 't'}₳ {balances['lovelace'] ? (Number(balances['lovelace']) / 1000000).toFixed(6) : 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='contract-params params-label-container'>
                                <div className={`show-params-text ${contract.paramsFileName !== 'None' ? 'underline' : ''}`}>
                                    {
                                        contract.paramsFileName !== 'None' ?
                                            contract.script.type === 'Native' ? <JsonPopup jsonString={contract.paramsContent}>Show Script</JsonPopup> : <JsonPopup jsonString={contract.paramsContent}>Show Params</JsonPopup>
                                            : 'No params'
                                    }
                                </div>
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
                                <Utxos 
                                    address={contract.address} 
                                    onUtxoUpdate={(utxos) => {
                                        const balances = sumAssets(utxos.map(utxo => utxo.assets))
                                        setBalances(balances)
                                    }}
                                    source='contract'
                                />
                            }
                        </div>
                    </div>
                ) : null
            }


        </div>
    )
}


export { ContractView }