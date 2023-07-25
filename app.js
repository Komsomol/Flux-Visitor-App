const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsforce = require('jsforce');

const session = require('express-session');
const flash = require('connect-flash');

require('dotenv').config()
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Add this line to set up the body-parser middleware.
app.use(express.json());

app.use(express.static('public'));

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // For development, set secure to true in production
}));

app.use(flash());

app.set('view engine', 'pug');

var conn = new jsforce.Connection({
  loginUrl : 'https://login.salesforce.com'
});

conn.login(process.env.USERNAME, process.env.PASSWORD, function(err, userInfo) {
  if (err) { return console.error(err); }
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
});

app.get('/', function (req, res) {
  res.render('index', { messages: req.flash() });
});

app.post('/submit', function (req, res) {
  console.log(req.body);

  let title = req.body.Title;
  let name = req.body.FirstName;
  let surname = req.body.LastName;
  let phone = req.body.Phone;
  let email = req.body.Email;
  let company = req.body.company__c;


  var contact = {
    Title: title,
    FirstName: name,
    LastName: surname, 
    Email: email,
    company__c: company
  };

  console.log('---------------- contact ----------------');
  console.log(contact);

  conn.sobject("Contact").create(contact, function(err, ret) {
    if (err || !ret.success) { 
      console.error(err, ret);
      req.flash('error', 'Error in creating contact.'); // set an error message
      return res.redirect('/');
    }

    console.log("Created record id : " + ret.id);
    req.flash('success', 'Contact created successfully.'); // set a success message
    res.redirect('/');
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
