import express from "express";
import bodyParser from "body-parser";
import { router as indexRouter } from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import session from "express-session";
import jsforce from "jsforce";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

dotenv.config();

// Serve static files from the "public" directory
app.use(express.static(`${__dirname}/public`));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
app.post("/submit", (req, res) => {
  console.log(req.body);

  let name = req.body.FirstName;
  let surname = req.body.LastName;
  let email = req.body.Email;
  let company = req.body.company__c;
  let source = req.body.Source__c;

  var contact = {
    FirstName: name,
    LastName: surname,
    Email: email,
    company__c: company,
    Source__c: source,
  };

  console.log("---------------- contact ----------------");
  console.log(contact);

  conn.sobject("Contact").create(contact, function (err, ret) {
    if (err || !ret.success) {
      console.error(err, ret);
      res.status(500).render("index", {
        message: "Error reading submissions.",
        showForm: false,
      });
    } else {
      console.log("Saved submission:==========>", req.body);
      res.render("index", {
        message: "Thank you for submitting.",
        wifi_msg:`Please connect to our WIFI:`,
        wifi_ssid:`SSID: Flux Guest`,
        wifi_password:`Password: Welcome123`,
        showForm: false,
      });

      //return res.redirect('/');
      setTimeout(function () {
        res.redirect("/");
      }, 60000);
    }
  });
});


const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
