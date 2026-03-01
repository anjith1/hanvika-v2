require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;
    const srSchema = new mongoose.Schema({}, { strict: false });
    const ServiceRequest = connection.model('ServiceRequest', srSchema);

    const reqs = await ServiceRequest.find();
    console.log(`Found ${reqs.length} service requests.`);

    let deleted = 0;
    for (const r of reqs) {
        console.log(`ID: ${r._id}, ServiceType: "${r.serviceType}"`);
        if (!r.serviceType || !['acRepair', 'mechanicRepair', 'electricalRepair', 'electronicRepair', 'plumber', 'packersMovers'].includes(r.serviceType)) {
            console.log(`-> Invalid serviceType. Normalizing if possible or Deleting...`);
            await ServiceRequest.deleteOne({ _id: r._id });
            deleted++;
        }
    }

    console.log(`Deleted ${deleted} invalid requests.`);
    process.exit(0);
}

check().catch(console.error);
