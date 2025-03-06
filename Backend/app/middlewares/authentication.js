import jwt from 'jsonwebtoken';
import User from '../models/user-model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export const AuthenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            _id: user._id,
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid authentication token' });
    }
};

export const AuthenticateFundraiser = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'fundraiser') {
            return res.status(403).json({ message: 'Access denied. Only fundraisers can access this resource.' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return res.status(400).json({ message: 'Invalid token.' });
    }
};

export const authenticateDonor = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.role !== 'donor') {
            return res.status(403).json({ message: 'Access denied. Donor only.' });
        }

        req.user = {
            _id: user._id,
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid authentication token' });
    }
};
