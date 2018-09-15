'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()); // creates express http server
const request = require('request');
var mapMess = { "id": "text" }
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body;

    if (body.object === 'page') {

        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            // console.log(webhook_event);
            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender_PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "tmcuongsiudzai"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

function sendQuestion(sender_psid, received_message) {
    let response;
    if (received_message.text) {
        text = received_message.text;
        response = {
            "text": `Để gửi câu hỏi lên group vui lòng xác nhận bằng nút bên dưới. ${last}`,
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": "Gửi câu hỏi",
                    "payload": "<POSTBACK_PAYLOAD>",
                },
                {
                    "content_type": "text",
                    "title": "Hủy",
                    "payload": "<POSTBACK_PAYLOAD>"
                }
            ]
        }

    } else if (received_message.attachments) {
        let attachment_url = received_message.attachments[0].payload.url;
    }
    callSendAPI(sender_psid, response, text);
}

function sendType(sender_psid, received_message) {
    let response;
    if (received_message.text) {
        text = received_message.text;
        response = {
            "text": `Vui lòng nhập câu hỏi.`,
        }

    } else if (received_message.attachments) {
        let attachment_url = received_message.attachments[0].payload.url;
    }
    callSendAPI(sender_psid, response);
}

function handleMessage(sender_psid, received_message) {

    let text = "";
    if (received_message.text) {
        text = received_message.text;
    }

    sendQuestion(sender_psid, received_message);
    if (mapMess[sender_psid]) {
        switch (text) {
            case "Đặt câu hỏi":
                sendType(sender_psid, received_message);
                break;

            default:
                break;
        }
    } else {
        sendQuestion(sender_psid, received_message);
    }
    if (mapMess[sender_psid]) {
        mapMess[sender_psid] = "";
    }
    mapMess[sender_psid] = text;
}

function callSendAPI(sender_psid, response) {



    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": "EAAYZCvsD6N7ABAIbVR6ZAmrZArAFhAEyRPWYYId9UA2lpUoZBCXkOOrS18biR20c7yoWhWeBZBsL58ZCPm87WfULaLGtnrqPsT2ur8NLEjWZB4MO6QJZAn0wNwG8LZA0hlUGM6AsMgEuiZAeGMZC9YjMpvtxi4d5nBnd1W5J3kZBlxw5yfYWdOWMe5Ko" },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}


// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}