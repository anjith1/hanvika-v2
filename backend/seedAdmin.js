// backend/seedAdmin.js
// Run once: node seedAdmin.js
// Force-resets admin@hanvika.com password to "admin123" (bcrypt hashed).

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("❌ MONGODB_URI not set in .env"); process.exit(1); }

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "WORKER", "ADMIN"], default: "USER" },
});

async function seed() {
    try {
        const conn = await mongoose.createConnection(MONGO_URI).asPromise();
        console.log("✅ Connected to MongoDB");

        const User = conn.models.User || conn.model("User", userSchema, "users");

        const NEW_PASS = "admin123";
        const hashed = await bcrypt.hash(NEW_PASS, 10);

        const existing = await User.findOne({ email: "admin@hanvika.com" });

        if (existing) {
            console.log("ℹ️  Admin found. ID:", existing._id, " | Current role:", existing.role);

            // Force reset password to fresh hash + ensure role is ADMIN
            existing.password = hashed;
            existing.role = "ADMIN";
            await existing.save();
            console.log("✅ Password force-reset to bcrypt hash of:", NEW_PASS);
        } else {
            // Create fresh admin
            await User.create({
                username: "admin",
                email: "admin@hanvika.com",
                password: hashed,
                role: "ADMIN",
                phone: "",
            });
            console.log("✅ Admin created fresh.");
        }

        // Verify the hash works
        const verifyAdmin = await User.findOne({ email: "admin@hanvika.com" });
        const testOk = await bcrypt.compare(NEW_PASS, verifyAdmin.password);
        console.log(`✅ bcrypt verify test: "${NEW_PASS}" → ${testOk ? "PASS ✓" : "FAIL ✗"}`);
        console.log();
        console.log("====================================================");
        console.log("  Admin Login Credentials");
        console.log("  Email:      admin@hanvika.com");
        console.log("  Password:   admin123");
        console.log("  Secret Key: HanvikaAdmin@2026");
        console.log("====================================================");

        await conn.close();
    } catch (err) {
        console.error("❌ Seed error:", err.message);
        process.exit(1);
    }
}

seed();
