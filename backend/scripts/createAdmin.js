// backend/scripts/createAdmin.js
// ─────────────────────────────────────────────────────────────────────────────
// Run ONCE to create your admin user:
//   node backend/scripts/createAdmin.js
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGODB_URI not found in .env!");
    console.error("   Make sure backend/.env exists and contains MONGODB_URI=...");
    process.exit(1);
}

// ✅ Use createConnection to match your db.js pattern
const conn = mongoose.createConnection(MONGO_URI);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "WORKER", "ADMIN"], default: "USER" },
});

const User = conn.model("User", userSchema, "users");

conn.once("open", async () => {
    console.log("✅ Connected to MongoDB:", conn.db.databaseName);

    try {
        const existing = await User.findOne({ email: "admin@hanvika.com" });

        if (existing) {
            if (existing.role === "ADMIN") {
                console.log("ℹ️  Admin already exists — no changes made.");
                console.log("   Email:", existing.email);
                console.log("   Role: ", existing.role);
            } else {
                existing.role = "ADMIN";
                await existing.save();
                console.log("✅ User upgraded to ADMIN role:", existing.email);
            }
        } else {
            const hashedPassword = await bcrypt.hash("Admin@Hanvika2026", 10);
            await User.create({
                username: "NarasimhaReddy",
                email: "admin@hanvika.com",
                password: hashedPassword,
                phone: "+91 9515029658",
                role: "ADMIN",
            });

            console.log("✅ Admin user created!");
            console.log("─────────────────────────────────────");
            console.log("   Email      : admin@hanvika.com");
            console.log("   Password   : Admin@Hanvika2026");
            console.log("   Secret Key : HanvikaAdmin@2026");
            console.log("─────────────────────────────────────");
            console.log("⚠️  Change the password after first login!");
        }
    } catch (err) {
        console.error("❌ Error creating admin:", err.message);
    } finally {
        await conn.close();
        process.exit(0);
    }
});

conn.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
});
