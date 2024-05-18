const { Router } = require('express');
const router = Router();
const fetchuser = require("../middelware/finduser");
const dbconnection = require('../db.js')
const db = dbconnection();

//adding cart data to database
router.post("/cartdata", fetchuser, (req, res) => {
    try {
        const { admin_id,item_id, brand, model, Price, image, Quantity, size, category,isSlected,availability,actualQuantity} = req.body;
        const sql1 = `insert into 
        cart (userid,item_id,brand,model,price,image,Quantity,size,category,isSlected,availability,actualQuantity,admin_id)
        values (${req.user},${item_id},"${brand}","${model}",${Price},"${image}",${Quantity},${size},"${category}",
        "${isSlected}","${availability}",${actualQuantity},${admin_id})
        `;
        db.query(sql1, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error });
            }
            return res.json({ status: 200});
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})

//updating cart data in database
router.post("/cartupdate", fetchuser, (req, res) => {
    try {
        const{Quantity,item_id,isSlected}=req.body;
        const sql1=`update cart set Quantity = ${Quantity},isSlected="${isSlected}" where  item_id=${item_id} and userid=${req.user}`;
        db.query(sql1,(error,result)=>{
            if (error) {
                console.log(error);
                return res.status(500).json({ error });
            }
            return res.json({ status: 200 });
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})

//geting user cartdata
router.get('/usercartdata',fetchuser,(req,res)=>{
    try {
        const sql1=`select * from cart where userid=${req.user}`;
        db.query(sql1,(err,result)=>{
            if (err) {
                console.log(err);
                return res.status(500).json({ err });
            }
            return res.json({ status: 200 ,data:result});
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }

})

//removing item from the cart
router.post('/deleteitem',fetchuser,(req,res)=>{
    try {
        const{item_id}=req.body;
        const sql1=`delete from cart where userid = ${req.user} and item_id=${item_id}`;
        db.query(sql1,(err,results)=> {
            if(err){
                console.log(err);
                return res.status(500).json({ err });
            }
            return res.json({status:200,message:"Remove successfully"});
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})
module.exports = router;