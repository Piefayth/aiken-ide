import './TopBar.css';

function ManagementTopBar() {
    return (
        <div className='top-bar management-top-bar'>
            <div className='top-bar-item'><strong>Network</strong>: Emulator</div>
            <div className='top-bar-item'><strong>Status</strong>: Not Connected</div>
        </div>
    )
}

export { ManagementTopBar }