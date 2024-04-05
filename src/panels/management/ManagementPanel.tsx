import './ManagementPanel.css'
import { BuildResults } from "./BuildResults"
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { Contracts } from './contract/Contracts'
import { Wallets } from './wallet/Wallets'
import { Transact } from './transact/Transact'
import { Settings } from '../settings/Settings'

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
        } else if (management.selectedTabIndex === 4) {
            return <Settings />
        }
    })()

    return (
        selectedComponent
    )
}


export { ManagementPanel }