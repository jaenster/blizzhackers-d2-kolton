/**
 *	@filename  AreaData.js
 *	@author    Nishimura-Katsuo
 *	@desc      part of game data library
 */

(function (module, require) {
	const AREA_INDEX_COUNT = 137;
	const SUPER = [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 1, 4, 0, 2, 3, 1, 0, 1, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 5, 1, 1, 1, 1, 3];
	const AREA_LOCALE_STRING = [5389, 5055, 5054, 5053, 5052, 5051, 5050, 5049, 5048, 5047, 5046, 5045, 5044, 5043, 5042, 5041, 5040, 5039, 5038, 5037, 5036, 5035, 5034, 5033, 5032, 5031, 5030, 5029, 5028, 5027, 5026, 5025, 5024, 5023, 5022, 5021, 5020, 5019, 5018, 788, 852, 851, 850, 849, 848, 847, 846, 845, 844, 843, 842, 841, 840, 839, 838, 837, 836, 835, 834, 833, 832, 831, 830, 829, 828, 827, 826, 826, 826, 826, 826, 826, 826, 825, 824, 820, 819, 818, 817, 816, 815, 814, 813, 812, 810, 811, 809, 808, 806, 805, 807, 804, 845, 844, 803, 802, 801, 800, 799, 798, 797, 796, 795, 790, 792, 793, 794, 791, 789, 22646, 22647, 22648, 22649, 22650, 22651, 22652, 22653, 22654, 22655, 22656, 22657, 22658, 22659, 22660, 22662, 21865, 21866, 21867, 22663, 22664, 22665, 22667, 22666, 5389, 5389, 5389, 5018];
	const MONSTER_KEYS = [
		['mon1', 'mon2', 'mon3', 'mon4', 'mon5', 'mon6', 'mon7', 'mon8', 'mon9', 'mon10'],
		['nmon1', 'nmon2', 'nmon3', 'nmon4', 'nmon5', 'nmon6', 'nmon7', 'nmon8', 'nmon9', 'nmon10'],
	][me.diff && 1]; // mon is for normal, nmon is for nm/hell, umon is specific to picking champion/uniques in normal

	const MonsterData = require('./MonsterData');
	const LocaleStringName = require('./LocaleStringID').LocaleStringName;

	/**
	 *  AreaData[areaID]
	 *  .Super = number of super uniques present in this area
	 *  .Index = areaID
	 *  .Act = act this area is in [0-4]
	 *  .MonsterDensity = value used to determine monster population density
	 *  .ChampionPacks.Min = minimum number of champion or unique packs that spawn here
	 *  .ChampionPacks.Max = maximum number of champion or unique packs that spawn here
	 *  .Waypoint = number in waypoint menu that leads to this area
	 *  .Level = level of area (use GameData.areaLevel)
	 *  .Size.x = width of area
	 *  .Size.y = depth of area
	 *  .Monsters = array of monsters that can spawn in this area
	 *  .LocaleString = locale string index for getLocaleString
	 */

	var AreaData = new Array(AREA_INDEX_COUNT);

	for (let i = 0; i < AreaData.length; i++) {
		let index = i;
		AreaData[i] = ({
			Super: SUPER[index],
			Index: index,
			Act: getBaseStat('levels', index, 'Act'),
			MonsterDensity: getBaseStat('levels', index, ['MonDen', 'MonDen(N)', 'MonDen(H)'][me.diff]),
			ChampionPacks: ({
				Min: getBaseStat('levels', index, ['MonUMin', 'MonUMin(N)', 'MonUMin(H)'][me.diff]),
				Max: getBaseStat('levels', index, ['MonUMax', 'MonUMax(N)', 'MonUMax(H)'][me.diff])
			}),
			Waypoint: getBaseStat('levels', index, 'Waypoint'),
			Level: getBaseStat('levels', index, ['MonLvl1Ex', 'MonLvl2Ex', 'MonLvl3Ex'][me.diff]),
			Size: (() => {
				if (index === 111) { // frigid highlands doesn't specify size, manual measurement
					return {x: 210, y: 710};
				}

				if (index === 112) { // arreat plateau doesn't specify size, manual measurement
					return {x: 690, y: 230};
				}

				return {
					x: getBaseStat('leveldefs', index, ['SizeX', 'SizeX(N)', 'SizeX(H)'][me.diff]),
					y: getBaseStat('leveldefs', index, ['SizeY', 'SizeY(N)', 'SizeY(H)'][me.diff])
				};
			})(),
			Monsters: (MONSTER_KEYS.map(key => getBaseStat('levels', index, key)).filter(key => key !== 65535)),
			forEachMonster: function (cb) {
				if (typeof cb === 'function') {
					this.Monsters.forEach(monID => {
						cb(MonsterData[monID], MonsterData[monID].Rarity * (MonsterData[monID].GroupCount.Min + MonsterData[monID].GroupCount.Max) / 2);
					});
				}
			},
			forEachMonsterAndMinion: function (cb) {
				if (typeof cb === 'function') {
					this.Monsters.forEach(monID => {
						let rarity = MonsterData[monID].Rarity * (MonsterData[monID].GroupCount.Min + MonsterData[monID].GroupCount.Max) / 2;
						cb(MonsterData[monID], rarity, null);
						MonsterData[monID].Minions.forEach(minionID => {
							let minionrarity = MonsterData[monID].Rarity * (MonsterData[monID].MinionCount.Min + MonsterData[monID].MinionCount.Max) / 2 / MonsterData[monID].Minions.length;
							cb(MonsterData[minionID], minionrarity, MonsterData[monID]);
						});
					});
				}
			},
			LocaleString: getLocaleString(AREA_LOCALE_STRING[index]),
			InternalName: LocaleStringName[AREA_LOCALE_STRING[index]],
		});
	}

	Object.freeze(AreaData);

	module.exports = AreaData;
})(module,require);