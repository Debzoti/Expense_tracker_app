import axios from 'axios'
import exp from 'constants';
import useTokenStore from '../store';

const api = axios.create({
    baseURL: 'http://localhost:4000',
    headers: {
        "Content-Type" :'application/json',
    }
})

api.interceptors.request.use((config) => {
    const token = useTokenStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const logIn = async (data: {email:String;password:string}) => await
 api.post('/api/users/login',data);

 export const createUser = async (data: {name:string;email:String;password:string}) => await
 api.post('/api/users/register',data);

 export const getAllExpenses = async () => await api.get('/api/allexpenses');

 export const deleteExpense = async (id:string) => await api.delete(`/api/expenses/${id}`);

