// c:\Users\Lenovo\Downloads\Trabajo final PrograWeb\Backend\seed_db.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// --- CARGA DE DATOS DESDE ARCHIVO SQL ---
// Leemos el contenido del archivo seed_data.sql
const sqlFilePath = path.join(__dirname, 'seed_data.sql');
const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Lógica para desactivar SSL en conexiones locales, igual que en index.js
    ssl: (function() {
        const url = process.env.DATABASE_URL || '';
        const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
        return isLocal ? false : { rejectUnauthorized: false };
    })()
});

async function seedDatabase() {
    const client = await pool.connect();
    try {
        console.log('Iniciando la inserción de datos...');
        
        // Ejecutamos todos los comandos del archivo seed_data.sql
        await client.query(sqlCommands);
        console.log('¡Inserción de datos completada con éxito!');
    } catch (error) {
        console.error('Error durante la inserción de datos:', error);
    } finally {
        await client.release();
        await pool.end();
    }
}

seedDatabase();
