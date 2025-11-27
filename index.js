const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- RUTAS (Las comentamos por ahora para que no falle al arrancar) ---
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/user');
// const ordersRoutes = require('./routes/orders');
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/orders', ordersRoutes);

// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
    res.send('Backend funcionando correctamente 🚀');
});

// CONFIGURACIÓN DE LA BASE DE DATOS
const pool = new Pool({
    // HE PUESTO LA DIRECCIÓN DE US-EAST (La que tenías en tu .env)
    connectionString: "postgres://postgres.ocrcgmhmqdyjlblyylfh:PROGRAWEB123@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

// Endpoint para traer productos (Lo que necesita tu Alumno 1)
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
        `);
        // Adaptamos los datos para el Frontend
        const products = result.rows.map(row => ({
            ...row,
            active: row.is_active,
            category: row.category,
            createdAt: row.created_at
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar productos' });
    }
});

// Endpoint para traer categorías
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar categorías' });
    }
});

// Endpoint para detalle de producto
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
        res.json({ ...product, active: product.is_active, category: product.category });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});