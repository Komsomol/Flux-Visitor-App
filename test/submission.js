const axios = require('axios');
let data = JSON.stringify({
  "Title": "Mr",
  "FirstName": "POSTMAN",
  "LastName": "POSTMAN",
  "Phone": "1234567890",
  "Email": "test@POSTMAN.com",
  "company__c": "POSTMAN",
  "Source__c": "FLUX GDD SOURCE"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://engageworks.my.salesforce.com/services/data/v58.0/sobjects/Contact',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer 00D20000000Cf8I!ARgAQM4mWrh8CcGAScha.1IRm.tt64u4zDgRGoyqnS19GnEpTR4SCWCB335YFmW9WThS3W3kb29lROWo3bpgEBM7eKL_LEmo', 
    'Cookie': 'BrowserId=2pJ4QxpyEe6E3vUeeopX1A; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});