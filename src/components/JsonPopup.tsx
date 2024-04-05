import { useState, useRef, useEffect } from "react"

type JsonPopupProps = {
    children: React.ReactNode
    jsonString: string
}

function JsonPopup({ children, jsonString }: JsonPopupProps) {
    const [isHovering, setIsHovering] = useState(false)
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
    const triggerElementRef = useRef<HTMLDivElement>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isHovering && triggerElementRef.current && popupRef.current) {
            const triggerRect = triggerElementRef.current.getBoundingClientRect()
            const popupRect = popupRef.current.getBoundingClientRect()
            setPopupPosition({
                top: triggerRect.top - popupRect.height / 2,
                left: triggerRect.left - popupRect.width / 2
            })
        }
    }, [isHovering])

    const popupStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 100,
        maxHeight: '40vh',
        maxWidth: '40vw',
        overflow: 'auto',
        padding: '10px',
        display: isHovering ? 'block' : 'none',
        top: `${popupPosition.top}px`,
        left: `${popupPosition.left}px`
    }

    return (
        <div ref={triggerElementRef} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            {children}
            <div className='data-popup' ref={popupRef} style={popupStyle} onMouseLeave={() => setIsHovering(false)}>
                <pre>{jsonString}</pre>
            </div>
        </div>
    )
}

export default JsonPopup
