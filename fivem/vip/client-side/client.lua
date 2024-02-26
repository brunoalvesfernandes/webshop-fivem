local Tunnel = module("vrp","lib/Tunnel")
local Proxy = module("vrp","lib/Proxy")
vRP = Proxy.getInterface("vRP")
vRPserver = Tunnel.getInterface("vRP","vip")

src = {}
Tunnel.bindInterface("vip",src)
vSERVER = Tunnel.getInterface("vip")

local _comemoracao = false
RegisterNetEvent('vipComemoracao')
AddEventHandler('vipComemoracao', function()
    _comemoracao = not _comemoracao
    SendNUIMessage({ comemoracao = _comemoracao })
end)

RegisterNUICallback('updateItemVip', function(data, cb)
	vSERVER.updateItemVip(json.encode(data.user_id))
	cb(true)
end)