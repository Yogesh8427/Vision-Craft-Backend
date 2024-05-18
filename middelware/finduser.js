const jwt = require('jsonwebtoken');
const secreat = 'visoncraft#123';

const findUser = (req, res, next) => {
    //get the user from the jwt token and add id to req object
    const token = req.header('authToken');
    if (!token) {
        return res.status(401).send({ error: "please authanticate valid token" })
    }
    try {
        const data = jwt.verify(token, secreat);
        // console.log(data);
        req.user = data.userid;
        next()
    } catch (error) {
        res.status(401).send({ error: "please authanticate valid token" })
    }

}
module.exports = findUser;