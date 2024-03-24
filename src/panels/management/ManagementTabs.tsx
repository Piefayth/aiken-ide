import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { TAB_NAMES, selectTab } from "../../features/management/managementSlice"

function ManagementTabs() {
    const management = useSelector((state: RootState) => state.management)
    const dispatch = useDispatch()

    return (
        <div
            className='management-tab-container'
        >
            {
                TAB_NAMES.map((name, index) => {
                    const focusedTabClass = management.selectedTabIndex === index ? 'highlight-focused-management-tab' : ''
                    return (
                        <div
                            key={index}
                            className={`management-tab ${focusedTabClass} unselectable`}
                            onClick={() => {
                                dispatch(selectTab(index))
                            }}
                        >
                            {name}
                        </div>
                    )
                })
            }
        </div>
    )
}

export { ManagementTabs }