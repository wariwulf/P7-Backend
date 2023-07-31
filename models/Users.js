const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Définition du schéma Mongoose pour l'entité "User"
const userSchema = mongoose.Schema ({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Utilisation du plugin "mongoose-unique-validator" pour valider l'unicité de la propriété "email"
userSchema.plugin(uniqueValidator);

// Exporte le modèle User créé à partir du schéma userSchema
module.exports = mongoose.model('User', userSchema);
