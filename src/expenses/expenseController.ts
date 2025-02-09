// src/controllers/expenseController.ts
import {  Request, Response,NextFunction } from 'express'
import  getExpenseDetails  from './geminiService' // Your Gemini API service
import Expense from './expenseModel' // Your Mongoose model
import { User } from '../user/userTypes';
import moment from 'moment';
import createHttpError from 'http-errors';
import userModel from '../user/userModel';
import { AuthRequest } from '../middlewares/authenticate';
import { create } from 'ts-node';




//  const createExpense = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const {description} = req.body

//     // Use Gemini API to get the expense category
//     const { amount, category } = await getExpenseDetails(description)
//     const date = new Date()

//     //Create a new expense record with the categorized data
//     const newExpense = new Expense({
//       amount,
//       description,
//       date,
//       category,
//     })

//     await newExpense.save()

//     return res.status(201).json({
//       message: 'Expense added successfully',
//       expense: newExpense,
//     })
//   } catch (error) {
//     console.error('Error adding expense:', error)
//     return res.status(500).json({ error: 'Internal Server Error' })
//   }
// }


// expenseController.js


// Fixed categories that are allowed
const FIXED_CATEGORIES = ['food', 'travel', 'utilities','entertainment','shopping', 'others'];
interface CustomRequest extends Request {
  user?: User;
}


const expenseController = {


  // GET /expenses
  // List all expenses for the current user.
  // Optionally, filter by a fixed category.
  
  getExpenses: async (req: Request, res: Response,  next: NextFunction):Promise<any> => {
    try {
      const _req = req as AuthRequest
        const userId = _req.userId
     
      const filter: any = { userId };

      // If a valid category is provided in the query, add it to the filter.
      const selectedCategory = req.query.category;
      if (typeof selectedCategory == 'string' && FIXED_CATEGORIES.includes(selectedCategory)) {
        filter.category = selectedCategory;
      }

      // Retrieve expenses and sort them by newest first.
      const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

      // Format each expense's date for display.
      expenses.forEach(exp => {
        (exp as any ).date = moment(exp.date).format('YYYY-MM-DD');
      });

      // Render the expenses view with the data.
      //return res.render('expenses', { expenses, fixedCategories: FIXED_CATEGORIES });
      return res.json({ expenses,userId, fixedCategories: FIXED_CATEGORIES });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return next(createHttpError(500,"error in fetching expenses"))
    }
  },

  // POST /expenses
  // Create a new expense and update the user's total for the category.
  
  postExpense: async (req : Request, res: Response, next:NextFunction):Promise<any> => {
    try {
      const { amount,category} = req.body;
      const date = Date.now()
      //auth needed
        const _req = req as AuthRequest
        const userId = _req.userId
      // if(!userId){
      //   next(createHttpError(404,"user not authenticated"))
      // }

      // Validate required fields.
      if (!category || !amount) {
        return res.status(400).send('Category and amount are required.');
      }

      // Ensure the category is one of our fixed choices.
      if (!FIXED_CATEGORIES.includes(category)) {
        return res.status(400).send('Invalid category.');
      }

      // Create and save the new expense.
      const expense = new Expense({
        userId ,
        category,
        amount: Number(amount),
        date: date ? new Date(date) : new Date()
      });
      await expense.save();

      // Build the user field name for the category (e.g., "totalFood" for "food").
      const fieldName = `total${category.charAt(0).toUpperCase() + category.slice(1)}`;
      // Update the user's total for that category.
      await userModel.findByIdAndUpdate(userId, { $inc: { [fieldName]: Number(amount) } });
      return  res.send("created and updated expenses")
      //return res.redirect('/expenses');
    } catch (error) {
      console.error('Error creating expense:', error);
      return res.status(500).send('Server Error');
    }
  },

  // PUT /expenses/:id
  // Update an existing expense and adjust the user's totals.

//issues in updating

  updateExpense: async (req: Request, res: Response, next:NextFunction):Promise<any> => {
    try {
      const _req = req as AuthRequest
      const userId = _req.userId

      console.log("User Id is:", userId);
 
      const expense = await Expense.findOne({ _id: req.params.id, userId });
      if (!expense) {
        return next(createHttpError(404,'expense not found'))
      }

      // Store the old category and amount.
      const oldCategory = expense.category;
      const oldAmount = expense.amount;

      // Get new data from the request body.
      const { category, amount,date } = req.body;
      if (!FIXED_CATEGORIES.includes(category)) {
        return next(createHttpError(400, 'Invalid category.'));
      }

      // Update the expense record.
      expense.category = category;
      expense.amount = Number(amount);
      expense.date = date ? new Date(date) : expense.date;
      await expense.save();

      // Adjust the user's totals:
      // 1. Subtract the old amount from the previous category total.
      const oldField = `total${oldCategory.charAt(0).toUpperCase() + oldCategory.slice(1)}`;
      await userModel.findByIdAndUpdate(userId, { $inc: { [oldField]: -oldAmount } });
      // 2. Add the new amount to the new category total.
      const newField = `total${category.charAt(0).toUpperCase() + category.slice(1)}`;
      await userModel.findByIdAndUpdate(userId, { $inc: { [newField]: Number(amount) } });
      const userTotals = await userModel.findById(userId);
      console.log(userTotals);



      return res.status(200).json({ message: 'Expense updated successfully' });
     
      //return res.redirect('/expenses');
    } catch (error) {
      console.error('Error updating expense:', error);
      return next(createHttpError(500,'Server Error'))
    }
  },

  // DELETE /expenses/:id
  // Delete an expense and update the user's total for that category.
  deleteExpense: async (req: Request, res: Response, next:NextFunction):Promise<any> => {
    try {
      
      const _req = req as AuthRequest
      const userId = _req.userId
      console.log("User Id is:", userId);
      console.log("Expense Id is:", req.params.id);
      const expense = await Expense.findOne({ _id: req.params.id, userId });
      if (!expense) {
        return next(createHttpError(404,"Expense not found"))
      }

      // Build the field name and subtract the expense amount from the user's total.
      const fieldName = `total${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}`;
      await userModel.findByIdAndUpdate(userId, { $inc: { [fieldName]: -expense.amount } });

      // Remove the expense record.
      await expense.deleteOne();

      return res.status(200).json({ message: 'Expense deleted successfully' });
      //return res.redirect('/expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      return next(createHttpError(500,'Server Error'))
    }
  }
};



export  {expenseController} ;


    