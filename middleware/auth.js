const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            console.error('JWT error:', err.message);
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user; // Guardar el usuario en la request
        next();
    });
};

module.exports = authenticateToken;
