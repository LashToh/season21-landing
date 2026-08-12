-- BossTopDamage_Client.lua
-- MUDevs S21.1-2 — Top Boss Damage overlay (client)
-- Place in your client Lua scripts folder and ensure it loads with Main.dll Lua.

local PACKET_HEAD = 0xBD
local PACKET_SUB_RANKING = 0x01
local PACKET_SUB_CLEAR = 0x02

-- Payload starts after C2-FE wrapper. If your client callback already strips the
-- header and passes only the inner payload, set this to 0.
local PAYLOAD_OFFSET = 0

local UI = {
    active = false,
    bossName = "",
    monsterIndex = 0,
    life = 0,
    maxLife = 0,
    total = 0,
    myDamage = 0,
    myRank = 0,
    rows = {},
    lastUpdate = 0,
}

local function FormatNumber(n)
    n = math.floor(tonumber(n) or 0)
    local s = tostring(n)
    local left, num, right = string.match(s, "^([^%d]*%d)(%d*)(.-)$")
    if not left then
        return s
    end
    return left .. (num:reverse():gsub("(%d%d%d)", "%1,"):reverse()) .. right
end

local function FormatPct(basisPoints)
    local v = tonumber(basisPoints) or 0
    return string.format("%.2f%%", v / 100)
end

local function ReadByte(packet, offset)
    return PacketGetByte(packet, offset), offset + 1
end

local function ReadWord(packet, offset)
    return PacketGetWord(packet, offset), offset + 2
end

local function ReadDword(packet, offset)
    return PacketGetDword(packet, offset), offset + 4
end

local function ReadLenString(packet, offset)
    local len
    len, offset = ReadByte(packet, offset)
    local chars = {}
    for i = 1, len do
        local b
        b, offset = ReadByte(packet, offset)
        chars[i] = string.char(b)
    end
    return table.concat(chars), offset
end

local function ClearUI()
    UI.active = false
    UI.bossName = ""
    UI.monsterIndex = 0
    UI.life = 0
    UI.maxLife = 0
    UI.total = 0
    UI.myDamage = 0
    UI.myRank = 0
    UI.rows = {}
end

local function ParseRanking(packet, offset)
    local monsterIndex, classId, life, maxLife, total, myDamage, myRank, count, bossName

    monsterIndex, offset = ReadWord(packet, offset)
    classId, offset = ReadWord(packet, offset)
    life, offset = ReadDword(packet, offset)
    maxLife, offset = ReadDword(packet, offset)
    total, offset = ReadDword(packet, offset)
    myDamage, offset = ReadDword(packet, offset)
    myRank, offset = ReadByte(packet, offset)
    count, offset = ReadByte(packet, offset)
    bossName, offset = ReadLenString(packet, offset)

    local rows = {}
    for i = 1, count do
        local name, damage, pct
        name, offset = ReadLenString(packet, offset)
        damage, offset = ReadDword(packet, offset)
        pct, offset = ReadWord(packet, offset)
        rows[i] = { name = name, damage = damage, pct = pct }
    end

    UI.active = true
    UI.bossName = bossName
    UI.monsterIndex = monsterIndex
    UI.life = life
    UI.maxLife = maxLife
    UI.total = total
    UI.myDamage = myDamage
    UI.myRank = myRank
    UI.rows = rows
    UI.lastUpdate = os.clock()
end

local function HandlePacket(head, packet)
    if head ~= nil and head ~= PACKET_HEAD then
        return false
    end

    local offset = PAYLOAD_OFFSET
    local sub
    sub, offset = ReadByte(packet, offset)

    -- Some clients deliver head as first payload byte instead of a separate arg
    if head == nil and sub == PACKET_HEAD then
        sub, offset = ReadByte(packet, offset)
    end

    if sub == PACKET_SUB_CLEAR then
        local monsterIndex
        monsterIndex = PacketGetWord(packet, offset)
        if UI.monsterIndex == 0 or UI.monsterIndex == monsterIndex then
            ClearUI()
        end
        return true
    end

    if sub == PACKET_SUB_RANKING then
        ParseRanking(packet, offset)
        return true
    end

    return false
end

-- Support common S21 client callback shapes
LuaEventAttach("OnPacketRecv", function(a, b)
    -- Shape A: OnPacketRecv(head, packet)
    if type(a) == "number" and b ~= nil then
        HandlePacket(a, b)
        return
    end
    -- Shape B: OnPacketRecv(packet)  — head embedded / already filtered
    if a ~= nil and b == nil then
        HandlePacket(nil, a)
    end
end)

LuaEventAttach("OnRender", function()
    if not UI.active then
        return
    end

    -- Auto-hide if updates stop (player left area / fight ended)
    if UI.lastUpdate > 0 and (os.clock() - UI.lastUpdate) > 3.0 then
        ClearUI()
        return
    end

    local x = 20
    local y = 120
    local hpPct = 0
    if UI.maxLife > 0 then
        hpPct = math.floor((UI.life * 100) / UI.maxLife)
    end

    UIRenderText_Left(x, y, "TOP BOSS DAMAGE", 255, 220, 120)
    y = y + 14
    UIRenderText_Left(x, y, string.format("%s  HP %d%%", UI.bossName, hpPct), 255, 255, 255)
    y = y + 16

    for i = 1, #UI.rows do
        local row = UI.rows[i]
        local r, g, b = 200, 200, 200
        if i == 1 then
            r, g, b = 255, 215, 0
        elseif UI.myRank == i then
            r, g, b = 120, 220, 255
        end
        UIRenderText_Left(
            x,
            y,
            string.format("%d. %s  %s  (%s)", i, row.name, FormatNumber(row.damage), FormatPct(row.pct)),
            r, g, b
        )
        y = y + 14
    end

    y = y + 6
    local rankText = UI.myRank > 0 and tostring(UI.myRank) or "-"
    UIRenderText_Left(
        x,
        y,
        string.format("You: %s  Rank %s", FormatNumber(UI.myDamage), rankText),
        180, 255, 180
    )
end)
