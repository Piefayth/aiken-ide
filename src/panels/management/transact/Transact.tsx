import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { useLucid } from "../../../components/LucidProvider"
import './Transact.css'
import { Spends } from "./Spends"
import { Mints } from "./Mints"
import { Payments } from "./Payments"
import { Extras } from "./Extras"
import { Submit } from "./Submit"

function Transact() {
    const { isLucidLoading, lucid: lucidOrNull } = useLucid()


    if (isLucidLoading || !lucidOrNull) {
        return (
            <div>{/* Please wait... */}</div>
        )
    }

    const lucid = lucidOrNull!!


    return (
        <div className='management-content-scroll-exclusion-wrapper'>
            <div className='management-content management-section-shadow'>
                <div className='management-section-heading'>Transact</div>

                <Spends />

                <Mints />

                <Payments />

                <Extras />

                <Submit />
            </div>
        </div>
    )
}

export { Transact }