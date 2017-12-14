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
	res.status(200);
	res.json(req.body);
});

app.post('/users/:userId/match/:projectId', (req, res) => {
    admin.database().ref("users/" + req.params.userId + "/potentialmatch")
    .push().set({projectId: req.params.projectId});
    admin.database().ref("projects/" + req.params.projectId + "/potentialmatch")
    .push().set({userId: req.params.userId});
    res.status(200);
    res.end();
});

app.post('/users/:userId/unmatch/:projectId', (req, res) => {
    admin.database().ref("users/" + req.params.userId + "/unmatch")
    .push().set({projectId: req.params.projectId});
    res.status(200);
    res.end();
});

app.post('/projects/:projectId/match/:userId', (req, res) => {
    var hasUser = false;
    admin.database().ref("projects/" + req.params.projectId + "/potentialmatch")
    .once("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (data.val().userId == req.params.userId) {
                hasUser = true;
            }
        });
        if (hasUser) {
            admin.database().ref("users/" + req.params.userId + "/match")
            .push().set({projectId: req.params.projectId});
            admin.database().ref("projects/" + req.params.projectId + "/match")
            .push().set({userId: req.params.userId});
            res.status(200);
            res.end();
        }
        else {
            res.status(500);
            res.end();
        }
    }, function(errorObject) {
        res.status(500);
        res.end();
    });
});

app.post('/projects/:projectId/unmatch/:userId', (req, res) => {
    var hasUser = false;
    admin.database().ref("projects/" + req.params.projectId + "/potentialmatch")
    .once("value", function(snapshot) {
        snapshot.forEach(function(data) {
            if (data.val().userId == req.params.userId) {
                hasUser = true;
            }
        });
        if (hasUser) {
            admin.database().ref("users/" + req.params.userId + "/potentialmatch")
            .once("value", function(snapshot) {
                snapshot.forEach(function(data) {
                    if (data.val().projectId == req.params.projectId) {
                        data.remove();
                    }
                });
            });
            admin.database().ref("projects/" + req.params.projectId + "/potentialmatch")
            .once("value", function(snapshot) {
                snapshot.forEach(function(data) {
                    if (data.val().userId == req.params.userId) {
                        data.remove();
                    }
                });
            });
            admin.database().ref("projects/" + req.params.projectId + "/unmatch")
            .push().set({userId: req.params.userId});
            res.status(200);
            res.end();
        }
        else {
            res.status(500);
            res.end();
        }
    }, function(errorObject) {
        res.status(500);
        res.end();
    });
});

exports.listen = functions.database.ref("projects/{projectId}/creator").onWrite(event => {
    var creatorId = event.data.val();
    return event.data.ref.root.child("users/" + creatorId + "/leadprojects")
    .push().set({ projectId: event.params.projectId });
});

exports.app = functions.https.onRequest(app);
