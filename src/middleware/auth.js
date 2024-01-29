import jwt from "jsonwebtoken";
import User from '../models/user.js'

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.trim().slice(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send({ error: 'You should be authenticated to do this operation.' })
    }
}
export default auth;