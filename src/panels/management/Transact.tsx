// import { useSelector } from "react-redux"
// import { RootState } from "../../app/store"
import { useLucid } from "../../hooks/useLucid"


function Transact() {
    const { isLucidLoading, lucid: lucidOrUndefined} = useLucid()
    //const wallets = useSelector((state: RootState) => state.management.wallets)

    if (isLucidLoading || !lucidOrUndefined) {
        return (
            <div>{/* Please wait... */ }</div>
        )
    }

    //const lucid = lucidOrUndefined!!

    return (
        <div className='transact-content'>
            TODO: everything lmao
        </div>
    )
}

export { Transact }