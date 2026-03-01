// backend/src/middleware/adminAuth.middleware.js
// Protect any route that should only be accessible by ADMIN users

const jwt = require("jsonwebtoken");

const adminAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "ADMIN") {
            return res.status(403).json({ message: "Admin access required." });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = adminAuthMiddleware;
