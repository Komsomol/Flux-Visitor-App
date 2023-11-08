import dotenv from "dotenv";
dotenv.config({
    path: "../.env", 
});

import axios from "axios";

// Vars
const apiKey = process.env.MAILCHIMP_API_KEY;
const listId = "20b218fecf";
const serverPrefix = "us4";

// Functions
const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

const contactDetails = {
  email_address: 'farhad.agza@engageworks.com',
  status: 'subscribed', // "subscribed" or "pending" if you want double opt-in
  merge_fields: {
    FNAME: 'Testing',
    LNAME: 'Send from Node.js'
  }
};

const options = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${apiKey}`
  }
};

axios.post(url, contactDetails, options)
  .then(response => {
    console.log('Contact added:', response.data);
    if(typeof response.data === 'object') {
      console.log(`Contact added: ${response.data.email_address}, Id is ${response.data.id}`);
    }   
  })
  .catch(error => {
    console.error('Error adding contact:', error.response.data);
  });