const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const request = require('request')
const fs = require('fs');
const { json } = require('body-parser');

var LISTEN_PORT = 8088;
var app = express();
app.use(bodyParser.json());

const SCB_API_KEY = "<View on SCB Developers>"
const SCB_API_SECRET = "<View on SCB Developers>"
const UUID = "c8f41e6a-850f-4ab4-b831-63d30a291bcf"
var oauthKey = null;
var stackOfOAuthKey = [];

app.listen(LISTEN_PORT, function () {
    console.log("Server running on port " + LISTEN_PORT);
})

app.get('/mobileAuthorize', function (req, res) {
    request.get("https://api-sandbox.partners.scb/partners/sandbox/v2/oauth/authorize", {
        headers: {
            'accept-language': 'EN',
            'apikey': SCB_API_KEY,
            'apisecret': SCB_API_SECRET,
            'endState': 'mobile_app',
            'requestUId': UUID,
            'resourceOwnerId': SCB_API_KEY,
            'response-channel': 'mobile'
        }
    }, function (error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        res.send(JSON.parse(body));
    })
});

app.get('/generateOAuthToken', function (req, res) {
    request.post("https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token", {
        headers: {
            'Content-Type': 'application/json',
            'accept-language': 'EN',
            'requestUId': UUID,
            'resourceOwnerId': SCB_API_KEY
        },
        json: {
            "applicationKey": SCB_API_KEY,
            "applicationSecret": SCB_API_SECRET
        }
    }, function (error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.

        oauthKey = body.data.accessToken;
        console.log(oauthKey);

        res.send(body);
    })
});

app.get('/refreshOAuthToken', function (req, res) {
    console.log(oauthKey);
    if (oauthKey == null) {
        res.statusCode(400).send({
            "status": "FAIL",
            "message": "Oauth key is null."
        })
    } else {
        request.post("https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token/refresh", {
            headers: {
                'Content-Type': 'application/json',
                'accept-language': 'EN',
                'requestUId': UUID,
                'resourceOwnerId': SCB_API_KEY
            },
            json: {
                "applicationKey": SCB_API_KEY,
                "applicationSecret": SCB_API_SECRET,
                "refreshToken": oauthKey
            }
        }, function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            res.send(body);
        })
    }
});