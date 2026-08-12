# Top Boss Damage (MUDevs S21.1-2)

Server + client Lua scripts for a real-time boss damage ranking. The monster drop goes to the highest damager. A player loses their accumulated damage if they die (mob or PvP), move more than 5 tiles away, or stay idle for more than 5 seconds.

## Files

| File | Side | Destination |
|---|---|---|
| `BossTopDamage.lua` | GameServer | `LuaScript/` (or any folder loaded by `ScriptCore.lua`) |
| `BossTopDamage_Client.lua` | Client (Main.dll Lua) | Your S21 client Lua scripts folder |

## Install

1. Copy `BossTopDamage.lua` into the GameServer Lua scripts directory so `ScriptCore` loads it on startup/reload.
2. Copy `BossTopDamage_Client.lua` into the S21 client Lua directory and make sure client Lua is enabled.
3. Edit boss Class IDs in `BOSS_CONFIG` (server file).
4. Restart GameServer (or reload scripts) and restart the client.

## Configure bosses

In `BossTopDamage.lua`:

```lua
local BOSS_CONFIG = {
    [275] = { name = "Kundun", maxDistance = 5, idleSeconds = 5 },
    -- [43]  = { name = "Red Dragon", maxDistance = 5, idleSeconds = 5 },
}
```

| Field | Meaning |
|---|---|
| key (`275`) | Monster Class ID |
| `name` | Label for notices / UI |
| `maxDistance` | Tiles from boss before damage is cleared (default 5) |
| `idleSeconds` | Seconds without fight activity before damage is cleared (default 5) |

## Packet protocol

Server → client via `SendPacket(aIndex, headcode, packet)` (wrapped as `C2 FE` by the GS).

| Constant | Value |
|---|---|
| Headcode | `0xBD` |
| Sub `RANKING` | `0x01` |
| Sub `CLEAR` | `0x02` |

### `0x01 RANKING` payload

1. `BYTE` sub  
2. `WORD` monsterIndex  
3. `WORD` monsterClass  
4. `DWORD` life  
5. `DWORD` maxLife  
6. `DWORD` totalDamage  
7. `DWORD` myDamage  
8. `BYTE` myRank (`0` = unranked)  
9. `BYTE` rowCount  
10. len-string bossName (`BYTE` len + bytes, max 32)  
11. repeated `rowCount` times:  
    - len-string playerName (max 10)  
    - `DWORD` damage  
    - `WORD` percent in basis points (`10000` = 100.00%)

### `0x02 CLEAR` payload

1. `BYTE` sub  
2. `WORD` monsterIndex  

If your client `OnPacketRecv` already strips the `C2 FE` header and passes only the inner payload, leave `PAYLOAD_OFFSET = 0` in the client script. If you receive the full raw packet, raise `PAYLOAD_OFFSET` to the first payload byte.

## Rules

1. **Drop** — On boss death (`OnMonsterDie`), default killer loot is blocked (`return 1`) and `gObjMonsterDieGiveItem` runs for the top HitDamage user.
2. **Death** — `OnUserDie` clears that player from all active boss damage tables.
3. **Distance** — Each `OnTimerThread` (~1s), players farther than `maxDistance` are removed via `gObjMonsterDelHitDamageUser`.
4. **Idle** — Approximated without an `OnDamage` hook: players who stop receiving fight activity (HP drop while in range / HitDamage growth) for `idleSeconds` lose their damage.

## API limit (important)

The public MUDevs Lua docs do **not** expose `OnDamage` / `OnAttack`.  
Damage totals for loot use the GameServer native HitDamage table (`gObjMonsterGetTopHitDamageUser`).  
The 5-second “no hit” rule is best-effort until a per-hit hook exists.

## Quick test

1. Add Kundun (`275`) to `BOSS_CONFIG` (already present).
2. Engage Kundun with two characters.
3. Confirm the client overlay updates about once per second.
4. Die / walk away / stand idle → your damage should clear and a chat notice appears.
5. Kill the boss → notice announces the top damager and that player receives the loot.
