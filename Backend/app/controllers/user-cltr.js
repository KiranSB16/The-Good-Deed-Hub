import User from "../models/user-model.js";
import {validationResult} from "express-validator"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
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
        const tokenData = { _id: user._id, role: user.role }
        const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: "7d" })
        
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
    console.log('Login attempt:', req.body); // Debug log

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log('Validation errors:', errors.array()); // Debug log
        return res.status(400).json({errors : errors.array()})
    }

    const {email, password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            console.log('User not found:', email); // Debug log
            return res.status(400).json({
                errors: [{ msg: 'Invalid email or password' }]
            })
        }

        console.log('User found:', { email: user.email, role: user.role }); // Debug log

        const isVerified = await bcryptjs.compare(password, user.password)
        if(!isVerified){
            console.log('Password verification failed'); // Debug log
            return res.status(400).json({
                errors: [{ msg: 'Invalid email or password' }]
            })
        }

        console.log('Password verified successfully'); // Debug log

        const tokenData = {_id: user._id, role: user.role}
        const token = jwt.sign(tokenData, JWT_SECRET, {expiresIn: "7d"})
        
        // Send user data (excluding password) along with token
        const userData = user.toObject()
        delete userData.password

        console.log('Login successful, sending response'); // Debug log

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
        console.error('Profile error:', err)
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
        console.error('Error fetching users:', err)
        res.status(500).json({
            errors: [{ msg: 'Server error while fetching users' }]
        })
    }
}

userCltr.toggleUserAccess = async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({
                errors: [{ msg: 'User not found' }]
            })
        }

        // Prevent restricting admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                errors: [{ msg: 'Cannot restrict admin users' }]
            })
        }

        user.isRestricted = !user.isRestricted
        await user.save()

        res.json({
            success: true,
            message: `User ${user.isRestricted ? 'restricted' : 'permitted'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isRestricted: user.isRestricted,
                createdAt: user.createdAt
            }
        })
    } catch (err) {
        console.error('Error toggling user access:', err)
        res.status(500).json({
            errors: [{ msg: 'Server error while updating user access' }]
        })
    }
}

export default userCltr