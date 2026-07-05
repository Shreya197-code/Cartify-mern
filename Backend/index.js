const dotenv = require('dotenv');
dotenv.config();



const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const connectDB=require('./config/db');


console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "NOT LOADED");
connectDB();

const app=express();
app.use(cors(
    {
        origin: ['http://localhost:3000','https://127.0.0.1:3000'],
        methods:['GET','POST','PUT','DELETE'],
       credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.get('/',(req,res)=>{
    res.send('Cartify Backend is running');
});

app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/products',require('./routes/productRoutes'));
app.use('/api/orders',require('./routes/orderRoutes'));
// app.use('/api/payment',require('./routes/payment'));
 app.use('/api/admin',require('./routes/analyticsRoutes'));

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});