const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Permite que React (puerto 5173) hable con Node (puerto 3000)
app.use(express.json());

// CONFIGURACIÓN DE LA BASE DE DATOS (POSTGRESQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});


// Obtener TODOS los productos y pasarlos a Search/Home
app.get('/api/products', async (req, res) => {
    try {
        // Traemos productos y hacemos un JOIN para traer el nombre de la categoría
        const result = await pool.query(`
            SELECT p.*, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.id ASC
        `);
        // Convertimos el snake_case de SQL (is_active) al camelCase de tu React (active)
        const products = result.rows.map(row => ({
            ...row,
            active: row.is_active, // Mapeo clave para que .filter(p => p.active) funcione
            category: row.category // Para que el filtro por categoría funcione
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar productos' });
    }
});

// 2. Para App.jsx: Obtener Categorías
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar categorías' });
    }
});

// 3. Para ProductDetail.jsx: Obtener UN producto por ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT p.*, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ msg: 'No encontrado' });
        
        const product = result.rows[0];
        // Adaptación de datos
        res.json({
            ...product,
            active: product.is_active
        });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});