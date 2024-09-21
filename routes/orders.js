const { Router } = require('express');
const router = Router();
const fetchuser = require("../middelware/finduser");
const dbconnection = require('../db.js')
const db = dbconnection();
//1- get your orders details
router.get('/getorders', fetchuser, (req, res) => {
    try {
        const sql = `select * from Orders where userid=${req.user}`
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ err });
            }
            return res.json({ status: 200, data: result });
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})
//make order cancle throught 
router.post("/cancleorder", fetchuser, (req, res) => {
    try {
        const { order_id, cancleReason,admin_id} = req.body;
        const sql1 = `update orders set order_status="Cancelled",cancleReason="${cancleReason}" where userid=${req.user} and order_id="${order_id}";`
        const sql2 = `update orders set order_status="Cancelled",cancleReason="${cancleReason}" where admin_id=${req.user} and order_id="${order_id}";`
        db.query(admin_id?sql2:sql1, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ err });
            } else {
                return res.json({ status: 200, msg: "Your Canceld the Order" })
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
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ err });
            }
            return res.json({ status: 200, data: result });
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})

router.post("/getbuyproducts", fetchuser, (req, res) => {
    try {
        const { order_id } = req.body;
        const sql1 = `select * from order_details where order_id= "${order_id}"`
        db.query(sql1, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error });
            } else {
                const arr = [];
                result.map((item, index) =>
                    db.query(`select * from products where item_id=${item.item_id}`, (err, result1) => {
                        if (err) {
                            console.log(error);
                            return res.status(500).json({ err });
                        } else {
                            result1[0].Quantity = item.Quantity;
                            arr.push(result1[0]);
                            if (result.length == index + 1)
                                return res.json(arr);
                        }
                    })
                )
            }
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }

})
router.post("/setorderstatus", (req, res) => {
    try {
        const { order_id, status } = req.body;
        const sql=`update Orders set order_status="${status}" where order_id="${order_id}"`;
        db.query(sql,(error,result)=>{
            if(error){
                console.log(error);
                return res.status(500).json({ error });
            }else{
                return res.json({status:200,msg:"Updated Succesfully"})
            }
        })
    } catch (error) {
        console.log("error", error);
        res.json({ status: 400 });
    }
})
module.exports = router;