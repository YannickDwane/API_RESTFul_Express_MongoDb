#!/usr/bin/env node

const Client = require('../models/client.model.js');
const Panier = require('../models/panier.model.js');
const Produit = require('../models/produit.model.js');

//Importation de module pour stocker l'identifiant de recap_cmd à mettre à jour
const localStorage = require("localStorage")

//Création d'un panier
exports.create_panier = (req, res) => {

    Panier.create(req.body)
            .then(paniers => {
                //RABBIT MQ: envoie du l'id du panier vers RabbitMQ, 
                //pour le lien des microservices
                var amqp = require('amqplib/callback_api');

                amqp.connect('amqp://localhost', function(error0, connection) {
                    if (error0) {
                        throw error0;
                    }
                    connection.createChannel(function(error1, channel_envoie_id_panier) {
                        if (error1) {
                            throw error1;
                        }

                        var queue = 'id_panier';
                        var msg = paniers._id.toString();

                        channel_envoie_id_panier.assertQueue(queue, {
                            durable: false
                        });
                        channel_envoie_id_panier.sendToQueue(queue, Buffer.from(msg));

                        console.log(" [x] Sent %s", msg);
                    });
                    setTimeout(function() {
                        connection.close();
                    }, 500);
                });
                
                //Si un client est trouvé correspondant à l'id, alors on creer le panier correspondant à ce client
                return Client.findByIdAndUpdate(req.params.clientId, {$push: {panier: paniers._id}}, { new: true });
            })
            .then(clients => {
                // Si un client est trouve, on le retourne le client
                res.json(clients);
            })
            .catch(err => {
                // s'il y a erreur on le retourne l'erreur
                res.json(err);
            });
}

//supression d'un panier
exports.delete_panier= (req, res) => {
    Panier.findByIdAndRemove(req.params.panierId)
    .then(paniers => {
        if(!paniers) {
            return res.status(404).send({
                message: "Panier non trouve avec l'id " + req.params.panierId
            });
        }
        res.send({message: "Panier supprimee avec succes!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "panier non trouve avec id " + req.params.panierId
            });                
        }
        return res.status(500).send({
            message: "Impossible de supprimer l'id " + req.params.panierId
        });
    });
};

//Visualiser les paniers
// Lire et retourner les clients dans la BDD.
exports.findAll_panier = (req, res) => {
    Panier.find().
    populate("produit")
    .then(paniers => {
        res.send(paniers);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation du panier"
        });
    });
};

//Creer produit
exports.create_produit = (req, res) => { 
    Produit.create(req.body)
    .then(produits => {
        //Si un panier est trouvé correspondant à l'id, alors on creer le produit lié à ce panier
        return Panier.findByIdAndUpdate(req.params.panierId, {$push: {produit: produits._id}}, { new: true });
    })
    .then(produits => {
        // Si un produit est trouve, on le retourne le produit
        res.json(produits);
    })
    .catch(err => {
        // s'il y a erreur on le retourne l'erreur
        res.json(err);
    });
}
//Visualiser les produits
// Lire et retourner les produits dans la BDD.
exports.findAll_produit = (req, res) => {
    Produit.find()
    .then(produits => {
        res.send(produits);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation du produit"
        });
    });
};

//supprimer produit
exports.delete_produit= (req, res) => {
    Produit.findByIdAndRemove(req.params.produitId)
    .then(produits => {
        if(!produits) {
            return res.status(404).send({
                message: "Produit non trouve avec l'id " + req.params.produitId
            });
        }
        res.send({message: "Produit supprimee avec succes!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "produit non trouve avec id " + req.params.produitId
            });                
        }
        return res.status(500).send({
            message: "Impossible de supprimer l'id " + req.params.produitId
        });
    });
};

//Creation client
exports.create_client = (req, res) => { 
    const client = new Client({
        nom : req.body.nom,
        prenom: req.body.prenom,
        adresse: req.body.adresse,
        adresse_mail: req.body.adresse_mail,
        numero_telephone: req.body.numero_telephone
    });
    // enregistrer client dans la BDD
    client.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors de la creation de client"
        });
    });
}

// Lire et retourner les clients dans la BDD.
exports.findAll_client = (req, res) => {
    Client.find().
    populate("panier")
    .then(clients => {
        res.send(clients);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Erreur lors du visualisation du client"
        });
    });
};

//supprimer client
exports.delete_client= (req, res) => {
    Client.findByIdAndRemove(req.params.clientId)
    .then(clients => {
        if(!clients) {
            return res.status(404).send({
                message: "Client non trouve avec l'id " + req.params.clientId
            });
        }
        res.send({message: "Client supprimee avec succes!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "client non trouve avec id " + req.params.clientId
            });                
        }
        return res.status(500).send({
            message: "Impossible de supprimer l'id " + req.params.clientId
        });
    });
};

//Mise à jour client
exports.update_client = (req, res) => {
    // trouver un client et la mettre a jour via le contenu du corps de requete
    Client.findByIdAndUpdate(req.params.clientId, {
        nom : req.body.nom,
        prenom: req.body.prenom,
        adresse: req.body.adresse,
        adresse_mail: req.body.adresse_mail,
        numero_telephone: req.body.numero_telephone
    }, {new: true})
    .then(clients => {
        if(!clients) {
            return res.status(404).send({
                message: "Client non trouvé avec l'id " + req.params.clientId
            });
        }
        res.send(clients);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "client non trouve avec id " + req.params.clientId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a jour des clients avec l'id " + req.params.clientId
        });
    });
};

//Mettre à jour les produits
exports.update_produit = (req, res) => {
    // trouver les produits et la mettre a jour via le contenu du corps de requete
    Produit.findByIdAndUpdate(req.params.produitId, {
        nom : req.body.nom,
        couleur: req.body.couleur,
        quantite: req.body.quantite,
        image: req.body.image,
        prix_unitaire: req.body.prix_unitaire
    }, {new: true})
    .then(produits => {
        if(!produits) {
            return res.status(404).send({
                message: "Produit non trouvé avec l'id " + req.params.produitId
            });
        }
        res.send(produits);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Produit non trouve avec id " + req.params.produitId
            });                
        }
        return res.status(500).send({
            message: "Erreur de mise a jour des produits avec l'id " + req.params.clientId
        });
    });
};
