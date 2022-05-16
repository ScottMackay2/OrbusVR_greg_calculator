define(["./Mage"], function (Mage) {
return {
	getData: function(){
		var mage = new Mage.Mage({
			talentlvl10:"Selfish Streak",talentlvl15:"Runic Diversity",talentlvl20:"Affinity",
			strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
		});

		// ####################################################################################
		// Mage
		// const PROJECTILE_BOOST_MAGE = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
		// const CRIT_AMOUNT_MAGE = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
		// const CRIT_CHANCE_MAGE = BASE_CRIT_CHANCE;
		// const NORMAL_BOOST_MAGE = PROJECTILE_BOOST_MAGE;

		const FIRE_CAST_SPEED = 1/globalLoadout.FIRE_HITS_PER_SECOND;
		const FROST_CAST_SPEED = 1/globalLoadout.FROST_HITS_PER_SECOND;
		const AFFLICTION_CAST_SPEED = 1/globalLoadout.AFFLICTION_HITS_PER_SECOND;
		var mageData = {
			attackTypes : {
				// Default boost of class
				// 'X'    : new Attack(0.00,		0, true,												0, 0, 0,			SELFISH_STREAK_BOOST_MAGE*STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),
				// Fireball
				'b'    : mage.getAttackFromInfo({type:"Fire2",time:FIRE_CAST_SPEED}),
				// 'b'    : new Attack(0.43,		15140*NORMAL_BOOST_MAGE, true,							0, 0, 0,			0.00, 0, 0, 	1, 0,"B",""),
				// Fireball empowered
				'B'    : mage.getAttackFromInfo({type:"Fire2",time:FIRE_CAST_SPEED,empowered:true}),
				// 'B'    : new Attack(0.43,		15140*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	0, 0, 0,			0.00, 0, 0, 	1, 0,"B",""),
				// Frost boosted by fireball
				'f'    : mage.getAttackFromInfo({type:"Frost2",time:FROST_CAST_SPEED,empowered:true}),
				// 'f'    : new Attack(0.43,		9460*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	0, 0, 0,			0.00, 0, 0, 	1, 0,"F",""),
				// Frost boosted by runic diversity (3th spell)
				'F'    : mage.getAttackFromInfo({type:"Frost2",time:FROST_CAST_SPEED,diversity:true}),
				// 'F'    : new Attack(0.43,		9460*RUNIC_DIVERSITY_MAGE*NORMAL_BOOST_MAGE, true,		0, 0, 0,			0.00, 0, 0, 	1, 0,"F",""),
				// Frost boosted by runic diversity and fireball.
				'V'    : mage.getAttackFromInfo({type:"Frost2",time:FROST_CAST_SPEED,empowered:true,diversity:true}),
				// 'V'    : new Attack(0.43,		9460*RUNIC_DIVERSITY_MAGE*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	0, 0, 0,		0.00, 0, 0, 	1, 0,"F",""),

				// Affliction affinity fireball
				// 'a'    : new Attack(0.55,		3542*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	3442, 12, 3,		0.05, 8, 2, 	1, 1,"A",""),
				'a'    : mage.getAttackFromInfo({type:"Affliction2",time:AFFLICTION_CAST_SPEED,empowered:true}),
				// Affliction runic diversity and frost boosted
				'A'    : mage.getAttackFromInfo({type:"Affliction2",time:AFFLICTION_CAST_SPEED,diversity:true,dotIncrease:true}),
				// 'A'    : new Attack(0.55,		3542*RUNIC_DIVERSITY_MAGE*NORMAL_BOOST_MAGE, true,		3442, 15, 3,		0.05, 8, 2, 	1, 1,"A",""),
				// Renew (constant heal tile)
				'h'    : new Attack(0.0,		0, true,	0, 20, 1,	0.00, 0, 0, 	0, 0,"","H"),
				// Bard passive (constant heal tile)
				'H'    : new Attack(3.1725,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"H",""),
				// Time spacing (doing nothing)
				'#'    : new Attack(0.1,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"",""),
				// Time spacing (renew)
				'@'    : new Attack(14,			0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"",""),
			},
		};
		return mageData;
	}
};
});