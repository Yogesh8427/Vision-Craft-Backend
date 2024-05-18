const { Router } = require('express');
const router = Router();
const fetchuser = require("../middelware/finduser");
const dbconnection = require('../db.js')
const db = dbconnection();
//1- get your orders details
router.get('/getorders', fetchuser, (req, res) => {
    try {
        const sql = `select * from orders where userid=${req.user}`
        db.query(sql,(err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({ err });
            }
            return res.json({status:200,data:result});
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})
//make order cancle throught 
router.post("/cancleorder",fetchuser,(req,res)=>{
    try {
        const {item_id,order_id,cancleReason}=req.body;
        const sql=`update orders set order_status="Cancle",cancleReason="${cancleReason}" where userid=${req.user} and item_id=${item_id} and order_id="${order_id}";`
        db.query(sql,(err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({ err });
            }else{
                return res.json({status:200,msg:"Your Canceld the Order"})
            }
        })
    } catch (error) {
        console.log(error);
        res.json({ status: 400 });
    }
})
//2- get your orders details for admin user
router.get('/getAdminorders', fetchuser, (req, res) => {
    try {
        const sql = `select * from orders where admin_id=${req.user}`
        db.query(sql,(err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).json({ err });
            }
            return res.json({status:200,data:result});
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})
module.exports = router;