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

// GET - Obtener todos los productos
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Error GET /admin/products:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// POST - Crear producto
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  const { name, category_id, price, stock, is_active } = req.body;

  if (
    !name ||
    category_id == null ||
    price == null ||
    stock == null ||
    is_active == null
  ) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, category_id, price, stock, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, category_id, price, stock, is_active]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error POST /admin/products:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT - Editar producto
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { name, category_id, price, stock, is_active } = req.body;
  const { id } = req.params;

  if (
    !name ||
    category_id == null ||
    price == null ||
    stock == null ||
    is_active == null
  ) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET name=$1, category_id=$2, price=$3, stock=$4, is_active=$5
       WHERE id=$6 RETURNING *`,
      [name, category_id, price, stock, is_active, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error PUT /admin/products/:id:", err);
    res.status(500).json({ error: "Error al editar producto" });
  }
});

// DELETE - Eliminar producto
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto eliminado", product: result.rows[0] });
  } catch (err) {
    console.error("Error DELETE /admin/products/:id:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

module.exports = router;
