import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

function Tooltip() {
    const tooltips = useSelector((state: RootState) => state.tooltip.tooltips);

    if (tooltips.length === 0) {
        return null;
    }

    return (
        <>
            {tooltips.map(({ id, message, position }) => (
                <div
                    key={id}
                    style={{
                        position: 'absolute',
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}
                    className="tooltip"
                >
                    {message}
                </div>
            ))}
        </>
    );
}

export default Tooltip;