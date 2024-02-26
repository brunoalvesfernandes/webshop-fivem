require('dotenv').config();
const router = require('express').Router();
const mysql = require('mysql');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const CryptoJS = require("crypto-js");
router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
// Adicione as credenciais
const upload = multer();
const client = new MercadoPagoConfig({ accessToken: process.env.YOUR_ACCESS_TOKEN });


const dbConfig = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};

let con;

function handleDisconnect() {
    con = mysql.createConnection(dbConfig);

    con.connect(function (err) {
        if (err) {
            setTimeout(handleDisconnect, 2000); // Tentar reconectar após 2 segundos
        } else {
        }
    });

    con.on('error', function (err) {
        console.log('Erro de conexão:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Reconectar em caso de conexão perdida
        } else {
            throw err;
        }
    });
}

handleDisconnect();

router.get('/sucess', (req, res) => {
    res.render('sucess', {});
});

router.post('/paypal', (req, res) => {
    let action = req.body;
    if(action.action == 'payment.update') {
        axios.get(`https://api.mercadopago.com/v1/payments/${action.data.id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.YOUR_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if(response.data.status == 'approved'){
                    let data = response.data.additional_info.items;
                    let user_id = parseInt(data[0].id, 10)
                    let coin = parseInt(data[0].quantity, 10)
                    if(isNaN(coin)){
                        coin = parseInt(data[0].description, 10)
                    }
                    updateCoins(user_id, coin , function(error, row){
                        if(error){
                            console.log(error)
                        }else {
                            //console.log(row)
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao buscar informações do pagamento autorizado:', error);
            });
    }else if(action.action == 'payment.updated') {
        axios.get(`https://api.mercadopago.com/v1/payments/${action.data.id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.YOUR_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if(response.data.status == 'approved'){
                    let data = response.data.additional_info.items;
                    let user_id = parseInt(data[0].id, 10)
                    let coin = parseInt(data[0].description, 10)
                    if(isNaN(coin)){
                        let coin2 = parseInt(data[0].quantity, 10)

                        updateCoins(user_id, coin2 , function(error, row){
                            if(error){
                                console.log(error)
                            }else {
                                //console.log(row)
                            }
                        });
                    }else {
                        updateCoins(user_id, coin , function(error, row){
                            if(error){
                                console.log(error)
                            }else {
                                //console.log(row)
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao buscar informações do pagamento autorizado:', error);
            });
    }else if(action.action == 'payment.created') {
        axios.get(`https://api.mercadopago.com/v1/payments/${action.data.id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.YOUR_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if(response.data.status == 'approved'){
                    let data = response.data.additional_info.items;
                    let user_id = parseInt(data[0].id, 10)
                    let coin = parseInt(data[0].description, 10)
                    if(isNaN(coin)){
                        let coin2 = parseInt(data[0].quantity, 10)

                        updateCoins(user_id, coin2 , function(error, row){
                            if(error){
                                console.log(error)
                            }else {
                                //console.log(row)
                            }
                        });
                    }else {
                        updateCoins(user_id, coin , function(error, row){
                            if(error){
                                console.log(error)
                            }else {
                                //console.log(row)
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao buscar informações do pagamento autorizado:', error);
            });
    }

    res.send(true);
});

router.post('/buyCoin', upload.none(), (req, res) => {
    const desc = req.body.desc;
    const user = req.body.user;
    const cookieString = req.headers.cookie;
    const parts = cookieString.split('=');
    const brotasOAuth2Token = decodeURIComponent(parts[1]);
    const email = req.body.email;
    let cpf = req.body.cpf.toString(); // Certifica-se de que cpf é uma string
    cpf = parseInt(cpf.replace(/\D/g, ''), 10);

    var bytes = CryptoJS.AES.decrypt(user, brotasOAuth2Token);
    var dadosUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const coin = dadosUser.coin + (dadosUser.coin * (parseInt(desc, 10) / 100))
    const price = dadosUser.price
    const image = dadosUser.image
    const unitPrice = parseFloat(price);

    const currentDate = new Date().toISOString();

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 48);
    const expirationDateString = expirationDate.toISOString();

    const preference = new Preference(client);
    preference.create({
        body: {
            items: [
                {
                    id: req.session.user.user_id,
                    title: 'QUANTIDADE DE ' + coin + ' COINS',
                    currency_id: 'BRL',
                    picture_url: image,
                    description: coin,
                    category_id: 'games',
                    quantity: 1,
                    unit_price: unitPrice
                }
            ],
            payer: {
                email: email
            },
            identification: {
                type: "CPF",
                number: cpf
            },
            back_urls: {
                success: 'https://loja.brotasrp.com/success',
                failure: 'http://loja.brotasrp.com/failure',
                pending: 'http://loja.brotasrp.com/pending'
            },
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 1
            },
            notification_url: 'https://loja.brotasrp.com/paypal',
            statement_descriptor: 'BROTAS RP',
            expires: true,
            expiration_date_from: currentDate,
            expiration_date_to: expirationDateString
        }
    }).then(function (data) {
        res.json({ error: false, data: data.init_point }); // init_point
    }).catch(function (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
    });
})

router.post('/pix', upload.none(), (req, res) => {
    const desc = req.body.desc;
    const user = req.body.user;
    const email = req.body.email;
    let cpf = req.body.cpf.toString(); // Certifica-se de que cpf é uma string
    cpf = parseInt(cpf.replace(/\D/g, ''), 10);
    const cookieString = req.headers.cookie;
    const parts = cookieString.split('=');
    const brotasOAuth2Token = decodeURIComponent(parts[1]);

    var bytes = CryptoJS.AES.decrypt(user, brotasOAuth2Token);
    var dadosUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    const image = dadosUser.image
    const coin = dadosUser.coin + (dadosUser.coin * (parseInt(desc, 10) / 100))
    const price = dadosUser.price
    const unitPrice = parseFloat(price);
    const payment = new Payment(client);

    const paymentData = {
        transaction_amount: unitPrice, // Montante da transação (em BRL)
        description: 'QUANTIDADE DE ' + coin + ' COINS', // Descrição da transação
        payment_method_id: 'pix', // Método de pagamento PIX
        additional_info: {
            items: [
                {
                    id: req.session.user.user_id,
                    title: 'QUANTIDADE DE ' + coin + ' COINS',
                    quantity: coin
                }
            ]
        },
        payer: {
            email: email,
            identification: {
                type: 'CPF', // Tipo de identificação (CPF ou CNPJ)
                number: cpf // Número do CPF ou CNPJ do pagador
            }
        }
    };

    const unique_id = generateUniqueId()
    const requestOption = {
        idempotencyKey: unique_id // Chave de idempotência única para garantir que a solicitação seja processada apenas uma vez
    };

    // Fazendo a solicitação de pagamento PIX
    payment.create({ body: paymentData, requestOption })
        .then((result) => {
            res.json({ error: false, data: result.point_of_interaction.transaction_data })
            //console.log(result);
        })
        .catch((error) => {
            res.json({ error: "Ouve algum problema, entre em conta com o ADM!" })
            console.log(error)
        });
})


function generateUniqueId() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
/* 
const preference = new Preference(client);
preference.create({
    body: {
        items: [
            {
                id: 123456789,
                title: 'Meu produto',
                currency_id: 'BRL',
                picture_url: 'https://www.mercadopago.com/org-img/MP3/home/logomp3.gif',
                description: 'Descrição do Item',
                category_id: 'art',
                quantity: 1,
                unit_price: 75.76
            }
        ],
        back_urls: {
            success: 'https://loja.brotasrp.com/paypal/success',
            failure: 'http://loja.brotasrp.com/paypal/failure',
            pending: 'http://loja.brotasrp.com/paypal/pending'
        },
        payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [],
            installments: 1
        },
        notification_url: 'https://loja.brotasrp.com/paypal',
        statement_descriptor: 'BROTAS RP',
        external_reference: 'wallet_container',
        expires: true,
        expiration_date_from: '2018-02-01T12:00:00.000-04:00',
        expiration_date_to: '2025-02-28T12:00:00.000-04:00'
    }
}).then(console.log).catch();; */

function updateCoins(user_id, coin, cb) {
    let query1 = 'SELECT * FROM brotas_shop WHERE user_id = ?'
    let value1 = [user_id]
    con.query(query1, value1, function (error, rows) {
        if (error) {
            console.log(error);
        }else {
            if(rows[0]){
                let coinUpdate = parseInt(coin + rows[0].coin, 10)
                let query = 'UPDATE brotas_shop SET coin = ? WHERE user_id = ?';
                let value = [coinUpdate, user_id]

                con.query(query, value, function (error, rows) {
                    if (error) {
                        console.log(error);
                        return cb(error, null);
                    }
                    return cb(null, rows);
                });
            }
        }
    });

        
}

module.exports = router;
