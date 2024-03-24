import { useSelector } from 'react-redux';
import '../TopBar.css';
import { RootState } from '../../app/store';

function ManagementTopBar() {
    const network = useSelector((state: RootState) => state.management.network)
    return (
        <div className='top-bar management-top-bar'>
            <div className='top-bar-item'><strong>Network</strong>: {network}</div>
            {/* <div className='top-bar-item'><strong>Status</strong>: Not Connected</div> */}
        </div>
    )
}

export { ManagementTopBar }