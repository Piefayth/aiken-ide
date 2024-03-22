import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

// unused atm
function useKeybindings() {
    const dispatch = useDispatch()

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case '???':
                    break;
                default:
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [dispatch])
}

export { useKeybindings }