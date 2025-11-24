const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Configurar conexión a BD
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: (function() {
        const url = process.env.DATABASE_URL || '';
        const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
        return isLocal ? false : { rejectUnauthorized: false };
    })()
});

// ============= GET PROFILE =============
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, first_name, last_name, is_active, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isActive: user.is_active,
            createdAt: user.created_at
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// ============= UPDATE PROFILE =============
router.put('/profile', authenticateToken, async (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        // Verificar si el email ya existe en otro usuario
        if (email !== req.user.email) {
            const emailExists = await pool.query(
                'SELECT * FROM users WHERE email = $1 AND id != $2',
                [email, req.user.id]
            );
            if (emailExists.rows.length > 0) {
                return res.status(409).json({ error: 'El email ya está en uso' });
            }
        }

        const result = await pool.query(
            'UPDATE users SET first_name = $1, last_name = $2, email = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, first_name, last_name',
            [firstName, lastName, email, req.user.id]
        );

        const user = result.rows[0];
        res.json({
            message: 'Perfil actualizado correctamente',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

// ============= CHANGE PASSWORD =============
router.put('/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        // Obtener usuario actual
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
});

module.exports = router;
