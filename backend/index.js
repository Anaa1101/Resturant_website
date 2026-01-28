const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes

// GET /api/menu - Fetch all menu items
app.get('/api/menu', (req, res) => {
    const sql = "SELECT * FROM menu_items";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});
// GET /api/orders - View all orders
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/order-items - View all order items
app.get('/api/order-items', (req, res) => {
    db.all("SELECT * FROM order_items", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/orders - Place a new order
app.post('/api/orders', (req, res) => {
    const { customer_name, customer_phone, items, total_amount } = req.body;

    if (!customer_name || !customer_phone || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const insertOrder = 'INSERT INTO orders (customer_name, customer_phone, total_amount) VALUES (?,?,?)';

    db.run(insertOrder, [customer_name, customer_phone, total_amount], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const orderId = this.lastID;

        // Insert order items
        const insertOrderItem = 'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?,?,?,?)';

        items.forEach(item => {
            db.run(insertOrderItem, [orderId, item.id, item.quantity, item.price], (err) => {
                if (err) {
                    console.error("Error inserting order item: " + err.message);
                }
            });
        });

        res.json({
            "message": "success",
            "order_id": orderId,
            "data": req.body
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
