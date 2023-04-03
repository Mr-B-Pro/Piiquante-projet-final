// - CONTROLLERS : - //
//  Importation fonctions createUser + logUser => locale création + connexion utilisateur
const { createUser, logUser } = require("../controllers/users");

// - IMPORTATION PACKAGES : - //
// Importation express => framework minimaliste basé sur node.js
const express = require("express");
// Importation express.Router => est utilisée pour créer un nouvel objet routeur dans le programme pour gérer les requêtes
const authRouter = express.Router();

// - ROUTES : - //
// Chemin post api signup => invoque function creation utilisateur
authRouter.post("/signup", createUser);
// Chemin post api login => invoque function connexion utilisateur
authRouter.post("/login", logUser);

// - EXPORTATION : - //
// Exportation : authRouter => est utilisée pour créer un nouvel objet routeur dans le programme pour gérer les requêtes
module.exports = { authRouter };
