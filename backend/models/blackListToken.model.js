const mongoose = require('mongoose');

const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours
    }
});

// ✅ SAFE EXPORT (no OverwriteModelError)
module.exports =
    mongoose.models.BlackListToken ||
    mongoose.model('BlackListToken', blackListTokenSchema);
