require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;
    const workerSchema = new mongoose.Schema({}, { strict: false });

    const Worker = connection.model('WorkerUpdate', workerSchema, 'workers'); // 'workers' collection

    const workers = await Worker.find();
    console.log(`Found ${workers.length} workers to update to services array.`);

    for (const w of workers) {
        let changed = false;

        if (!w.services || !Array.isArray(w.services)) {
            // Handle undefined array or migration
            w.services = [];
            changed = true;

            // Migrate from serviceType string if present
            if (w.serviceType && typeof w.serviceType === 'string' && w.serviceType.trim() !== "") {
                w.services.push(w.serviceType);
            }
            // Migrate from workerTypes object if present and serviceType was empty
            else if (w.workerTypes && typeof w.workerTypes === 'object') {
                const types = Object.keys(w.workerTypes).filter(k => w.workerTypes[k] === true);
                types.forEach(val => {
                    // Attempt to normalize literal old names
                    let type = val;
                    if (type === "AC Repair" || type === "Technical") type = "acRepair";
                    else if (type === "Mechanic" || type === "Mechanic Repair") type = "mechanicRepair";
                    else if (type === "Electrical" || type === "Electrical Repair") type = "electricalRepair";
                    else if (type === "Electronics" || type === "Electronics Repair") type = "electronicRepair";
                    else if (type === "Plumber" || type === "Non-Technical") type = "plumber";
                    else if (type === "Packers & Movers" || type === "Housekeeping" || type === "packersMovers") type = "packersMovers";

                    if (!w.services.includes(type) && ['acRepair', 'mechanicRepair', 'electricalRepair', 'electronicRepair', 'plumber', 'packersMovers'].includes(type)) {
                        w.services.push(type);
                    }
                });
            }
        }

        if (changed) {
            console.log(`-> Updating worker ${w.username} to services: ${JSON.stringify(w.services)}`);
            await w.save();
        }
    }

    console.log("Done migrating to services array.");
    process.exit(0);
}

migrate().catch(console.error);
