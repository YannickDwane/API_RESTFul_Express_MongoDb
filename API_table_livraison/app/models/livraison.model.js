const mongoose = require('mongoose');

const LivraisonSchema = mongoose.Schema({
    date_livraison: {
        type: Date,
        required: true,
        default: new Date()
       },
    addr_livraison: {
        type: String,
        required: true
       }
}, {
    timestamps: true
});

module.exports = mongoose.model('Livraison', LivraisonSchema);