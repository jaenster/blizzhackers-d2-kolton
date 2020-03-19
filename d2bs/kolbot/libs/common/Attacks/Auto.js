/**
 * @filename Auto.js
 * @author Jaenster
 * @description Simply automatically configure the attacking part of the bot
 */

var ClassAttack = (function () {
	const AutoAttack = {};

	const GameData = require('../../modules/GameData');
	const SkillData = require('../../modules/SkillData');
	const sdk = require('../../modules/sdk');

	const Result = {
		FAIL: 0,
		OK: 1,
		NO_VALID_SKILLS: 2,
		NEXT_TARGET: 3,
	};

	let check;
	const legitDelay = global.hasOwnProperty('_delay') ? global._delay : global.delay;

	AutoAttack.doAttack = function (unit, preattack) {
		// Ask the game data how to attack this specific monster the best way
		const monsterEffort = GameData.monsterEffort(unit, unit.area, undefined, undefined, undefined, true);

		let populatedAttack = monsterEffort.find(x => SkillData.manaCost[x.skill] < me.mp);

		// A simple function to move around and get in position of the unit
		const move = (sk = populatedAttack.skill) => {
			if (unit.distance > SkillData.range[sk] || checkCollision(me, unit, 0x4) || unit.distance > 40) {
				if (!Attack.getIntoPosition(unit, SkillData.range[sk] / 3 * 2, 0x4)) {
					return false;
				}
			}
			return unit.distance <= 40;
		};

		if (!populatedAttack) return Result.NO_VALID_SKILLS; // dont know how to attack unit

		if (!Attack.validSpot(unit.x, unit.y)) {
			return Result.FAIL;
		}
		let corpse, range;

		//ToDo; every x seconds
		getTickCount() - check > 1000 && (check = getTickCount()) && Precast.doPrecast();
		new Line(me.x, me.y, unit.x, unit.y, 0x84, true);
		//@ToDo; Here some specific class stuff.
		switch (true) {
			case me.classid === 1: // sorc
				break;
			case me.classid === 2: // necro
				// recast bonearmor
				!me.getState(sdk.states.BoneArmor) && me.cast(sdk.skills.BoneArmor) && me.cast(sdk.skills.BoneArmor);

				corpse = getUnit(1, -1, 12);
				range = Math.floor((me.getSkill(74, 1) + 7) / 3);

				if (corpse) {
					let exploded = false;
					// calculate the range of your skill and loop trough them
					for (let range = ((me.getSkill(sdk.skills.CorpseExplosion, 1) + 7) / 3); corpse.getNext();) {
						// Check if monster in range
						if (getDistance(unit, corpse) <= range && corpse.checkCorpse) {
							// Check if it can be amp'd. ToDo; fix line of sight
							// Amp does -100% DR, and corpse explosion is 50% psy dmg. https://www.theamazonbasin.com/wiki/index.php?title=Amplify_Damage
							if (me.getSkill(sdk.skills.AmplifyDamage, 1) && !unit.getState(sdk.states.AmplifyDamage) && unit.isCursable) {
								unit.cast(sdk.skills.AmplifyDamage);
							}

							// Explode that corpse
							corpse.cast(sdk.skills.CorpseExplosion);
							exploded = true;
							break; // once is enough, we see next loop if its needed again
						}
					}

					// Give some time back to kolbot system, telling we succeed
					if (exploded) {
						return Result.OK;
					}
				}

				break;
			case me.classid === 3: //Paladin
				// Recast holy shield
				!me.getState(sdk.states.HolyShield) && me.getSkill(sdk.skills.HolyShield, 1) && me.cast(sdk.skills.HolyShield);

				// If the skill we gonna use is a left skill, we can use an aura with it
				if (getBaseStat('skills', populatedAttack.skill, 'leftskill')) {
					//ToDo; write something for this
				}

				// Be a healer, check for party members around us that have a low health
				let party = getParty();
				if (party) for (let unit; party.getNext();) {// If party member in same area, and can find the unit, that isnt dead, cast holy bolt on thje party member
					if (party.hp < 60 && party.area === me.area) {
						let unit = getUnits(1, party.name).filter(x => !x.dead).first();
						unit && unit.cast(sdk.skills.HolyBolt);
					}
				}

				if (populatedAttack.skill === sdk.skills.BlessedHammer) {
					if (!Paladin.getHammerPosition(unit)) return Result.FAIL;
				}
				break;
			case me.classid === 6: // ToDO; make more viable on lower levels / fire assasin
				let baseTrap = me.getSkill(sdk.skills.LightningSentry, 1) && sdk.skills.LightningSentry || me.getSkill(sdk.skills.LightningBolt, 1) && sdk.skills.LightningBolt;
				let traps = [baseTrap, baseTrap, baseTrap, baseTrap, baseTrap]; // We can have 5 traps
				if (me.getSkill(sdk.skills.DeathSentry, 1)) {
					corpse = getUnit(1, -1, 12);
					range = Math.floor(([(9 + me.getSkill(sdk.skills.DeathSentry, 1)) / 2] * 2 / 3 + 7) / 3);

					// Todo; check if its useful to cast a death sentry (no corpses = barely damage)
					if (corpse) for (; corpse.getNext();) {
						if (corpse.distance <= range && corpse.checkCorpse()) {
							traps[0] = sdk.skills.DeathSentry; // Cast a death sentry
							break;
						}
					}
				}

				const map = {
					416: sdk.skills.DeathSentry,
					415: sdk.skills.WakeofInferno,
					412: sdk.skills.LightningSentry,
					411: sdk.skills.ChargedBoltSentry,
					410: sdk.skills.WakeofFire,
				};

				// get a list of _my_ placed traps
				const getPlacedTraps = () => getUnits(sdk.unittype.Monsters) // All monsters (yeah traps are monsters)
					.filter(x => [410, 411, 412, 415, 416].indexOf(x.classid) > -1) // Only those that are traps
					.filter(x => x.mode !== 12); // only alive ones
				//.filter(x=>x.getParent() === me) // only my traps =)
				//.filter(x => checkCollision(x, unit, 0x4)); // Only those that dont collide with the current attacking monster

				if (traps.reduce((acc, trap) => {
					acc = acc && (function () {
						const currentTraps = getPlacedTraps(),
							trapid = parseInt(Object.keys(map).find(classId => map[classId] === trap));

						// See if we have the currently amount of traps, we want
						const have = currentTraps.filter(x => x.classid === trapid).length;
						const want = traps.filter(x => x === trap).length;
						if (have < want) {
							if (!move(trap)) return false;

							// We dont have enough of unit trap
							me.overhead(getSkillById(trap) + ' -- (' + (have + 1) + '/' + want + ')');

							const location = unit.bestSpot(5);
							location && Skill.cast(trap, 0, location.x, location.y);
							return true;
						}
						return false;
					})();
					return acc;
				})) {
					return Result.OK;
				}

				break;
		}

		if (Config.MercWatch && Town.needMerc()) {
			Town.visitTown();
		}

		me.overhead(getSkillById(populatedAttack.skill) + ' @ ' + populatedAttack.effort.toFixed(2));

		move();
		// Paladins have aura's
		if (SkillData.hand[populatedAttack.skill] && me.classid === 3) { // Only for skills set on first hand, we can have an aura with it
			// First ask nishi's frame if it is Eligible for conviction, if so, we put conviction on, if we got it obv
			if (GameData.convictionEligible[populatedAttack.type] && GameData.skillLevel(123)) {
				me.getSkill(0) !== 123 && me.setSkill(123, 0);
			} else {
				let aura = SkillData.aura[populatedAttack.skill];

				// Figure out aura on skill, and set it if we got it
				aura && me.getSkill(aura, 1) && me.setSkill(aura, 0)
			}
		}
		let val = Attack.canAttack(unit) && !unit.dead && Skill.cast(populatedAttack.skill, 0, x);
		legitDelay(3);
		Pickit.pickItems();
		return val ? Result.OK : Result.FAIL;
	};

	AutoAttack.afterAttack = function() {
		// ToDo; do something with it
	};

	// Some prototypes i like to use
	!Unit.prototype.hasOwnProperty('distance') && Object.defineProperty(Unit.prototype, 'distance', {
		get: function () {
			return getDistance(this, me)
		}
	});

	!Unit.prototype.hasOwnProperty('bestSpot') && (Unit.prototype.bestSpot = function (distance) {
		let n, coll = 0x04,
			coords = [],
			fullDistance = distance,
			angle = Math.round(Math.atan2(me.y - this.y, me.x - this.x) * 180 / Math.PI),
			angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];

		for (n = 0; n < 3; n += 1) {
			n > 0 && (distance -= Math.floor(fullDistance / 3 - 1));

			angles.forEach(c => ((cx, cy) => Pather.checkSpot(cx, cy, 0x1, false)
				&& coords.push({
					x: cx,
					y: cy
				}))
				(
					Math.round((Math.cos((angle + c) * Math.PI / 180)) * distance + this.x),
					Math.round((Math.sin((angle + c) * Math.PI / 180)) * distance + this.y)
				)
			);
		}
		coords.sort((a, b) => getDistance(me, a.x, a.y) - getDistance(me, b.x, b.y));

		return coords.find(c => !CollMap.checkColl({x: c.x, y: c.y}, this, coll, 1));
	});

	!Unit.prototype.hasOwnProperty('cast') && (Unit.prototype.cast = function (skillId, hand, x, y, item, forcePacket) {
		// In case its called upon an item we own, redirect it to castChargedSkill
		if (this.type === 4 && Object.keys(sdk.storage).map(x => sdk.storage[x]).indexOf(this.location) !== -1) return this.castChargedSkill(skillId, x, y);

		//return me.cast(skillId, hand || Skills.hand[skillId], this);
		// Some invalid crap
		switch (true) {
			case me.inTown && !SkillData.town[skillId]: // cant cast this in town
			case !item && SkillData.manaCost[skillId] > me.mp: // dont have enough mana for this
			case !item && !me.getSkill(skillId, 1): // Dont have this skill
				return false;
			case skillId === undefined:
				throw new Error("Unit.cast: Must supply a skill ID");
		}

		var i, n, clickType, shift;

		hand === undefined && (hand = SkillData.hand[skillId]);

		x === undefined && (x = me.x);
		y === undefined && (y = me.y);
		if (!me.setSkill(skillId, hand, item)) return false;
		const ensureState = () => {
			if (SkillData.isTimed[skillId]) { // account for lag, state 121 doesn't kick in immediately
				for (i = 0; i < 10; i += 1) {
					if ([4, 9].indexOf(me.mode) > -1) {
						break;
					}

					if (me.getState(121)) {
						break;
					}

					delay(10);
				}
			}
		};
		if (Config.PacketCasting > 1 || forcePacket || (Config.PacketCasting && skillId === sdk.skills.Teleport)) {
			if (this === me) {
				sendPacket(1, (hand === 0) ? 0x0c : 0x05, 2, x, 2, y);
			} else {
				sendPacket(1, (hand === 0) ? 0x11 : 0x0a, 4, this.type, 4, this.gid);
			}
			ensureState();
			delay(GameData.castingDuration(skillId) * 1000);
			return this;
		}

		switch (hand) {
			case 0: // Right hand + No Shift
				clickType = 3;
				shift = 0;

				break;
			case 1: // Left hand + Shift
				clickType = 0;
				shift = 1;

				break;
			case 2: // Left hand + No Shift
				clickType = 0;
				shift = 0;

				break;
			case 3: // Right hand + Shift
				clickType = 3;
				shift = 1;

				break;
		}

		MainLoop:
			for (n = 0; n < 3; n += 1) {
				if (this !== me) {
					clickMap(clickType, shift, this);
				} else {
					clickMap(clickType, shift, x, y);
				}

				delay(20);

				if (this !== me) {
					clickMap(clickType + 2, shift, this);
				} else {
					clickMap(clickType + 2, shift, x, y);
				}

				for (i = 0; i < 8; i += 1) {
					if (me.attacking) {
						break MainLoop;
					}

					delay(20);
				}
			}

		//ToDo; Deal with ias, if it is an melee attack
		delay(GameData.castingDuration(skillId) * 1000);

		ensureState();
		return this;
	});


	// Some paladin specifics
	const Paladin = {};
	Paladin.getHammerPosition = function (unit) {
		let i, x, y, positions, check,
			baseId = getBaseStat("monstats", unit.classid, "baseid"),
			size = getBaseStat("monstats2", baseId, "sizex");

		// in case base stat returns something outrageous
		(typeof size !== "number" || size < 1 || size > 3) && (size = 3);

		switch (unit.type) {
			case 0: // Player
				x = unit.x;
				y = unit.y;
				positions = [[x + 2, y], [x + 2, y + 1]];

				break;
			case 1: // Monster
				x = (unit.mode === 2 || unit.mode === 15) && unit.distance < 10 && getDistance(unit.targetx, unit.targety, me) > 5 && unit.targetx || unit.x;
				y = (unit.mode === 2 || unit.mode === 15) && unit.distance < 10 && getDistance(unit.targetx, unit.targety, me) > 5 && unit.targety || unit.y;
				positions = [[x + 2, y + 1], [x, y + 3], [x + 2, y - 1], [x - 2, y + 2], [x - 5, y]];

				size === 3 && positions.unshift([x + 2, y + 2]);
				break;
		}

		// If one of the valid positions is a position im at already
		if (positions.some(pos => getDistance(me, pos.x, pos.y) < 1)) return true;

		// Either found and moved to a spot, or we failed
		for (i = 0; i < positions.length; i += 1) {
			if (getDistance(me, positions[i][0], positions[i][1]) < 1) {
				return true;
			}
		}

		for (i = 0; i < positions.length; i += 1) {
			check = {
				x: positions[i][0],
				y: positions[i][1]
			};

			if ([check.x, check.y].validSpot && !CollMap.checkColl(unit, check, 0x4, 0)) {
				if (this.reposition(positions[i][0], positions[i][1])) {
					return true;
				}
			}
		}

		return false;
	};

	Paladin.reposition = function (x, y) {
		if (getDistance(me, x, y) > 0) {
			if (Pather.teleport && !me.inTown && me.getStat(sdk.stats.Nonclassskill, sdk.skills.Teleport)) {
				(getDistance(me, x, y) > 40 && Pather.moveTo || Pather.teleportTo).apply(Pather, [x, y, 3])
			} else { // or walk
				Misc.click(0, 0, x, y);
				delay(200);
			}
		}

		return true;
	};

	Object.freeze(AutoAttack);
	return AutoAttack;
})();