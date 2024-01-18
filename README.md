# Flux Visitor App
- Application saves user details to Mailchimp and Salesforce
- Salesforce integration is done using REST API
- MailChimp integration is done using MailChimp API v3.0
- Salesforce username and password are stored in environment variables
- Salesfroce password is concatenated with security token from Salesforce
- MailChimp API key is stored in environment variable
- MailChimp list ID is stored in environment variable
- MailChimp API key is concatenated with datacenter ID from MailChimp
- MailChimp List and Locale are stored in environment variables
- MailChimp API key is concatenated with datacenter ID from MailChimp
- Data saved only if both MailChimp and Salesforce save is successful
- Data will not be saved to MailChimp if email already exists in MailChimp
- This will then skip and return success
- Salesforce does not have this check, so it will always save

# PM2 
Using PM2 to start the app on server startup
- `pm2 start app.js`
- `pm2 startup`
- `pm2 save`

# Port control
Find the process using port 3000:
- `lsof -i :3000`
- `kill -9 <PID>`

