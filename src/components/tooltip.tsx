import { useSelector } from 'react-redux'
import { RootState } from '../app/store'

function Tooltip() {
    const { visible, message, position } = useSelector((state: RootState) => state.tooltip)

    if (!visible) {
        return null
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            className='tooltip'
        >
            {message}
        </div>
    )
}

export default Tooltip