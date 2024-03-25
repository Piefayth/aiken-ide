import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { useLucid } from "../../hooks/useLucid"
import { AddContract } from "./AddContract"

function Contracts() {
    const { isLucidLoading, lucid: lucidOrUndefined } = useLucid()
    const contracts = useSelector((state: RootState) => state.management.contracts)

    // const dispatch = useDispatch()

    if (isLucidLoading || !lucidOrUndefined) {
        return (
            <div>{ /* Please wait... */}</div>
        )
    }

    // const lucid = lucidOrUndefined!!

    return (
        <div className='contracts-content'>
            <div className='contracts-heading'><strong>Contracts</strong></div>
            <AddContract />
            {
                contracts.map(contract => {
                    return (
                        <div 
                            key={`${contract.name}${contract.version}`}
                        >
                                {contract.name} v{ contract.version }
                        </div>
                    )
                })
            }
        </div>
    )
}

export { Contracts }