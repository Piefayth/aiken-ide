import './ManagementPanel.css'
import { BuildResults } from "./BuildResults"
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { Contracts } from './Contracts'
import { Wallets } from './Wallets'
import { Transact } from './Transact'

function ManagementPanel() {
    const management = useSelector((state: RootState) => state.management)

    const selectedComponent = (() => {
        if (management.selectedTabIndex === 0) {
            return <BuildResults />
        } else if (management.selectedTabIndex === 1) {
            return <Contracts />
        } else if (management.selectedTabIndex === 2) {
            return <Wallets />
        } else if (management.selectedTabIndex === 3) {
            return <Transact />
        }
    })()

    return (
        selectedComponent
    )
}


export { ManagementPanel }