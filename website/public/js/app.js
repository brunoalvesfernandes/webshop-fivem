var currentPage = 1;
var myCoin = 0;
var selectedCategory = null;
var categories = [];
var items = [];
var coinList = [];
var topPlayers = [];
var translate = [];
var firstOpen = true;
var profilePhoto = null;
var descontoAplicado = 0;
var linkItens = null;
var linkVehicles = null;

chamarT()

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

const key = getCookie('brotas.oauth2');


function encryptElement(element) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(element), key).toString();
    return encrypted;
}

function setCoinBuyItems(desconto) {
    $(".coinListArea").empty();
    const elm = encryptElement(coinList)
    coinList.forEach((element) => {
        
        if (desconto == 0) {
            $(".coinListArea").append(`
                <div class="coinItem">
                    <div class="coinNameArea">
                        <div class="coinBuyCoinCount">${element.coin}</div>
                        <div class="coinBuyCoinText">COINS</div>
                    </div>
                    <div class="coinBuyImageArea">
                        <img src=https://dgbijzg00pxv8.cloudfront.net/730e2e3d-6058-4f2f-b90e-19a8f43d3574/000000-0000000000/29714182317096389116622984018383799166334810000320155336077102762626826855522/ITEM_PREVIEW1.gif alt="" />
                    </div>
                    <div class="coinBottomSection">
                        <div class="coinRealPrice">R$${element.price}</div>
                        <div class="coinBuyButton" data-coin='${encryptElement(element)}' data-coinBuy='${elm}'>Comprar</div>
                    </div>
                </div>
            `);
        } else {
            $(".coinListArea").append(`
                <div class="coinItem">
                    <div class="coinNameArea">
                        <div class="coinBuyCoinCount descont">${element.coin + (element.coin * (desconto/100))}</div>
                        <div class="coinBuyCoinText">COINS</div>
                    </div>
                    <div class="coinBuyImageArea">
                        <img src=https://dgbijzg00pxv8.cloudfront.net/730e2e3d-6058-4f2f-b90e-19a8f43d3574/000000-0000000000/29714182317096389116622984018383799166334810000320155336077102762626826855522/ITEM_PREVIEW1.gif alt="" />
                    </div>
                    <div class="coinBottomSection">
                        <div class="coinRealPrice">R$${element.price}</div>
                        <div class="coinBuyButton" data-coin='${encryptElement(element)}' data-coinBuy='${elm}'>Comprar</div>
                    </div>
                </div>
            `);
        }
    });
}

$(document).on("click", ".coinBuyButton", function () {
    var selectedStringify = $(this).attr("data-coinBuy");
    var selectedString = $(this).attr("data-coin");

    var formDataBuy = new FormData();
    formDataBuy.append('data', selectedStringify);
    formDataBuy.append('desc', descontoAplicado);
    formDataBuy.append('user', selectedString);

    $('.metodpag').show()

    $('#pix').click(()=> {
        if(validar()){
            let cpf = $("#cpf").val()
            let email = $("#email").val()
            formDataBuy.append('cpf', cpf);
            formDataBuy.append('email', email);
            $.ajax({
                type: "POST",
                url: 'https://loja.brotasrp.com/pix',
                data: formDataBuy,
                contentType: false,
                processData: false,
                success: function (response) {
                    if (response.error == false) {
                        window.open(response.data.ticket_url, '_blank');
                        setTimeout(() => {
                            $('.metodpag').fadeOut(400);
                            $(".coinBuyArea").fadeOut(400);
                        }, 1500);
                    } else {
                        $(".notifyArea").html(response.error);
                        $(".notifySectionXX").fadeIn(200);
                        setTimeout(() => {
                            $(".notifySectionXX").fadeOut(200);
                        }, 3000);
                    }
                },
                error: function (result) {
                    console.log("ERROR :" + JSON.stringify(result))
                }
            });
        }
    });
    
    $('#mercpago').click(()=> {
        if(validar()){
            let cpf = $("#cpf").val()
            let email = $("#email").val()
            formDataBuy.append('cpf', cpf);
            formDataBuy.append('email', email);
            $.ajax({
                type: "POST",
                url: 'https://loja.brotasrp.com/buyCoin',
                data: formDataBuy,
                contentType: false,
                processData: false,
                success: function (response) {
                    if (response.error == false) {
                        window.open(response.data, '_blank');
                        setTimeout(() => {
                            $('.metodpag').fadeOut(400);
                            $(".coinBuyArea").fadeOut(400);
                        }, 1500);
                    } else {
                        $(".notifyArea").html(response.error);
                        $(".notifySectionXX").fadeIn(200);
                        setTimeout(() => {
                            $(".notifySectionXX").fadeOut(200);
                        }, 3000);
                    }
                },
                error: function (result) {
                    console.log("ERROR :" + JSON.stringify(result))
                }
            });
        }
    });

});

function setCategories(xxx) {
    $(".categorySection").empty();
    xxx.forEach((element) => {
        $(".categorySection").append(`
            <div class="categoryItem" id="${element.category}">
            <i id="categoryIcon" class="${element.icon}"></i>
            </div>
        `);
    });
}

function setItemsIntoCategory(cate, items) {
    cate.forEach((cateElements) => {
        // Verifica se cateElements.items é uma array
        if (!Array.isArray(cateElements.items)) {
            // Se não for uma array, inicializa como uma array vazia
            cateElements.items = [];
        }
        items.forEach((itemElements) => {
            if (cateElements.category == itemElements.category) {
                cateElements.items.push(itemElements);
            }
        });
    });
}

$(document).on("click", ".categoryItem", function () {
    var currentDiv = this;
    var current = document.getElementsByClassName("categoryItem active");
    if (current.length > 0) {
        current[0].className = current[0].className.replace("categoryItem active", "categoryItem");
    }
    this.className += " active";
    var categoryId = currentDiv.id;
    selectedCategory = null;
    categories.forEach((element) => {
        if (element.category == categoryId) {
            selectedCategory = element.items;
        }
    });
    if (selectedCategory) {
        currentPage = 1;
        $(".totalPage").attr("data-totalPage", currentPage);
        $(".currentPage").html(currentPage);
        setTimeout(() => {
            var larguraPagina = window.innerWidth;

            if (larguraPagina > 1600) {
                setItem(10);
            } else if (larguraPagina < 600) {
                setItem(4);
            }else{
                setItem(6);
            }
        }, 50);
    }
});

function setItem(_forPage) {
    if (selectedCategory) {
        var totalCategory = Math.ceil(selectedCategory.length / _forPage);
        $(".totalPage").html("/ " + totalCategory);
        $(".totalPage").attr("data-totalPage", totalCategory);
        $(".rightItemList").empty();
        var forPage = (currentPage - 1) * _forPage;
        var inCount = 0;
        for (let index = 0; index < selectedCategory.length; index++) {
            if (index >= forPage) {
                inCount += 1;
                if (inCount > _forPage) break;
                const element = selectedCategory[index];
                if (element.category == "vip") {
                    $(".rightItemList").append(`
                        <div class="rightItem">
                            <div class="itemTopSection">
                                <div class="rightItemName">${element.label}</div>
                                <div class="rightItemCount">${element.count}X</div>
                            </div>
                            <div class="itemImageArea">
                                <img src="${linkItens}${element.itemName}.png" alt="" />
                            </div>
                            <div class="itemBottomArea">
                                <div class="itemCoinArea">
                                    <div class="coinImageArea">
                                        <img src="https://dgbijzg00pxv8.cloudfront.net/730e2e3d-6058-4f2f-b90e-19a8f43d3574/000000-0000000000/29714182317096389116622984018383799166334810000320155336077102762626826855522/ITEM_PREVIEW1.gif" alt="" />
                                    </div>
                                    <div class="itemCoinAmount">${element.price}</div>
                                    <div class="itemCoinText">COINS</div>
                                </div>
                                <div class="infButton" data-itemData='${JSON.stringify(element.description)}'><i class="bi bi-info-circle"></i></div>
                                <div class="buyButton" data-itemData='${JSON.stringify(element)}'><i class="bi bi-cart-check-fill"></i></div>
                            </div>
                        </div>
                    `);
                } else if (element.category == "vehicles") {
                    $(".rightItemList").append(`
                        <div class="rightItem">
                            <div class="itemTopSection">
                                <div class="rightItemName">${element.label}</div>
                                <div class="rightItemCount">${element.count}X</div>
                            </div>
                            <div class="itemImageArea">
                                <img src="${linkVehicles}${element.itemName}.png" alt="" />
                            </div>
                            <div class="itemBottomArea">
                                <div class="itemCoinArea">
                                    <div class="coinImageArea">
                                        <img src="https://dgbijzg00pxv8.cloudfront.net/730e2e3d-6058-4f2f-b90e-19a8f43d3574/000000-0000000000/29714182317096389116622984018383799166334810000320155336077102762626826855522/ITEM_PREVIEW1.gif" alt="" />
                                    </div>
                                    <div class="itemCoinAmount">${element.price}</div>
                                    <div class="itemCoinText">COINS</div>
                                </div>
                                <div class="buyButton" data-itemData='${JSON.stringify(element)}'><i class="bi bi-cart-check-fill"></i></div>
                            </div>
                        </div>
                    `);
                } else {
                    $(".rightItemList").append(`
                        <div class="rightItem">
                            <div class="itemTopSection">
                                <div class="rightItemName">${element.label}</div>
                                <div class="rightItemCount">${element.count}X</div>
                            </div>
                            <div class="itemImageArea">
                                <img src="${linkItens}${element.itemName}.png" alt="" />
                            </div>
                            <div class="itemBottomArea">
                                <div class="itemCoinArea">
                                    <div class="coinImageArea">
                                        <img src="https://dgbijzg00pxv8.cloudfront.net/730e2e3d-6058-4f2f-b90e-19a8f43d3574/000000-0000000000/29714182317096389116622984018383799166334810000320155336077102762626826855522/ITEM_PREVIEW1.gif" alt="" />
                                    </div>
                                    <div class="itemCoinAmount">${element.price}</div>
                                    <div class="itemCoinText">COINS</div>
                                </div>
                                <div class="buyButton" data-itemData='${JSON.stringify(element)}'><i class="bi bi-cart-check-fill"></i></div>
                            </div>
                        </div>
                    `);
                }
            }
        }
    }
}

$(document).on("click", ".nextButton", function () {
    var totalPage = $(".totalPage").attr("data-totalPage");
    currentPage += 1;
    if (totalPage >= currentPage) {
        $(".totalPage").attr("data-totalPage", currentPage);
        $(".currentPage").html(currentPage);
        setTimeout(() => {
            var larguraPagina = window.innerWidth;

            if (larguraPagina > 1600) {
                setItem(10);
            } else if (larguraPagina < 650) {
                setItem(4);
            }else{
                setItem(6);
            }
        }, 50);
    } else {
        currentPage -= 1;
    }
});

function verificarLarguraPagina() {
    var larguraPagina = window.innerWidth;

    if (larguraPagina > 1600) {
        setItem(10);
    } else if (larguraPagina < 600) {
        setItem(4);
    } else {
        setItem(6);
    }
}

// Chama a função para verificar a largura da página quando a página é carregada
verificarLarguraPagina();

// Anexa a função à um manipulador de evento de redimensionamento da janela
window.onresize = function() {
    verificarLarguraPagina();
};

$(document).on("click", ".previousButton", function () {
    var totalPage = $(".totalPage").attr("data-totalPage");
    currentPage -= 1;
    if (totalPage >= currentPage && currentPage > 0) {
        $(".totalPage").attr("data-totalPage", currentPage);
        $(".currentPage").html(currentPage);
        setTimeout(() => {
            var larguraPagina = window.innerWidth;

            if (larguraPagina > 1600) {
                setItem(10);
            } else if (larguraPagina < 600) {
                setItem(4);
            }else{
                setItem(6);
            }
        }, 50);
    } else {
        currentPage += 1;
    }
});

$(document).on("click", ".addCreditButton", function () {
    $(".coinBuyArea").fadeIn(400);
});

$(document).on("click", ".buyButton", function () {
    var selectedDiv = this;
    var itemData = $(selectedDiv).attr("data-itemData");
    var jsonData = JSON.parse(itemData);
    $(".wantCoin").html(jsonData.price + " " + "COINS");
    $(".wantItemName").html(jsonData.label);
    $(".wantItemCount").html(jsonData.count + "X");
    $("#wantBuyButton").attr("data-buyButtonItem", encryptElement(jsonData));
    $(".youWantBuySection").fadeIn(400);
});

$(document).on("click", ".infButton", function () {
    var selectedDiv = this;
    var itemData = $(selectedDiv).attr("data-itemData");
    // Remover o primeiro caractere
    itemData = itemData.slice(1);

    // Remover o último caractere
    itemData = itemData.slice(0, -1);

    $(".infData").show();
    $("#textDescription").html(itemData);
});

$(document).on("click", "#wantCancelButton", function () {
    $(".youWantBuySection").fadeOut(400);
});

$(document).on("click", "#wantBuyButton", function () {
    var selectedDiv = this;
    var itemData = $(selectedDiv).attr("data-buyButtonItem");
    var formData = new FormData();
    formData.append("data", itemData);

    $.ajax({
        type: "POST",
        url: 'https://loja.brotasrp.com/buyItem',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response.error == false) {
                $(".creditCount").html(response.coin);
                $(".youWantBuySection").fadeOut(400);
                $(".succesfullyPurchArea").fadeIn(400);

                $(".succesItemLabel").html(response.label);
                $("#succesImg").attr("src", linkItens + response.itemName + ".png");

                setTimeout(() => {
                    $(".succesfullyPurchArea").fadeOut(400);
                }, 1500);
            } else {
                $(".notifyArea").html(response.error);
                $(".notifySectionXX").fadeIn(200);
                setTimeout(() => {
                    $(".notifySectionXX").fadeOut(200);
                }, 3000);
            }
        },
        error: function (result) {
            console.log("ERROR :" + JSON.stringify(result))
        }
    });
    
});

$(document).on("click", "#exitIcon", function () {
    $.post("https://brotas-vip/closeMenu", JSON.stringify());
    $(".generalSection").hide();
    $(".coinBuyArea").hide();
    $(".youWantBuySection").hide();
    $(".succesfullyPurchArea").hide();
});

$(document).on("click", "#exitBttn", function () {
    $(".coinBuyArea").fadeOut(400);
});

$(document).on("click", "#exitBttn2", function () {
    $(".metodpag").fadeOut(400);
});

$(document).on("click", "#exitBttnDescription", function () {
    $(".infData").fadeOut(400);
});

$(document).on("click", ".redeemOkButton", function () {
    var codeInputValue = $("#redeemCodeInput").val();
    if (codeInputValue != "RESGATAR CÓDIGO..." && codeInputValue.length > 0) {
        var formdata = new FormData();
        formdata.append("cupom", JSON.stringify(codeInputValue));
        $.ajax({
            type: "POST",
            url: 'https://loja.brotasrp.com/sendInput',
            data: formdata,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.error == false) {
                    $(".succesfullyArea").empty();
                    $(".succesfullyArea").append(`
                        <div class="succesNotify">Desconto aplicado com sucesso!</div>
                    `);
                    $(".succesfullyArea").fadeIn(200);
                    setTimeout(() => {
                        $(".succesfullyArea").fadeOut(200);
                    }, 3000);
                    setCoinBuyItems(parseInt(response.desc.percentage))
                    descontoAplicado = parseInt(response.desc.percentage)
                } else {
                    $(".notifyArea").html(response.error);
                    $(".notifySectionXX").fadeIn(200);
                    setTimeout(() => {
                        $(".notifySectionXX").fadeOut(200);
                    }, 3000);
                }
            },
            error: function (result) {
                console.log("ERROR :" + JSON.stringify(result))
            }
        });
    }
});

$(document).on("keydown", function () {
    switch (event.keyCode) {
        case 27: // ESC
            $.post("https://brotas-vip/closeMenu", JSON.stringify());
            $(".generalSection").hide();
            $(".coinBuyArea").hide();
            $(".youWantBuySection").hide();
            $(".succesfullyPurchArea").hide();
            break;
    }
});

function setTopPlayers(topPly) {
    $(".rankAreaRankList").empty();

    // Ordena os jogadores com base na quantidade de moedas
    topPly.sort((a, b) => b.coin - a.coin);

    for (let i = 0; i < topPly.length; i++) {
        var classText = "";
        if (i == 0) classText = " first";
        if (i == 1) classText = " second";
        if (i == 2) classText = " third";

        const element = topPly[i];
        $(".rankAreaRankList").append(`
            <div class="rankItem${classText}">
                <div class="rankItemLeftArea">
                    <div class="rankCount${classText}">#${i + 1}</div>
                    <div class="weeklyFirstName${classText}">${element.firstName}</div>
                </div>
                <div class="rankItemRightArea">
                    <div class="rankItemCoinImgArea">
                        <img src="https://dgbijzg00pxv8.cloudfront.net/730e2e3d-6058-4f2f-b90e-19a8f43d3574/000000-0000000000/29714182317096389116622984018383799166334810000320155336077102762626826855522/ITEM_PREVIEW1.gif" alt="" />
                    </div>
                    <div class="rankItemCoin${classText}">${element.coin}</div>
                    <div class="rankItemCoinText${classText}">COINS</div>
                </div>
            </div>
        `);
    }
}

function chamarT() {
    $.ajax({
        type: "GET",
        url: 'https://loja.brotasrp.com/getItems',
        dataType: 'json',
        success: function (response) {
            if (response.error == false) {
                processEventData(response.itens)
            } else {
                // Se houver um erro no lado do servidor
            }
        },
        error: function (result) {
            console.log("ERROR :" + JSON.stringify(result))
            // Se houver um erro de rede ou outro tipo de erro
        }
    });
}

function processEventData(configData) {
    categories = JSON.parse(configData.Categories);
    items = JSON.parse(configData.Items);
    coinList = JSON.parse(configData.CoinList);
    topPlayers = info;
    linkItens = configData.urlImgItens;
    linkVehicles = configData.urlImgVehicles;
    setTopPlayers(topPlayers);
    setCoinBuyItems(descontoAplicado);
    setCategories(categories);
    setItemsIntoCategory(categories, items);
    setTimeout(() => {
        $(".categoryItem:first-child").click();
    }, 10);
}


/* STYLE BUTTON LOGOUT */

document.querySelectorAll('.logoutButton').forEach(button => {
    button.state = 'default'

    // function to transition a button from one state to the next
    let updateButtonState = (button, state) => {
        if (logoutButtonStates[state]) {
            button.state = state
            for (let key in logoutButtonStates[state]) {
                button.style.setProperty(key, logoutButtonStates[state][key])
            }
        }
    }

    // mouse hover listeners on button
    button.addEventListener('mouseenter', () => {
        if (button.state === 'default') {
            updateButtonState(button, 'hover')
        }
    })
    button.addEventListener('mouseleave', () => {
        if (button.state === 'hover') {
            updateButtonState(button, 'default')
        }
    })

    // click listener on button
    button.addEventListener('click', () => {
        if (button.state === 'default' || button.state === 'hover') {
            button.classList.add('clicked')
            updateButtonState(button, 'walking1')
            setTimeout(() => {
                button.classList.add('door-slammed')
                updateButtonState(button, 'walking2')
                setTimeout(() => {
                    button.classList.add('falling')
                    updateButtonState(button, 'falling1')
                    setTimeout(() => {
                        updateButtonState(button, 'falling2')
                        setTimeout(() => {
                            updateButtonState(button, 'falling3')
                            setTimeout(() => {
                                button.classList.remove('clicked')
                                button.classList.remove('door-slammed')
                                button.classList.remove('falling')
                                updateButtonState(button, 'default')
                                window.location.href = '/auth/logout'; // Redireciona para a página de logout
                            }, 1000)
                        }, logoutButtonStates['falling2']['--walking-duration'])
                    }, logoutButtonStates['falling1']['--walking-duration'])
                }, logoutButtonStates['walking2']['--figure-duration'])
            }, logoutButtonStates['walking1']['--figure-duration'])
        }
    })
})

const logoutButtonStates = {
    'default': {
        '--figure-duration': '100',
        '--transform-figure': 'none',
        '--walking-duration': '100',
        '--transform-arm1': 'none',
        '--transform-wrist1': 'none',
        '--transform-arm2': 'none',
        '--transform-wrist2': 'none',
        '--transform-leg1': 'none',
        '--transform-calf1': 'none',
        '--transform-leg2': 'none',
        '--transform-calf2': 'none'
    },
    'hover': {
        '--figure-duration': '100',
        '--transform-figure': 'translateX(1.5px)',
        '--walking-duration': '100',
        '--transform-arm1': 'rotate(-5deg)',
        '--transform-wrist1': 'rotate(-15deg)',
        '--transform-arm2': 'rotate(5deg)',
        '--transform-wrist2': 'rotate(6deg)',
        '--transform-leg1': 'rotate(-10deg)',
        '--transform-calf1': 'rotate(5deg)',
        '--transform-leg2': 'rotate(20deg)',
        '--transform-calf2': 'rotate(-20deg)'
    },
    'walking1': {
        '--figure-duration': '300',
        '--transform-figure': 'translateX(11px)',
        '--walking-duration': '300',
        '--transform-arm1': 'translateX(-4px) translateY(-2px) rotate(120deg)',
        '--transform-wrist1': 'rotate(-5deg)',
        '--transform-arm2': 'translateX(4px) rotate(-110deg)',
        '--transform-wrist2': 'rotate(-5deg)',
        '--transform-leg1': 'translateX(-3px) rotate(80deg)',
        '--transform-calf1': 'rotate(-30deg)',
        '--transform-leg2': 'translateX(4px) rotate(-60deg)',
        '--transform-calf2': 'rotate(20deg)'
    },
    'walking2': {
        '--figure-duration': '400',
        '--transform-figure': 'translateX(17px)',
        '--walking-duration': '300',
        '--transform-arm1': 'rotate(60deg)',
        '--transform-wrist1': 'rotate(-15deg)',
        '--transform-arm2': 'rotate(-45deg)',
        '--transform-wrist2': 'rotate(6deg)',
        '--transform-leg1': 'rotate(-5deg)',
        '--transform-calf1': 'rotate(10deg)',
        '--transform-leg2': 'rotate(10deg)',
        '--transform-calf2': 'rotate(-20deg)'
    },
    'falling1': {
        '--figure-duration': '1600',
        '--walking-duration': '400',
        '--transform-arm1': 'rotate(-60deg)',
        '--transform-wrist1': 'none',
        '--transform-arm2': 'rotate(30deg)',
        '--transform-wrist2': 'rotate(120deg)',
        '--transform-leg1': 'rotate(-30deg)',
        '--transform-calf1': 'rotate(-20deg)',
        '--transform-leg2': 'rotate(20deg)'
    },
    'falling2': {
        '--walking-duration': '300',
        '--transform-arm1': 'rotate(-100deg)',
        '--transform-arm2': 'rotate(-60deg)',
        '--transform-wrist2': 'rotate(60deg)',
        '--transform-leg1': 'rotate(80deg)',
        '--transform-calf1': 'rotate(20deg)',
        '--transform-leg2': 'rotate(-60deg)'
    },
    'falling3': {
        '--walking-duration': '500',
        '--transform-arm1': 'rotate(-30deg)',
        '--transform-wrist1': 'rotate(40deg)',
        '--transform-arm2': 'rotate(50deg)',
        '--transform-wrist2': 'none',
        '--transform-leg1': 'rotate(-30deg)',
        '--transform-leg2': 'rotate(20deg)',
        '--transform-calf2': 'none'
    }
}


/* FINAL STYLE BUTTON LOGOUT */


function validar() {
    const inputCPF = document.getElementById('cpf');
    const inputEmail = document.getElementById('email');
    const cpf = inputCPF.value.trim();
    const email = inputEmail.value.trim();

    const isValidCPF = validarCPF(cpf);
    const isValidEmail = validarEmail(email);

    const mensagem = 'CPF: ' + isValidCPF.message + '\n' + 'Email: ' + isValidEmail.message;
    const isValid = isValidCPF.isValid && isValidEmail.isValid;

    return exibirMensagem(mensagem, isValid);
}

function validarCPF(cpf) {
    const cpfPattern = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

    if (!cpfPattern.test(cpf)) {
        return { isValid: false, message: 'Formato de CPF inválido.' };
    }

    cpf = cpf.replace(/[^\d]+/g,'');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return { isValid: false, message: 'CPF inválido.' };
    }

    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(9, 10))) {
        return { isValid: false, message: 'CPF inválido.' };
    }
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(10, 11))) {
        return { isValid: false, message: 'CPF inválido.' };
    }

    return { isValid: true, message: 'CPF válido.' };
}

function validarEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return { isValid: false, message: 'Formato de email inválido.' };
    }

    return { isValid: true, message: 'Email válido.' };
}


function exibirMensagem(mensagem, isValid) {
    const mensagemDiv = document.getElementById('validation-message');
    mensagemDiv.textContent = mensagem;
    mensagemDiv.style.color = isValid ? 'green' : 'red';

    if(isValid)
        return true
    else
        return false 
}

// Função para formatar CPF enquanto o usuário digita
function formatarCPF(input) {
    // Remove caracteres não numéricos do valor do input
    let cpf = input.value.replace(/\D/g, '');
    
    // Adiciona pontos e traço de acordo com a posição dos números
    if (cpf.length > 3 && cpf.length < 7) {
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    } else if (cpf.length > 6 && cpf.length < 10) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
    } else if (cpf.length > 9 && cpf.length < 12) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
    }

    // Atualiza o valor do input com o CPF formatado
    input.value = cpf;
}

// Seleciona o campo de CPF
const cpfInput = document.getElementById('cpf');

// Adiciona um event listener para chamar a função formatarCPF quando o usuário digita no campo de CPF
cpfInput.addEventListener('input', function() {
    formatarCPF(this);
});

let profileVisible = false;
$('.hamburger').click(() => {
    if (profileVisible) {
        $('.profileArea2').css('width', '0');
        $('.hamburger').html('<i class="bi bi-list"></i>');
        profileVisible = false;
    } else {
        $('.profileArea2').css('width', '100%');
        $('.hamburger').html('<i class="bi bi-x-circle" style="color:red"></i>');
        profileVisible = true;
    }
});