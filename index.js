const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {

    // Check if session exists and contains an access token
    if (req.session && req.session.accessToken) {
        // User is authenticated — continue to next handler
        return next();
    }

    // If no token, deny access
    return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token missing or invalid"
    });
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
