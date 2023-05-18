const mongoose = require('mongoose');
const Produit = require('../models/produit.model.js');

const PanierSchema = mongoose.Schema({
    produit: [ {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Produit",
        default: null
    } ],
    date_panier: {
        type: Date,
        required: true,
        default: Date.now()
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Panier', PanierSchema);
