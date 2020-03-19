/**
 *	@filename  GameData.js
 *	@author    Nishimura-Katsuo
 *	@desc      part of game data library
 */

(function (module, require) {
	const MONSTER_INDEX_COUNT = 734;
	/**
	 *  MonsterData[classID]
	 *  .Index = Index of this monster
	 *  .Level = Level of this monster in normal (use GameData.monsterLevel to find monster levels)
	 *  .Ranged = if monster is ranged
	 *  .Rarity = weight of this monster in level generation
	 *  .Threat = threat level used by mercs
	 *  .Align = alignment of unit (determines what it will attack)
	 *  .Melee = if monster is melee
	 *  .NPC = if unit is NPC
	 *  .Demon = if monster is demon
	 *  .Flying = if monster is flying
	 *  .Boss = if monster is a boss
	 *  .ActBoss = if monster is act boss
	 *  .Killable = if monster can be killed
	 *  .Convertable = if monster is affected by convert or mind blast
	 *  .NeverCount = if not counted as a minion
	 *  .DeathDamage = explodes on death
	 *  .Regeneration = hp regeneration
	 *  .LocaleString = locale string index for getLocaleString
	 *  .ExperienceModifier = percent of base monster exp this unit rewards when killed
	 *  .Undead = 2 if greater undead, 1 if lesser undead, 0 if neither
	 *  .Drain = drain effectiveness percent
	 *  .Block = block percent
	 *  .Physical = physical resist
	 *  .Magic = magic resist
	 *  .Fire = fire resist
	 *  .Lightning = lightning resist
	 *  .Poison = poison resist
	 *  .Minions = array of minions that can spawn with this unit
	 */

	const MonsterData = Array(MONSTER_INDEX_COUNT);

	for (let i = 0; i < MonsterData.length; i++) {
		let index = i;
		MonsterData[i] = Object.freeze(Object.defineProperties({}, {
			Index: {get: () => index, enumerable: true},
			Level: {get: () => getBaseStat('monstats', index, 'Level'), enumerable: true}, // normal only, nm/hell are determined by area's LevelEx
			Ranged: {get: () => getBaseStat('monstats', index, 'RangedType'), enumerable: true},
			Rarity: {get: () => getBaseStat('monstats', index, 'Rarity'), enumerable: true},
			Threat: {get: () => getBaseStat('monstats', index, 'threat'), enumerable: true},
			Align: {get: () => getBaseStat('monstats', index, 'Align'), enumerable: true},
			Melee: {get: () => getBaseStat('monstats', index, 'isMelee'), enumerable: true},
			NPC: {get: () => getBaseStat('monstats', index, 'npc'), enumerable: true},
			Demon: {get: () => getBaseStat('monstats', index, 'demon'), enumerable: true},
			Flying: {get: () => getBaseStat('monstats', index, 'flying'), enumerable: true},
			Boss: {get: () => getBaseStat('monstats', index, 'boss'), enumerable: true},
			ActBoss: {get: () => getBaseStat('monstats', index, 'primeevil'), enumerable: true},
			Killable: {get: () => getBaseStat('monstats', index, 'killable'), enumerable: true},
			Convertable: {get: () => getBaseStat('monstats', index, 'switchai'), enumerable: true},
			NeverCount: {get: () => getBaseStat('monstats', index, 'neverCount'), enumerable: true},
			DeathDamage: {get: () => getBaseStat('monstats', index, 'deathDmg'), enumerable: true},
			Regeneration: {get: () => getBaseStat('monstats', index, 'DamageRegen'), enumerable: true},
			LocaleString: {get: () => getBaseStat('monstats', index, 'NameStr'), enumerable: true},
			ExperienceModifier: {
				get: () => getBaseStat('monstats', index, ['Exp', 'Exp(N)', 'Exp(H)'][me.diff]),
				enumerable: true
			},
			Undead: {
				get: () => (getBaseStat('monstats', index, 'hUndead') && 2) | (getBaseStat('monstats', index, 'lUndead') && 1),
				enumerable: true
			},
			Drain: {
				get: () => getBaseStat('monstats', index, ["Drain", "Drain(N)", "Drain(H)"][me.diff]),
				enumerable: true
			},
			Block: {
				get: () => getBaseStat('monstats', index, ["ToBlock", "ToBlock(N)", "ToBlock(H)"][me.diff]),
				enumerable: true
			},
			Physical: {
				get: () => getBaseStat('monstats', index, ["ResDm", "ResDm(N)", "ResDm(H)"][me.diff]),
				enumerable: true
			},
			Magic: {
				get: () => getBaseStat('monstats', index, ["ResMa", "ResMa(N)", "ResMa(H)"][me.diff]),
				enumerable: true
			},
			Fire: {
				get: () => getBaseStat('monstats', index, ["ResFi", "ResFi(N)", "ResFi(H)"][me.diff]),
				enumerable: true
			},
			Lightning: {
				get: () => getBaseStat('monstats', index, ["ResLi", "ResLi(N)", "ResLi(H)"][me.diff]),
				enumerable: true
			},
			Cold: {
				get: () => getBaseStat('monstats', index, ["ResCo", "ResCo(N)", "ResCo(H)"][me.diff]),
				enumerable: true
			},
			Poison: {
				get: () => getBaseStat('monstats', index, ["ResPo", "ResPo(N)", "ResPo(H)"][me.diff]),
				enumerable: true
			},
			Minions: {
				get: () => [getBaseStat('monstats', index, 'minion1'), getBaseStat('monstats', index, 'minion2')].filter(mon => mon !== 65535),
				enumerable: true
			},
		}));
	}

	Object.freeze(MonsterData);

	module.exports = MonsterData;
})(module, require);