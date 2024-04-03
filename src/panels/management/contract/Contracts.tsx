import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import { AddContract } from "./AddContract"
import { removeContract } from "../../../features/management/managementSlice"
import { shortenAddress } from "../../../util/strings"
import Copy from "../../../components/Copy"
import './Contract.css'

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
        <div className='management-content-scroll-exclusion-wrapper'>
            <div className='management-content management-section-shadow'>
                <div className='management-section-heading'>Contracts</div>
                <AddContract />
                <div className='flex-column'>
                    <div className='contracts-subheading'>
                        Your Contracts
                    </div>
                    <div className='contracts-container'>

                        {
                            contracts.length === 0 ?
                                <span className='add-contract-warning'>No contracts have been added to the workspace yet.<br></br> Add a contract to get started.</span> :
                                null
                        }
                        {
                            contracts.map(contract => {
                                return (
                                    <div
                                        key={`${contract.name}${contract.version}`}
                                        className='contract-container'
                                    >
                                        <div className='contract-header'>
                                            <div className='contract-name'>{contract.name}</div>
                                            <div className='contract-version'>Version {contract.version}</div>
                                        </div>
                                        <div className='contract-data'>

                                            <div className='contract-data-holder'>
                                                <div className='contract-params'>
                                                    <div className='contract-params-label'>Address</div>
                                                    <div className='contract-params-content'>
                                                        {shortenAddress(contract.address)} <Copy value={contract.address} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='contract-data-holder'>
                                                <div className='contract-params'>
                                                    <div className='contract-params-label'>Script Hash</div>
                                                    <div className='contract-params-content'>
                                                        {shortenAddress(contract.scriptHash)} <Copy value={contract.scriptHash} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='contract-data-holder'>

                                            </div>



                                            <div className='delete-contract-button-container'>
                                                <div className='contract-params params-label-container'>
                                                    <div className='contract-params-label'>Parameters</div>
                                                    <div className='contract-params-content'>{contract.paramsFileName}</div>
                                                </div>
                                                <button
                                                    className='button danger-button'
                                                    onClick={() => dispatch(removeContract({
                                                        version: contract.version,
                                                        name: contract.name
                                                    }))}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Contracts }

function formatUTCDate(date: Date): string {
    const day = date.getUTCDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
}