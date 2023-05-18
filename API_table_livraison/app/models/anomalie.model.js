const mongoose = require('mongoose');

const AnomalieSchema = mongoose.Schema({
    description_anomalie: {
        type: String, 
        required: true,
        default: ""
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Anomalie', AnomalieSchema);