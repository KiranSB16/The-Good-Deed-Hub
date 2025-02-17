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

export const AuthenticateFundraiser = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.role !== 'fundraiser') {
      return res.status(403).json({ message: 'Access denied. Only fundraisers can upload files.' });
    }
    req.user = decoded;
    console.log("Before next")
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    return res.status(400).json({ message: 'Invalid token.' });
  }
};
