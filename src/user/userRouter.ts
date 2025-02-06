import express  from "express";
import {createUser, loginUser}  from "./userController";
const useRouter = express.Router();
//routes

useRouter.post('/register',createUser)
useRouter.post('/login',loginUser)

export default useRouter;