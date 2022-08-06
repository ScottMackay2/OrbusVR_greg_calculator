define(["./Attack"], function (Attack) {
	const Data = {
		BASE_DMG: 0.75992,
		HUNTERS_MARK: 0.05,
		SUPER_TIME_WITH_WIGGLE: 8000,

		TILES : {
			POISON_ARROW : "A",
			PIERCING_ARROW : "F",
			FIRE_RAIN_ARROW : "P",
			FIRE_RAIN_TICK : "P",

			// Charging gives you '2' hits per second
			// Poison gives you '2' hits per second
			// So charged poison gives you '3' hits per second

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
		Data : Data,
		Ranger: function(data){
			for (const [key, value] of Object.entries(data)) {
				this[key] = value;
			}
			this.getAttackFromInfo = function(arrow){
				function IF(condition,return1,return2){
					return condition ? return1 : return2;
				}
				const TIME = arrow.time;
				const CAN_CRIT = true;
				const strBoost = this.strBoost || 1;
				const intBoost = this.intBoost || 1;
				const M2 = this.talentlvl5 || 0;
				const O2 = this.talentlvl15 || 0;
				const P2 = this.talentlvl20 || 0;
				const Q2 = this.talentlvl30 || 0;
				const projectileIncrease = this.projectileIncrease || 0;
				const dotIncrease = this.dotIncrease || 0;

				if(arrow.globes == "MAX"){
					if(this.talentlvl20 == "Globe Master"){
						arrow.globes = 6;
					} else{
						arrow.globes = 5;
					}
				}
				const I2 = arrow.globes || 0;
				const J2 = arrow.charge || 0;
				const CHARGED = J2 == "Yes";
				const K2 = arrow.type || 0;
				const L2 = arrow.weakCircle || 0;
				const N2 = arrow.arrowBar || (this.talentlvl5 == "Precision" ? 0.8 : (this.talentlvl5 == "Rapidity"? 1 : -1));
				const T2 = arrow.super || 0;

				const GLOBE_BOOST = I2*0.098;

				const BASE_DAMAGE = Data.BASE_DMG;
				let damage = 1;
				let prePreModifierFunc = undefined;
				if(TIME > 0.3){
					prePreModifierFunc = function(attack){
						attack.time = attack.time + (Math.random()*0.02)-0.02/2;
					};
					damage = 
						BASE_DAMAGE*
						(
						(
						IF(M2=="Precision",IF(N2>=0.9,3.7,IF(N2>=0.8,3.38,IF(N2>=0.4,1.5,0.75))), IF(M2=="Rapidity",1.35+N2*0.19 ,1))
						*IF(T2=="Yes",1.81818181818,1)*strBoost
						+( IF(CHARGED,4.1453,0)+IF(K2=="Piercing",2.5*IF(CHARGED,1.1,1),0) )*intBoost+IF(O2=="Multishot",1,0)
						)
						*(1+GLOBE_BOOST)+IF(P2=="Overcharge",0.1741*I2,0)*intBoost
						)
						*(1+IF(O2=="Arrow Sight",0.1,0) + IF(L2=="Yes",(0.2+IF(Q2=="Critical Aim",0.3,IF(Q2=="Needler",0.15,0)))*IF(CHARGED,1.65,1),0) + projectileIncrease);
				}

				let tiles = "";
				let dotTiles = "";
				let attackID = 0;
				let hitCount = 1;
				let dotDamage = 0;
				let dotTimes = 0;
				let dotMaxActive = 0;
				let spawnsNormalAttack = false;
				let dmgBoostAmount = 0.00;
				let dmgBoostStayTime = 0;
				let dmgBoostMaxActive = 0;

				const ARROW_CHARGED = arrow.charge == "Yes";
				if(ARROW_CHARGED){
					hitCount++;
					dmgBoostAmount = 1+Data.HUNTERS_MARK;
					dmgBoostStayTime = 30;
					dmgBoostMaxActive = 1;
					attackID = 2;
				}

				if(arrow.type == "Poison"){
					hitCount++;
					dotDamage = 0.96714910*(1+GLOBE_BOOST)*intBoost*(1+dotIncrease);
					dotTimes = 8 + (arrow.charge == "Yes" ? 4 : 0);
					dotMaxActive = 10;
					attackID = 1;
					tiles = Data.TILES.POISON_ARROW;
				}
				else if(arrow.type == "Piercing"){
					tiles = Data.TILES.PIERCING_ARROW;
				}
				else if(arrow.type == "Spread"){
					hitCount+=5;
					let addedDmg = BASE_DAMAGE*5*(1+GLOBE_BOOST)*strBoost*(1+projectileIncrease);
					if(ARROW_CHARGED){
						addedDmg*=1.20;
					}
					damage+=addedDmg;
				}
				else if(arrow.type == "Fire Rain"){
					hitCount++;
					dotDamage = 0.69079216*(1+GLOBE_BOOST)*intBoost;
					if(ARROW_CHARGED){
						dotDamage*=1.85;
					}
					dotTimes = 6; 
					dotMaxActive = 10;
					tiles = Data.TILES.FIRE_RAIN_ARROW;
					dotTiles = Data.TILES.FIRE_RAIN_TICK;
					spawnsNormalAttack = true;
				}

				return new Attack.Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, null, null, prePreModifierFunc)
			};
		}
	};
});