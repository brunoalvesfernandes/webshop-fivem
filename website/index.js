require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session')
const fs = require('fs');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');

// Configuração do multer para lidar com o upload de formulários
const upload = multer();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));

const authRoute = require('./src/routes/auth'); // Move a importação da rota 'authRoute' para cima de 'homeRoute' e 'isAuthorized'
const homeRoute = require('./src/routes/home');
const dataRoute = require('./src/routes/data');
const paypalRoute = require('./src/routes/paypal');
const machineRoute = require('./src/routes/machine');

app.use(session({
    secret: 'some random secret',
    resave: false,
    cookie: {
        maxAge: 60000 * 60 * 24,
        httpOnly: false
    },
    saveUninitialized: false,
    name: 'brotas.oauth2'
}))

//POST 
app.use('/', dataRoute);


//OTHERS
app.use('/machine', machineRoute);
app.use('/', paypalRoute);
app.use('/auth', authRoute);
app.use('/', isAuthorized, homeRoute);


app.use('/error',(req, res) => {
    res.render('error', {});
})



function isAuthorized(req, res, next) {
    req.session.user ? next() : res.redirect('/auth/login');
}

app.listen(process.env.PORTA, function (err) {
    if (err) console.log(err);
    console.log("SERVER INICIADO NA PORTA:", process.env.PORTA);
});