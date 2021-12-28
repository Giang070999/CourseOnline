const AdminModel = require("../models/account.model/admin.model")
const jwt = require('jsonwebtoken')


const jwtAuthentication = async (req, res, next) => {
    try {
        res.locals.isAdmin = false
        let authorization = req.headers.authorization;
        let token = authorization.split(" ")[1]
        //if not exist cookie[access_token] -> isAuth = false -> next
        if (!token) {
            next();
            return;
        }
        //verify jwt
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded) {
            const { accountId } = decoded.sub;
            const user = await AdminModel.findById(accountId);
            if (user) {
                res.locals.isAdmin = true;
                req.user = user;
            }
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized.',
            error,
        });
    }
}

module.exports = {
    jwtAuthentication,
}