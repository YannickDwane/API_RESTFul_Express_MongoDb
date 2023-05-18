#!/usr/bin/env node

const express = require('express');
const bodyParser = require('body-parser');

//Importation module pour stocker l'identifiant de recap_cmd à mettre à jour
const localStorage = require("localStorage")

// creation express app
const app = express();

// convertir application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// convertir application/json
app.use(bodyParser.json())

// Configurer la BDD
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connexion à la BDD
mongoose.connect(dbConfig.url, {
	useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false
}).then(() => {
    console.log("Connexion reussie a la BDD");    
}).catch(err => {
    console.log('Impossible de se connecter a la BDD. Extinction du serveur...', err);
    process.exit();
});

// definir une route GET
app.get('/', (req, res) => {
    res.json({"message": "Bienvenu sur l'API Recapitulatif commande d'ARICRAFT."});
});

require('./app/routes/recap_cmd.routes.js')(app);

// Ecouter les requetes
app.listen(5000, () => {
    console.log("Le serveur ecoute sur le port 5000");
});

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

        channel_update_recap_cmd.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel_update_recap_cmd.consume(queue, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            //envoyer lidentifiant dans le stockage locale
            localStorage.setItem('identifiant', msg.content.toString()) 
            //identifiant_recap_cmd_4_update = msg.content.toString();
        }, {
            noAck: true
        });
    });
});

