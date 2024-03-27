import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"

function Extras() {
    const wallets = useSelector((state: RootState) => state.management.wallets)

    return (
        <div className='transact-section transact-section-extra'>
            <div className='transact-spend-header'>Extras</div>
            <div className='transact-extras-container'>
                Extra signers
                {/* need list of wallet addresses */}
                <br></br>
                Validity interval
                {/* has to use real dates :( */}
                <br></br>
                Metadata
                {/* easy and free thank fuck */}
            </div>
        </div>
    )
}

export { Extras }