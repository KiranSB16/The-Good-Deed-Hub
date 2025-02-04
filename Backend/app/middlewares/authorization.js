const authorizeUser = (permittedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        console.log("User not authenticated."); // Debug log
        return res.status(401).json({ errors: "User not authenticated" });
      }
      console.log("User Role:", req.user.role); // Debug log
      if (permittedRoles.includes(req.user.role)) {
        return next();
      } else {
        console.log("Unauthorized access for role:", req.user.role); // Debug log
        return res.status(403).json({ errors: "Unauthorized access" });
      }
    };
  };
export default authorizeUser  