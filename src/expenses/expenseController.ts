// src/controllers/expenseController.ts
import {  Request, Response } from 'express'
import  getExpenseDetails  from './geminiService' // Your Gemini API service
import Expense from './expenseModel' // Your Mongoose model

 const addExpense = async (req: Request, res: Response):Promise<any> => {
  try {
    const {description} = req.body

    // Use Gemini API to get the expense category
    const { amount, category } = await getExpenseDetails(description)
    const date = new Date()

    //Create a new expense record with the categorized data
    const newExpense = new Expense({
      amount,
      description,
      date,
      category,
    })

    await newExpense.save()

    return res.status(201).json({
      message: 'Expense added successfully',
      expense: newExpense,
    })
  } catch (error) {
    console.error('Error adding expense:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}


export  {addExpense} ;


    