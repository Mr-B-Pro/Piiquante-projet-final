// - IMPORTATION PACKAGES : - //
// Importation express => framework minimaliste basé sur node.js
const express = require("express");

// - CONTROLLERS : - //
//  Importation fonctions : getSauces => sert à gerer le token + createSauce => sert à créer une sauce + getSauceById => sert à gerer l'id pour les sauces + deleteSauce => sert à supprimer une sauce + modifySauce => sert à modifier une sauce + likeSauce => sert à gerer les likes et dislikes sur les sauces
const {
  getSauces,
  createSauce,
  getSauceById,
  deleteSauce,
  modifySauce,
  likeSauce,
} = require("../controllers/sauces");

// - MIDDLEWARE : - //
// Importation function authentificateUser => locale sert à authentifier utilisateur
const { authenticateUser } = require("../middleware/auth");
// Importation function upload => locale met l'image dans le dossier images
const { upload } = require("../middleware/multer");
// Importation express.Router => est utilisée pour créer un nouvel objet routeur dans le programme pour gérer les requêtes
const saucesRouter = express.Router();
// Importation body-parser => est utilisé pour traiter les données envoyées dans un corps de requête HTTP
const bodyParser = require("body-parser");
// Invocation bodyParser.json => transforme les données arrivant de la requête POST en un objet JSON facilement exploitable
saucesRouter.use(bodyParser.json());
// Invocation function authentificateUser => sert à authentifier utilisateur
saucesRouter.use(authenticateUser);

// - ROUTES : - //
//// Chemin get api sauces => execute function getSauces sert à gerer le token
saucesRouter.get("/", getSauces);
// Chemin post api sauces => execute function upload => met l'image dans le dossier images + function createSauce sert à créer une sauce
saucesRouter.post("/", upload.single("image"), createSauce);
// Chemin get api sauces id => execute function getSauceById sert à gerer l'id pour les sauces
saucesRouter.get("/:id", getSauceById);
// Chemin delete api sauces id => execute function deleteSauce sert à supprimer une sauce
saucesRouter.delete("/:id", deleteSauce);
// Chemin put api sauces id => execute function upload => met l'image dans le dossier images + function modifySauce sert à modifier une sauce
saucesRouter.put("/:id", upload.single("image"), modifySauce);
// Chemin post api sauces id like => execute function likeSauce sert à gerer les likes et dislikes sur les sauces
saucesRouter.post("/:id/like", likeSauce);

// - EXPORTATION : - //
// Exportation : saucesRouter => est utilisée pour créer un nouvel objet routeur dans le programme pour gérer les requêtes
module.exports = { saucesRouter };
