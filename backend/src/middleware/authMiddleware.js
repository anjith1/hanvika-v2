const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Normalize user ID to `req.user.id` or `req.userId`
        // User token has `userId`, Worker token has `id`
        req.user = {
            id: decoded.id || decoded.userId || decoded.workerId,
            role: decoded.role || "USER", // Default to USER if not present for legacy tokens
            email: decoded.email
        };
        next();
    } catch (ex) {
        res.status(400).json({ error: "Invalid token." });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: "Access denied. No role found." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRoles
};
