define(["./Scoundrel"], function (Scoundrel) {
return {
	getData: function() {
		var scoundrel = new Scoundrel.Scoundrel({
			talentlvl5:"Slow Burn",talentlvl10:"Quick Draw",talentlvl15:"On the Line",talentlvl20:"Break Shot",talentlvl30:"True Gambler",
			strBoost:globalStrengthBoost, 
			intBoost:globalIntellectBoost,
			projectileIncrease:globalArmourProjectileDamage,
			critChance: globalArmourCritChance,
			critDamage: globalArmourCritDamage,
		});

		// rank V (71.897% increase) Most scoundrel damage is pre-calculated to have the rank V dps increase.
		var scoundrelData = {
			attackTypes : {
				// Used to reset the cards and crit stacks of the scoundrel.
				'X'    : scoundrel.getAttackFromInfo({reset:true}),
				// 'X'    : new Attack(0.00,  		0, true,	0, 0, 0, 	0, 0, 0, 	0, 3,"","", false, resetScoundrel),

				// Normal bullet with rank V boost
				'B'    : scoundrel.getAttackFromInfo({time:0.22,bulletCount:1,rank:5}),
				// 'B'    : new Attack(0.22,  		5851*RANK_V*NORMAL_BOOST_SCOUNDREL, true, 			0, 0, 0, 		0.00, 0, 0, 	1, 0,"","", false, increaseCritChance, updateCritChance),

				// Charged shot (2 bullet charge) with rank V boost
				'c'    : scoundrel.getAttackFromInfo({bulletCount:2,rank:5}),
				// 'c'    : new Attack(1.21,  		5851*RANK_V*2.14*NORMAL_BOOST_SCOUNDREL, true,  	0, 0, 0, 		0.00, 0, 0, 	1, 0,"","", false, increaseCritChance, useCard),
				// Charged shot (full 3 bullet charge) without a rank as first shot taking no time.
				'f'    : scoundrel.getAttackFromInfo({time:0,bulletCount:"MAX",rank:5}),
				// 'f'    : new Attack(0.00,  		5851*3*NORMAL_BOOST_SCOUNDREL, true,  				0, 0, 0, 		0.08, 10, 1, 	1, 0,"","", false, increaseCritChance, useCard),
				// Charged shot (full 3 bullet charge) with rank V boost
				'C'    : scoundrel.getAttackFromInfo({bulletCount:"MAX",rank:5}),
				// 'C'    : new Attack(1.71,  		5851*RANK_V*3.53*NORMAL_BOOST_SCOUNDREL, true,  	0, 0, 0, 		0.08, 10, 1, 	1, 0,"","", false, increaseCritChance, useCard),
				// Charged shot (delayed 3 bullet charge for tileset testing) with rank V boost
				// 'F'    : scoundrel.getAttackFromInfo({time:2.11,bulletCount:3,rank:5}),
				// 'F'    : new Attack(2.11,  		5851*RANK_V*3.53*NORMAL_BOOST_SCOUNDREL, true,  	0, 0, 0, 		0.08, 10, 1, 	1, 0,"","", false, increaseCritChance, useCard),

				// Normal bullet while having the super activated. With rank V boost
				's'    : scoundrel.getAttackFromInfo({time:0.22,bulletCount:1,rank:5,super:true}),
				// 's'    : new Attack(0.22,  		SUPER_BOOST_SCOUNDREL*5851*RANK_V*NORMAL_BOOST_SCOUNDREL, true, 		0, 0, 0, 		0.00, 0, 0, 	1, 0,"","", false, increaseCritChance, updateCritChance),
				// Charged shot while having the super activated. With rank V boost
				'S'    : scoundrel.getAttackFromInfo({bulletCount:"MAX",rank:5,super:true}),
				// 'S'    : new Attack(1.71,  		SUPER_BOOST_SCOUNDREL*5851*RANK_V*3.53*NORMAL_BOOST_SCOUNDREL, true, 	0, 0, 0, 	0.08, 10, 1, 	1, 0,"","", false, increaseCritChance, useCard),

				// (D)eck (action that spawns a new card and do something with it. Then it will be used on the charged shot)
				'D'    : scoundrel.getAttackFromInfo({tryGrabCard:true}),
				// 'D'    : new Attack(SCOUNDREL_CARD_TIME,  		0, true,  							0.00, 0, 0, 	0.00, 0, 0, 	0, 0,"","", false, handleNewSpawnedCard), // Nothing card
			},
			critTalentList : []
		};
		return scoundrelData;

	}
};
});