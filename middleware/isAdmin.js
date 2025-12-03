// middleware/isAdmin.js

const isAdmin = (req, res, next) => {
  try {
    // auth.js ya coloca req.user = decoded (con role incluido)
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Verificar rol admin (puede ser 'admin' o 'administrator', depende de tu BD)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Acceso denegado: se requiere rol ADMIN" });
    }

    next(); // Usuario sí es admin
  } catch (error) {
    console.error("Error en isAdmin:", error);
    res.status(500).json({ error: "Error interno en verificación de rol" });
  }
};

module.exports = isAdmin;
