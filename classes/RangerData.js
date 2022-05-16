define(["./Ranger"], function (Ranger) {
return {
	getData: function() {
		var ranger = new Ranger.Ranger({
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
});