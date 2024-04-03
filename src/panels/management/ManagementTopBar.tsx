import { useDispatch, useSelector } from 'react-redux';
import '../TopBar.css';
import { RootState } from '../../app/store';
import { toggleSettings } from '../../features/settings/settingsSlice';

function ManagementTopBar() {
    const network = useSelector((state: RootState) => state.settings.network)
    const dispatch = useDispatch()

    const displayNetwork = network === 'Custom' ? 'Emulator' : network
    return (
        <div className='top-bar management-top-bar'>
            {/* <div className='top-bar-item'><strong>Network</strong>: {displayNetwork}</div> */}
            {/* <div 
                className='top-bar-item'
                onClick={() => dispatch(toggleSettings())}
            >Settings
            </div> */}

            {/* <div className='top-bar-item'><strong>Status</strong>: Not Connected</div> */}
        </div>
    )
}

export { ManagementTopBar }