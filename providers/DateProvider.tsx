import { isFuture, startOfDay } from '@/lib/date'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { AppState } from 'react-native'

interface DateContextType {
    /** The day currently being viewed (local midnight) */
    date: Date
    setDate: (date: Date) => void
}

const DateContext = createContext<DateContextType | undefined>(
    undefined
)

export function DateProvider({ children }: { children: ReactNode }) {
    const [date, setDateState] = useState(() =>
        startOfDay(new Date())
    )
    const lastActiveDay = useRef(startOfDay(new Date()).getTime())

    const setDate = useCallback((next: Date) => {
        // Never navigate into the future
        const day = isFuture(next) ? new Date() : next
        setDateState(startOfDay(day))
    }, [])

    /**
     * If the app was left open on "today" and comes back on a new day,
     * move forward to the new today.
     */
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state !== 'active') return
            const today = startOfDay(new Date()).getTime()
            if (today !== lastActiveDay.current) {
                setDateState((current) =>
                    current.getTime() === lastActiveDay.current
                        ? new Date(today)
                        : current
                )
                lastActiveDay.current = today
            }
        })
        return () => sub.remove()
    }, [])

    return (
        <DateContext.Provider value={{ date, setDate }}>
            {children}
        </DateContext.Provider>
    )
}

export function useDate() {
    const context = useContext(DateContext)
    if (!context) {
        throw new Error('useDate must be used within a DateProvider')
    }
    return context
}
