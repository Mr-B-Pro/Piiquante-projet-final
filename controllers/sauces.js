// ------ GESTION TOKEN + CREATION SAUCES + GESTION LIKE ------ //

// - IMPORTATION PACKAGES : - //
// Importation mongodb => base de données
const mongoose = require("mongoose");
// Importation File System => supprime une image du dossier images
const { unlink } = require("fs/promises");
const { log } = require("console");

// - SCHEMA CREATION SAUCE : - //
// Schema productSchema => objet création sauce
const productSchema = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: { type: Number, min: 1, max: 10 },
  likes: Number,
  dislikes: Number,
  usersLiked: [String],
  usersDisliked: [String],
});

// Product => nom du schéma + utilisation de productSchema
// Fonction mongoose.model => est utilisée pour créer une collection d'une base de données
const Product = mongoose.model("Product", productSchema);
mongoose.set("strictQuery", false);

// Function getSauces => sert à obtenir sauces
function getSauces(req, res) {
  // si token est ok :
  // méthode find de mongoose sur l'objet Product => la méthode find est utilisée pour sélectionner des documents dans la base de données. ({}) pour renvoyer tous les documents d'une collection.
  Product.find({})
    // fonction send => envoie la réponse HTTP
    .then((products) => res.send(products))
    // status 500 => serveur rencontre un problème qui l'empêche de répondre à la requête
    // fonction send => envoie la réponse HTTP
    .catch((error) => res.status(500).send(error));
}

// - GERER UN ID : - //
// Function getSauce => sert à trouver l'id
function getSauce(req, res) {
  // id => recupere id dans l'url
  const { id } = req.params;
  // renvoi invocation function de mongoose findById sur l'objet Product => recherche une sauce par son id
  return Product.findById(id);
}

// Function getSauceById => sert à gerer l'id pour les sauces
function getSauceById(req, res) {
  // invocation function getSauce => sert à trouver l'id
  getSauce(req, res)
    // invocation function sendClientResponse => sert à gerer l'envoi d'une sauce modifiée au client
    .then((product) => sendClientResponse(product, res))
    // status 500 => serveur rencontre un problème qui l'empêche de répondre à la requête
    // fonction send => envoie la réponse HTTP
    .catch((err) => res.status(500).send(err));
}

// - SUPPRIMER UNE SAUCE : - //
// Function deleteSauce => sert à supprimer une sauce
function deleteSauce(req, res) {
  // id => recupere id dans l'url
  const { id } = req.params;
  // invocation function de mongoose findByIdAndDelete sur l'objet Product => supprime la sauce correspondant à l'id
  Product.findByIdAndDelete(id)
    // invocation function sendClientResponse => sert à gerer l'envoi d'une sauce modifiée au client
    .then((product) => sendClientResponse(product, res))
    // invocation function deleteImage => sert à supprimer image
    .then((item) => deleteImage(item))
    .then((res) => console.log("FICHIER SUPPRIMÉ: ", res))
    // status 500 => serveur rencontre un problème qui l'empêche de répondre à la requête
    // fonction send => envoie la réponse HTTP
    .catch((err) => res.status(500).send({ message: err }));
}

// - MODIFIER UNE SAUCE : - //
// Function modifySauce => sert à modifier une sauce
function modifySauce(req, res) {
  if (req.file) {
    Product.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images")[1];

        fs.unlink(`images/${filename}`, (err) => {
          if (err) throw err;
        });
      })
      .catch((error) => {
        return console.log("image !!");
      });
  } else {
  }

  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Product.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(400).json({ error }));
}

// - SUPPRIMER UNE IMAGE : - //
// Function deleteImage => sert à supprime image
function deleteImage(product) {
  // si il n'y a rien dans la base de donnée alors ne fait rien
  if (product == null) return;
  console.log("SUPPRIMER L'IMAGE: ", product);

  // imageToDelete  => recupere l'url de l'image + split donc separe elements entre les / + recupere le dernier element avec -1
  const imageToDelete = product.imageUrl.split("/").at(-1);
  // renvoi fs unlink => supprimer le contenu du dossier images
  return unlink("images/" + imageToDelete);
}

// - GERER LE PAYLOAD : - //
// Function makePayload => sert à gerer le payload avec ou sans l'image
function makePayload(hasNewImage, req) {
  console.log("Voici hasNewImage: ", hasNewImage);
  // si il y a pas d'image :
  // renvoi les données de la requete
  if (!hasNewImage) return req.body;

  // si il y a une image :
  // méthode JSON.parse => transforme les données de la sauce qui sont en string en un objet
  const payload = JSON.parse(req.body.sauce);
  // invocation fonction makeImageUrl => sert à trouver lien absolu de l'url de l'image
  payload.imageUrl = makeImageUrl(req, req.file.fileName);
  console.log("NOUVELLE IMAGE A GERER: ");
  console.log("Voici le payload: ", payload);
  // renvoi payload => les données de la sauce sous forme d'objet
  return payload;
}

// - GERER L'ENVOI D'UNE SAUCE MODIFIEE AU CLIENT : - //
// Function sendClientResponse => sert à gerer l'envoi d'une sauce modifiée au client
function sendClientResponse(product, res) {
  // si modification sauce pas ok :
  // alors renvoi status 404 => le serveur ne trouve pas la ressource demandée
  if (product == null) {
    //console.log('RIEN A METTRE A JOUR: ')
    // fonction send => envoie la réponse HTTP
    return res
      .status(404)
      .send({ message: "Objet introuvable dans la base de données: " });
  }
  // si modification sauce ok
  // renvoi status 200 => réussite requête
  //console.log('TOUT EST BIEN MIS A JOUR: ', product)
  // la méthode Promise.resolve renvoi une promesse résolue avec la valeur donnée
  // fonction send => envoie la réponse HTTP
  return Promise.resolve(res.status(200).send(product)).then(() => product);
}

// fonction makeImageUrl => sert à trouver lien absolu de l'url de l'image
function makeImageUrl(req, fileName) {
  // renvoi req.protocol contient la chaîne de protocole de requête qui est HTTP + ://localhost + le dossier + le nom de l'image
  return req.protocol + "://" + req.get("host") + "/images/" + fileName;
}

// - CREER UNE SAUCE : - //
// Function createSauce => sert à créer une sauce
function createSauce(req, res) {
  // body + file  => recupere les données du body + données de l'image de la requete
  const { body, file } = req;
  // fileName  => recupere les données du nom de l'image
  const { fileName } = file;
  // méthode JSON.parse => transforme les données de la sauce qui sont en string en un objet
  const sauce = JSON.parse(body.sauce);
  // variables => recupere les données des elements de la sauce de l'objet product
  const { name, manufacturer, description, mainPepper, heat, userId } = sauce;

  // product => element de l'objet sauce
  const product = new Product({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper,
    imageUrl: makeImageUrl(req, fileName),
    heat: heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  // fonction save => sauvegarde la creation de sauce
  product
    .save()
    // status 201 => ressource crée
    // fonction send => envoie la réponse HTTP
    .then((message) => res.status(201).send({ message }))
    // status 500 => serveur rencontre un problème qui l'empêche de répondre à la requête
    .catch((err) => res.status(500).send(err));
}

// - GESTION DES LIKES ET DISLIKES SUR LES SAUCE: - //
// Function likeSauce => sert à gerer les likes et dislikes sur les sauces
function likeSauce(req, res) {
  // like + userId  => recupere les données du like + du userId de la requete
  const { like, userId } = req.body;
  // si like n'est pas égal à 1, -1 ou 0 :
  // la méthode includes permet de déterminer si un tableau contient une valeur et renvoi true si c'est le cas sinon renvoi false
  if (![1, -1, 0].includes(like))
    // alors renvoi status 403 => serveur comprend requête mais refuse d'autoriser
    // fonction send => envoie la réponse HTTP
    return res.status(403).send({ message: "Le vote est invalide: " });

  // si like est égal à 1, -1 ou 0 :
  // invocation function getSauce => sert à trouver l'id
  getSauce(req, res)
    // invocation function updateVote => sert à mettre à jour le vote
    .then((product) => updateVote(product, like, userId, res))
    // fonction save => sauvegarde le like ou le dislike
    .then((pr) => pr.save())
    // invocation function sendClientResponse => sert à gerer l'envoi d'une sauce modifiée au client
    .then((prod) => sendClientResponse(prod, res))
    // status 500 => serveur rencontre un problème qui l'empêche de répondre à la requête
    // fonction send => envoie la réponse HTTP
    .catch((err) => res.status(500).send(err));
}

// Function updateVote => sert à mettre à jour les likes et dislikes sur les sauces
function updateVote(product, like, userId, res) {
  // si like est égal à 1 ou -1 :
  //  renvoi invocation function incrementVote => sert à ajouter les likes et dislikes sur les sauces
  if (like === 1 || like === -1) return incrementVote(product, userId, like);
  // alors renvoi invocation function resetVote => sert à annuler un like ou un dislike
  return resetVote(product, userId, res);
}

// Function resetVote => sert à annuler un like ou un dislike
function resetVote(product, userId, res) {
  // usersLiked + usersDisliked  => recupere les données des les likes et dislikes
  const { usersLiked, usersDisliked } = product;
  // si il a déja été like ou dislike :
  // la méthode every permet de tester si tous les éléments d'un tableau vérifient une condition par une fonction
  // la méthode includes permet de déterminer si un tableau contient une valeur et renvoi true si c'est le cas sinon renvoi false
  if ([usersLiked, usersDisliked].every((arr) => arr.includes(userId)))
    // alors renvoi la méthode Promise.reject qui renvoie un objet Promise qui est rejeté à cause d'une raison donnée
    return Promise.reject(
      "L'utilisateur semble avoir voté dans les deux sens: "
    );

  // si il n'a pas déja like ou dislike :
  // la méthode some teste si un élément du tableau réussit le test de la fonction fournie. Elle renvoie vrai si dans le tableau elle trouve un élément pour lequel la fonction fournie renvoie vrai, sinon il renvoie faux
  // la méthode includes permet de déterminer si un tableau contient une valeur et renvoi true si c'est le cas sinon renvoi false
  if (![usersLiked, usersDisliked].some((arr) => arr.includes(userId)))
    // alors renvoi la méthode Promise.reject qui renvoie un objet Promise qui est rejeté à cause d'une raison donnée
    return Promise.reject("L'utilisateur semble ne pas avoir voté: ");

  // si c'est un like qu'il faut enlever :
  // la méthode includes permet de déterminer si un tableau contient une valeur et renvoi true si c'est le cas sinon renvoi false
  if (usersLiked.includes(userId)) {
    --product.likes;
    // la méthode filter crée et retourne un nouveau tableau contenant tous les éléments du tableau d'origine qui remplissent une condition déterminée
    product.usersLiked = product.usersLiked.filter((id) => id !== userId);
  }

  // si c'est un dislike qu'il faut enlever :
  else {
    --product.dislikes;
    // La méthode filter crée et retourne un nouveau tableau contenant tous les éléments du tableau d'origine qui remplissent une condition déterminée
    product.usersDisliked = product.usersDisliked.filter((id) => id !== userId);
  }
  // alors renvoi la valeur d'un like ou un dislike en moins
  return product;
}

// Function incrementVote => sert à ajouter les likes et dislikes sur les sauces
function incrementVote(product, userId, like) {
  // usersLiked + usersDisliked  => recupere les données du like
  const { usersLiked, usersDisliked } = product;

  // votersArray => si usersLiked like 1 sinon usersDisliked like 1
  // opérateur (ternaire) conditionnel ? => sert de raccourci pour if else
  const votersArray = like === 1 ? usersLiked : usersDisliked;
  // si l'utilisateur like ou dislike => renvoi la valeur
  // la méthode includes permet de déterminer si un tableau contient une valeur et renvoi true si c'est le cas sinon renvoi false
  if (votersArray.includes(userId)) return product;
  // push le like ou le dislike de l'utilisateur dans le usersLiked ou le usersDisliked
  // la méthode push ajoute un ou plusieurs éléments et retourne la nouvelle taille du tableau
  votersArray.push(userId);

  // si product.likes => ajoute 1 like sinon product.dislikes => ajoute 1 dislike
  // opérateur (ternaire) conditionnel ? => sert de raccourci pour if else
  like === 1 ? ++product.likes : ++product.dislikes;
  // alors renvoi la valeur d'un like ou d'un dislike
  return product;
}

// - EXPORTATION : - //
// Exportation : sendClientResponse => sert à gerer l'envoi d'une sauce modifiée au client + getSauce => sert à trouver l'id + getSauces => sert à obtenir sauces + createSauce => sert à créer une sauce + getSauceById => sert à gerer l'id pour les sauces + deleteSauce => sert à supprimer une sauce + modifySauce => sert à modifier une sauce + likeSauce => sert à gerer les likes et dislikes sur les sauces
module.exports = {
  sendClientResponse,
  getSauce,
  getSauces,
  createSauce,
  getSauceById,
  deleteSauce,
  modifySauce,
  likeSauce,
};
