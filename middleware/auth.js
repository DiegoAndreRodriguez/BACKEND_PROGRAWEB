const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your_secret_key",
    (err, decoded) => {
      if (err) {
        console.error("JWT error:", err.message);
        return res.status(403).json({ error: "Token inválido o expirado" });
      }

      // decoded = { id, email, role, name, ... }  << IMPORTANTE
      req.user = decoded;

      next();
    }
  );
};

module.exports = authenticateToken;
