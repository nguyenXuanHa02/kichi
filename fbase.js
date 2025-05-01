const admin = require('firebase-admin');
 require('dotenv').config();
 
const firebaseConfig = {
  "type": "service_account",
  "project_id": "pj1firebase",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key":process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_AUTH_URI,
  "token_uri": process.env.FIREBASE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
  "universe_domain": "googleapis.com"
};
// console.log(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));
// console.log("-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtctYDw3zArLLs\n926cTEeGPBRc6VwftgonUSRUTwY52FJVjKSePqX12EKerKSVG/+qUdKoTA3lYguT\nsRIag96XZWAmPkH68lcFiR8v/QBzDunyfu+bJ6ziv8cKdMgh406Z4s4srlL5TV8L\nzXkp2uYlJ8ccVhdZtbF6scfJ2/pAbEeDZWiYma6TEhKqQnNf3OWYTFL6VfO4MYeB\nsfLP+AIy9jgS09ZO3yM4TROlHBMTfUI7uV/z3q01CwNlic61E6UKgbuE7PnrGmHF\nFlBFwuXYHeRLPv7AQm0TJWJxrM56FI7iErzDrLFfPYdw9d+2OAOwxs8Jd1Xc/owc\ndl8e8FD3AgMBAAECggEACafxey8oZE+Y/HE/8qqadsIkfhGtw8QuJ4cwZxMpLRI6\nbzHPvlGNirS57Lx+wyBWaOR6Pk1RnroJG/VJJTm/LB2EL0za/n38Uz4RgunqWv1z\nD8F6VGBukwcLLS1YMO7HIvEJ+lnQG7nvdyg+vRJHKr1eq9itHxzq3wJDtZyt/2UQ\nHlJNw0dObBpjgV6UOqQXGARp21e8pIZWaUt+dPWl6EA2zbjaRu+NTVOs1yYQjXq/\nODuZSVqkcn0ry+6yn38R1qNBO6V31Kec2kUFcVvmAlWWsKgIpsp5czZyUXq8xVTL\nsrBxirsYtMWqTNhHSa63ysXQvJOmVBsGHsuk7YD6QQKBgQC39YSUiT5xJLtna3a3\nna8EVjmPPrcRxVdJRQJUGajVvZ8ObVAA/A9nbv8EzRcq6RZU24KPWu9BrxNicUpt\nWgQYPBH0SXh3dB2cbNBC+ibx2twS++8znrLlo/Lqjxhw9xZu5Nf/eqD/6GRLFxhu\n7efLD+xJlQgzlbt6tyqLmx+CwQKBgQDxX5v9YcLlWBv3tTrVh22S8gx1X/FCIKwU\nF9sI8ksu/c3zGNtLiFwnW+sB1yYUybpFMJWSif6x7O1mSce1ZpbpVy7rRPLPSaoL\ne9tHnI59kXDBwDpWElxldgKu5nhICUAUKtPKN/xU0crhuy3yT7KqZyJ5x5+pA4/0\nLy4GceUZtwKBgCPl6HJn+eRwa5W59dfNEJtDDEZ00ZrJLMhijBrHSxgywbg6ArO+\nfG8NzPwt3YiFJdN3Zpn8/9WMibbbLs/6EfR8vHA0aiq9YQ3mehmn4TOvJuUZfstO\n+9AuVzgIppdc0Gbhh3kWgBaQTgoNPrpe+K26tLyDNa+DV6uR1N6bbeHBAoGBAJdH\nmCnXwuIhNe4rnQNFjQyDPgG2rywF9DPnu7VAvpRmKFVLZ+5QOYnFl2Yg5VI0GNXS\nnHwqlwIG/8eTSGLOOJlothRos1Ht1nC6IPYiDkBvDl+wzh8yBMzmiMn70rk7avj4\n2qKsMi8rCeAug56SCuW4HCh9T/kLLYcaptsNOUzDAoGACuHLJOWPj95DsmVMnrg+\nSi3qteQk9+QnUQ/5V2u1u/mAcuHHfCJF6WMjjHvi08ejGMNTbX0ulhHySwMT771z\nz7XzYd+fi4rtUhxT/nGWkJk1b7hI+6K3ivZ7iFOU677McRTB8a0Jg+hQKyOsSPTq\nV2BfAfFsRc6J3WiTA7NRZY8=\n-----END PRIVATE KEY-----\n");
const serviceAccount = firebaseConfig;


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
