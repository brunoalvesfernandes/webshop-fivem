$(document).ready(function () {
    let money = 0;
    let bet = 1;
    let level = 1;
    let winBanner = $("#winLine");
    let inGame = true;
    let automatic = false

    $.ajax({
        type: "GET",
        url: 'https://loja.brotasrp.com/machine/getInfo',
        dataType: 'json',
        success: function (response) {
            if (response.error == false) {
                money = response.info
                bet = 1
                $("#totalMoney").text(`${money}`);
            } else {
                // Se houver um erro no lado do servidor
            }
        },
        error: function (result) {
            console.log("ERROR :" + JSON.stringify(result))
            // Se houver um erro de rede ou outro tipo de erro
        }
    });

    setInterval(getBet, 50);
    setInterval(getLevel, 100);


    function getBet() {
        let displayBet = money < 2 ? money / 1 : bet;
        $("#betAmount").text(`${displayBet}`);
    }

    function increaseBet() {
        if (bet < 10) {
            bet += 1;
            getBet();
        }
    }

    function decreaseBet() {
        if (bet > 1) {
            bet -= 1;
            getBet();
        }
    }

    function maxTheBet() {
        while (bet < 10) {
            bet += 1;
            getBet();
        }
    }

    function minTheBet() {
        while (bet > 1) {
            bet -= 1;
            getBet();
        }
    }

    $("#plusBet").click(increaseBet);
    $("#minusBet").click(decreaseBet);
    $("#maxBet").click(maxTheBet);
    $("#minBet").click(minTheBet);

    function getLevel() {
        $("#level").text(level);
    }

    $("#spin").click(startGame);
    $("#automatic").click(() => {
        if (automatic) {
            $("#automatic").removeClass('active');
            automatic = false;
        } else {
            automatic = true;
            $("#automatic").addClass('active');
        }
    });

    setInterval(() => {

        if(automatic){
            
            startGame()
            
        }
    }, 3000);

    function spinTheReels() {
        inGame = false;
        if (money > 500 && money < 1000) {
            level = 2;
            $("#level").text(level);
        } else if (money >= 1000 && money < 3000) {
            level = 3;
            $("#level").text(level);
        } else if (money >= 10000) {
            level = 4;
            $("#level").text(level);
        } else {
            level = 1;
        }

        $("#reel1, #reel2, #reel3, #reel4, #reel5").css("background-color", "");
        $("#winLine").css("z-index", "0");
        const giro = new Audio();
        giro.src = 'audio/pull.mp3';

        const win = new Audio();
        win.src = 'audio/win.mp3';

        giro.play();
        giro.volume = 0.2;
        win.volume = 0.2

        //Spin The Reels - Where will the reels land?
        function getPorcent() {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: "GET",
                    url: 'https://loja.brotasrp.com/machine/getPorcent',
                    dataType: 'json',
                    success: function (response) {
                        if (response.error == false) {
                            resolve(response.array);
                        } else {
                            reject("Erro ao obter dados do servidor");
                        }
                    },
                    error: function (result) {
                        reject("Erro de rede ou outro tipo de erro");
                    }
                });
            });
        }

        getPorcent().then(randResult => {
            var rand1, rand2, rand3, rand4, rand5;

            switch (randResult) {
                case "fullDollarSign":
                    rand1 = -683;
                    rand2 = -683;
                    rand3 = -683;
                    rand4 = -683;
                    rand5 = -683;
                    break;
                case "fullDiamonds":
                    rand1 = -985;
                    rand2 = -985;
                    rand3 = -985;
                    rand4 = -985;
                    rand5 = -985;
                    break;
                case "line1Toilet":
                    rand1 = -50;
                    rand2 = -85;
                    rand3 = -135;
                    rand4 = -170;
                    rand5 = -220;
                    break;
                case "line2Poop":
                    rand1 = -335;
                    rand2 = -335;
                    rand3 = -640;
                    rand4 = -335;
                    rand5 = -335;
                    break;
                case "line3Bags":
                    rand1 = -400;
                    rand2 = -400;
                    rand3 = -400;
                    rand4 = -808;
                    rand5 = -774;
                    break;
                case "line4Angry":
                    rand1 = -95;
                    rand2 = -95;
                    rand3 = -537;
                    rand4 = -95;
                    rand5 = -95;
                    break;
                case "lose":
                    rand1 = Math.random() * -700;
                    rand2 = Math.random() * -700;
                    rand3 = Math.random() * -700;
                    rand4 = Math.random() * -700;
                    rand5 = Math.random() * -700;
                    break;
                default:
                    rand1 = -5;
                    rand2 = -10;
                    rand3 = -15;
                    rand4 = -20;
                    rand5 = -25;
                    break;
            }

            setTimeout(async function bannerDisplay() {
                try {
                    const { bg, rResult, dollar, totalmoney, vitoria } = await premio(bet, randResult, money);
                    
                    money = dollar

                    setTimeout(() => {
                        $("#winLine").css({
                            "z-index": "2",
                            "background-color": bg
                        }).html(`${rResult} ${dollar - totalmoney}`); // premio = 50 coin
                        $("#totalMoney").text(`${dollar}`);
                    }, 1500);
                } catch (error) {
                    /* console.log(error); */
                    winBanner.css({
                        zIndex: "2",
                        top: "40vh",
                        height: "32vh",
                        backgroundColor: "red"
                    }).text(error);
                }

            }, 100);
            async function premio(bet, premio, money) {
                return new Promise((resolve, reject) => {
                    var formdata = new FormData();
                    formdata.append("premio", premio);
                    formdata.append("bet", bet);
                    formdata.append("money", money)

                    $.ajax({
                        type: "POST",
                        url: 'https://loja.brotasrp.com/machine/setInfo',
                        data: formdata,
                        contentType: false,
                        processData: false,
                        success: function (response) {
                            if (response.error == false) {
                                resolve({
                                    bg: response.bg,
                                    rResult: response.result,
                                    dollar: parseInt(response.money, 10),
                                    totalmoney: response.totalmoney,
                                    vitoria: response.vitoria
                                }); // Resolve a promessa com o valor do prêmio
                            } else {
                                reject(response.error); // Rejeita a promessa com o erro
                            }
                        },
                        error: function (result) {
                            reject("Erro na requisição AJAX"); // Rejeita a promessa em caso de erro na requisição AJAX
                        }
                    });
                });
            }

            //Spin The Reels - How do they spin??
            //////////////////////////////////////////////////////////////////
            var pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0,
                pos5 = 0;

            var id1 = setInterval(row1, 10),
                id2 = setInterval(row2, 10),
                id3 = setInterval(row3, 10),
                id4 = setInterval(row4, 10),
                id5 = setInterval(row5, 10);

            function row1() {
                if (pos1 <= rand1) {
                    clearInterval(id1);
                } else {
                    pos1 -= 5;
                    $("#reel1").css("top", pos1 + "%");
                }
            }

            function row2() {
                setTimeout(function row2time() {
                    if (pos2 <= rand2) {
                        clearInterval(id2);
                    } else {
                        pos2 -= 5;
                        $("#reel2").css("top", pos2 + "%");
                    }
                }, 20);
            }

            function row3() {
                setTimeout(function row3time() {
                    if (pos3 <= rand3) {
                        clearInterval(id3);
                    } else {
                        pos3 -= 5;
                        $("#reel3").css("top", pos3 + "%");
                    }
                }, 40);
            }

            function row4() {
                setTimeout(function row4time() {
                    if (pos4 <= rand4) {
                        clearInterval(id4);
                    } else {
                        pos4 -= 5;
                        $("#reel4").css("top", pos4 + "%");
                    }
                }, 60);
            }

            function row5() {
                setTimeout(function row5time() {
                    if (pos5 <= rand5) {
                        clearInterval(id5);
                    } else {
                        pos5 -= 5;
                        $("#reel5").css("top", pos5 + "%");
                    }
                }, 100);
            }
            setTimeout(() => {
                inGame = true;
            }, 2000);
        }).catch(error => {
            console.error(error);
        });
    }


    function startGame() {
        if (inGame) {
            spinTheReels();
        }
    }
});
