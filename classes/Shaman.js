define(["./Attack"], function (Attack) {
	const Data = {
		BASE_DMG: 0.92674,

		TILES : {
			PLACE_TOTEM : "T",
			FROST_TOTEM_PULSE : "F",
			LAVA_TOTEM_PULSE : "P",
			STUN_ORB : "S",
			LIGHTNING_ORB : "X",
			FIRE_ORB : "B",

			// 0 = start of combat
			// 2 = 2 hits per second
			// 3 = 3 hits per second
			// 4 = 4 hits per second
			// 5 = 5 hits per second
			// 6 = 1-1.999 second delay
			// 7 = 2-2.999 second delay
			// 8 = 3-3.999 second delay
			// 9 = 4-5.999 second delay
		},
	};
	return {
		Data: Data,
		Shaman: function(data){
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
				if(attackData.type === "Place"){
					tiles = Data.TILES.PLACE_TOTEM;
				}
				if(attackData.type === "Frost"){
					usesProjectile = false;
					damage = Data.BASE_DMG*0.372712;
					if(this.dotIncrease !== undefined){
						damage *= (1+this.dotIncrease);
					}
					// 30 = ; 
					// 30+6 = 
					tiles = Data.TILES.FROST_TOTEM_PULSE;
				}
				if(attackData.type === "Lava"){
					usesProjectile = false;
					damage = Data.BASE_DMG*2.01265;
					if(this.dotIncrease !== undefined){
						damage *= (1+this.dotIncrease);
					}
					// 30 = 8416; 
					// 30+6 = 11902
					tiles = Data.TILES.LAVA_TOTEM_PULSE;
				}
				if(attackData.type === "Stun"){
					damage = Data.BASE_DMG*0.3727158;
					const addedWeaknessDamage = damage*(0.69*WEAKNESS_COUNT);
					if(this.talentlvl5 == "Stunning"){
						damage += damage*3;
					}
					damage += addedWeaknessDamage;

					// 30 (2 weakness) = 8416; 
					// 30+6 (no weakness) = 8816
					// 30+6 (1 weakness) = 10337
					// 30+6 (2 weakness) = 11858
					tiles = Data.TILES.STUN_ORB;
				}
				if(attackData.type === "Lightning"){
					damage = Data.BASE_DMG*2.2362947 * (1+0.5750*WEAKNESS_COUNT);
					// 30 (2 weakness) = 20180; 
					// 30+6 (no weakness) = 13224
					// 30+6 (1 weakness) = 20828
					// 30+6 (2 weakness) = 28432
					tiles = Data.TILES.LIGHTNING_ORB;
					if(attackData.autoCrit != true && this.talentlvl20 == "Strikes Twice"){
						modifierFuncs=this.extraFunc.bind({});
					}
					attackID = 2;
				}
				if(attackData.type === "Fire"){
					damage = Data.BASE_DMG*2.9817263 * (1+0.8625*WEAKNESS_COUNT); // 689.346
					// 30 (2 weakness) = 34103; 
					// 30+6 (no weakness) = 17632
					// 30+6 (1 weakness) = 32840
					// 30+6 (2 weakness) = 48047
					tiles = Data.TILES.FIRE_ORB;
					if(this.talentlvl10 === "Fire Consumes"){
						dotDamage = Data.BASE_DMG*0.559075;
						if(this.dotIncrease !== undefined){
							dotDamage *= (1+this.dotIncrease);
						}
						// 30 = 2347;
						// 30+6 = 3306
						dotTimes = 3;
						dotMaxActive = 1;
					}
				}

				if(this.talentlvl20 === "Totamic Call" && attackData.triggerTeleport){
					damage*=1.08;
				}

				if(attackData.autoCrit == true){
					damage*=globalArmourCritDamage;
				}
				damage*=this.intBoost*(1+(usesProjectile ? this.projectileIncrease : 0));
				dotDamage*=this.intBoost;

				return new Attack.Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, modifierFuncs);
			};
		}
	};
});