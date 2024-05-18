const { Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = Router();
const fetchuser=require("../middelware/finduser.js");
const secreat = 'visoncraft#123';
const dbconnection = require("../db.js");
const db = dbconnection();

//get user details
router.get("/details",fetchuser,(req,res)=>{
    try {
        const sql=`select userid,firstName,lastName,role,address,pincode from users where userid=${req.user}`
        db.query(sql,(error,result)=>{
            if(error){
                console.log(error);
                return res.status(500).json({ error });
            }else{
                return res.json({result});
            }
        })
    } catch (error) {
        res.json({ error: error }).status(401);
    }
})
//add address to user 's profile
router.post('/address',fetchuser,(req,res)=>{
    try {
        const{address,pincode}=req.body;
        const sql=`update users set address="${address}",pincode="${pincode}" where userid=${req.user}`
        db.query(sql,(error,result)=>{
            if(error){
                console.log(error);
                return res.status(500).json({ error });
            }else{
                return res.json({
                    message:"Adderss updated Successfully",
                    status:200
                })
            }
        })
    } catch (error) {
        res.json({ error: error }).status(401);
    }
})


module.exports = router;