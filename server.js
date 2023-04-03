// - IMPORTATION PACKAGES : - //
// Importation express => locale framework minimaliste basé sur node.js
const { app, express } = require("./app");
const { saucesRouter } = require("./routers/sauces.router");
const { authRouter } = require("./routers/auth.router");
// Ecoute du port => 3000
const port = 3000;
// Importation path => pour trouver le chemin
const path = require("path");
const bodyParser = require("body-parser");

// - CONNEXION DATABASE : - //
// Importation locale mongodb => base de données
require("./mongo");

// - MIDDLEWARE : - //
app.use(bodyParser.json());
// Chemin principal sauces
app.use("/api/sauces", saucesRouter);
// Chemin principal auth
app.use("/api/auth", authRouter);

// - ROUTES : - //
// Chemin get absolu => execute function qui affiche hello world
// fonction send => envoie la réponse HTTP
app.get("/", (req, res) => res.send("Hello World!"));

// Chemin dossier images function express.static + path.join __dirname => pour que le chemin soit compatible avec tout les systeme d'exploitation + envoi les images
app.use("/images", express.static(path.join(__dirname, "images")));

// - LISTEN : - //
// Ecoute => le port 3000
// La fonction app.listen est utilisée pour lier et écouter les connexions sur l'hôte et le port spécifiés
app.listen(port, () => console.log("Listening on port " + port));
