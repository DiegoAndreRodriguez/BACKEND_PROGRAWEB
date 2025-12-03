const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const authenticateToken = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin.js");

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (() => {
    const url = process.env.DATABASE_URL || "";
    const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
    return isLocal ? false : { rejectUnauthorized: false };
  })(),
});

// GET - Obtener todas las categorías
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error GET /admin/categories:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// POST - Crear categoría
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });

  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error POST /admin/categories:", err);
    res.status(500).json({ error: "Error al crear categoría" });
  }
});

// PUT - Editar categoría
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (!name) return res.status(400).json({ error: "Nombre requerido" });

  try {
    const result = await pool.query(
      "UPDATE categories SET name=$1 WHERE id=$2 RETURNING *",
      [name, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error PUT /admin/categories/:id:", err);
    res.status(500).json({ error: "Error al editar categoría" });
  }
});

// DELETE - Eliminar categoría
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json({ message: "Categoría eliminada", category: result.rows[0] });
  } catch (err) {
    console.error("Error DELETE /admin/categories/:id:", err);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});

module.exports = router;
