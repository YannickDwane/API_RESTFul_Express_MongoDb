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
    res.json({"message": "Bienvenu sur l'API de gestion de commandes et clients d'ARICRAFT."});
});

require('./app/routes/recap_cmd.routes.js')(app);

// Ecouter les requetes
app.listen(6000, () => {
    console.log("Le serveur ecoute sur le port 6000");
});


