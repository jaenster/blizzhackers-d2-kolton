export {};
declare global {

    type PathNode = { x: number, y: number }

    function getUnit(type?: number, name?: string, mode?: number, unitId?: number)
    function getUnit(type?: number, classId?: number, mode?: number, unitId?: number)

    function getPath(area: number, fromX: number, fromY: number, toX: number, toY: number, reductionType: 0 | 1, radius: number): PathNode | false

    function getCollision(area: number, x: number, y: number)

    function getMercHP(): number

    function getCursorType(type: 1 | 3 | 6): boolean

    function getSkillByName(name: string): number

    function getSkillById(id: number): string

    function getLocaleString(id: number)

// Never seen in the wild, not sure about arguments
    function getTextSize(name: string, size: number)

    function getThreadPriority(): number

    function getUIFlag(flag: number): boolean

    function getTradeInfo(mode: 0 | 1 | 2): boolean

    function getWaypoint(id: number): boolean

    class Script {
        getNext(): Script
    }

    function getScript(name?: string): Script | false

    function getScripts(): Script | false

    class Room {
        getNext(): Room | false;
    }

    function getRoom(area: number, x: number, y: number): Room | false
    function getRoom(x: number, y: number): Room | false
    function getRoom(area: number): Room | false
    function getRoom(): Room | false

    class Party {
        getNext(): Party | false;
    }

    function getParty(): Party | false

    class PresetUnit {
        getNext(): PresetUnit | false
    }

    function getPresetUnit(): PresetUnit | false

    function getPresetUnits(): PresetUnit[] | false

    class Area {
        getNext(): Area | false;
    }

    function getArea(): Area | false

    function getBaseStat(table: string, row: number, column: string): number | string
    function getBaseStat(row: number, column: string): number | string

    class Control {

    }

    function getControl(type?: number, x?: number, y?: number, xsize?: number, ysize?: number): Control | false

    function getControls(type?: number, x?: number, y?: number, xsize?: number, ysize?: number): Control[]

    function getPlayerFlag(meGid: number, otherGid: number, type: number): boolean

    function getTickCount(): number

    function getInteractedNPC(): Monster | false

    function getIsTalkingNPC(): boolean

    function getDialogLines(): { handler() }[] | false

    function print(what: string): void

    function stringToEUC(arg): []

    function utf8ToEuc(arg): []

    function delay(ms: number): void

    function load(file: string): boolean

    function isIncluded(file: string): boolean

    function include(file: string): boolean

    function stacktrace(): true

    function rand(from: number, to: number): number

    function copy(what: string): void

    function paste(): string

    function sendCopyData(noIdea: null, handle: number, mode: number, data: string)
    function sendCopyData(noIdea: null, handle: string, mode: number, data: string)

    function sendDDE()

    function keystate()

    type eventName = 'gamepacket' | 'scriptmsg' | 'copydata' | 'keyup' | 'keydown'

    function addEventListener(eventType: 'gamepacket', callback: ((bytes: ArrayBufferLike) => boolean)): void
    function addEventListener(eventType: 'scriptmsg', callback: ((data: string | object | number) => void)): void
    function addEventListener(eventType: 'copydata', callback: ((mode: number, msg: string) => void)): void
    function addEventListener(eventType: 'itemaction', callback: ((gid: number, mode?: number, code?: string, global?: true) => void)): void
    function addEventListener(eventType: 'keyup' | 'keydown', callback: ((key: number) => void)): void
    function addEventListener(eventType: 'chatmsg', callback: ((nick: string, msg: string) => void)): void
    function addEventListener(eventType: eventName, callback: ((...args: any) => void)): void

    function removeEventListener(eventType: 'gamepacket', callback: ((bytes: ArrayBufferLike) => boolean)): void
    function removeEventListener(eventType: 'scriptmsg', callback: ((data: string | object | number) => void)): void
    function removeEventListener(eventType: 'copydata', callback: ((mode: number, msg: string) => void)): void
    function removeEventListener(eventType: 'itemaction', callback: ((gid: number, mode?: number, code?: string, global?: true) => void)): void
    function removeEventListener(eventType: 'keyup' | 'keydown', callback: ((key: number) => void)): void
    function removeEventListener(eventType: 'chatmsg', callback: ((nick: string, msg: string) => void)): void
    function removeEventListener(eventType: eventName, callback: ((...args: any) => void)): void

    function clearEvent()

    function clearAllEvents()

    function js_strict()

    function version(): number

    function scriptBroadcast(what: string | object): void

    function sqlite_version()

    function sqlite_memusage()

    function dopen(path: string): false | { create(what: string) }

    function debugLog(text: string): void

    function showConsole(): void

    function hideConsole(): void

// out of game functions

    function login(name?: string): void

//
// function createCharacter())
// this function is not finished

    function selectCharacter()

    function createGame()

    function joinGame()

    function addProfile()

    function getLocation()

    function loadMpq()

// game functions that don't have anything to do with gathering data

    function submitItem(): void

    function getMouseCoords()

    function copyUnit(unit: Unit): Unit

    function clickMap(type: 0 | 1 | 2 | 3, shift: 0 | 1, x: number, y: number)

    function acceptTrade()

    function tradeOk()

    function beep(id?: number)

    function clickItem(where: 0 | 1 | 2, bodyLocation: number)
    function clickItem(where: 0 | 1 | 2, item: Item)
    function clickItem(where: 0 | 1 | 2, x: number, y: number)
    function clickItem(where: 0 | 1 | 2, x: number, y: number, location: number)

    function getDistance(a: Unit, b: Unit): number
    function getDistance(a: Unit, toX: number, toY: number): number
    function getDistance(fromX: number, fromY: number, b: Unit): number
    function getDistance(fromX: number, fromY: number, toX: number, toY: number): number

    function gold(amount: number, changeType?: 0 | 1 | 2 | 3 | 4): void

    function checkCollision(a: Unit, b: Unit, type: number): boolean

    function playSound(num: number): void

    function quit(): never

    function quitGame(): never

    function say(what: string): void

    function clickParty(player: Party, type: 0 | 1 | 2 | 3 | 4)

    function weaponSwitch(): void

    function transmute(): void

    function useStatPoint(type: number): void

    function useSkillPoint(type: number): void

    function takeScreenshot(): void

    function moveNPC(npc: Monster, x: number, y: number): void

    function getPacket(buffer: DataView): void
    function getPacket(...args: { size: number, data: number }[]): void

    function sendPacket(buffer: DataView): void
    function sendPacket(...args: { size: number, data: number }[]): void

    function getIP(): string

    function sendKey(key: number): void

    function revealLevel(unknown: true): void

// hash functions

    function md5(str: string): string

    function sha1(str: string): string

    function sha256(str: string): string

    function sha384(str: string): string

    function sha512(str: string): string

    function md5_file(str: string): string

    function sha1_file(str: string): string

    function sha256_file(str: string): string

    function sha384_file(str: string): string

    function sha512_file(str: string): string

    // Some additions i made myself
    interface Array<T> {
        first(): T;
    }
}