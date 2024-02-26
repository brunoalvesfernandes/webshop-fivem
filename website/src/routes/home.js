const router = require('express').Router();
const mysql = require('mysql');
const multer = require('multer');

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

router.get('/', (req, res) => {
    playTimeShopgetPlayerDetails(function(error, data) {
        if (error) {
            console.error('Erro ao obter detalhes do jogador:', error);
            res.render(error);
        } else {
            getUserRegister(req.session.user.user_id, function(error, dataUser){
                if(error) {
                    console.error('Erro ao obter detalhes do jogador:', error);
                    res.render(error);
                }else {
                    if(dataUser[0]){
                        res.render('home', {
                            info: data,
                            user: dataUser[0],
                            avatar: req.session.user
                        });
                    }
                }
                
            })
        }
    });
});

function playTimeShopgetPlayerDetails(callback){
    let result = 'SELECT * FROM brotas_shop';
    
    con.query(result, function(error, rows){
        if (error) {
            console.log(error);
            return callback(error, null);
        }
        return callback(null, rows);
    });
}

function getUserRegister(id, cb){
    let query = `SELECT * FROM brotas_shop WHERE user_id = ?`
    let value = [id]
    
    con.query(query, value, function(error, rows){
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

module.exports = router;
