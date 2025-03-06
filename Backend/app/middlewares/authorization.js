const authorizeUser = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. ${roles.join(' or ')} role required.` 
            });
        }

        next();
    };
};

export default authorizeUser;