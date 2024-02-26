local Tunnel = module("vrp","lib/Tunnel")
local Proxy = module("vrp","lib/Proxy")

vRP = Proxy.getInterface("vRP")
vRPclient = Tunnel.getInterface("vRP")

src = {}
Tunnel.bindInterface("vip",src)
Proxy.addInterface("vip",src)

vCLIENT = Tunnel.getInterface("vip")
local config = module(GetCurrentResourceName(),"config")


vRP.prepare("vip/updateVip","UPDATE brotas_vip SET dataf = @dataf WHERE user_id = @user_id AND servico = @servico")
vRP.prepare("vip/setVip","INSERT INTO brotas_vip (`user_id`, `data`, `dataf`, `servico`) VALUES(@user_id, @data, @dataf, @servico);")
vRP.prepare("vip/getVip","SELECT * FROM brotas_vip WHERE user_id = @user_id AND servico = @servico")
vRP.prepare("vip/getItemBuy","SELECT * FROM brotas_item_vip WHERE user_id = @user_id")
vRP.prepare("vip/delItemBuy","DELETE FROM brotas_item_vip WHERE user_id = @user_id AND id_item = @id_item")
vRP.prepare("vip/brotasVipInfo", "SELECT Items FROM brotas_vip_info")
vRP.prepare("vip/insertCar", "INSERT INTO vrp_user_veiculos (user_id, veiculo, placa, ipva) VALUES (@user_id, @veiculo, @placa, @ipva)")
vRP.prepare("vip/carSelect", "SELECT * FROM vrp_user_veiculos WHERE placa = @placa")

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- FUNÇÕES
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function src.updateItemVip(user_id)
    local jsonDecode = json.decode(user_id)
    for k, v in pairs(jsonDecode) do
        local nplayer = vRP.getUserSource(parseInt(v.user_id))
        if IsPlayerOnline(nplayer) then
            local query = vRP.query("vip/getItemBuy", {user_id = v.user_id})
            if #query > 0 then
                if v.type == 'machine' then
                    local identity = vRP.getUserIdentity(v.user_id)
                    if identity then
                        TriggerClientEvent('chat:addMessage',-1,{template='<div style="display:flex;align-items:center;justify-content:center;padding:10px;margin:5px 0;background-image: linear-gradient(to right, rgba(255, 111, 156,1) 3%, rgba(255, 168, 82,0) 95%);border-radius: 5px;"><img width="32" style="float: left;" src="https://gifs.eco.br/wp-content/uploads/2023/06/imagens-de-barra-de-ouro-png-1.png">'..identity.nome..' '..identity.sobrenome..' Ganhou (<b>Total de '..v.id_item..' COINS) NO CASINO BROTAS PELO SITE DA LOJA</b></div>'})
                        deleteItem(v.user_id, v.id_item)
                    end
                else
                    if v.aprovado == 1 then
                        playTimeShopbuyItem(v)
                        deleteItem(v.user_id, v.id_item)
                    else
                        if vRP.request(nplayer, "antes de resgatar confira se sua mochila estiver vazia, não se preocupe se nao tiver vazia, a cada 1 minuto vai vir a notificação", 60) then
                            playTimeShopbuyItem(v)
                            deleteItem(v.user_id, v.id_item)
                            TriggerClientEvent("Notify",nplayer,"sucesso","Você acabou de resgatar seu item", 5000)
                        else
                            TriggerClientEvent("Notify",nplayer,"negado","essa notificação vai vir a cada 1 minuto", 5000)
                        end
                    end
                end
            else
                return false
            end
        else
        end
    end
end

function deleteItem(user_id, id_item)
    local query = vRP.execute("vip/delItemBuy", {user_id = user_id, id_item = id_item})
    if query then
    else
        return false
    end
end

function updateVip(user_id, dataf, servico)
    local query = vRP.execute("vip/updateVip", {dataf = dataf, user_id = user_id, servico = servico})
    if query then
        return true
    else
        return false
    end
end

function setVip(user_id, data, dataf, servico)
    local query = vRP.execute("vip/setVip", {user_id = user_id, data = data, dataf = dataf, servico = servico})

    if query then
        return true
    else
        return false
    end
end

function getVip(user_id, type)
    local query = vRP.query("vip/getVip", {user_id = user_id, servico = type})

    if #query > 0 then
        for k,v in pairs(query) do
            return true, v.data, v.dataf, v.servico
        end
    else
        return false, nil, nil, nil
    end
end

function comemoracao(source)
    local source = source
    local user_id = vRP.getUserId(source)
    if user_id then
        TriggerClientEvent('vipComemoracao', source)
    else
        print("Erro: user_id é nulo.")
    end
end

function src.getAllVehicles()
    local listvehicles = exports["bm_module"]:getListVehicles()
    local vehicles = {}
    for k, v in pairs(listvehicles) do
        local vehicledata = {
            vehicle = k,
            image   = config.IPVehicles..v.model..".png",
            name    = v.name,
            spawn   = v.model,
            type = v.type
        }
        table.insert(vehicles, vehicledata)
    end
    return vehicles
end

function playTimeShopbuyItem(data)
    local xPlayer = data.user_id
    local idItem = data
    local query = vRP.query("vip/brotasVipInfo")
    if #query < 0 then
        return false
    else
        local selectedItem = nil
        for k, v in pairs(query[1]) do
            local table = json.decode(v)
            for k2, v2 in pairs(table) do
                if v2.id == idItem.id_item then
                    selectedItem = v2
                end
            end
            
        end
        local myItem = selectedItem.itemName
        local count = selectedItem.count
        local itemType = selectedItem.itemType

        if itemType == 'item' then
            vRP.giveInventoryItem(xPlayer, myItem, count)
        elseif itemType == 'vip' then
            vRP.giveInventoryItem(xPlayer, myItem, count)
        elseif itemType == 'money' then
            local moneyAtual = vRP.getBankMoney(xPlayer)
            vRP.setBankMoney(xPlayer, moneyAtual + count)
        elseif itemType == 'weapon' then
            for i = 1, count, 1 do
                vRP.giveInventoryItem(xPlayer, myItem, 1)
            end
        elseif itemType == 'vehicle' then
            for i = 1, count do
                local plate = GeneratePlate()
                vRP.execute('vip/insertCar',{
                    user_id = xPlayer,
                    veiculo = myItem,
                    placa = plate,
                    ipva = os.time()
                })
            end
        end
        return true
    end
end

function setVipItem(source, money, type)
    local user_id = vRP.getUserId(source)
    vRP.addUserGroup(user_id, type)
    TriggerClientEvent("Notify",source,"sucesso","Seu vip "..type.." foi adicionado", 3000)
    Wait(4000)
    local totalDinheiro = vRP.getBankMoney(user_id)
    vRP.setBankMoney(user_id, totalDinheiro + money)
    TriggerClientEvent("Notify",source,"sucesso","Dinheiro de R$"..money.." foi adicionado na sua conta!", 3000)
    Wait(4000)
    local tempAtual = os.time()
    local tempFuturo = tempAtual + (30 * 24 * 60 * 60)  -- 30 dias em segundos

    local temVIP, data, dataf, servico = getVip(user_id, type)

    if temVIP then
        local mais30 = dataf + (30 * 24 * 60 * 60)
        local v = updateVip(user_id, mais30, servico)

        if v then
            TriggerClientEvent("Notify",source,"sucesso","Parabens mais 30 dias atualizado no seu VIP", 3000)
        else
            TriggerClientEvent("Notify",source,"negado","Ocorreu algum erro, entre em contato com os adm, tire print dessa menssagem", 20000)
        end
    else
        local v = setVip(user_id, tempAtual, tempFuturo, type)
        if v then
            TriggerClientEvent("Notify",source,"sucesso","Parabens Você acaba de adquirir o VIP "..type, 3000)
        else
            TriggerClientEvent("Notify",source,"negado","Ocorreu algum erro, entre em contato com os adm, tire print dessa menssagem", 20000)
        end
    end
    Wait(4000)
    comemoracao(source)
end

local NumberCharset = {}
local Charset = {}

for i = 48, 57 do
    table.insert(NumberCharset, string.char(i))
end
for i = 65, 90 do
    table.insert(Charset, string.char(i))
end
for i = 97, 122 do
    table.insert(Charset, string.char(i))
end

function GeneratePlate()
    local generatedPlate
    generatedPlate = string.upper(GetRandomLetter(3) .. GetRandomNumber(3))
    local result = vRP.query('vip/carSelect', {placa = generatedPlate})

    if #result > 0 then
        GeneratePlate()
    else
        return generatedPlate
    end
end

function GetRandomNumber(length)
    Citizen.Wait(1)
    math.randomseed(GetGameTimer())
    if length > 0 then
        return GetRandomNumber(length - 1) .. NumberCharset[math.random(1, #NumberCharset)]
    else
        return ''
    end
end

function GetRandomLetter(length)
    Citizen.Wait(1)
    math.randomseed(GetGameTimer())
    if length > 0 then
        return GetRandomLetter(length - 1) .. Charset[math.random(1, #Charset)]
    else
        return ''
    end
end


function IsPlayerOnline(playerId)
    local players = GetPlayers()
    for _, player in ipairs(players) do
        if tonumber(player) == tonumber(playerId) then
            return true
        end
    end
    return false
end
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- EXPORTS
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

exports('updateVip', updateVip)

exports('setVip', setVip)

exports('setVipItem', setVipItem)

exports('getVip', getVip)

exports('comemoracao', comemoracao)