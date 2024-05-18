const { Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = Router();
const secreat = 'visoncraft#123';
const dbconnection = require("../db.js");
const db = dbconnection();

//creating the user bu thise route
router.post('/createUser', (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const sql1 = `select  * from users where email='${email}'`;
        db.query(sql1, (err, results) => {
            if (err) throw err;
            if (!results[0]) {
                const userId = Date.now();
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);
                const token = jwt.sign({ userId }, secreat);
                const sql2 = `insert into users (userid,firstName,lastName,email,password,role) 
                values (${userId},"${firstName}","${lastName}","${email}","${hash}","user")`;
                db.query(sql2, (error, result) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ error });
                    };
                    return res.json({ message: "User Create Succesfully", token, status: 200 });
                })
            } else {
                return res.json({ message: "user with thise email id all ready exit", status: 400 });
            }
        })
    } catch (error) {
        console.log(error);
        res.status(401);
        res.json({ message: "something bad happen" });
    }
})

// loing the users by the  using of this route
router.post('/login', (req, res) => {
    try {
        const { useremail, userpassword } = req.body;
        const sql1 = `select  * from users where email="${useremail}"`;
        db.query(sql1, (err, result) => {
            if (err){
                return res.json({error:"Invalid user",status:400})
            };
            if (result[0]) {
                const { userid, password } = result[0];
                const isValid = bcrypt.compareSync(userpassword, password);
                const token = jwt.sign({ userid }, secreat);
                if (isValid) {
                    return res.json({ message: "login Succesfully", token ,status:200,result});
                } else {
                    return res.json({ error: "Invalid user",status:400});
                }
            } else {
                return res.json({ error: "Invalid user",status:400});
            }
        })

    } catch (error) {
        res.json(error).status(401);
    }
})

module.exports = router;