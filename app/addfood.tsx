import { FoodForm } from '@/components/FoodForm'
import { useDate } from '@/providers/DateProvider'

export default function AddFood() {
    const { date } = useDate()
    return <FoodForm initialDay={date} />
}
