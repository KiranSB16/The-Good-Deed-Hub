import jwt from 'jsonwebtoken';

export const AuthenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Attach the user data
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message); // Debug
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

