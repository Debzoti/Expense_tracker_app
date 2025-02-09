import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MdDelete } from 'react-icons/md'
import { deleteExpense } from '../http/api'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function ExpenseCard({ expense }) {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: deleteExpense(expense?._id),
    onSuccess: () => {
      // Invalidate and refetch
      console.log('delete success')
      //redirect to dashboard

      navigate('/dashboard/home')
    },
  })

  const handleDelete = (e) => {
    e.preventDefault() // Prevents page refresh
    
    mutation.mutate()
  }
  
  return (
    <Card className="w-[380px] bg-gray-800 text-white shadow-lg rounded-xl">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-200">
          Expense Title
        </CardTitle>
        <CardDescription className="text-gray-400">
          {expense?.description}
        </CardDescription>
      </CardHeader>

      {/* Content */}
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Amount:</span>
            <span className="text-lg font-bold text-orange-400">
              ${expense?.amount}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Date:</span>
            <span className="text-gray-300">{expense?.date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Category:</span>
            <span className="text-gray-300">{expense?.category}</span>
          </div>
        </div>
      </CardContent>

      {/* Footer with Delete Button */}
      <CardFooter>
        <Button onClick={handleDelete} className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
          <MdDelete className="text-xl" /> Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ExpenseCard
