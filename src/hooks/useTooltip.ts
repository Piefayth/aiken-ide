import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { hideTooltip, showTooltip } from '../features/tooltip/tooltipSlice'

const TOOLTIP_EXPIRE_TIME_MS = 1500

interface TooltipOffset {
    x: number
    y: number
}

let id = 0
function nextId(): string {
    id++
    return id.toString()
}

function useTooltip(message: string, elementRef: React.RefObject<HTMLElement>, offset: TooltipOffset = { x: 0, y: 0 }, onHide: () => void = () => {}): void {
    const dispatch = useDispatch()
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
    
    if (elementRef.current && !elementRef.current?.id) {
        elementRef.current.id = nextId()
    }

    useEffect(() => {
        if (!message && timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
            dispatch(hideTooltip(elementRef.current?.id || ''))
            onHide()
        } else if (message && elementRef.current) {
            if (timeoutIdRef.current !== null) {
                clearTimeout(timeoutIdRef.current)
            }

            const rect = elementRef.current.getBoundingClientRect()
            
            dispatch(showTooltip({
                id: elementRef.current?.id,
                message,
                position: {
                    x: rect.left + offset.x,
                    y: rect.top + offset.y
                }
            }))

            timeoutIdRef.current = setTimeout(() => {
                dispatch(hideTooltip(elementRef.current?.id || ''))
                onHide()
            }, TOOLTIP_EXPIRE_TIME_MS)
        }

        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
            }
        }
    }, [message, elementRef])
}


export { useTooltip }