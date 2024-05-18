const express=require("express");
const cors=require('cors');
const app=express();
const path=require('path')
const connect=require('./db.js');
const db=connect();
const fileupload=require('express-fileupload');
db.connect((error)=>{
    if(error) throw error;
    console.log("connection to db succesfully");
})
app.use(express.json());
app.use(cors());
app.use(fileupload());
app.use("/image",express.static(path.join(__dirname,'/image')));
app.use('/api/auth',require('./routes/auth.js'));
app.use("/api/cart",require('./routes/carts.js'));
app.use("/api/products",require('./routes/getProducts.js'));
app.use("/api/admin",require('./routes/admin.js'));
app.use("/api/users",require('./routes/user.js'));
app.use("/api/payment",require("./routes/payment.js"));
app.use("/api/orders",require("./routes/orders.js"));
app.listen(4000,()=>{
console.log(`Server is running on http://localhost:4000`);
})