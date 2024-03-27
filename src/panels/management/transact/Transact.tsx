import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Transact.css'
import { Spends } from "./Spends"
import { Mints } from "./Mints"
import { Payments } from "./Payments"
import { Extras } from "./Extras"

function Transact() {
    const spends = useSelector((state: RootState) => state.transact.spends)
    const dispatch = useDispatch()

    const { isLucidLoading, lucid: lucidOrNull } = useLucid()


    if (isLucidLoading || !lucidOrNull) {
        return (
            <div>{/* Please wait... */}</div>
        )
    }

    const lucid = lucidOrNull!!
    return (
        <div className='transact-content'>
            <div className='management-section-heading'><strong>Transact</strong></div>

            <Spends />

            <Mints />

            <Payments />
            {
                // when we do the 'pay' panel
                // it should only enumerate assets that are actually in your utxos
                // and let you select those from a dropdown
            }

            <Extras />

        </div>
    )
}

export { Transact }