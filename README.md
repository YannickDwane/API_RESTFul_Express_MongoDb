# API RESTFul pour le site de E-commerce ARTICRAFT
Utilisation de 2 serveurs Node.js pour décomposer la partie backend d'après la conception domain driven design.
Application de l'utilisation du pattern message avec un serveur rabbitMQ : envoie d'info de l'id panier sur le broker et récupération de l'id panier par le service recapitulation commande.

Les données sont hébérger dans un SGBD NOSQL MongoDB.

## INSTALLATION

1) Installer node.js version 18 ou plus
2) Avoir à disposition l'accés et les identifians au Message Broker RabbitMQ
3) Ouvrir l'invite de commande dans ce répértoire
4) lancer la commande : ``` npm install ```
    
 ## UTILISATION
 
 1) Démarré le serveur node.js
 2) Detenir l'accès et les identifiants à la BDD MongoDB utilisé et aux Message Broker RabbitMQ 
 3) Lancer dans un navigateur: http://localhost:4000/ - http://localhost:5000/ et http://localhost:6000/
