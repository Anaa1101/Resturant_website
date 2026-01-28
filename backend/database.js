const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./restaurant.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Create tables
        createTables();
    }
});

function createTables() {
    // Menu Items Table
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating menu_items table:', err.message);
        } else {
            console.log('Menu items table ready.');
            seedMenu();
        }
    });

    // Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        total_amount REAL NOT NULL,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating orders table:', err.message);
        } else {
            console.log('Orders table ready.');
        }
    });

    // Order Items Table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_at_time REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating order_items table:', err.message);
        } else {
            console.log('Order items table ready.');
        }
    });
}

function seedMenu() {
    db.get("SELECT count(*) as count FROM menu_items", (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (row.count === 0) {
            console.log("Seeding menu items...");
            const insert = 'INSERT INTO menu_items (name, description, price, category) VALUES (?,?,?,?)';
            db.run(insert, ["Classic Burger", "Juicy  patty with lettuce, tomato, and cheese.", 250, "Main"]);
            db.run(insert, ["Margherita Pizza", "Classic tomato and mozzarella pizza.", 295, "Main"]);
            db.run(insert, ["Caesar Salad", "Crisp romaine lettuce with caesar dressing and croutons.", 189, "Starter"]);
            db.run(insert, ["French Fries", "Crispy golden shoestring fries.", 150, "Side"]);
            db.run(insert, ["Chocolate Cake", "Rich chocolate layer cake.", 325, "Dessert"]);
            db.run(insert, ["Coke", "Chilled can of Coke.", 50, "Drink"]);
        }
    });
}

module.exports = db;
