const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  storageBucket: 'pj1firebase.appspot.com' 

});

const db = admin.firestore();
const bucket = admin.storage().bucket();
module.exports = { admin, db ,bucket};
