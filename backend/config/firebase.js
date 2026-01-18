const admin = require('firebase-admin');

// IMPORTANT: Replace with the path to your service account key file
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
