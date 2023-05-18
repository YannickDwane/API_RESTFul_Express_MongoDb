const Recap_cmd = require('../models/recap_cmd.model.js');
const Commande = require('../models/commande.model.js');

//Importation de module pour stocker l'identifiant de recap_cmd à mettre à jour
const localStorage = require("localStorage")

// Lire et retourner les recap cmd dans la BDD.
exports.findAll = (req, res) => {
    Recap_cmd.find()
    .then( recap_cmds => {
        res.send(recap_cmds);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation de la recap cmd"
        });
    });
};

// Trouver un recap cmd via son Id
exports.findOne = (req, res) => {
    Recap_cmd.findById(req.params.recap_cmdId)
    .then(recap_cmd => {
        if(!recap_cmd) {
            return res.status(404).send({
                message: "Recap cmd non reconnu avec id " + req.params.recap_cmdId
            });            
        }
        res.send(recap_cmd);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recap cmd non trouve avec id " + req.params.recap_cmdId
            });                
        }
        return res.status(500).send({
            message: "Erreur lors de la visualisation avec id " + req.params.recap_cmdId
        });
    });
};

// Mettre a jour un recap cmd via son Id par une requete
exports.update = (req, res) => {
    // trouver un recap cmd et la mettre a jour via le contenu du corps de requete
    Recap_cmd.findByIdAndUpdate(req.params.recap_cmdId, {
        livraison_possible:(req.body.livraison_possible.toLowerCase() === 'true'),
        cmd_attente:(req.body.cmd_attente.toLowerCase() === 'true'), 
        cmd_regle:(req.body.cmd_regle.toLowerCase() === 'true'),
        cmd_expedie: (req.body.cmd_expedie.toLowerCase() === 'true'),
        date_expedition: req.body.date_expedition, 
        cmd_recu:(req.body.cmd_recu.toLowerCase() === 'true'),
        cmd_anormale: (req.body.cmd_anormale.toLowerCase() === 'true'),
        date_reception: req.body.date_reception
    }, {new: true})
    .then(recap_cmd => {
        if(!recap_cmd) {
            return res.status(404).send({
                message: "Recap cmd non trouvé avec l'id " + req.params.recap_cmdId
            });
        }
        res.send(recap_cmd);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recap commande non trouve avec id " + req.params.recap_cmdId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a lour de la recap commande avec l'id " + req.params.recap_cmdId
        });
    });
};

// Suppression d'une recap commande via son Id transmis dans la requete
exports.delete = (req, res) => {
    //Suppression de la commande qui s'y refère
    Commande.findByIdAndRemove(req.params.cmdId)
    .then(commandes => {
        if(!commandes) {
            return res.status(404).send({
                message: "Commande non trouve avec l'id " + req.params.cmdId
            });
        }
        //Suppression du recap commande qui s'y refère
        Recap_cmd.findByIdAndRemove(req.params.recap_cmdId)
        .then(recap_cmds => {
            if(!recap_cmds) {
                return res.status(404).send({
                    message: "Recap commande non trouve avec l'id " + req.params.recap_cmdId
                });
            }
            res.send({message: "Commande et Recap commande supprimee avec succes!"});
        }).catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Recap cmd non trouve avec id " + req.params.recap_cmdId
                });                
            }
            return res.status(500).send({
                message: "Impossible de supprimer l'id " + req.params.recap_cmdId
            });
        });
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Cmd non trouve avec id " + req.params.cmdId
            });                
        }
        return res.status(500).send({
            message: "Impossible de supprimer l'id " + req.params.cmdId
        });
    });
};

// Creaton et enregistrement d'une commande

exports.create_commande = (req, res) => {
    // Creer une recap commande
    const recap_cmd = new Recap_cmd({
        //Creation avec tous les chanps par défaut au début
        //Mise à jour à faire depuis d'autres service via appel API
    });

    // enregistrer recap cmd dans la BDD
    recap_cmd.save()
    .then(data => {
        //res.send(data);
        const recap_cmdId = data._id.toString();

        //enregistrement commande
        // Valider la requete: date commande ne doit pas être vide
        if(!req.body.date_commande) {
            return res.status(400).send({
                message: "Le resume de la commande ne peut pas etre vide"
            });
        }

        // Creer une commande
        const commande= new Commande({
            date_commande: req.body.date_commande,
            recap_cmd: recap_cmdId,
            intitule_cmd: req.body.intitule_cmd.toString()
        });

        // enregistrer commande dans la BDD
        commande.save()
        .then(data1 => {
            res.send(data1);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Erreur lors de la creation de la commande"
            });
        });


    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors de la creation de recap commande"
        });
    });
};

// Lire et retourner les commandes dans la BDD.
exports.findAll_commande = (req, res) => {
    Commande.find().
    populate("livraison")
    .then(commandes => {
        res.send(commandes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation de la recap cmd"
        });
    });
};

// Trouver une commande via son Id
exports.findOne_commande = (req, res) => {
    Commande.findById(req.params.commande_Id)
    .then(commandes => {
        if(!commandes) {
            return res.status(404).send({
                message: "Commande non reconnu avec id " + req.params.commande_Id
            });            
        }
        res.send(commandes);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Commande non trouve avec id " + req.params.commande_Id
            });                
        }
        return res.status(500).send({
            message: "Erreur lors de la visualisation de la commande avec id " + req.params.commande_Id
        });
    });
};

// Mettre a jour une cmd via son Id par une requete
exports.update_cmd = (req, res) => {
    
    // trouver une cmd et la mettre a jour via le contenu du corps de requete
    Commande.findByIdAndUpdate(req.params.cmdId, {
        date_commande: req.body.date_commande,
        intitule_cmd: req.body.intitule_cmd.toString()
    }, {new: true})
    .then(cmds => {
        if(!cmds) {
            return res.status(404).send({
                message: "commamde non trouvée avec l'id " + req.params.cmdId
            });
        }
        res.send(cmds);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Commande non trouvée avec id " + req.params.cmdId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a jour de la commande avec l'id " + req.params.cmdId
        });
    });
};

// Mettre a jour une cmd via son Id avec RabbitMQ
exports.rabbit_update_recap_cmd = (req, res) => {
    //Mettre a jour le recap_commande (concernant l'anomalie) obtenu sur RABBIT MQ
    //De maniere synchrone

    //récupération de l'id de la récap commande venant de RabitMQ
    //console.log("recuperation ID par stockage locales")
    console.log(localStorage.getItem('identifiant'))
    const recap_cmdId = localStorage.getItem('identifiant')

    Recap_cmd.findByIdAndUpdate(recap_cmdId, {
        cmd_anormale: ('true' === 'true')
    }, {new: true})
    .then(recap_cmd_update => {
        if(!recap_cmd_update) {
            return res.status(404).send({
                message: "Recap cmd non trouvé avec l'id " + recap_cmdId
            });
        }
        res.send(recap_cmd_update);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Recap commande non trouve avec id " + recap_cmdId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a lour de la recap commande avec l'id " + recap_cmdId
        });
    });
};
