#!/usr/bin/env node
const MongoClient = require('mongodb');
const Livraison = require('../models/livraison.model.js');
const Commande = require('../models/commande.model.js');
const Recap_cmd = require('../models/recap_cmd.model.js');
const Anomalie = require('../models/anomalie.model.js');


// Creaton et enregistrement de livraison
// il prend en paramètre l'id de la commande (id_commande = référence commande)
exports.create = (req, res) => {
    if(!req.body.addr_livraison) {
        return res.status(400).send({
            message: "adresse de livraison ne peut pas etre vide"
        });
    }
    //Vérifier d'abord les conditions de livraison ( livraison possible && cmd réglé)
    Recap_cmd.findById(req.params.recap_cmdId)
    .then(recap_cmd => {
        if(!recap_cmd) {
            return res.status(404).send({
                message: "Recap cmd non reconnu avec id " + req.params.recap_cmdId
            });            
        }
        if (recap_cmd.livraison_possible === true && recap_cmd.cmd_regle === true){
            //Création livraison
            Livraison.create(req.body)
            .then(function(livraisons) {
                //S'il une commande est trouvée correspondant à l'id, alors on creer la livraison 
                return Commande.findOneAndUpdate({ _id: req.params.commande_id }, {$push: {livraison: livraisons}}, { new: true });
            })
            .then(function(commandes) {
                // Si une commande est trouvée, on le retourne au client
                res.json(commandes);
            })
            .catch(function(err) {
                // s'il y a erreur on le retourne au client
                res.json(err);
            });

        }else{
            return res.status(404).send({
                message: "NOK: Impossible de liver cette commande car commande non réglé ou rupture de stock " + req.params.recap_cmdId
            });                
        }

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

// Lire et retourner les livrasions dans la BDD.
exports.findAll = (req, res) => {
    Livraison.find()
    .then( livraisons => {
        res.send(livraisons);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation de la livraison"
        });
    });
};

// Trouver une livraison via son Id
exports.findOne = (req, res) => {
    Livraison.findById(req.params.livraisonId)
    .then(livraison => {
        if(!livraison) {
            return res.status(404).send({
                message: "Livraison non reconnu avec id " + req.params.livraisonId
            });            
        }
        res.send(livraison);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Livraison non trouve avec id " + req.params.livraisonId
            });                
        }
        return res.status(500).send({
            message: "Erreur lors de la visuallisation avec id " + req.params.livraisonId
        });
    });
};

// Mettre a jour une livraison via son Id par une requete
exports.update = (req, res) => {
    // Valider requete: l'adresse de livraison doit être complète
    if(!req.body.addr_livraison) {
        return res.status(400).send({
            message: "Le contenu de la livraison ne peut pas être vide"
        });
    }

    // trouver une livraison et la mettre a jour via le contenu du corps de requete
    Livraison.findByIdAndUpdate(req.params.livraisonId, {
        date_livraison: req.body.date_livraison,
        addr_livraison: req.body.addr_livraison
    }, {new: true})
    .then(livraison => {
        if(!livraison) {
            return res.status(404).send({
                message: "Livraison non trouvé avec l'id " + req.params.livraisonId
            });
        }
        res.send(livraison);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "livraison non trouve avec id " + req.params.livraisonId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a lour de la livraison avec l'id " + req.params.livraisonId
        });
    });
};

// Suppression d'une livraison via son Id transmis dans la requete
exports.delete = (req, res) => {
    Livraison.findByIdAndRemove(req.params.livraisonId)
    .then(livarison => {
        if(!livraison) {
            return res.status(404).send({
                message: "Livraison non trouve avec l'id " + req.params.livraisonId
            });
        }
        res.send({message: "livraison supprimee avec succes!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "livraison non trouve avec id " + req.params.livraisonId
            });                
        }
        return res.status(500).send({
            message: "Impossible de supprimer l'id " + req.params.livraisonId
        });
    });
};

//Création d'une anomalies
exports.create_anomalie = (req, res) => {
    //enregister d'abord le parametres
    const descr_anomalie = req.body.description_anomalie;

    //vérification que l'anomalie appartient à une commande et creation d'anomalie
    Commande.findById(req.params.commande_id)
    .then(commandes => {
        if(!commandes) {
            return res.status(404).send({
                message: "Commande inéxistante avec l'id :" + req.params.commande_id
            });            
        }

        console.log(commandes.recap_cmd)

        //RABBIT MQ: envoie du l'id du recap commande correspondant à la commande, 
        //pour mettre à jour le champ cmd_anormale de la table recap_cmd
        var amqp = require('amqplib/callback_api');

        amqp.connect('amqp://localhost', function(error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel_update_recap_cmd) {
                if (error1) {
                    throw error1;
                }

                var queue = 'upade_recap_cmd';
                var msg = commandes.recap_cmd.toString();

                channel_update_recap_cmd.assertQueue(queue, {
                    durable: false
                });
                channel_update_recap_cmd.sendToQueue(queue, Buffer.from(msg));

                console.log(" [x] Sent %s", msg);
            });
            setTimeout(function() {
                connection.close();
            }, 500);
        });
        
        const anomalie = new Anomalie({
            description_anomalie: descr_anomalie
        });
        // enregistrer anomalie dans la BDD
        anomalie.save()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Erreur lors de la creation de l'anomalie de commande"
            });
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation de la commande"
        });
    });
};

// Lire et retourner les anomalies dans la BDD.
exports.findAll_anomalie = (req, res) => {
    Anomalie.find()
    .then( anomalies => {
        res.send(anomalies);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation des anomalies"
        });
    });
};

// Trouver une anomalie via son Id
exports.findOne_anomalie = (req, res) => {
    Anomalie.findById(req.params.anomalieId)
    .then(anomalies => {
        if(!anomalies) {
            return res.status(404).send({
                message: "Anomalie non reconnu avec id " + req.params.anomalieId
            });            
        }
        res.send(anomalies);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Anomalie non trouve avec id " + req.params.anomalieId
            });                
        }
        return res.status(500).send({
            message: "Erreur lors de l'anomalie avec id " + req.params.anomalieId
        });
    });
};

// Mettre a jour une livraison via son Id par une requete
exports.update_anomalie = (req, res) => {
    // Valider requete: description anomalie ne doit pas être vide
    if(!req.body.description_anomalie) {
        return res.status(400).send({
            message: "Le contenu de l'anomalie ne peut pas être vide"
        });
    }

    // trouver une anomalie et la mettre a jour via le contenu du corps de requete
    Anomalie.findByIdAndUpdate(req.params.anomalieId, {
        description_anomalie: req.body.description_anomalie
    }, {new: true})
    .then(anomalies => {
        if(!anomalies) {
            return res.status(404).send({
                message: "Anomalie non trouvé avec l'id " + req.params.anomalieId
            });
        }
        res.send(anomalies);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Anomalie non trouve avec id " + req.params.anomalieId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a lour de l'anomalie avec l'id " + req.params.anomalieId
        });
    });
};

// Suppression d'une anomalie via son Id transmis dans la requete
exports.delete_anomalie = (req, res) => {
    Anomalie.findByIdAndRemove(req.params.anomalieId)
    .then(anomalies => {
        if(!anomalies) {
            return res.status(404).send({
                message: "Anomalie non trouve avec l'id " + req.params.anomalieId
            });
        }
        res.send({message: "Anomalie supprimee avec succes!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Anomalie non trouve avec id " + req.params.anomalieId
            });                
        }
        return res.status(500).send({
            message: "Impossible de supprimer l'id " + req.params.anomalieId
        });
    });
};
