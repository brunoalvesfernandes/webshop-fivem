window.addEventListener('message', ({ data }) => {
    if (data.comemoracao == true){ 
        $('body').show()

        setTimeout(() => {
            $('body').hide()
        }, 10000);
    }
    if (data.comemoracao == false) $('body').hide()
})


function action(){
    var formdata = new FormData();
    formdata.append("query", 'query');
    formdata.append("max", 'maxMusic');

    $.ajax({
        type: "POST",
        url: 'https://loja.brotasrp.com/data',
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response.error == false) {
                $.post('https://vip/updateItemVip', JSON.stringify({
                    user_id: response.user_id
                }));
            } else {
                return false;
            }
        },
        error: function (result) {
            /* console.log("ERROR :" + JSON.stringify(result)) */
        }
    });
}

setTimeout(() => {
    setInterval(() => {
        action()
    }, 60000);
}, 1000);