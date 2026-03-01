require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;
    const workerSchema = new mongoose.Schema({
        username: String,
        serviceType: String
    }, { strict: false }); // Allow reading unmapped fields if any like workerTypes

    const Worker = connection.model('Worker', workerSchema);

    const workers = await Worker.find();
    console.log(`Found ${workers.length} workers to check.`);

    for (const w of workers) {
        let changed = false;
        console.log(`\nChecking worker: ${w.username} (Current ServiceType: "${w.serviceType}")`);

        // Normalize literal old names
        if (w.serviceType === "AC Repair" || w.serviceType === "Technical") {
            w.serviceType = "acRepair";
            changed = true;
        } else if (w.serviceType === "Mechanic" || w.serviceType === "Mechanic Repair") {
            w.serviceType = "mechanicRepair";
            changed = true;
        } else if (w.serviceType === "Electrical" || w.serviceType === "Electrical Repair") {
            w.serviceType = "electricalRepair";
            changed = true;
        } else if (w.serviceType === "Electronics" || w.serviceType === "Electronics Repair") {
            w.serviceType = "electronicRepair";
            changed = true;
        } else if (w.serviceType === "Plumber" || w.serviceType === "Non-Technical") {
            w.serviceType = "plumber";
            changed = true;
        } else if (w.serviceType === "Packers & Movers" || w.serviceType === "Housekeeping" || w.serviceType === "packersMovers") {
            w.serviceType = "packersMovers";
            changed = true;
        }

        if (changed) {
            console.log(`-> Updating to ${w.serviceType}`);
            await w.save();
        }
    }

    console.log("Done normalizing.");
    process.exit(0);
}

migrate().catch(console.error);
