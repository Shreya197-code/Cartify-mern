const dotenv = require('dotenv');
dotenv.config();

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const connectDB=require('./config/db');


console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "NOT LOADED");
connectDB();

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.get('/',(req,res)=>{
    res.send('Cartify Backend is running');
});

app.use('/api/auth',require('./routes/auth'));
app.use('/api/products',require('./routes/product.js'));
app.use('/api/orders',require('./routes/order'));
app.use('/api/payment',require('./routes/payment'));
app.use('/api/admin',require('./routes/admin'));

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});