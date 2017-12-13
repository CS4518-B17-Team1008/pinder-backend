const functions = require('firebase-functions');
const express = require('express');
// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
})); 

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies


app.get('/timestamp', (req, res) => {
	console.log(`${Date.now()}`);
	res.send(`${Date.now()}`);
});

app.post('/echo', (req, res) => {
	console.log(req.body);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write(req.body);
	res.end();
});


exports.app = functions.https.onRequest(app);
