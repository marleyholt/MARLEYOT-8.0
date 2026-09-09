-- AutoLoot OTClient Module for MarleyOT 7.72
autoLootWindow = nil
autoLootButton = nil

local OPCODE_AUTOLOOT = 110
local isTogglingGoldInternally = false

function init()
	connect(g_game, {
		onGameStart = onGameStart,
		onGameEnd = onGameEnd
	})

	ProtocolGame.registerExtendedOpcode(OPCODE_AUTOLOOT, onExtendedOpcode)

	autoLootWindow = g_ui.displayUI('game_autoloot')
	autoLootWindow:hide()

	if modules.client_topmenu and modules.client_topmenu.addLeftGameButton then
		autoLootButton = modules.client_topmenu.addLeftGameButton('autoLootButton', tr('AutoLoot (Ctrl+L)'), '/images/topbuttons/inventory', toggle)
	end

	g_keyboard.bindKeyDown('Ctrl+L', toggle)

	if g_game.isOnline() then
		requestSync()
	end
end

function terminate()
	disconnect(g_game, {
		onGameStart = onGameStart,
		onGameEnd = onGameEnd
	})

	ProtocolGame.unregisterExtendedOpcode(OPCODE_AUTOLOOT)
	g_keyboard.unbindKeyDown('Ctrl+L')

	if autoLootButton then
		autoLootButton:destroy()
		autoLootButton = nil
	end

	if autoLootWindow then
		autoLootWindow:destroy()
		autoLootWindow = nil
	end
end

function onGameStart()
	requestSync()
end

function onGameEnd()
	if autoLootWindow and autoLootWindow:isVisible() then
		autoLootWindow:hide()
	end
end

function toggle()
	if not autoLootWindow then
		return
	end

	if autoLootWindow:isVisible() then
		autoLootWindow:hide()
	else
		autoLootWindow:show()
		autoLootWindow:raise()
		autoLootWindow:focus()
		requestSync()
	end
end

function sendOpcode(payload)
	local protocol = g_game.getProtocolGame()
	if protocol then
		protocol:sendExtendedOpcode(OPCODE_AUTOLOOT, json.encode(payload))
	end
end

function requestSync()
	sendOpcode({ action = "open" })
end

function onToggleGold(checked)
	if isTogglingGoldInternally then
		return
	end
	sendOpcode({ action = "toggle_gold" })
end

function onAddItem()
	if not autoLootWindow then
		return
	end

	local input = autoLootWindow:getChildById('itemInput')
	if not input then
		return
	end

	local text = input:getText():trim()
	if text:len() == 0 then
		return
	end

	sendOpcode({ action = "add", item = text })
	input:clearText()
end

function onRemoveItem(itemId)
	sendOpcode({ action = "remove", item = itemId })
end

function onClearList()
	sendOpcode({ action = "clear" })
end

function onExtendedOpcode(protocol, opcode, buffer)
	if opcode ~= OPCODE_AUTOLOOT then
		return
	end

	local status, data = pcall(function() return json.decode(buffer) end)
	if not status or not data then
		return
	end

	if data.action == "sync" then
		renderSyncData(data)
	elseif data.action == "error" then
		displayMessage(data.message or "Erro no AutoLoot.")
	end
end

function renderSyncData(data)
	if not autoLootWindow then
		return
	end

	-- Update Gold Checkbox
	local goldBox = autoLootWindow:getChildById('goldCheckBox')
	if goldBox then
		isTogglingGoldInternally = true
		goldBox:setChecked(data.gold == true)
		isTogglingGoldInternally = false
	end

	-- Update Slots Label
	local items = data.items or {}
	local count = #items
	local maxSlots = data.maxSlots or 3
	local accType = data.isPremium and "Premium Account" or "Free Account"

	local slotsLabel = autoLootWindow:getChildById('slotsLabel')
	if slotsLabel then
		slotsLabel:setText(string.format("Slots: %d / %d (%s)", count, maxSlots, accType))
	end

	-- Render Item List
	local listPanel = autoLootWindow:getChildById('itemList')
	if listPanel then
		listPanel:destroyChildren()
		for _, item in ipairs(items) do
			local widget = g_ui.createWidget('AutoLootItemWidget', listPanel)
			local label = widget:getChildById('itemName')
			if label then
				label:setText(item.name .. " (" .. item.id .. ")")
			end

			local removeBtn = widget:getChildById('removeButton')
			if removeBtn then
				removeBtn.onClick = function()
					onRemoveItem(item.id)
				end
			end
		end
	end
end

function displayMessage(msg)
	if modules.game_textmessage then
		modules.game_textmessage.displayFailureMessage("[AutoLoot] " .. msg)
	end
end
