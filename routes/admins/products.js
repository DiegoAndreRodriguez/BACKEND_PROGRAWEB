const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const authenticateToken = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");

// Conexión propia a la DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
});

//      GET PRODUCTS

router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

//     CREATE PRODUCT

router.post("/", authenticateToken, isAdmin, async (req, res) => {
  const { name, category_id, price, stock, is_active } = req.body;

  if (
    !name ||
    !category_id ||
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
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// =====================
// ACTIVATE/DEACTIVATE PRODUCT
// =====================
router.patch("/:id/status", authenticateToken, isAdmin, async (req, res) => {
  const { is_active } = req.body;

  try {
    const result = await pool.query(
      "UPDATE products SET is_active=$1 WHERE id=$2 RETURNING *",
      [is_active, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Estado actualizado", product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

module.exports = router;
