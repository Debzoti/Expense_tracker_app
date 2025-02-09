import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExpenseCard from "@/components/ExpenseCard";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {  getAllExpenses } from "../http/api"; // ✅ Correct way


const AddExpensePage = () => {
  const [description, setDescription] = useState("");

  // Fetch expenses using React Query
  const { data: expenses = [], isLoading, isError } = useQuery({
    queryKey: ["expenses"],
    queryFn: getAllExpenses,
  });

   
  console.log('data',expenses);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white p-6">
      {/* Input & Save Button */}
      <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <Input
          className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
          placeholder="Enter Expense Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button className="bg-orange-600 hover:bg-orange-700">Save</Button>
      </div>

      {/* Recently Added Expenses */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold">Recently Added Expenses</h1>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4">
          {expenses.slice(0, 8).map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddExpensePage;
