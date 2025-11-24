const express = require('express');
const cors = require('cors');
const path = require('path'); // Importamos el módulo 'path' de Node.js
const { Pool } = require('pg');
require('dotenv').config();

// Importar routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const ordersRoutes = require('./routes/orders');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Permite que React (puerto 5173) hable con Node (puerto 3000)
app.use(express.json());

// --- SERVIR ARCHIVOS ESTÁTICOS (IMÁGENES) ---
// Le decimos a Express que sirva los archivos de la carpeta 'public' del frontend.
app.use(express.static(path.join(__dirname, '..', 'Frontend', 'public')));

// CONFIGURACIÓN DE LA BASE DE DATOS (POSTGRESQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Evitar forzar SSL en entornos locales (Postgres portable/instalado localmente)
    // Si la URL apunta a localhost o 127.0.0.1, desactivar SSL.
    ssl: (function() {
        const url = process.env.DATABASE_URL || '';
        const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
        return isLocal ? false : { rejectUnauthorized: false };
    })()
});

// Prueba de conexión a la base de datos al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.stack);
        return;
    }
    console.log('Conexión a la base de datos exitosa.');
    client.release();
});


// ============= PRODUCTS & CATEGORIES (PUBLIC) =============

// Obtener TODOS los productos
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
            ORDER BY p.id ASC
        `);
        const products = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            image: row.image_url, // Renombramos image_url a image
            active: row.is_active,
            category: row.category
        }));
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cargar productos' });
    }
});

// Obtener Categorías
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        console.error(err); // Añadido para ver el error en la consola
        res.status(500).json({ error: 'Error al cargar categorías' }); // La respuesta al frontend no cambia
    }
});

// Obtener UN producto por ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT p.*, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1 AND p.is_active = true
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ msg: 'No encontrado' });
        
        const product = result.rows[0];
        res.json({
            ...product,
            active: product.is_active
        });
    } catch (err) {
        console.error(err); // Añadido para ver el error en la consola
        res.status(500).json({ error: 'Error del servidor' }); // La respuesta al frontend no cambia
    }
});

// ============= AUTH ROUTES =============
app.use('/api/auth', authRoutes);

// ============= USER ROUTES (PROTECTED) =============
app.use('/api/user', userRoutes);

// ============= ORDERS ROUTES (PROTECTED) =============
app.use('/api/orders', ordersRoutes);

// ============= HEALTH CHECK =============
app.get('/health', (req, res) => {
    res.json({ status: 'Backend running' });
});

app.listen(port, () => {
    console.log(`Backend corriendo en http://localhost:${port}`);
});