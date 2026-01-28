const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./restaurant.db');

db.serialize(() => {
    console.log("--- Menu Items in Database ---");
    db.each("SELECT * FROM menu_items", (err, row) => {
        if (err) { console.error(err.message); }
        console.log(`${row.id}: ${row.name} - $${row.price}`);
    });

    console.log("\n--- Orders in Database ---");
    db.each("SELECT * FROM orders", (err, row) => {
        if (err) { console.error(err.message); }
        console.log(`Order #${row.id} by ${row.customer_name} (Total: $${row.total_amount})`);
    });
});

db.close();
