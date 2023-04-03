// ------ GESTION DES IMAGES  ------ //

// - IMPORTATION PACKAGES : - //
// Importation multer => pour gérer les images
const multer = require("multer");

// - MET LE CHEMIN DE L'IMAGE ET SON NOM : - //
// Invocation functions multer.diskStorage => chemin dossier images + nom de l'image
const storage = multer.diskStorage({
  // destination => envoi fichier vers dossier images
  destination: "images/",
  // invocation function filename => invocation function makeFilename renomme l'image
  filename: function (req, file, cb) {
    cb(null, makeFilename(req, file));
  },
});

// Function makeFilename => sert renommer l'image
function makeFilename(req, file) {
  console.log("req, file:", file);
  // fileName => renomme l'image avec la date et enleve les espaces en remplaçant par un barre -
  const fileName = `${Date.now()}-${file.originalname}`.replace(/\s/g, "-");
  // file.fileName => met le nouvau nom sur la requete du file
  file.fileName = fileName;
  return fileName;
}
// upload => met l'image dans le dossier images
const upload = multer({ storage });

// - EXPORTATION : - //
// Exportation : upload => met l'image dans le dossier images
module.exports = { upload };
