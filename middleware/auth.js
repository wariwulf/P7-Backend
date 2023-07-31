const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupère le token d'authentification depuis le header Authorization
        const token = req.headers.authorization.split(' ')[1];

        // Vérifie et décode le token à l'aide de la clé secrète 'RANDOM_TOKEN_SECRET'
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

        // Récupère l'identifiant de l'utilisateur depuis le token décodé
        const userId = decodedToken.userId;

        // Ajoute l'identifiant de l'utilisateur à l'objet req (req.auth)
        req.auth = {
            userId: userId
        };

        // Passe au middleware suivant
        next();
    } catch(error) {
        // En cas d'erreur lors de la vérification ou du décodage du token
        // ou si le token est manquant dans le header Authorization
        // renvoie une réponse avec le statut 401 Unauthorized
        res.status(401).json({ message: 'Authentification failed' });
    }
};
