import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import { AddContract } from "./AddContract"
import { removeContract } from "../../../features/management/managementSlice"
import { shortenAddress } from "../../../util/strings"
import Copy from "../../../components/Copy"
import './Contract.css'
import { ContractView } from "./Contract"

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
                <div className='contracts-wrapper'>
                    <div className='contracts-subheading'>
                        Your Contracts
                    </div>
                    {/* 
                        what if
                        we make each contract (and wallet) very long horizontally
                        collapse most of the information
                        let the user expand them, which THEN loads the utxos
                    */}
                    <div className='contracts-container'>

                        {
                            contracts.length === 0 ?
                                <span className='add-contract-warning'>No contracts have been added to the workspace yet.<br></br> Add a contract to get started.</span> :
                                null
                        }
                        {
                            contracts.map(contract => {
                                return (
                                    <ContractView key={contract.address} contract={contract}/>
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