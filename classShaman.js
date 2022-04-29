function Shaman(data){
	for (const [key, value] of Object.entries(data)) {
		this[key] = value;
	}
	this.getAttackFromInfo = function(attackData){
		const TIME = attackData.time;
		let damage = 0;
		let CAN_CRIT = attackData.autoCrit == true ? false : true;
		let WEAKNESS_COUNT = attackData.weaknessCount || 0;
		let dotDamage = 0;
		let dotTimes = 0;
		let dotMaxActive = 0;
		let dmgBoostAmount = 0.00;
		let dmgBoostStayTime = 0;
		let dmgBoostMaxActive = 0;
		let hitCount = 1;
		let attackID = 0;
		let tiles = "";
		let dotTiles = "";
		let spawnsNormalAttack = false;
		let modifierFuncs = undefined;

		let usesProjectile = true;
		if(attackData.type == "Place"){
			tiles = "T";
		}
		if(attackData.type == "Lava"){
			usesProjectile = false;
			damage = 465.35301;
			if(this.dotIncrease !== undefined){
				damage *= (1+this.dotIncrease);
			}
			// 30 = 8416; 
			// 30+6 = 11902
			tiles = "P";
		}
		if(attackData.type == "Stun"){
			damage = 344.6892824640674 * (1+0.1725*WEAKNESS_COUNT);

			// 30 (2 weakness) = 8416; 
			// 30+6 (no weakness) = 8816
			// 30+6 (1 weakness) = 10337
			// 30+6 (2 weakness) = 11858
			tiles = "S";
		}
		if(attackData.type == "Lightning"){
			damage = 517.0632489711107 * (1+0.5750*WEAKNESS_COUNT);
			// 30 (2 weakness) = 20180; 
			// 30+6 (no weakness) = 13224
			// 30+6 (1 weakness) = 20828
			// 30+6 (2 weakness) = 28432
			tiles = "X";
			if(attackData.autoCrit != true && this.talentlvl20 == "Strikes Twice"){
				modifierFuncs=this.extraFunc.bind({});
			}
			attackID = 2;
		}
		if(attackData.type == "Fire"){
			damage = 689.4176652948144 * (1+0.8625*WEAKNESS_COUNT);
			// 30 (2 weakness) = 34103; 
			// 30+6 (no weakness) = 17632
			// 30+6 (1 weakness) = 32840
			// 30+6 (2 weakness) = 48047
			tiles = "B";
			if(this.talentlvl10 == "Fire Consumes"){
				dotDamage = 129.265812;
				if(this.dotIncrease !== undefined){
					dotDamage *= (1+this.dotIncrease);
				}
				// 30 = 2347;
				// 30+6 = 3306
				dotTimes = 3;
				dotMaxActive = 1;
			}
		}

		if(attackData.autoCrit == true){
			damage*=globalArmourCritDamage;
		}
		damage*=this.intBoost*(1+(usesProjectile ? this.projectileIncrease : 0));
		dotDamage*=this.intBoost;

		return new Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, modifierFuncs);
	};
}

var ClassShaman = {
	getData: function(){
		var shaman = new Shaman({
			talentlvl5:"Stunning",talentlvl10:"Fire Consumes",talentlvl15:"Reach",talentlvl20:"Strikes Twice",talentlvl30:"All In",
			strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
		});

		// ####################################################################################
		// Shaman
		// const PROJECTILE_BOOST_SHAMAN = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
		// const CRIT_AMOUNT_SHAMAN = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
		// const NORMAL_BOOST_SHAMAN = PROJECTILE_BOOST_SHAMAN;

		// The time it takes between shaman throws of every orb type (stun, fire, lightning)
		const SHAMAN_ORB_ATTACK_TIME = 3.40;

		// When you replace a totem on the ground, you cut off time that it needs to
		// respawn a totem. So it takes less time between hits.
		const SHAMAN_REPLACE_ATTACK_TIME = SHAMAN_ORB_ATTACK_TIME-1.3;

		// The lava pulse totem takes this amount of time between attacks. Not controlled by the player how fast an orb is thrown.
		const SHAMAN_PULSE_ATTACK_TIME = 3.15;
		
		// Lighting when instantly respawned will hit the enemy with 0.4 seconds
		// of timeframe inbetween the hits.
		const SHAMAN_RETHROW_LIGHTING_TIME = 0.4;


		function lightningSpawnMoreAttacks(attack, targetPatternData, graphSpecificData, timePassed) {
			if(attack.isCritting) {
				var newAttack = clone(NEW_SPAWNED_LIGHTNING);
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			}
			return 1;
		}
		shaman.extraFunc = lightningSpawnMoreAttacks;
		const NEW_SPAWNED_LIGHTNING = shaman.getAttackFromInfo({type:"Lightning", weaknessCount:2, time:SHAMAN_RETHROW_LIGHTING_TIME});
		// const NEW_SPAWNED_LIGHTNING = new Attack(SHAMAN_RETHROW_LIGHTING_TIME,  	19711*NORMAL_BOOST_SHAMAN, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"X","", false, lightningSpawnMoreAttacks);
		

		var shamanData = {
			attackTypes : {
				// Default boost of class
				// 'X'    : new Attack(0.00,  							0, true,  													0, 0, 0, 		STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),

				// Place totem. (triggers a tile)
				'T'    : shaman.getAttackFromInfo({type:"Place", weaknessCount:2, time:0}),
				// 'T'    : new Attack(0,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"T",""),

				// Lava pulse (very first placement relative to fight start no time passed)
				'p'    : shaman.getAttackFromInfo({type:"Lava", weaknessCount:2, time:SHAMAN_REPLACE_ATTACK_TIME}),
				// 'p'    : new Attack(0.00,  							8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),
				// Lava pulse default timing.
				'P'    : shaman.getAttackFromInfo({type:"Lava", weaknessCount:2, time:SHAMAN_PULSE_ATTACK_TIME}),
				// 'P'    : new Attack(SHAMAN_PULSE_ATTACK_TIME,  		8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),
				// Lava pulse next time replaced (a shorter timeframe between lava pulses because it got replaced)
				'A'    : shaman.getAttackFromInfo({type:"Lava", weaknessCount:2, time:0}),
				// 'A'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),

				// Stun default timing
				's'    : shaman.getAttackFromInfo({type:"Stun", weaknessCount:2, time:SHAMAN_ORB_ATTACK_TIME}),
				// 's'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		8416*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0,		0.00, 0, 0, 	1, 0,"S",""),
				// Stun after replacing totems (auto crit + faster timing)
				'S'    : shaman.getAttackFromInfo({type:"Stun", weaknessCount:2, time:SHAMAN_REPLACE_ATTACK_TIME, autoCrit:true}),
				// 'S'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	8416*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		0, 0, 0, 		0.00, 0, 0, 	1, 0,"S",""),

				// Lightning (with shorter timeframe because spawned relative to previous lightning crit, used as spawn for new lightnings)
				'i'    : NEW_SPAWNED_LIGHTNING,
				// Lightning which can have a chance to spawn a new lightning with default time spacing.
				'L'    : shaman.getAttackFromInfo({type:"Lightning", weaknessCount:2, time:SHAMAN_ORB_ATTACK_TIME}),
				// 'L'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		20180*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"X","", false, lightningSpawnMoreAttacks),
				// First lightning after replacing totems (auto crit + faster timing)
				'I'    : shaman.getAttackFromInfo({type:"Lightning", weaknessCount:2, time:SHAMAN_REPLACE_ATTACK_TIME, autoCrit:true}),
				// 'I'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	20180*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		0, 0, 0, 		0.00, 0, 0, 	1, 0,"X",""),

				// Fire default timing.
				'F'    : shaman.getAttackFromInfo({type:"Fire", weaknessCount:2, time:SHAMAN_ORB_ATTACK_TIME}),
				// 'F'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		34103*NORMAL_BOOST_SHAMAN, true,  							2347, 3, 1, 	0.00, 0, 0, 	1, 2,"B",""),
				// Fire after placing totems again (auto crit + faster timing)
				'V'    : shaman.getAttackFromInfo({type:"Fire", weaknessCount:2, time:SHAMAN_REPLACE_ATTACK_TIME, autoCrit:true}),
				// 'V'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	34103*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		2347, 3, 1, 	0.00, 0, 0, 	1, 2,"B",""),

				// # small timing used to offset the orb throwing between the different totems. @ is a bigger jump in time.
				'#'    : new Attack(0.1,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"",""),
				'@'    : new Attack(0.5,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"",""),
			},
		};

		return shamanData;
	}
};
