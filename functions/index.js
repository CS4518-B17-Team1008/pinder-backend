const functions = require('firebase-functions');
const express = require('express');
// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const app = express();
app.get('/timestamp', (req, res) => {
	res.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);
