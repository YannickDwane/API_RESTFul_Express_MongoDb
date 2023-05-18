const mongoose = require('mongoose');



const ProduitSchema = mongoose.Schema({
    nom: {
        type: String,
        required: true,
        default: ""
    },
    couleur: {
        type: String,
        required: true,
        default: ""
    },
    quantite:{
        type: Number,
        required: true,
        default: 0
    },
    image: {
        type: String,
        required: true,
        default: ""
    },
    prix_unitaire: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Produit', ProduitSchema);