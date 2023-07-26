const axios = require('axios');

const data = {
  Title : "Mr",
  FirstName : "Test24J",
  LastName : "Test24J",
  Email : "test@email.com",
  company__c : "ECA",
  Source__c :"Source"
};

axios.post('http://localhost:3000/submit', data)
.then((res) => {
  console.log(`Status: ${res.status}`);
  console.log('Body: ', res.data);
}).catch((err) => {
  console.error(err);
});
