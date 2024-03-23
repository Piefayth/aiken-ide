import './ManagementPanel.css'
import { BuildResults } from "./BuildResults"
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'

function ManagementPanel() {
    const management = useSelector((state: RootState) => state.management)

    const selectedComponent = (() => {
        if (management.selectedTabIndex == 0) {
            return <BuildResults />
        } else {
            return <></>
        }
    })()

    return (
        selectedComponent
    )
}


export { ManagementPanel }