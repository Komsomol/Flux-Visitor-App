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

// mailchimp vars
const _mailChimpAPI = process.env.MAILCHIMP_API_KEY;
const listId = "20b218fecf";
const serverPrefix = "us4";

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

// var conn = new jsforce.Connection({
//   loginUrl: "https://login.salesforce.com",
// });

// conn.login(
//   process.env.SALES_FORCE_USERNAME,
//   process.env.SALES_FORCE_PASSWORD,
//   function (err, userInfo) {
//     if (err) {
//       return console.error(err);
//     }
//     console.log(conn.accessToken);
//     console.log(conn.instanceUrl);
//     console.log("User ID: " + userInfo.id);
//     console.log("Org ID: " + userInfo.organizationId);
//   },
// );

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

  // save to mailchimp
  let mailchimpStatus = await submitMailChimp(contact);
  console.log('submission', mailchimpStatus);


    if(mailchimpStatus.status === false){
      console.log("error saving to mailchimp");
      res.status(500).render("index", {
        message: "Error reading submissions." + mailchimpStatus.error.detail,
        showForm: false,
      });
    } 

    if(mailchimpStatus.status === true){
      console.log("saved to mailchimp");
      res.render("index", {
        message: "Thank you for submitting.",
        wifi_msg:`Please connect to our WIFI:`,
        wifi_ssid:`SSID: Flux Guest`,
        wifi_password:`Password: Welcome123`,
        showForm: false,
      });
    }
  
  // save to salesforce
  // const salesForceStatus = await submitSalesForce(contact);

  // return status to page
  // if(mailchimpStatus){
  //   console.log("saved to mailchimp and salesforce");
  // }else{  
  //   console.log("error saving to mailchimp and salesforce");
  // }
    
  // console.log("---------------- contact ----------------");
  // console.log(contact);
  
  // res.status(500).render("index", {
  //   message: "Error reading submissions.",
  //   showForm: false,
  // });

  // console.log("Saved submission:==========>", req.body);
  // res.render("index", {
  //   message: "Thank you for submitting.",
  //   wifi_msg:`Please connect to our WIFI:`,
  //   wifi_ssid:`SSID: Flux Guest`,
  //   wifi_password:`Password: Welcome123`,
  //   showForm: false,
  // });


});

// submit to mailchimp, write function to submits to mailchimp api
const submitMailChimp = async (contact) =>{
  
  // Functions
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const contactDetails = {
    email_address: contact.Email,
    status: 'subscribed', // "subscribed" or "pending" if you want double opt-in
    merge_fields: {
      FNAME: contact.FirstName,
      LNAME: contact.LastName
    }
  };
  
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `apikey ${_mailChimpAPI}`
    }
  };
  
  try {
    let response = await axios.post(url, contactDetails, options);
    console.log(`Contact added: ${response.data.email_address}, Id is ${response.data.id}`);
    return {status: true, message: "Contact added to mailchimp", error: null};
  } catch (error) {
    console.error('Error adding contact:', error.response.data);
    return {status: false, message: "Error adding contact to mailchimp", error: error.response.data };
  }

}

// submit to salesforce, write function to submits to salesforce api
const submitSalesForce = async () =>{
  conn.sobject("Contact").create(contact, function (err, ret) {
    if (err || !ret.success) {
      console.error(err, ret);
      return false;
    } else {
      console.log("Created record id : " + ret.id);
      return true;
    }
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