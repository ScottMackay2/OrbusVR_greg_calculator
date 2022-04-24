function Ranger(data){
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
		
		const MULTISHOT_CHANCE = 0.1;

		const GLOBE_BOOST = I2*0.098;

		const BASE_DAMAGE = 189.6;
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
				*IF(T2=="Yes",1.818,1)*strBoost
				+( IF(CHARGED,4.145,0)+IF(K2=="Piercing",2.5*IF(CHARGED,1.1,1),0) )*intBoost+IF(O2=="Multishot",1*MULTISHOT_CHANCE,0)
				)
				*(1+GLOBE_BOOST)+IF(P2=="Overcharge",0.1742*I2,0)*intBoost
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
			dmgBoostAmount = 0.05;
			dmgBoostStayTime = 30;
			dmgBoostMaxActive = 1;
			attackID = 2;
		}

		if(arrow.type == "Poison"){
			hitCount++;
			dotDamage = 241.3*(1+GLOBE_BOOST)*intBoost*(1+dotIncrease);
			dotTimes = 8 + (arrow.charge == "Yes" ? 4 : 0);
			dotMaxActive = 10;
			attackID = 1;
			tiles = "A";
		}
		else if(arrow.type == "Piercing"){
			tiles = "F";
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
			dotDamage = 172.35*(1+GLOBE_BOOST)*intBoost;
			if(ARROW_CHARGED){
				dotDamage*=1.85;
			}
			dotTimes = 6; 
			dotMaxActive = 10;
			tiles = "P";
			dotTiles = "P";
			spawnsNormalAttack = true;
		}

		return new Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, null, null, prePreModifierFunc)
	};
};

// console.log("UP:"+ranger.getAttackFromInfo({}));

var ClassRanger = {
	getData: function() {
		var ranger = new Ranger({
			talentlvl5:"Precision",talentlvl15:"Arrow Sight",talentlvl20:"Globe Master",talentlvl30:"Critical Aim",
			strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
		});
		const TIME_08 = 0.817;
		const TIME_09 = 0.92; // People are less good in timing 0.9 arrows exactly, so adding +0.02 for the perfect human.
		var rangerData = {
			attackTypes : {
				// Default boost of class
				// 'X'    : new Attack(0.00,  				0, true,															0, 0, 0, 			STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),

				// ranger.getAttackFromInfo({time:0,arrowBar:0.1,globes:6,charge:"No",weakCircle:"Yes",type:"Normal",super:"No"});

				// The nothing arrow (shot as fast as possible to trigger tilesets and ofset hits for charged strikes)
				// 'o'    : new Attack(0.02,  				1, true,															0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				'o'    : ranger.getAttackFromInfo({time:0.02,arrowBar:0,globes:"MAX"}),

				//@@ Normal arrows @@//
				// Normal 0.8 second arrow (before full globes)
				// 'e'    : new Attack(TIME_08,  			PREC_ARROW_08, true,  									0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				'e'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:0,charge:"No",weakCircle:"No",type:"Normal",super:"No"}),
				// Normal 0.8 second arrow
				's'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"No"}),
				// 's'    : new Attack(TIME_08,  			PREC_ARROW_08*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				
				// Weakspot 0.8 second arrow (1.5x)
				'S'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"Yes",type:"Normal",super:"No"}),
				// 'S'    : new Attack(TIME_08,  			19077*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				
				// 0.9 second arrow
				'z'    : ranger.getAttackFromInfo({time:TIME_09,arrowBar:0.9,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"No"}),
				// 'z'    : new Attack(TIME_09,  			PREC_ARROW_09*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				
				// 0.9 second arrow on weakspot (1.5x)
				'Z'    : ranger.getAttackFromInfo({time:TIME_09,arrowBar:0.9,globes:"MAX",charge:"No",weakCircle:"Yes",type:"Normal",super:"No"}),
				// 'Z'    : new Attack(TIME_09,  			20884*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),

				//@@ (Time bended normal arrows with curves) @@//
				// 0.9 second arrow affected by the previous curved charged shot. (this arrow is not curved itself)
				'b'    : ranger.getAttackFromInfo({time:TIME_09-0.1,arrowBar:0.9,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"No"}),
				// 'b'    : new Attack(TIME_09-0.1,		PREC_ARROW_09*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// 0.9 second arrow time increased by a curved shot.
				'c'    : ranger.getAttackFromInfo({time:TIME_09+0.1,arrowBar:0.9,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"No"}),
				// 'c'    : new Attack(TIME_09+0.1,		PREC_ARROW_09*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// Normal 0.8 second arrow (time decreased by prev arrow)
				'd'    : ranger.getAttackFromInfo({time:TIME_08-0.1,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"No"}),
				// 'd'    : new Attack(TIME_08-0.1,  		PREC_ARROW_08*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// Normal 0.8 second arrow (time decreased by prev arrow)(1.5x crit spot)
				'D'    : ranger.getAttackFromInfo({time:TIME_08-0.1,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"Yes",type:"Normal",super:"No"}),
				// 'D'    : new Attack(TIME_08-0.1,		19077*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),

				'f'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:6,charge:"No",weakCircle:"No",type:"Piercing",super:"No"}),
				'r'    : ranger.getAttackFromInfo({time:1.0+TIME_08,arrowBar:0.8,globes:6,charge:"Yes",weakCircle:"No",type:"Normal",super:"No"}),
				'k'    : ranger.getAttackFromInfo({time:1.0+TIME_08,arrowBar:0.8,globes:6,charge:"Yes",weakCircle:"No",type:"Poison",super:"No"}),

				//@@ Charged shots. @@//
				// 0.9 charged piercing on weakspot with 2 globes
				'a'    : ranger.getAttackFromInfo({time:1.1+TIME_09,arrowBar:0.9,globes:2,charge:"Yes",weakCircle:"Yes",type:"Piercing",super:"No"}),
				// 'a'    : new Attack(1.1+TIME_09,  		85699, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),
				// 0.9 charged piercing on weakspot
				'A'    : ranger.getAttackFromInfo({time:1.1+TIME_09,arrowBar:0.9,globes:"MAX",charge:"Yes",weakCircle:"Yes",type:"Piercing",super:"No"}),
				// 'A'    : new Attack(1.1+TIME_09,  		PREC_CHARG_PIERCING_ARROW_09, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),
				// 0.8 charged piercing
				'T'    : ranger.getAttackFromInfo({time:1+TIME_08,arrowBar:0.8,globes:"MAX",charge:"Yes",weakCircle:"No",type:"Piercing",super:"No"}),
				// 'T'    : new Attack(1+TIME_08,  		64020, true,  				0, 0, 0, 			0.05, 30, 1, 	1, 1,"F",""),
				// 0.8 charged piercing on weakspot with 2 globes
				'v'    : ranger.getAttackFromInfo({time:1+TIME_08,arrowBar:0.8,globes:2,charge:"Yes",weakCircle:"Yes",type:"Piercing",super:"No"}),
				// 'v'    : new Attack(1+TIME_08,  		83110, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),
				// 0.8 charged piercing on weakspot
				'V'    : ranger.getAttackFromInfo({time:1+TIME_08,arrowBar:0.8,globes:"MAX",charge:"Yes",weakCircle:"Yes",type:"Piercing",super:"No"}),
				// 'V'    : new Attack(1+TIME_08,  		PREC_CHARG_PIERCING_ARROW_08, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),

				//@@ Poison stuff @@//
				// Poison arrow shot at 0.8 seconds
				'u'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"No",type:"Poison",super:"No"}),
				// 'u'    : new Attack(TIME_08,  			PREC_ARROW_08*RANGER_6_GLOBES, true,  					4380*RANGER_6_GLOBES, 			8, 10, 			0.00, 0, 0, 	2, 2,"A",""),
				// Poison arrow shot at 0.8 seconds but used as 0 timeframe shot that stays the whole fight (This was used to proof the dps decrease amount on not shot on cooldown directly)
				// 'U'    : new Attack(0.00,  				PREC_ARROW_08*RANGER_6_GLOBES, true,  					4380*8/12.5*RANGER_6_GLOBES, 	999, 10, 		0.00, 0, 0, 	0, 0,"",""),

				//@@ Super arrows. @@//
				// Super 0.8 arrow
				'w'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"Yes"}),
				// 'w'    : new Attack(TIME_08,  			24111*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// Super 0.8 arrow on weakspot 1.5x
				'W'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"Yes",type:"Normal",super:"Yes"}),
				// 'W'    : new Attack(TIME_08,  			34686*RANGER_6_GLOBES, true,  		0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// Super charged piercing weakspot hit
				'Y'    : ranger.getAttackFromInfo({time:1+TIME_08,arrowBar:0.8,globes:"MAX",charge:"Yes",weakCircle:"Yes",type:"Piercing",super:"Yes"}),
				// 'Y'    : new Attack(1+TIME_08,  		140050, true,  			0, 0, 0, 			0.00, 0, 0, 	2, 0,"F",""),		

				// Super charged piercing weakspot hit with a curve.
				'G'    : ranger.getAttackFromInfo({time:1.1+TIME_09,arrowBar:0.9,globes:"MAX",charge:"Yes",weakCircle:"Yes",type:"Piercing",super:"Yes"}),
				// 'G'    : new Attack(1.1+TIME_09,  		146298, true,  			0, 0, 0, 			0.00, 0, 0, 	2, 0,"F",""),
				// 0.9 second arrow affected by the previous curved charged shot.
				'h'    : ranger.getAttackFromInfo({time:TIME_09-0.1,arrowBar:0.9,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"Yes"}),
				// 'h'    : new Attack(TIME_09-0.1,		26394*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// 0.9 second arrow time increased by a curved shot.
				'i'    : ranger.getAttackFromInfo({time:TIME_09+0.1,arrowBar:0.9,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"Yes"}),
				// 'i'    : new Attack(TIME_09+0.1,		26394*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
				// Normal 0.8 second arrow (time decreased by prev arrow)
				'j'    : ranger.getAttackFromInfo({time:TIME_08-0.1,arrowBar:0.8,globes:"MAX",charge:"No",weakCircle:"No",type:"Normal",super:"Yes"}),
				// 'j'    : new Attack(TIME_08-0.1,  		24111*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),

				// Fire rain
				'F'    : ranger.getAttackFromInfo({time:TIME_08,arrowBar:0.8,globes:"MAX",charge:"Yes",weakCircle:"No",type:"Fire Rain",super:"No"}),
				// 'F'    : new Attack(TIME_08,  			46887, true,  5788*RANGER_6_GLOBES, 6, 10, 		0.00, 0, 0, 	2, 2,"P","P", true),
			},
		};
		return rangerData;
	}
};