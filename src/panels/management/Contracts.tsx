import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { useLucid } from "../../hooks/useLucid"
import { AddContract } from "./AddContract"
import { removeContract } from "../../features/management/managementSlice"
import { shortenAddress } from "../../util/strings"
import Copy from "../../components/Copy"

function Contracts() {
    const { isLucidLoading, lucid: lucidOrUndefined } = useLucid()
    const contracts = useSelector((state: RootState) => state.management.contracts)

    const dispatch = useDispatch()

    if (isLucidLoading || !lucidOrUndefined) {
        return (
            <div>{ /* Please wait... */}</div>
        )
    }

    const lucid = lucidOrUndefined!!

    return (
        <div className='contracts-content'>
            <div className='contracts-heading'><strong>Contracts</strong></div>
            <AddContract />
            <div className='contracts-container'>
            {
                contracts.map(contract => {
                    const validatorAddress = lucid.utils.validatorToAddress(contract.script)
                    const scriptHash = lucid.utils.validatorToScriptHash(contract.script)

                    return (
                        <div 
                            key={`${contract.name}${contract.version}`}
                            className='contract-container'
                        >       
                                <div className='contract-header'>
                                    <div className='contract-name'>{contract.name}</div>
                                    <div className='contract-version'>Version {contract.version}</div>
                                </div>
                                
                                <div className='contract-data-holder'>
                                    <div className='contract-params'>
                                        <div className='contract-params-label'>Parameters</div>
                                        <div className='contract-params-content'>{contract.paramsFileName}</div>
                                    </div>
                                </div>

                                <div className='contract-data-holder'>
                                    <div className='contract-params'>
                                        <div className='contract-params-label'>Address</div>
                                        <div className='contract-params-content'>
                                            {shortenAddress(validatorAddress)} <Copy value={validatorAddress}/>
                                        </div>
                                    </div>
                                </div>

                                <div className='contract-data-holder'>
                                    <div className='contract-params'>
                                        <div className='contract-params-label'>Script Hash</div>
                                        <div className='contract-params-content'>
                                            {shortenAddress(scriptHash)} <Copy value={scriptHash}/>
                                        </div>
                                    </div>
                                </div>
 
                                <div className='delete-contract-button-container'>
                                    <button 
                                        className='delete-contract-button'
                                        onClick={() => dispatch(removeContract({
                                            version: contract.version,
                                            name: contract.name
                                        }))}    
                                    >
                                        Delete
                                    </button>
                                </div>
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}

export { Contracts }