-- BossTopDamage.lua
-- MUDevs S21.1-2 — Top Boss Damage (server)
-- Drop goes to highest damager. Damage is cleared on death, distance > N, or idle timeout.
--
-- NOTE: Public Lua API has no OnDamage/OnAttack hook. HitDamage is filled by the GameServer.
-- Idle timeout is approximated via HP drops + presence in range (see README).

local PACKET_HEAD = 0xBD
local PACKET_SUB_RANKING = 0x01
local PACKET_SUB_CLEAR = 0x02
local TOP_N = 5
local UI_RANGE = 15

-- Add boss Class IDs here
local BOSS_CONFIG = {
    [275] = { name = "Kundun", maxDistance = 5, idleSeconds = 5 },
    -- [43]  = { name = "Red Dragon", maxDistance = 5, idleSeconds = 5 },
    -- [149] = { name = "Golden Budge Dragon", maxDistance = 5, idleSeconds = 5 },
}

-- ActiveBosses[monsterIndex] = {
--   class, name, maxDistance, idleSeconds,
--   lastLife, participants = { [aIndex] = { name, damage, lastActive } }
-- }
local ActiveBosses = {}

local function Now()
    return GetTickCount()
end

local function IsBossClass(class)
    return BOSS_CONFIG[class] ~= nil
end

local function EnsureBossState(monster)
    if monster == nil or not IsBossClass(monster.Class) then
        return nil
    end

    local idx = monster.Index
    local state = ActiveBosses[idx]
    if state == nil then
        local cfg = BOSS_CONFIG[monster.Class]
        state = {
            class = monster.Class,
            name = cfg.name,
            maxDistance = cfg.maxDistance or 5,
            idleSeconds = cfg.idleSeconds or 5,
            lastLife = monster.Life,
            participants = {},
        }
        ActiveBosses[idx] = state
        gObjMonsterInitHitDamage(monster)
    end
    return state
end

local function ClearPlayerFromBoss(monster, state, aIndex, reason)
    if state == nil or state.participants[aIndex] == nil then
        return
    end

    local entry = state.participants[aIndex]
    state.participants[aIndex] = nil

    if monster ~= nil then
        gObjMonsterDelHitDamageUser(monster, aIndex)
        -- Keep custom table in sync if the GS uses it
        pcall(function()
            gObjMonsterDelHitDamageUserCustom(monster, aIndex)
        end)
    end

    if gObjIsConnectedGP(aIndex) then
        local msg = string.format("[BossDMG] Damage cleared on %s (%s).", state.name, reason or "rule")
        GCNoticeSend(aIndex, 0, msg)

        local pkt = Packet()
        pkt:WriteByte(PACKET_SUB_CLEAR)
        pkt:WriteWord(monster and monster.Index or 0)
        SendPacket(aIndex, PACKET_HEAD, pkt)
    end
end

local function ClearPlayerFromAllBosses(aIndex, reason)
    for monsterIndex, state in pairs(ActiveBosses) do
        local monster = GetUser(monsterIndex)
        ClearPlayerFromBoss(monster, state, aIndex, reason)
    end
end

local function ProbeHitDamage(monster, aIndex)
    -- SetHitDamage returns accumulated total. Passing 0 probes without adding real damage
    -- when the player already exists in the table; if the player is absent, some builds
    -- may create a 0-entry — we only probe known participants / top dealer.
    local ok, accumulated = pcall(function()
        return gObjMonsterSetHitDamage(monster, aIndex, 0)
    end)
    if ok and type(accumulated) == "number" then
        return accumulated
    end
    return 0
end

local function SyncParticipant(monster, state, aIndex, damage, markActive)
    local player = GetUser(aIndex)
    if player == nil or not gObjIsConnectedGP(aIndex) then
        return
    end

    local entry = state.participants[aIndex]
    if entry == nil then
        entry = { name = player.Name, damage = 0, lastActive = Now() }
        state.participants[aIndex] = entry
    else
        entry.name = player.Name
    end

    if damage ~= nil and damage > entry.damage then
        entry.damage = damage
        if markActive ~= false then
            entry.lastActive = Now()
        end
    elseif markActive then
        entry.lastActive = Now()
    end
end

local function BuildRanking(state)
    local list = {}
    local total = 0

    for aIndex, entry in pairs(state.participants) do
        if entry.damage > 0 and gObjIsConnectedGP(aIndex) then
            total = total + entry.damage
            list[#list + 1] = {
                index = aIndex,
                name = entry.name,
                damage = entry.damage,
            }
        end
    end

    table.sort(list, function(a, b)
        if a.damage == b.damage then
            return a.index < b.index
        end
        return a.damage > b.damage
    end)

    local top = {}
    for i = 1, math.min(TOP_N, #list) do
        local row = list[i]
        local pct = 0
        if total > 0 then
            pct = math.floor((row.damage * 10000) / total) -- basis points for 2 decimals
        end
        top[#top + 1] = {
            index = row.index,
            name = row.name,
            damage = row.damage,
            pct = pct,
        }
    end

    return top, total
end

local function WriteLenString(pkt, text, maxLen)
    text = tostring(text or "")
    if #text > maxLen then
        text = text:sub(1, maxLen)
    end
    pkt:WriteByte(#text)
    for i = 1, #text do
        pkt:WriteByte(string.byte(text, i))
    end
end

local function SendRankingToPlayer(aIndex, monster, state, ranking, total)
    local myDamage = 0
    local myRank = 0
    local entry = state.participants[aIndex]
    if entry ~= nil then
        myDamage = entry.damage
    end
    for i = 1, #ranking do
        if ranking[i].index == aIndex then
            myRank = i
            break
        end
    end

    local pkt = Packet()
    pkt:WriteByte(PACKET_SUB_RANKING)
    pkt:WriteWord(monster.Index)
    pkt:WriteWord(monster.Class)
    pkt:WriteDword(math.floor(monster.Life or 0))
    pkt:WriteDword(math.floor(monster.MaxLife or 0))
    pkt:WriteDword(math.floor(total))
    pkt:WriteDword(math.floor(myDamage))
    pkt:WriteByte(myRank)
    pkt:WriteByte(#ranking)
    WriteLenString(pkt, state.name, 32)

    for i = 1, #ranking do
        local row = ranking[i]
        WriteLenString(pkt, row.name, 10)
        pkt:WriteDword(math.floor(row.damage))
        pkt:WriteWord(row.pct)
    end

    SendPacket(aIndex, PACKET_HEAD, pkt)
end

local function BroadcastRanking(monster, state)
    local ranking, total = BuildRanking(state)
    local userStart = OBJECT_START_USER()
    local userEnd = userStart + MAX_OBJECT_USER() - 1

    for aIndex = userStart, userEnd do
        if gObjIsConnectedGP(aIndex) then
            local player = GetUser(aIndex)
            if player ~= nil and player.Map == monster.Map then
                local dist = gObjCalcDistance(player, monster)
                if dist >= 0 and dist <= UI_RANGE then
                    SendRankingToPlayer(aIndex, monster, state, ranking, total)
                end
            end
        end
    end
end

local function ScanBosses()
    local monsterStart = OBJECT_START_MONSTER()
    local monsterEnd = monsterStart + MAX_OBJECT_MONSTER() - 1
    local seen = {}

    for mIndex = monsterStart, monsterEnd do
        local monster = GetUser(mIndex)
        if monster ~= nil and monster.Live ~= 0 and IsBossClass(monster.Class) then
            seen[mIndex] = true
            local state = EnsureBossState(monster)
            if state ~= nil then
                local life = monster.Life or 0
                local lifeDropped = state.lastLife - life
                if lifeDropped < 0 then
                    lifeDropped = 0
                end

                -- Refresh top dealer from native HitDamage table
                local topIdx = -1
                local okTop, result = pcall(function()
                    return gObjMonsterGetTopHitDamageUser(monster)
                end)
                if okTop and type(result) == "number" then
                    topIdx = result
                end

                if OBJECT_USER_RANGE(topIdx) and gObjIsConnectedGP(topIdx) then
                    local dmg = ProbeHitDamage(monster, topIdx)
                    SyncParticipant(monster, state, topIdx, dmg, lifeDropped > 0)
                end

                local userStart = OBJECT_START_USER()
                local userEnd = userStart + MAX_OBJECT_USER() - 1
                local now = Now()
                local idleMs = (state.idleSeconds or 5) * 1000
                local toClear = {}

                for aIndex = userStart, userEnd do
                    if gObjIsConnectedGP(aIndex) then
                        local player = GetUser(aIndex)
                        if player ~= nil and player.Map == monster.Map and player.Live ~= 0 then
                            local dist = gObjCalcDistance(player, monster)
                            local inRange = dist >= 0 and dist <= state.maxDistance

                            if inRange then
                                local entry = state.participants[aIndex]
                                if lifeDropped > 0 then
                                    -- Approximate: players in fight range while HP drops stay active.
                                    -- Exact per-hit idle needs an OnDamage hook (not in public API).
                                    local dmg = 0
                                    if entry ~= nil or aIndex == topIdx then
                                        dmg = ProbeHitDamage(monster, aIndex)
                                    end
                                    if dmg > 0 or aIndex == topIdx then
                                        SyncParticipant(monster, state, aIndex, dmg, true)
                                    elseif entry ~= nil then
                                        entry.lastActive = now
                                    end
                                elseif entry ~= nil then
                                    local dmg = ProbeHitDamage(monster, aIndex)
                                    if dmg > entry.damage then
                                        SyncParticipant(monster, state, aIndex, dmg, true)
                                    end
                                end
                            elseif state.participants[aIndex] ~= nil then
                                toClear[#toClear + 1] = { index = aIndex, reason = "distance > " .. state.maxDistance }
                            end
                        elseif state.participants[aIndex] ~= nil then
                            toClear[#toClear + 1] = { index = aIndex, reason = "offline/dead" }
                        end
                    elseif state.participants[aIndex] ~= nil then
                        toClear[#toClear + 1] = { index = aIndex, reason = "disconnect" }
                    end
                end

                -- Idle check for participants still tracked
                for aIndex, entry in pairs(state.participants) do
                    if (now - (entry.lastActive or now)) >= idleMs then
                        toClear[#toClear + 1] = { index = aIndex, reason = "idle > " .. state.idleSeconds .. "s" }
                    end
                end

                local cleared = {}
                for i = 1, #toClear do
                    local item = toClear[i]
                    if not cleared[item.index] then
                        cleared[item.index] = true
                        ClearPlayerFromBoss(monster, state, item.index, item.reason)
                    end
                end

                state.lastLife = life
                BroadcastRanking(monster, state)
            end
        end
    end

    for mIndex, _ in pairs(ActiveBosses) do
        if not seen[mIndex] then
            ActiveBosses[mIndex] = nil
        end
    end
end

local function OnReadScript()
    ActiveBosses = {}
    LogAdd(LOG_BLUE, "[BossTopDamage] Loaded (S21). Configured bosses:")
    for class, cfg in pairs(BOSS_CONFIG) do
        LogAdd(LOG_BLUE, string.format("  - %s (Class %d) dist=%d idle=%ds", cfg.name, class, cfg.maxDistance or 5, cfg.idleSeconds or 5))
    end
end

local function OnTimerThread()
    ScanBosses()
end

local function OnUserDie(aIndex, bIndex)
    ClearPlayerFromAllBosses(aIndex, "death")
end

local function OnCharacterClose(aIndex)
    ClearPlayerFromAllBosses(aIndex, "disconnect")
end

local function OnMonsterDie(aIndex, bIndex)
    local monster = GetUser(aIndex)
    if monster == nil or not IsBossClass(monster.Class) then
        return 0
    end

    local state = ActiveBosses[aIndex] or EnsureBossState(monster)
    local cfg = BOSS_CONFIG[monster.Class]
    local bossName = cfg and cfg.name or tostring(monster.Class)

    local topIdx = -1
    local okTop, result = pcall(function()
        return gObjMonsterGetTopHitDamageUser(monster)
    end)
    if okTop and type(result) == "number" then
        topIdx = result
    end

    -- Prefer Lua ranking if native top is empty
    if (not OBJECT_USER_RANGE(topIdx)) or (not gObjIsConnectedGP(topIdx)) then
        if state ~= nil then
            local ranking = BuildRanking(state)
            if #ranking > 0 then
                topIdx = ranking[1].index
            end
        end
    end

    -- Fallback to killer
    if (not OBJECT_USER_RANGE(topIdx)) or (not gObjIsConnectedGP(topIdx)) then
        topIdx = bIndex
    end

    local topUser = GetUser(topIdx)
    if topUser == nil then
        ActiveBosses[aIndex] = nil
        return 0
    end

    -- Final probe for announcement
    local topDamage = 0
    if state ~= nil and state.participants[topIdx] ~= nil then
        topDamage = state.participants[topIdx].damage
    else
        topDamage = ProbeHitDamage(monster, topIdx)
    end

    -- Block default loot for killer; give monster drops to top damager
    gObjMonsterDieGiveItem(monster, topUser)

    GCNoticeSendToAll(0, string.format("%s defeated! Drop goes to %s (Top Damage: %d).", bossName, topUser.Name, math.floor(topDamage)))
    GCNoticeSend(topIdx, 1, string.format("You won %s loot (highest damage).", bossName))
    LogAdd(LOG_GREEN, string.format("[BossTopDamage] %s loot -> %s (dmg=%d) killer=%s", bossName, topUser.Name, math.floor(topDamage), (GetUser(bIndex) and GetUser(bIndex).Name) or "?"))

    -- Clear UI for nearby players
    if state ~= nil then
        for pIndex, _ in pairs(state.participants) do
            if gObjIsConnectedGP(pIndex) then
                local pkt = Packet()
                pkt:WriteByte(PACKET_SUB_CLEAR)
                pkt:WriteWord(aIndex)
                SendPacket(pIndex, PACKET_HEAD, pkt)
            end
        end
    end

    ActiveBosses[aIndex] = nil
    return 1 -- block default loot (killer would receive it)
end

BridgeFunctionAttach("OnReadScript", OnReadScript)
BridgeFunctionAttach("OnTimerThread", OnTimerThread)
BridgeFunctionAttach("OnUserDie", OnUserDie)
BridgeFunctionAttach("OnCharacterClose", OnCharacterClose)
BridgeFunctionAttach("OnMonsterDie", OnMonsterDie)
