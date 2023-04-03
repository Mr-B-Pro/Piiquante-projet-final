// ------ EXPRESS ------ //

// - IMPORTATION PACKAGES : - //
// Importation dotenv => masque les données sensibles
require("dotenv").config();
// Importation express => framework minimaliste basé sur node.js
const express = require("express");
// Invocation function express => framework minimaliste basé sur node.js
const app = express();
// Importation cors => pour ajouter des headers
const cors = require("cors");

// - MIDDLEWARE : - //
// Invocation function cors => pour ajouter des headers
app.use(cors());
// Invocation function express.json => reconnaît objet request entrant en tant qu'objet JSON
app.use(express.json());

// - EXPORTATION : - //
// Exportation : app + express => framework minimaliste basé sur node.js
module.exports = { app, express };
