import User from "../models/user-model.js";
import {validationResult} from "express-validator"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
const userCltr = {}

userCltr.register = async(req , res) => {
const errors = validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors : errors.array()})
}
const {name , email , password, role} = req.body  
try{
    const user = new User ({name , email , password, role})
    const salt = await bcryptjs.genSalt()
    const hash = await bcryptjs.hash(password , salt)
    user.password = hash

    const userCount = await User.countDocuments();
        if (userCount == 0) {
            user.role = 'admin';
        }

    await user.save()
    res.status(201).json(user)
} catch(err){
    console.log(err)
    res.status(500).json("something went wrong")
}
}

userCltr.login = async(req , res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const {email , password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({errors : "Invalid email or password"})
        }
        const isVerified = bcryptjs.compare(password , user.password)
        if(!isVerified){
            return res.status(404).json({errors : "Invalid email or password"})
        }
        const tokenData = {userId : user._id , role : user.role}
        const token = jwt.sign(tokenData , process.env.SECRET_KEY , {expiresIn : "7d"} )
        res.json({token : `Bearer ${token}`})
    } catch(err){
        res.json(err.message)
    }
}

userCltr.profile = async (req , res) => {
    try{
        const user = await User.findById(req.user.userId)
        res.json(user)
    } catch(err) {
        console.log(err)
        res.status(500).json({errors : "something went wrong"})
    }
}

userCltr.all = async(req , res) => {
    try{
        const user = await User.find()
        res.status(200).json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({errors : "something went wrong"})
    }
}
export default userCltr

