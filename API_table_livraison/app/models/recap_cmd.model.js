const mongoose = require('mongoose');

const Recap_cmdSchema = mongoose.Schema({
    livraison_possible: {
        type: Boolean,
        default: false
    },
    cmd_attente: {
        type: Boolean,
        default: false
    },
    cmd_regle: {
        type: Boolean,
        default: false
    },
    cmd_expedie: {
        type: Boolean,
        default: false
    },
    date_expedition: {
        type: Date,
        default: ""
       },
    cmd_recu: {
        type: Boolean,
        default: false
    },
    cmd_anormale: {
        type: Boolean,
        default: false
    },
    date_reception: {
        type: Date,
        default: ""
       },
}, {
    timestamps: true
});

module.exports = mongoose.model('Recap_cmd', Recap_cmdSchema);
