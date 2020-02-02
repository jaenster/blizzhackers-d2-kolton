/**
 * @Author jaenster
 * @description a baalrun in modern javascript
 */

!isIncluded('require.js') && include('require.js'); // load the require.js

global.SpeedBaal = (function (thread) {
	/** @type SpeedBaal
	 *  @param {{Follower,KillBaal}} config
	 */
	function SpeedBaal(config) {
		const sdk = require('../modules/sdk');
		config.Leecher = me.getStatEx(555) < 30 && config.Follower;

		const Baal = {};

		Baal.towning = function () {
			Town.doChores();

			// Go bo outside of town, if we have a cta
			if (Precast.checkCTA()) {
				Pather.useWaypoint('random');
				Precast.doPrecast(true);
				Config.Follower && Pather.useWaypoint(sdk.areas.PandemoniumFortress);
			}
		};

		Baal.toThrone = function () {
			if (config.Follower) {
				// In case we in aren't in act < 4, go to act 4
				me.area < sdk.areas.PandemoniumFortress && Town.goToTown(4); // Go to act 4.

				if (me.area === sdk.areas.PandemoniumFortress) {
					// Go to act 5 via tyreal
					SpeedBaal.tyrealAct5();
				}
				Town.goToTown(5); // To be sure
				Town.moveToSpot('portalspot');

				for (let start = getTickCount(), portal; getTickCount() - start < 60e3 || me.area === sdk.areas.ThroneOfDestruction; delay(10)) {
					portal = Pather.getPortal(sdk.areas.ThroneOfDestruction);
					if (portal && (!config.Leecher || SpeedBaal.data.safe)) {
						Pather.usePortal(null, null, portal); // Take portal
					}
				}
			} else { // Teleport to throne
				Pather.useWaypoint(sdk.areas.WorldstoneLvl3);
				Pather.moveToExit([sdk.areas.WorldstoneLvl3, sdk.aras.ThroneOfDestruction], true);

				// Teleport safely trough the throne
				[[15112, 5206], [15111, 5175], [15112, 5141], [15109, 5107], [15113, 5073], [15083, 5035]]
					.forEach(([x, y]) => Attack.getIntoPosition({x: x, y: y}, 25, 5, false));
			}

			if (me.area !== sdk.areas.ThroneOfDestruction) {
				throw new Error('Failed to go to throne');
			}
		};

		Baal.waves = function () {
			while (SpeedBaal.data.nextWave !== 6) {

				const wave = SpeedBaal.checkThrone();

				SpeedBaal.clear(wave);
				if (!wave) {
					SpeedBaal.preAttack();
					continue;
				}
				SpeedBaal.afterWaveChecks(wave);

			}
		};

		Baal.kill = function () {
			if ([sdk.areas.WorldstoneChamber, sdk.areas.ThroneOfDestruction].indexOf(me.area) === -1) {
				// ToDo; magic to go to throne/WorldstoneChamber
			}
			Config.FieldID && Town.fieldID(); // perfect moment to have an empty inventory
			if (me.area === sdk.areas.ThroneOfDestruction) {
				// Go to WorldstoneChamber
				Pather.moveTo(15089, 5006);
				const baalSitting = !!getUnit(1, 543);

				while (getUnit(1, 543) && delay(3)) ;

				baalSitting && delay(1000); // Only a bit if baal wasnt there in the first place
				me.area !== sdk.areas.WorldstoneChamber && Pather.usePortal(null, null, getUnit(2, 563));
			}

			if (me.area !== sdk.areas.WorldstoneChamber) {
				throw Error('failed to go to the worldstone chamber');
			}

			if (SpeedBaal.builds.isCurseNecro) {
				let unit = getUnit(1, 544);
				if (unit) {
					print('cast lower curse on distance on baal');
					Skill.cast(91, 0, 15166, 5903);
				}
			}
			const fast = [15144, 5892],	slow = [15134, 5923];
			// If we can teleport, move quickly over gap.
			Pather.moveTo.apply(Pather, me.getSkill(sdk.skills.Teleport, 1) ? fast : slow);

			Attack.kill(544); // Baal
			Pickit.pickItems();
			delay(rand(1000, 2000));
		};

		try {
			Object.keys(Baal).some(item => !item.apply(Baal));
		} finally {
			SpeedBaal.data.done = true;
			Delta.destroy();
		}
	}

	SpeedBaal.checkThrone = function () {
		const waveMonsters = [23, 62, 105, 381, 557, 558, 571], waves = [1, 1, 2, 2, 3, 4, 5],
			monster = getUnits(1)
				.filter(monster => Attack.checkMonster(monster) && waveMonsters.indexOf(monster.classid) > -1)
				.first();

		SpeedBaal.data.currentWave = monster ? waves[waveMonsters.indexOf(monster.classid)] : 0;
		if (SpeedBaal.data.currentWave) {
			SpeedBaal.data.nextWave++;
		}
		return SpeedBaal.data.currentWave;
	};

	SpeedBaal.tyrealAct5 = function () {
		Town.goToTown(4);
		// in case we are in act 4.
		Town.move("tyrael");
		if (getUnit(2, sdk.units.RedPortalToAct5)) { // a red portal present?
			Pather.useUnit(2, sdk.units.RedPortalToAct5, sdk.areas.Harrogath);
		} else {
			let tyrael = getUnit(1, "tyrael");

			if (!tyrael || !tyrael.openMenu()) {
				Town.goToTown(5); // Looks like we failed, lets go to act 5 by wp
			} else {
				Misc.useMenu(0x58D2); // Travel to Harrogath
			}
		}
	};

	const DefaultConfig = {
		Follower: false, // take portal instead of teleporting to throne
		KillBaal: true, // Pwn baal
	};
	const Team = require('Team');
	const Messaging = require('../modules/Messaging');
	/** @type Delta */
	const Delta = new (require('../modules/Deltas'));

	const Thread = {
		tick: 0,
		nextWaveNPC: 0,
		up: false,
	};

	if (thread === 'thread') {

		// Update watcher for each item in the Thread
		Object.keys(Thread)
			.forEach(key =>
				Delta.check(
					() => JSON.stringify(Thread[key]),
					() => {
						const msg = {};
						msg[key] = Thread[key];
						Messaging.send({SpeedBaal: {Thread: msg}})
					})
			);


		// Listen for game packet
		addEventListener('gamepacket', bytes =>
			bytes
			&& typeof bytes === 'object'
			&& bytes.hasOwnProperty('length')
			&& bytes.length > 2
			&& bytes[0] === 0xA4 //
			&& (
				(
					Thread.nextWaveNPC = (bytes[2] << 8) + bytes[1]
				) || true
			)
			&& (Thread.tick = getTickCounter()) // set timer
			&& false /* Dont block packet*/
		);

		// Forever loop
		while (me.ingame) delay(10);
	}

	// handle receiving data of the thread
	Messaging.on('SpeedBaal', function (data) {
		if (data.hasOwnProperty('Thread') && typeof data.Thread === 'object') {
			Object.keys(data.Thread).forEach(key => Thread[key] = data.Thread[key]);
		}
	});

	SpeedBaal.data = {
		safe: false,
		done: false,
		currentWave: 0,
		nextWave: 1,
	};

	// React if a team member sends me an update
	Team.on('SpeedBaal', msg => {
		if (msg.hasOwnProperty('data') && msg.data && typeof msg.data === 'object') {
			Object.keys(SpeedBaal.data).forEach(key => SpeedBaal.data[key] = msg.data[key])
		}

		// If someone requests what we have already
		if (msg.hasOwnProperty('request')) {
			msg.reply({SpeedBaal: {data: SpeedBaal.data}})
		}
	});

	// Send on change my data the the other clients
	Object.keys(SpeedBaal.data).forEach(key =>
		Delta.track(
			JSON.stringify(SpeedBaal.data[key]),
			() => {
				const msg = {};
				msg[key] = SpeedBaal.data[key];
				Team.broadcastInGame({SpeedBaal: {data: msg}});
			}
		)
	);

	const Promise = require('Promise');
	new Promise((resolve, reject) => {
		if (Config.PublicMode && me.area === sdk.areas.ThroneOfDestruction && getUnit(sdk.units.BaalSitting) && Pather.getPortal(sdk.areas.Harrogath)) {
			resolve();
		}
		if (SpeedBaal.data.done) {
			reject();
		}
	}).then(Pather.makePortal).catch(() => print('Stop trying to cast a portal for baal'));


	SpeedBaal.clear = function (wave) {
		let i, result,
			gidAttack = [],
			attackCount = 0,
			monsterList = [],
			target = getUnit(1);

		do {
			if (Attack.checkMonster(target) && Attack.skipCheck(target)) {
				// Baal check, Be sure in throne we only clear *in* the chamber of the throne, not outside it
				/*if (me.area !== Areas.ThroneOfDestruction || ((target.y > 5002 && target.y < 5073
					&& target.x > 15072 && target.x < 15118)
					|| (target.y > 5073 && target.y < 5096
						&& target.x > 15088 && target.x < 15103))) {*/
				if (me.area !== Areas.ThroneOfDestruction
					|| (
						target.x > 15070 && target.x < 15120 // Between the x coords
						&& target.y > 5000 && target.y < 5075 // And between the y coords
					)) {
					monsterList.push(copyUnit(target));
				}
			}
		} while (target.getNext());
		if (wave === undefined) {
			wave = 0;
		}

		monsterList.sort((unitA, unitB) => getDistance(me, unitA) - getDistance(me, unitB));

		while (monsterList.length > 0 && attackCount < 300) {
			// Did i die? If so revive and pickup corpse
			if (me.dead) {
				const [cx, cy] = [me.x, me.y];
				delay(200 + (me.ping * 2));
				me.revive();
				delay(200 + (me.ping * 2));
				Pather.usePortal(sdk.areas.ThroneOfDestruction, null);
				Pather.moveTo(cx, cy);
				//ToDo: redo this
				if (!Town.getCorpse()) {
					quit(); // failed to pick up corpse, probably cuz we died again. Fuck this, bye
				}
			}

			// resort
			monsterList.sort((unitA, unitB) => getDistance(me, unitA) - getDistance(me, unitB));
			target = copyUnit(monsterList[0]);

			// Monster still in reach?
			if (target.x !== undefined && // Only if defined
				!(
					target.x > 15070 && target.x < 15120 // Between the x coords‘
					&& target.y > 5000 && target.y < 5075 // And between the y coords
				)) {
				monsterList.shift();
				continue; // Next!
			}

			if (!(
				me.x > 15070 && me.x < 15120 // Between the x coords
				&& me.y > 5000 && me.y < 5075 // And between the y coords
			)) {
				Pather.moveTo(15094, 5038);
			}

			if (target.x !== undefined && Attack.checkMonster(target)) {
				// Dodge or get in position
				if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
					Attack.deploy(target, Config.DodgeRange, 5, 9);
				} else {
					Attack.getIntoPosition(target, Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]), 0x4)
				}

				if (wave === 0) {
					// Only during clearing the throne, not during a wave.
					Misc.townCheck(true);
					Pickit.pickItems();
				}

				me.overhead("attacking " + target.name + " spectype " + target.spectype + " id " + target.classid);

				result = ClassAttack.doAttack(target);
				if (result) {
					// Find or get the last
					const find = gidAttack.find((el) => target.gid === el.gid) || gidAttack[gidAttack.length];
					find.attacks += 1;

					// Flash with melee skills
					if (find.attacks > 0 && find.attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) < 4) {
						Pather.moveTo(me.x + rand(-1, 1) * 5, me.y + rand(-1, 1) * 5);
					}

				} else {
					monsterList.shift();
					Pickit.pickItems();
				}
			} else {
				monsterList.shift();
				Pickit.pickItems();
			}
		}

		ClassAttack.afterAttack();

		Pickit.pickItems();
		return true;
	};

	SpeedBaal.builds = {
		mine: undefined,
		Javazon: 1,
		FireBall: 2,
		Blizzard: 3,
		Lightning: 4,
		SuperNova: 5,
		Avengerdin: 6,
		Hammerdin: 7,
		Trapsin: 8,
		WarCry: 9,
		CurseNecro: 10,
		Hurricane: 11,
		isJavazon: false,
		isFireBall: false,
		isBlizzard: false,
		isLightning: false,
		isSuperNova: false,
		isAvengerdin: false,
		isHammerdin: false,
		isTrapsin: false,
		isWarCry: false,
		isCurseNecro: false,
		isHurricane: false,
	};

	(function () {
		// get attack sequence
		const attackSequences = {
			Javazon: {skills: [sdk.skills.Fury, sdk.skills.ChargedStrike],},
			FireBall: {skills: [sdk.skills.FireBall, sdk.skills.Meteor, sdk.skills.FireMastery, sdk.skills.FireBolt],},
			Blizzard: {skills: [sdk.skills.Blizzard, sdk.skills.IceBlast, sdk.skills.ColdMastery],},
			Lightning: {skills: [sdk.skills.Lightning, sdk.skills.ChainLightning, sdk.skills.LightningMastery, sdk.skills.Nova],},
			SuperNova: {skills: [sdk.skills.FrostNova, sdk.skills.Nova, sdk.skills.StaticField, sdk.skills.FireBall, sdk.skills.FireBolt],},
			Avengerdin: {skills: [sdk.skills.Conviction, sdk.skills.Vengeance],},
			Hammerdin: {skills: [sdk.skills.BlessedHammer, sdk.skills.BlessedAim, sdk.skills.Concentration, sdk.skills.Vigor],},
			CurseNecro: {skills: [sdk.skills.LowerResist, sdk.skills.CorpseExplosion], /* its skill, or the other*/},
			Trapsin: {skills: [sdk.skills.LightningSentry, sdk.skills.DeathSentry, sdk.skills.ShockField],},
			WarCry: {skills: [sdk.skills.WarCry, sdk.skills.BattleCommand, sdk.skills.BattleOrders],},
		};

		// get build of char
		const sum = array => {
			let k, total = 0;
			for (k = 0; k < array.length; k++) {
				total += array[k];
			}
			return total;
		};

		let max = 0, who;
		for (let i in attackSequences) {
			let attacks = attackSequences[i].skills.map(function (skill) {
				skill = me.getSkill(skill, 0) || 0; // get amount of hardpoints
				return skill;
			});
			let score = sum(attacks) / attacks.length * (attacks.length / 3);
			if (score > max) {
				max = score;
				who = i;
			}
		}
		print('my build: ' + who + ' == ' + Builds[who]);
		SpeedBaal.builds.mine = SpeedBaal.builds[who];
		SpeedBaal.builds['is' + who] = true;
	}).call();

	SpeedBaal.preAttack = function () {
		switch (SpeedBaal.builds.mine) {

			case SpeedBaal.builds.SuperNova:
			case SpeedBaal.builds.FireBall:
				if ((Thread.tick > 27e2 || Thread.tick < -1e3)) {
					return false;
				}

				if (Thread.tick > 2000) { // 15093,5025
					return Skill.cast(sdk.skills.Meteor, 0, 15093, 5025);
				}
				if (SpeedBaal.builds.isSuperNova) {
					return Skill.cast(sdk.skills.Nova, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1));
				} else {
					return Skill.cast(sdk.skills.FireBall, 0, 15093, 5025);
				}

			case SpeedBaal.builds.Blizzard:
				if ((Thread.tick > 45e2 || Thread.tick < -1e3)) {
					return false;
				}
				return Skill.cast(sdk.skills.Blizzard, 0, 15091 + rand(-1, 1), 5027 + rand(-1, 1));

			case SpeedBaal.builds.CurseNecro:
				if ((Thread.tick > 15e2 || Thread.tick < -1e3)) {
					return false;
				}
				return Skill.cast(sdk.skills.LowerResist, 0, 15091, 5027);

			case SpeedBaal.builds.Avengerdin:
				Skill.setSkill(sdk.skills.Conviction, 0);
				break;
			case SpeedBaal.builds.Hammerdin: // Paladin
				if ((Thread.tick > 45e2 || Thread.tick < -1e3)) {
					return false;
				}
				Skill.setSkill(sdk.skills.Concentration, 0);
				return Skill.cast(sdk.skills.BlessedHammer, 1);

			case SpeedBaal.builds.Javazon:
				if ((Thread.tick > 15e2 || Thread.tick < -1e3)) {
					return false;
				}
				return Skill.cast(sdk.skills.LightningFury, 0, 15091, 5028);

			case SpeedBaal.builds.WarCry:
				if (Thread.tick > 2e3 || Thread.tick < -1e3) {
					return false;
				}
				Skill.cast(sdk.skills.WarCry, 0); // cast war cry
				Pather.moveTo(15087, 5024);
				Skill.cast(sdk.skills.WarCry, 0); // cast war cry
				Pather.moveTo(15094, 5024);
				return Skill.cast(sdk.skills.WarCry, 0); // cast war cry

			case SpeedBaal.builds.Hurricane: // Druid
				switch (SpeedBaal.data.nextWave) {
					case 3:
						// Twister gives a stun, and that prevents hydra's
						return Skill.cast(sdk.skills.Twister, 0, 15091, 5018);
					default:
						return Skill.cast(sdk.skills.Tornado, 0, 15091, 5018);
				}

			case SpeedBaal.builds.Trapsin: // Assassin
				// Don't do this 1 second before the wave come, so we can cast cloak of shadow directly
				if (Thread.tick > 4e3 || Thread.tick < 1e3) {
					return false;
				}
				return Skill.cast(sdk.skills.ShockField);

			case SpeedBaal.builds.Lightning:
				if (Thread.tick > 2e3 || Thread.tick < -1e3) {
					return false;
				}
				if (SpeedBaal.data.nextWave === 1) {
					return Skill.cast(sdk.skills.Nova, 0, 15094 + rand(-1, 1), 5028 + rand(-1, 1));
				}
				return Skill.cast(sdk.skills.ChainLightning, 0, 15092, 5026); // cast chainlighting for max dmg

		}

	};

	// Relay traps at wave 5, and so on
	SpeedBaal.afterWaveChecks = function () {
		// Don't do this after wave 5
		if (this.nextWave === 6) {
			return true;
		}
		Precast.doPrecast(false); // Make sure everything is still here

		switch (SpeedBaal.builds.mine) {
			case SpeedBaal.builds.Trapsin:
				// Place traps again
				for (let i = 0; i < 4; i += 1) {
					if (i === 2) {
						// Place a death sentry in the middle
						Skill.cast(sdk.skills.DeathSentry, 0, 15090 + (i * 2), 5035);
					} else {
						Skill.cast(sdk.skills.LightningSentry, 0, 15090 + (i * 2), 5035);
					}
				}
				return true;
			// Just a bo barb
			case SpeedBaal.builds.WarCry:
				// Give everyone a bo, to avoid stupid people with cta
				return Precast.doPrecast(true);
			case SpeedBaal.builds.Hammerdin:
				// In case we have ResistFire aura, set this on after wave 3
				if (this.nextWave - 1 === 3 && me.getSkill(sdk.skills.ResistFire, 1)) {
					return Skill.setSkill(sdk.skills.ResistFire, 0);
				}
				return Skill.setSkill(sdk.skills.Cleansing, 0); // saves time
		}
		return false;
	};

	// Tell the team its safe once we got the ThreadTick
	new Promise(resolve => Thread.tick && resolve()).then(_ => SpeedBaal.data.safe = true);

	return SpeedBaal.bind(SpeedBaal, Object.assign({}, DefaultConfig, typeof Config.SpeedBaal === 'object' && Config.SpeedBaal || {}));

}).call(getScript.startAsThread());
