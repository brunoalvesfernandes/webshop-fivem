const router = require('express').Router();
const mysql = require('mysql');
const crypto = require('crypto');

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

router.get('/login', isAuth, (req, res) => {

    if (req.session.error) {
        res.render('login', {
            error: req.session.error,
            errorTime: 8
        });
    } else {
        res.render('login', {
            error: '',
            errorTime: 0
        });
    }

});

router.get('/register', isAuth, (req, res) => {
    if (req.session.error) {
        res.render('register', {
            error: req.session.error,
            errorTime: 8
        });
    } else {
        res.render('register', {
            error: '',
            errorTime: 0
        });
    }
});

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hash = crypto.createHash('sha512');
    hash.update(password);
    const hashedPassword = hash.digest('hex');
    const nome = req.body.nome;
    const sobrenome = req.body.sobrenome;
    const id = req.body.id;

    getUserRegister(id, function (error, data) {
        if (error) {
            console.log(error)
            req.session.error = "ERRO, Entrar em contato com o adm !"
            res.redirect('/auth/register');
        } else {
            if (data[0]) {
                req.session.error = "Usuario já existe!, se você não criou a conta, entrar em contato com o ADM!"
                res.redirect('/auth/register');
            } else {
                setRegisterUser(id, username, hashedPassword, nome, sobrenome, function (error, data) {
                    if (error) {
                        console.log(error)
                        req.session.error = "ERRO, Entrar em contato com o adm !"
                        res.redirect('/auth/register');
                    } else {
                        const user = {
                            user_id: id,
                            coin: 0,
                            firstName: nome,
                            lastName: sobrenome,
                            vip: 0,
                            avatar: './images/pp.png'
                        };
                        req.session.user = user;
                        res.redirect('/');
                    }

                });
            }
        }

    });

});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hash = crypto.createHash('sha512');
    hash.update(password);
    const hashedPassword = hash.digest('hex');

    getUserLogin(username, hashedPassword, function (error, data) {
        if (error) {
            console.error('Erro ao obter detalhes do jogador:', error);
        } else {
            const dataUser = data[0];
            if (dataUser) {
                getUserPicture(dataUser.user_id, function (error, data) {
                    if (error) {
                        console.error('Erro ao obter detalhes do jogador:', error);
                    } else {
                        const dataPicture = data[0];
                        if (dataPicture) {
                            const user = {
                                user_id: dataUser.user_id,
                                coin: dataUser.coin,
                                firstName: dataUser.firstName,
                                lastName: dataUser.lastName,
                                vip: dataUser.vip,
                                avatar: dataPicture.avatarURL
                            };

                            // Armazene o usuário na sessão
                            req.session.user = user;

                            // Redirecione para a página de dashboard ou qualquer outra página
                            res.redirect('/');
                        } else {
                            const user = {
                                user_id: dataUser.user_id,
                                coin: dataUser.coin,
                                firstName: dataUser.firstName,
                                lastName: dataUser.lastName,
                                vip: dataUser.vip,
                                avatar: './images/pp.png'
                            };

                            // Armazene o usuário na sessão
                            req.session.user = user;

                            // Redirecione para a página de dashboard ou qualquer outra página
                            res.redirect('/');
                        }
                    }
                })
            } else {
                req.session.error = "Login ou senha incorreta"
                res.redirect('/auth/login');
            }
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err);
        } else {
            res.redirect('/login'); // Redirecione para a página de login após o logout
        }
    });
});

function isAuth(req, res, next) {
    req.session.user ? res.redirect('/') : next()
}

function getUserRegister(id, cb) {
    let result = `SELECT * FROM brotas_shop WHERE user_id = '${id}'`

    con.query(result, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function setRegisterUser(id, username, pass, nome, sobrenome, cb) {
    const sql = "INSERT INTO brotas_shop (user_id, username, password, firstName, lastName) VALUES (?, ?, ?, ?, ?)";

    // Valores a serem inseridos nas colunas
    const valores = [id, username, pass, nome, sobrenome];

    con.query(sql, valores, function (error, result) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, result);
    });
}

function getUserLogin(username, pass, cb) {
    let result = `SELECT * FROM brotas_shop WHERE username = '${username}' AND password = '${pass}'`

    con.query(result, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

function getUserPicture(user_id, cb) {
    let result = `SELECT * FROM smartphone_instagram WHERE user_id = '${user_id}'`;

    con.query(result, function (error, rows) {
        if (error) {
            console.log(error);
            return cb(error, null);
        }
        return cb(null, rows);
    });
}

module.exports = router;
