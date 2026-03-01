require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;

    // Using strict: false to access legacy fields
    const workerSchema = new mongoose.Schema({
        email: String,
        status: String,
        services: [String]
    }, { strict: false });
    const Worker = connection.model('WorkerUpdate', workerSchema, 'workers');

    // We can use the actual WorkerForm schema since it's accurate
    const WorkerForm = require('./src/models/WorkerForm');

    const validServices = [
        "acRepair",
        "mechanicRepair",
        "electricalRepair",
        "electronicRepair",
        "plumber",
        "packersMovers"
    ];

    const workers = await Worker.find();
    console.log(`Checking ${workers.length} workers for migration...`);

    let updatedCount = 0;

    for (const w of workers) {
        // If worker has no services, try to populate from WorkerForm
        if (!w.services || w.services.length === 0) {
            console.log(`\nWorker ${w.email} has empty services. Looking up form...`);
            const form = await WorkerForm.findOne({ email: w.email });

            if (form && form.workerTypes) {
                let extractedServices = [];
                for (const [key, isSelected] of Object.entries(form.workerTypes)) {
                    if (isSelected === true && validServices.includes(key)) {
                        extractedServices.push(key);
                    }
                }

                if (extractedServices.length > 0) {
                    w.services = extractedServices;
                    await w.save();
                    updatedCount++;
                    console.log(`-> Updated worker ${w.email} services to: [${extractedServices.join(", ")}]`);
                } else {
                    console.log(`-> Form found but no valid workerTypes true values.`);
                }
            } else {
                console.log(`-> No WorkerForm found or workerTypes missing for ${w.email}. Admin manual re-approval / assignment needed.`);
            }
        }
    }

    console.log(`\nMigration completed. Updated ${updatedCount} workers.`);
    process.exit(0);
}

migrate().catch(console.error);
