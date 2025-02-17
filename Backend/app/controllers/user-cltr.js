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
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                errors: [{ msg: 'User with this email already exists' }]
            })
        }

        const user = new User({name, email, password, role})
        const salt = await bcryptjs.genSalt()
        const hash = await bcryptjs.hash(password, salt)
        user.password = hash

        const userCount = await User.countDocuments();
        if (userCount === 0) {
            user.role = 'admin';
        }

        await user.save()
        
        // Create token and send response
        const tokenData = { userId: user._id, role: user.role }
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: "7d" })
        
        // Send user data (excluding password) along with token
        const userData = user.toObject()
        delete userData.password

        res.status(201).json({
            user: userData,
            token: `Bearer ${token}`
        })
    } catch(err){
        console.error('Registration error:', err)
        res.status(500).json({
            errors: [{ msg: 'Server error during registration' }]
        })
    }
}

userCltr.login = async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    const {email, password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                errors: [{ msg: 'Invalid email or password' }]
            })
        }

        const isVerified = await bcryptjs.compare(password, user.password)
        if(!isVerified){
            return res.status(400).json({
                errors: [{ msg: 'Invalid email or password' }]
            })
        }

        const tokenData = {userId: user._id, role: user.role}
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, {expiresIn: "7d"})
        
        // Send user data (excluding password) along with token
        const userData = user.toObject()
        delete userData.password

        res.json({
            user: userData,
            token: `Bearer ${token}`
        })
    } catch(err){
        console.error('Login error:', err)
        res.status(500).json({
            errors: [{ msg: 'Server error during login' }]
        })
    }
}

userCltr.profile = async(req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password')
        if (!user) {
            return res.status(404).json({
                errors: [{ msg: 'User not found' }]
            })
        }
        res.json(user)
    } catch (err) {
        console.error('Profile fetch error:', err)
        res.status(500).json({
            errors: [{ msg: 'Server error while fetching profile' }]
        })
    }
}

userCltr.all = async(req, res) => {
    try {
        const users = await User.find().select('-password')
        res.json(users)
    } catch (err) {
        console.error('Users fetch error:', err)
        res.status(500).json({
            errors: [{ msg: 'Server error while fetching users' }]
        })
    }
}

export default userCltr