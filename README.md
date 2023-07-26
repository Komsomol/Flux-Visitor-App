# Flux Visitor App

# PM2 
Using PM2 to start the app on server startup
- `pm2 start app.js`
- `pm2 startup`
- `pm2 save`

# Port control
Find the process using port 3000:
- `lsof -i :3000`
- `kill <PID>`