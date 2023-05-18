module.exports = (app) => {
    const livraisons = require('../controllers/livraison.controller.js');

    // Creer une nouvelle Livraison
    app.post('/livraisons/:commande_id/:recap_cmdId', livraisons.create);

    // Lire toutes les livraisons
    app.get('/livraisons/', livraisons.findAll);

    // Lire une livraison a partir de son Id
    app.get('/livraisons/:livraisonId', livraisons.findOne);

    // Mise a jour d'une livraison a partir de son Id
    app.put('/livraisons/:livraisonId', livraisons.update);

    // Supprimer une livraison a partir de son Id
    app.delete('/livraisons/:livraisonId', livraisons.delete);

    // Creer une anomalie
    app.post('/anomalies/:commande_id', livraisons.create_anomalie);

    //Lire les anomalies
    app.get('/anomalies/', livraisons.findAll_anomalie);

    // Lire une anomalie a partir de son Id
    app.get('/anomalies/:anomalieId', livraisons.findOne_anomalie);

    // Mise a jour d'une anomalie a partir de son Id
    app.put('/anomalies/:anomalieId', livraisons.update_anomalie);

    // Supprimer une anomalie a partir de son Id
    app.delete('/anomalies/:anomalieId', livraisons.delete_anomalie);
    
}