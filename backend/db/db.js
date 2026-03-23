const mongoose = require('mongoose');

function connectTODb() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('✅ Connected to DB');
        })
        .catch(err => console.log('❌ DB ERROR:', err));
}

module.exports = connectTODb;