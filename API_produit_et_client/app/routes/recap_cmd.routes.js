module.exports = (app) => {
    const produit_client = require('../controllers/produit_client.controller.js');

    // Creer un nouveau panier
    app.post('/paniers/:clientId', produit_client.create_panier);

    // Creer un nouveau produit
    app.post('/produits/:panierId', produit_client.create_produit);

    // Creer un nouveau client
    app.post('/clients', produit_client.create_client);

    // Mise a jour d'un produit a partir de son Id
    app.put('/produits/:produitId', produit_client.update_produit);

    // Mise a jour d'un client a partir de son Id
    app.put('/clients/:clientId', produit_client.update_client);

    // Supprimer un panier a partir de son Id
    app.delete('/paniers/:panierId', produit_client.delete_panier);

    // Supprimer un client a partir de son Id
    app.delete('/clients/:clientId', produit_client.delete_client);

    // Supprimer un produit a partir de son Id
    app.delete('/produits/:produitId', produit_client.delete_produit);

    // Lire toutes les clients
    app.get('/clients', produit_client.findAll_client);

    // Lire toutes les paniers
    app.get('/paniers', produit_client.findAll_panier);

     // Lire toutes les produits
     app.get('/produits', produit_client.findAll_produit);
    
}