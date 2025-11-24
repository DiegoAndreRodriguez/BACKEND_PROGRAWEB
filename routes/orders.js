const express = require('express');
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

// ============= GET ORDERS (CON PAGINACIÓN) =============
router.get('/', authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Obtener total de órdenes del usuario
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM orders WHERE user_id = $1',
            [req.user.id]
        );
        const total = parseInt(countResult.rows[0].count);

        // Obtener órdenes paginadas
        const result = await pool.query(
            `SELECT id, total_amount, status, payment_method, shipping_method, created_at, updated_at 
             FROM orders 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset]
        );

        const orders = result.rows.map(order => ({
            id: order.id,
            totalAmount: order.total_amount,
            status: order.status,
            paymentMethod: order.payment_method,
            shippingMethod: order.shipping_method,
            createdAt: order.created_at,
            updatedAt: order.updated_at
        }));

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                limit
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener órdenes' });
    }
});

// ============= GET ORDER DETAIL =============
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener orden (verificar que pertenece al usuario)
        const orderResult = await pool.query(
            `SELECT o.id, o.user_id, o.total_amount, o.status, o.payment_method, 
                    o.shipping_address, o.shipping_method, o.created_at, o.updated_at
             FROM orders o
             WHERE o.id = $1 AND o.user_id = $2`,
            [id, req.user.id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const order = orderResult.rows[0];

        // Obtener ítems de la orden
        const itemsResult = await pool.query(
            `SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, p.name, p.image_url
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [id]
        );

        const items = itemsResult.rows.map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.name,
            productImage: item.image_url,
            quantity: item.quantity,
            unitPrice: item.unit_price
        }));

        res.json({
            id: order.id,
            totalAmount: order.total_amount,
            status: order.status,
            paymentMethod: order.payment_method,
            shippingAddress: order.shipping_address,
            shippingMethod: order.shipping_method,
            items,
            createdAt: order.created_at,
            updatedAt: order.updated_at
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener detalle de orden' });
    }
});

// ============= CANCEL ORDER =============
router.put('/:id/cancel', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener orden (verificar que pertenece al usuario)
        const orderResult = await pool.query(
            'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const order = orderResult.rows[0];

        // Verificar que solo se puede cancelar órdenes en estado pending
        if (order.status !== 'pending') {
            return res.status(400).json({ error: `No se puede cancelar una orden con estado "${order.status}"` });
        }

        // Actualizar estado a cancelled
        await pool.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
            ['cancelled', id]
        );

        res.json({ message: 'Orden cancelada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al cancelar orden' });
    }
});

module.exports = router;
