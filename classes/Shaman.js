define(["./Attack"], function (Attack) {
	return {
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

				const baseMult = 0.92674;

				let usesProjectile = true;
				if(attackData.type === "Place"){
					tiles = "T";
				}
				if(attackData.type === "Frost"){
					usesProjectile = false;
					damage = baseMult*0.372687;
					if(this.dotIncrease !== undefined){
						damage *= (1+this.dotIncrease);
					}
					// 30 = ; 
					// 30+6 = 
					tiles = "F";
				}
				if(attackData.type === "Lava"){
					usesProjectile = false;
					damage = baseMult*2.01258;
					if(this.dotIncrease !== undefined){
						damage *= (1+this.dotIncrease);
					}
					// 30 = 8416; 
					// 30+6 = 11902
					tiles = "P";
				}
				if(attackData.type === "Stun"){
					// Increased Stun 1.4909
					damage = baseMult*0.6595 * (1+0.1725*WEAKNESS_COUNT);
					if(this.talentlvl5 == "Stunning"){
						damage*=2.26;
					}

					// 30 (2 weakness) = 8416; 
					// 30+6 (no weakness) = 8816
					// 30+6 (1 weakness) = 10337
					// 30+6 (2 weakness) = 11858
					tiles = "S";
				}
				if(attackData.type === "Lightning"){
					damage = baseMult*2.23625 * (1+0.5750*WEAKNESS_COUNT);
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
				if(attackData.type === "Fire"){
					damage = baseMult*2.9817 * (1+0.8625*WEAKNESS_COUNT); // 689.346
					// 30 (2 weakness) = 34103; 
					// 30+6 (no weakness) = 17632
					// 30+6 (1 weakness) = 32840
					// 30+6 (2 weakness) = 48047
					tiles = "B";
					if(this.talentlvl10 === "Fire Consumes"){
						dotDamage = baseMult*0.559;
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