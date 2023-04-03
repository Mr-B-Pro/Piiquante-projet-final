// ------ CREATION + CONNEXION UTILISATEUR ------ //

// - IMPORTATION PACKAGES : - //
// Importation bcrypt => crypte les données sensibles
const bcrypt = require("bcrypt");
// Importation jsonwebtoken => création token
const jwt = require("jsonwebtoken");

// - CONNEXION DATABASE : - //
// Importation objet user mongoose modele => locale mongodb base de données
const { User } = require("../mongo");

// - SIGN UP UTILISATEUR : - //
// Function asynchrone createUser => sert à créer compte utilisateur
async function createUser(req, res) {
  // si creation utilisateur ok
  try {
    // récupère l'email + le password
    const { email, password } = req.body;
    // invocation function hashPassword => crypte le mot de passe
    const hashedPassword = await hashPassword(password);
    // user => element de l'objet user avec création email + mot de passe cryptés
    const user = new User({ email, password: hashedPassword });
    // fonction save => sauvegarde le modele creation compte utilisateur
    // fonction save =>
    await user.save();
    // status 201 => ressource crée
    // fonction send => envoie la réponse HTTP
    res.status(201).send({ message: "L'utilisateur est enregistré: " });

    // si creation utilisateur pas ok
  } catch (err) {
    // status 409 => conflit avec l'état actuel du server
    // fonction send => envoie la réponse HTTP
    res
      .status(409)
      .send({ message: "L'utilisateur n'est pas enregistré: " + err });
  }
}

// Function hashPassword => sert à crypter le mot de passe
function hashPassword(password) {
  // saltRounds => chiffre 10 fois
  const saltRounds = 10;
  // renvoi le mot de passe crypté + chiffré 10 fois
  return bcrypt.hash(password, saltRounds);
}

// - LOGIN UTILISATEUR : - //
// Function asynchrone logUser => sert à connecter compte utilisateur
async function logUser(req, res) {
  // si trouve un utilisateur
  try {
    // récupère email + mot de passe
    const email = req.body.email;
    const password = req.body.password;
    // invocation function findOne sur le schema utilisateur => trouve email utilisateur existant
    const user = await User.findOne({ email: email });

    // bcrypt.compare => compare mot de passe avec mot de passe utilisateur existant
    const isPasswordOk = await bcrypt.compare(password, user.password);
    // si password pas ok status 403 => serveur comprend requête mais refuse d'autoriser
    if (!isPasswordOk) {
      // fonction send => envoie la réponse HTTP
      res.status(403).send({ message: "Mot de passe incorrect: " });
    }
    // invocation function createToken => création token utilisateur
    const token = createToken(email);
    // si password ok => status 200 réussite requête + user id + token
    // fonction send => envoie la réponse HTTP
    res.status(200).send({ userId: user._id, token: token });

    // si trouve pas utilisateur
  } catch (err) {
    console.error(err);
    // status 500 => serveur rencontre un problème qui empêche la requête
    // fonction send => envoie la réponse HTTP
    res.status(500).send({ message: "Erreur interne: " });
  }
}

// - CREATION TOKEN : - //
// Function createToken => sert à créer token utilisateur
function createToken(email) {
  // jwtPassword => injecte le mot de passe utilisateur
  const jwtPassword = process.env.JWT_PASSWORD;
  // renvoi jwt.sign => token email + mot de passe + temps expiration token
  return jwt.sign({ email: email }, jwtPassword, { expiresIn: "24h" });
}

// - EXPORTATION : - //
// Exportation : createUser => sert à créer compte utilisateur + logUser => sert à connecter compte utilisateur
module.exports = { createUser, logUser };
