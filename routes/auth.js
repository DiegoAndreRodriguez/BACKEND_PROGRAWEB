const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Pool } = require('pg');
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

// Configurar nodemailer para envío de emails
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ============= REGISTRO =============
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Validar datos
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        const result = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
            [email, hashedPassword, firstName, lastName]
        );

        const user = result.rows[0];

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// ============= LOGIN =============
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    try {
        // Buscar usuario
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        // Verificar si el usuario está activo
        if (!user.is_active) {
            return res.status(403).json({ error: 'Usuario desactivado' });
        }

        // Comparar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Sesión iniciada',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// ============= FORGOT PASSWORD =============
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
    }

    try {
        // Buscar usuario
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            // No revelar si el email existe o no (seguridad)
            return res.json({ message: 'Si el email existe, recibirá un enlace para recuperar la contraseña' });
        }

        // Generar token de recuperación
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora

        await pool.query(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt]
        );

        // Enviar email (ajusta la URL según tu frontend)
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

        await transporter.sendMail({
            to: email,
            subject: 'Recuperar contraseña',
            html: `
                <h1>Recuperar contraseña</h1>
                <p>Haz clic en el siguiente enlace para recuperar tu contraseña:</p>
                <a href="${resetLink}">Recuperar contraseña</a>
                <p>Este enlace expira en 1 hora.</p>
            `
        });

        res.json({ message: 'Si el email existe, recibirá un enlace para recuperar la contraseña' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al enviar email de recuperación' });
    }
});

// ============= RESET PASSWORD =============
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        // Verificar token
        const result = await pool.query(
            'SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
            [token]
        );

        const resetRecord = result.rows[0];
        if (!resetRecord) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña del usuario
        await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
            hashedPassword,
            resetRecord.user_id
        ]);

        // Marcar token como usado
        await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [resetRecord.id]);

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al resetear contraseña' });
    }
});

// ============= LOGOUT =============
router.post('/logout', (req, res) => {
    // En una arquitectura con JWT, el logout se maneja en el frontend eliminando el token
    // Pero podemos mantener este endpoint para futuras extensiones (blacklist de tokens)
    res.json({ message: 'Sesión cerrada' });
});

module.exports = router;
