'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()); // creates express http server
    const request = require('request');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
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

        // Return a '200 OK' response to all events
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

function handleMessage(sender_psid, received_message) {

    let response;
  
    // Checks if the message contains text
    if (received_message.text) {
      
      // Creates the payload for a basic text message, which
      // will be added to the body of our request to the Send API
      response = {
        "text": `Bạn vừa nhắn: "${received_message.text}". Vì một thế giới tôn vinh Cường đẹp trai!`
      }
  
    } else if (received_message.attachments) {
    
      // Gets the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
    
    } 
    
    // Sends the response message
    callSendAPI(sender_psid, response);    
  }

function callSendAPI(sender_psid, response) {
    // Construct the message body
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