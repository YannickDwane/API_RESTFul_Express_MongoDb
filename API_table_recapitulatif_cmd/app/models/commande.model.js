const mongoose = require('mongoose');
const Commande = require('../models/commande.model.js');
const Livraison = require('../models/livraison.model.js')


const CommandeSchema = mongoose.Schema({
    //cle etrangere de la relation 1 to 1 avec recap_cmd
    recap_cmd: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Recap_cmd",
       },
    //cle etrangere de la relation 0..* to 1 avec livraison
    livraison: [ {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Livraison",
        default: null
    } ],
    date_commande: {
        type: Date,
        required: true,
        default: new Date()
    },
    intitule_cmd: {
        type: String,
        required: true,
        default: ""
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Commande', CommandeSchema);