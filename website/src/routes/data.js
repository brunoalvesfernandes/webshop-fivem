const router = require('express').Router();
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const CryptoJS = require("crypto-js");
router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
let time = {};
let IDs = [];

const upload = multer();

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

function isAuthN(req, res, next) {
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        // Se o cabeçalho não estiver presente ou não corresponder ao valor esperado
        return res.redirect('/error'); // Ou redirecione para uma página de erro
    }
    next(); // Passa para o próximo middleware
}

router.post('/data', upload.none(), async (req, res) => {

    selectItemVip(function (error, data) {
        if (error) {
            console.log(error)
        } else {
            if (data[0]) {
                return res.json({
                    error: false,
                    user_id: data
                })
            }
        }
    })
});

router.post('/buyItem', upload.none(), async (req, res) => {
    const data = req.body.data;
    const cookieString = req.headers.cookie;
    const parts = cookieString.split('=');
    const brotasOAuth2Token = decodeURIComponent(parts[1]);
    const bytes = CryptoJS.AES.decrypt(data, brotasOAuth2Token);
    const dadosItems = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    if (req.session.user) {

        getUserRegister(req.session.user.user_id, function (error, userData) {
            if (error) {
                return res.json({
                    error: error
                });
            }
            if (userData[0]) {
                if (userData[0].coin >= dadosItems.price) {
                    updateUserRegister(userData[0].coin - dadosItems.price, req.session.user.user_id, function (error, data2) {
                        if (error) {
                            return res.json({
                                error: error
                            });
                        }

                        InsertItemVip(req.session.user.user_id, dadosItems.id, dadosItems.category, 0, function (error, data) {
                            if (error) {
                                return res.json({
                                    error: error
                                });
                            }
                            return res.json({
                                error: false,
                                coin: userData[0].coin - dadosItems.price,
                                itemName: dadosItems.itemName,
                                label: dadosItems.label
                            });
                        })

                    })
                } else {
                    return res.json({
                        error: "Você não tem coin para comprar " +dadosItems.itemName+ ", Recarregue, e tente novamente!"
                    });
                }
            }
        });
    } else {
        return res.json({ error: "Faça o login novamente" })
    }
});

router.get('/getItems', isAuthN, upload.none(), async (req, res) => {
    if (req.session.user) {
        buscarTodosItens((error, itens) => {
            if (error) {
                console.error('Erro:', error);
                return;
            }

            if (itens) {
                return res.json({
                    error: false,
                    itens: itens
                });
            } else {
                console.log('Nenhum item encontrado.');
            }
        });
    } else {
        return res.json({ error: "Faça o login novamente" })
    }
});

router.post('/sendInput', upload.none(), async (req, res) => {
    let cupom = req.body.cupom;
    if (req.session.user) {
        buscarTodosDescontos(cupom, (error, desc) => {
            if (error) {
                console.error('Erro:', error);
                return;
            }

            if (desc) {
                if (!time[req.session.user.user_id] || time[req.session.user.user_id] <= 0) {
                    time[req.session.user.user_id] = 60;
                    if (!IDs.includes(req.session.user.user_id)) {
                        IDs.push(req.session.user.user_id);
                    }

                    return res.json({
                        error: false,
                        desc: desc
                    });
                } else {
                    return res.json({ error: 'Você não pode obter desconto novamente, aguarde ' + converterSparaH(time[req.session.user.user_id]) })
                }
            } else {
                return res.json({ error: "O código de cupom '" + cupom + "' não é válido. Por favor, verifique e tente novamente." })
            }
        });
    } else {
        return res.json({ error: 'Faça o login novamente!' })
    }
})

setInterval(() => {
    for (const id of IDs) {
        if (time[id] > 0) {
            time[id]--;
        }
    }
}, 1000);


function buscarTodosItens(cb) {
    const query = "SELECT * FROM brotas_vip_info";

    con.query(query, (error, results) => {
        if (error) {
            cb(error, null);
            return;
        }

        if (results.length < 1) {
            cb(null, []);
            return;
        }

        cb(null, results[0]);
    });
}

function buscarTodosDescontos(cupom, cb) {
    const query = `SELECT * FROM brotas_shop_codes WHERE code = ?`;
    const query2 = 'UPDATE brotas_shop_codes SET credit = ? WHERE code = ?'
    cupom = cupom.replace(/"/g, '');
    const value = cupom

    con.query(query, value, (error, results) => {
        if (error) {
            cb(error, null);
            return;
        }

        if (!results[0]) {
            cb(null, null);
            return;
        }
        let credit = parseInt(results[0].credit - 1, 10)
        const value2 = [credit, value]
        con.query(query2, value2, (error, results2) => {
            if (error) {
                cb(error, null);
                return;
            }

            cb(null, results[0]);
        });
    });
}

function selectItemVip(cb) {
    let result = 'SELECT * FROM brotas_item_vip';

    con.query(result, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function InsertItemVip(user_id, id_item, type, aprovado, cb) {
    let query = 'INSERT INTO brotas_item_vip(user_id, id_item, type, aprovado) VALUES(?, ?, ?, ?)';

    let value = [user_id, id_item, type, aprovado]

    con.query(query, value, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function getUserRegister(id, cb) {
    let query = `SELECT * FROM brotas_shop WHERE user_id = ?`
    let value = [id]

    con.query(query, value, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function updateUserRegister(coin, id, cb) {
    let query = `UPDATE brotas_shop SET coin = ? WHERE user_id = ?`
    let value = [coin, id]

    con.query(query, value, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function converterSparaH(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    return `${horas} H, ${minutos} m e ${segundosRestantes} s`;
}

module.exports = router;
