module.exports = (app) => {
    const recap_cmds = require('../controllers/recap_cmd.controller.js');

    // Creer une nouvelle commade
    app.post('/commandes', recap_cmds.create_commande);

    // Lire toutes les recap cmd
    app.get('/recapCmds', recap_cmds.findAll);

    // Lire toutes les commandes
    app.get('/commandes/', recap_cmds.findAll_commande);

    //Lire une commande a partir de son Id
    app.get('/commandes/:commande_Id', recap_cmds.findOne_commande);

    // Lire une recap cmd a partir de son Id
    app.get('/recapCmds/:recap_cmdId', recap_cmds.findOne);

    // Mise a jour d'une recap cmd a partir de son Id
    app.put('/recapCmds/:recap_cmdId', recap_cmds.update);

    // Mise a jour une cmd a partir de son Id
    app.put('/commandes/:cmdId', recap_cmds.update_cmd);

    //Mise a jour d'un recap commande apres anomalies
    app.put('/rabbit_upadate_recap_cmd/', recap_cmds.rabbit_update_recap_cmd);

    // Supprimer une commande a partir de son Id
    app.delete('/supprCommamdes/:cmdId/:recap_cmdId', recap_cmds.delete);
}