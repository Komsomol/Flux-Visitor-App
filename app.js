import express from "express";
import bodyParser from "body-parser";
import { router as indexRouter } from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import session from "express-session";
import jsforce from "jsforce";
import dotenv from "dotenv";
import ip from "ip";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

dotenv.config();

// Serve static files from the "public" directory
app.use(express.static(`${__dirname}/public`));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MailChimp vars
const mailchimp_apiKey = process.env.MAILCHIMP_API_KEY;
const mailchimp_listId = process.env.MAILCHIMP_LIST_ID;
const mailchimp_serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;


// Connect to Salesforce
app.use(
  // eslint-disable-next-line no-undef
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // For development, set secure to true in production
  }),
);

var conn = new jsforce.Connection({
  loginUrl: "https://login.salesforce.com",
});

conn.login(
  process.env.SALES_FORCE_USERNAME,
  process.env.SALES_FORCE_PASSWORD,
  function (err, userInfo) {
    if (err) {
      return console.error(err);
    }
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
  },
);

// Set up pug as view engine
app.set("view engine", "pug");

// Define routes
app.use("/", indexRouter);

// Pass jsforce connection to middleware
app.post("/submit", async (req, res) => {
  // console.log(req.body);

  let name = req.body.FirstName;
  let surname = req.body.LastName;
  let email = req.body.Email;
  let company = req.body.company__c;
  let source = req.body.Source__c;
  let visitedState = req.body.Previously_Visited_Flux__c;

  let isVisited = (visitedState === "on") ? true : false;

  var contact = {
    FirstName: name,
    LastName: surname,
    Email: email,
    company__c: company,
    Source__c: source,
    Previously_Visited_Flux__c: isVisited
  };

  try {
    // For Salesforce
    const salesforceResult = await addSalesForceContact(contact);
    console.log(`Salesforce result: ${salesforceResult.status}`);

    // For MailChimp
    const mailchimpResult = await addMailChimpContact(contact);
    console.log(`MailChimp result: ${mailchimpResult.status}`);

    // if both are true
    if(mailchimpResult.status && salesforceResult.status) {
      res.render("index", {
        message: "Thank you for submitting.",
        wifi_msg: "Please connect to our WIFI:",
        wifi_ssid: "SSID: Flux Guest",
        wifi_password: "Password: Welcome123",
        showForm: false
      });
    } else {
      res.status(500).render("index", {
        message: "Error processing your submission.",
        showForm: true
      });
    }

  } catch (error) {
    // console.error(error);
    res.status(500).render("index", {
      message: "Error processing your submission.",
      showForm: true
    });
  }
});

// For MailChimp
async function addMailChimpContact(contact) {
  console.log(`Adding to MailChimp`, contact);
  
  const url = `https://${mailchimp_serverPrefix}.api.mailchimp.com/3.0/lists/${mailchimp_listId}/members`;

  const contactDetails = {
    email_address: contact.Email,
    status: 'subscribed', // "subscribed" or "pending" if you want double opt-in
    merge_fields: {
      FNAME: contact.FirstName,
      LNAME: contact.LastName,
    }
  };

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `apikey ${mailchimp_apiKey}`
    }
  };

  console.log(contactDetails);

  console.log(options);

  console.log(url);

  try{
    const mailChimpSubmission = await axios.post(url, contactDetails, options);
    console.log("MailChimp response:", mailChimpSubmission.status);
    if(mailChimpSubmission.status === 200){
      console.log(`Contact added: ${mailChimpSubmission.data.email_address}, Id is ${mailChimpSubmission.data.id}`);
      return { status: true, message: 'Contact added', data: mailChimpSubmission.data };
    } else { 
      return { status: true, message: 'Contanct Exists or other error', data: mailChimpSubmission.data };
    }

  } catch (error) {
    console.error('Error:', error.data);
    return { status: false, message: 'Error adding contact', data: error };  
  }
}

// For Salesforce
async function addSalesForceContact(contact) {
  return new Promise((resolve, reject) => {
    conn.sobject("Contact").create(contact, function (err, ret) {
      if (err || !ret.success) {
        console.error(err, ret);
        reject({ status: false, message: 'Error adding contact', data: err });
      } else {
        console.log("Saved submission:==========>", ret.id);
        resolve({ status: true, message: 'Contact added', data: ret });
      }
    });
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  const localURL = `http://localhost:${port}`;
  const networkURL = `http://${ip.address()}:${port}`;

  console.log(`Server is running on:
  - Local:   ${localURL}
  - Network: ${networkURL}`);
});