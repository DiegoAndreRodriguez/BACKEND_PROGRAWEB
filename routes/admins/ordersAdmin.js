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

// ===============================================
// GET: Todas las órdenes (ADMIN)
// ===============================================
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.payment_method, 
             o.created_at, u.name AS user_name, u.lastname AS user_lastname
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo órdenes" });
  }
});

// ===============================================
// GET: Órdenes filtradas por fecha (ADMIN)
// ===============================================
router.get("/by-date", authenticateToken, isAdmin, async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT o.id, o.total_amount, o.status, o.created_at,
             u.name, u.lastname
      FROM orders o 
      JOIN users u ON o.user_id = u.id
      WHERE DATE(o.created_at) BETWEEN $1 AND $2
      ORDER BY o.created_at ASC
      `,
      [startDate, endDate]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error filtrando órdenes" });
  }
});

// ===============================================
// GET: Métricas del dashboard (ADMIN)
// ===============================================
router.get("/metrics", authenticateToken, isAdmin, async (req, res) => {
  try {
    const incomeResult = await pool.query(
      "SELECT SUM(total_amount) FROM orders"
    );

    const usersResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE"
    );

    const ordersResult = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );

    res.json({
      totalIncome: incomeResult.rows[0].sum || 0,
      newUsers: usersResult.rows[0].count,
      ordersToday: ordersResult.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo métricas" });
  }
});

module.exports = router;
