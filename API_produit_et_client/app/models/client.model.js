const mongoose = require('mongoose');

const Produit = require('../models/produit.model.js');
const Panier = require('../models/panier.model.js')

const ClientSchema = mongoose.Schema({
    //clé étrangère  relation 1 to Many avec produit
    panier: [ {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Panier",
        default: null
    } ],
    nom: {
        type: String,
        required: true,
        default: ""
       },
    prenom: {
        type: String,
        required: true,
        default: ""
       },
    adresse: {
        type: String,
        required: true,
        default: ""
       },
    adresse_mail: {
        type: String,
        required: true,
        default: ""
       },
    numero_telephone: {
        type: String,
        required: true,
        default: ""
       },
}, {
    timestamps: true
});

module.exports = mongoose.model('Client', ClientSchema);