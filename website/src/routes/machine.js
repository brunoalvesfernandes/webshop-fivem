const router = require('express').Router();
const mysql = require('mysql');
const multer = require('multer');

const upload = multer();
const userResults = {};

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

function isAuthN(req, res, next){
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        // Se o cabeçalho não estiver presente ou não corresponder ao valor esperado
        return res.redirect('/error'); // Ou redirecione para uma página de erro
    }
    next(); // Passa para o próximo middleware
}

router.get('/', isAuth, (req, res) => {
    res.render('machine', {
        info: req.session.user
    });
});

router.get('/getPorcent', isAuthN, upload.none(), async (req, res) => {
    let resultArray = ["lose", "lose", "lose", "lose", "line3Bags", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "line3Bags", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose","lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "line2Poop", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "fullDiamonds", "fullDollarSign", "line1Toilet", "line2Poop", "line3Bags", "line4Angry", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "lose", "line1Toilet", "line1Toilet", "line3Bags", "line3Bags", "line4Angry", "lose"]

    let arrayTest = ["lose","line3Bags","fullDollarSign", "fullDiamonds", "line1Toilet", "line2Poop", "line3Bags", "line4Angry"]

    var randResult = resultArray[Math.floor(Math.random() * resultArray.length)];

    if (randResult === "fullDiamonds" || randResult === "fullDollarSign") {
        if (!userResults[req.session.user.user_id]) {
            userResults[req.session.user.user_id] = [];
        }
        userResults[req.session.user.user_id].push(randResult);
    }

    if (req.session.user) {
        res.json({ error: false , array: randResult})
    } else {
        res.json({ error: true })
    }
});

router.get('/getInfo', isAuthN, upload.none(), async (req, res) => {
    if (req.session.user) {
        buscarInfo(parseInt(req.session.user.user_id, 10), (error, info) => {
            if (error) {
                console.error('Erro:', error);
                return;
            }
        
            if (info) {
                res.json({
                    error: false,
                    info: info[0].coin
                });
            } else {
                console.log('Nenhum item encontrado.');
            }
        });
    } else {
        res.json({ error: true })
    }
});

router.post('/setInfo', upload.none(), async (req, res) => {
    const premio = req.body.premio;
    const bet = parseInt(req.body.bet, 10);
    const money = parseInt(req.body.money, 10);

    if (req.session.user && premio) {
        if(money <= 0 || money < bet) {
            return res.json({ error: 'Você não tem mais coins!' })
        }

        if(bet > 10) {
            return res.json({ error: 'BET MAIOR QUE 10' })
        }

        switch (premio) {
            case "fullDollarSign":
                setInfo(50 * bet, req.session.user.user_id, (error, info, totalmoney) => {
                    if (error) {
                        console.error('Erro:', error);
                        return;
                    }

                    InsertItemVip(req.session.user.user_id, (50 * bet), 'machine', 1, (error, row)=>{
                        if (error) {
                            console.error('Erro:', error);
                            return;
                        }
                    })
                
                    res.json({
                        error: false,
                        bg: 'green',
                        result:'💲VITÓRIA💲 ',
                        money: info,
                        totalmoney: totalmoney,
                        vitoria: true
                    });
                });
                break;
            case "fullDiamonds":
                setInfo(200 * bet, req.session.user.user_id, (error, info, totalmoney) => {
                    if (error) {
                        console.error('Erro:', error);
                        return;
                    }

                    InsertItemVip(req.session.user.user_id, (200 * bet), 'machine', 1, (error, row)=>{
                        if (error) {
                            console.error('Erro:', error);
                            return;
                        }
                    })
                
                    res.json({
                        error: false,
                        bg: 'white',
                        result:'💎JACKPOT💎 VITÓRIA ',
                        money: info,
                        totalmoney: totalmoney,
                        vitoria: true
                    });
                });
                break;
            case "line1Toilet":
                setInfo(-2 * bet, req.session.user.user_id, (error, info, totalmoney) => {
                    if (error) {
                        console.error('Erro:', error);
                        return;
                    }
                
                    res.json({
                        error: false,
                        bg: 'white',
                        result:'🚽O QUE FEDE?🚽 ',
                        money: info,
                        totalmoney: totalmoney,
                        vitoria: false
                    });
                });
                break;
            case "line2Poop":
                setInfo(-2 * bet, req.session.user.user_id, (error, info, totalmoney) => {
                    if (error) {
                        console.error('Erro:', error);
                        return;
                    }
                
                    res.json({
                        error: false,
                        bg: 'brown',
                        result:'💩PORCARIA!💩 ',
                        money: info,
                        totalmoney: totalmoney,
                        vitoria: false
                    });
                });
                break;
            case "line3Bags":
                setInfo(4 * bet, req.session.user.user_id, (error, info, totalmoney) => {
                    if (error) {
                        console.error('Erro:', error);
                        return;
                    }
                
                    res.json({
                        error: false,
                        bg: 'green',
                        result:'💰 Ganhou mesmo !💰 ',
                        money: info,
                        totalmoney: totalmoney,
                        vitoria: true
                    });
                });
                break;
            case "line4Angry":
                setInfo(-2 * bet, req.session.user.user_id, (error, info, totalmoney) => {
                    if (error) {
                        console.error('Erro:', error);
                        return;
                    }
                
                    res.json({
                        error: false,
                        bg: 'black',
                        result:'👿Tome cuidado!👿 ',
                        money: info,
                        totalmoney: totalmoney,
                        vitoria: false
                    });
                });
                break;
            case "lose":
                    setInfo( -1 * bet , req.session.user.user_id, (error, info, totalmoney) => {
                        if (error) {
                            console.error('Erro:', error);
                            return;
                        }
                    
                        res.json({
                            error: false,
                            bg: 'red',
                            result:'👿Você perdeu!👿 ',
                            money: info,
                            totalmoney: totalmoney,
                            vitoria: false
                        });
                    });
                    break;
            default:
                break;
        }
    }else {
        res.json({ error: 'Faça o login novamente !' })
    }

});

function isAuth(req, res, next) {
    req.session.user ? next() : res.redirect('/auth/login');
}

function buscarInfo(user_id, cb){
    const query = 'SELECT * FROM brotas_shop WHERE user_id = ?';
    const value = [user_id]

    con.query(query, value, function(error, rows){
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function setInfo(coin, user_id, cb){
    const query1 = 'SELECT coin FROM brotas_shop WHERE user_id = ?';
    const value1 = [user_id]
    const query = 'UPDATE brotas_shop SET coin = ? WHERE user_id = ?';

    con.query(query1, value1, function(error, rows){
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        if(rows[0]){
            const coinsTotal = rows[0].coin + (coin) ;
            const value = [coinsTotal,user_id]
            con.query(query, value, function(error, rows2){
                if (error) {
                    console.log(error);
                    return cb(error, null);
                }
                return cb(null, coinsTotal, rows[0].coin);
            });
        }
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

// Verificar e limpar os resultados dos usuários a cada 24 horas
setInterval(() => {
    for (const userId in userResults) {
        const results = userResults[userId];
        if (results.includes("fullDiamonds") || results.includes("fullDollarSign")) {
            delete userResults[userId];
        }
    }
}, 24 * 60 * 60 * 1000); // 24 horas em milissegundos


module.exports = router;
