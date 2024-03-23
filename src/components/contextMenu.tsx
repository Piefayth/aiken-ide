import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { hideContextMenu } from '../features/contextMenu/contextMenuSlice'; // Assuming you have an action to hide the context menu
import { addFile, removeFile, renameFile } from '../features/files/filesSlice';

function ContextMenu() {
    const { visible, options, position } = useSelector((state: RootState) => state.contextMenu);
    const dispatch = useDispatch();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                dispatch(hideContextMenu());
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, dispatch]);

    if (!visible) {
        return null;
    }

    return (
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            className='context-menu unselectable'
        >
            {options.map((option, index) => (
                <div
                    className='context-menu-item'
                    key={index}
                    onClick={() => {
                        switch (option.name) {
                            case 'New File':
                                dispatch(addFile())
                                break;
                            case 'Delete File':
                                dispatch(removeFile(option.data.deletedFileIndex))
                                break;
                            case 'Rename File':
                                dispatch(renameFile(option.data.renamedFileIndex))
                                break;
                        }

                        dispatch(hideContextMenu())
                    }}
                >
                    {option.name}
                </div>
            ))}
        </div>
    );
}

export { ContextMenu };