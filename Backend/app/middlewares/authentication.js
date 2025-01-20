import jwt from 'jsonwebtoken';

export const AuthenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authorization header missing or malformed."); // Debug
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  console.log("Extracted Token:", token); // Debug log

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded Token:", decoded); // Debug log

    req.user = decoded; // Attach the user data
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message); // Debug
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

