const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
    res.send('Backend funcionando correctamente 🚀');
});

// CONFIGURACIÓN DE LA BASE DE DATOS (Correcta: US-EAST)
const pool = new Pool({
    connectionString: "postgres://postgres.ocrcgmhmqdyjlblyylfh:PROGRAWEB123@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

// ==========================================
//  RUTAS DE AUTENTICACIÓN (ALUMNO 3) - ¡AQUÍ ESTÁN!
// ==========================================

// 1. REGISTRO
app.post('/api/auth/register', async (req, res) => {
    const { name, lastName, email, password } = req.body;
    try {
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        const newUser = await pool.query(
            'INSERT INTO users (name, lastname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, lastname, email, role',
            [name, lastName, email, password, 'user']
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            name: user.name,
            lastName: user.lastname,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// 3. ACTUALIZAR PERFIL
app.put('/api/user/profile', async (req, res) => {
    const { id, name, lastName, email } = req.body;
    try {
        await pool.query('UPDATE users SET name=$1, lastname=$2, email=$3 WHERE id=$4', [name, lastName, email, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'No se pudo actualizar' });
    }
});

// 4. CAMBIAR PASSWORD
app.put('/api/user/change-password', async (req, res) => {
    const { id, currentPassword, newPassword } = req.body;
    try {
        const check = await pool.query('SELECT * FROM users WHERE id=$1 AND password=$2', [id, currentPassword]);
        if (check.rows.length === 0) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

        await pool.query('UPDATE users SET password=$1 WHERE id=$2', [newPassword, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al cambiar password' });
    }
});

// ==========================================
//  RUTAS DE PRODUCTOS (ALUMNO 1)
// ==========================================

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
        `);
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

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar categorías' });
    }
});

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

// ==========================================
//  RUTAS DE ÓRDENES (Checkout)
// ==========================================

app.post('/api/orders', async (req, res) => {
    const { userId, customer, shipping, payment, items, total } = req.body;

    try {
        // Insertar la orden en la base de datos
        // Guardamos los items como un JSON para no complicarnos con tablas extra hoy
        const newOrder = await pool.query(
            `INSERT INTO orders (user_id, total, status, shipping_address, payment_method, items) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [
                userId || null, // Si es null (invitado), Postgres lo acepta si la columna lo permite
                total,
                'created',
                JSON.stringify(shipping), // Guardamos dirección como texto/json
                payment.method,
                JSON.stringify(items)     // Guardamos el carrito como JSON
            ]
        );

        res.json({ success: true, orderId: newOrder.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear la orden' });
    }
});

// Ruta para que el admin vea las órdenes 
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar órdenes' });
    }
});

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});