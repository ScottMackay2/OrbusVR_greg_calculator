define(["./Mage"], function (Mage) {
return {
	getData: function(){
		var mage = new Mage.Mage({
			talentlvl10:"Selfish Streak",talentlvl15:"Runic Diversity",talentlvl20:"Affinity",
			strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
		});

		// ####################################################################################
		// Mage

		const FIRE_CAST_SPEED = 1/globalLoadout.FIRE_HITS_PER_SECOND;
		const FROST_CAST_SPEED = 1/globalLoadout.FROST_HITS_PER_SECOND;
		const AFFLICTION_CAST_SPEED = 1/globalLoadout.AFFLICTION_HITS_PER_SECOND;
		var mageData = {
			attackTypes : {
				// Default boost of class
				// 'X'    : new Attack(0.00,		0, true,												0, 0, 0,			SELFISH_STREAK_BOOST_MAGE*STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),
				// Fireball
				'b'    : mage.getAttackFromInfo({type:"Fire2",time:FIRE_CAST_SPEED}),
				// Fireball empowered
				'B'    : mage.getAttackFromInfo({type:"Fire2",time:FIRE_CAST_SPEED,empowered:true}),
				// Frost boosted by fireball
				'f'    : mage.getAttackFromInfo({type:"Frost2",time:FROST_CAST_SPEED,empowered:true}),
				// Frost boosted by runic diversity (3th spell)
				'F'    : mage.getAttackFromInfo({type:"Frost2",time:FROST_CAST_SPEED,diversity:true}),
				// Frost boosted by runic diversity and fireball.
				'V'    : mage.getAttackFromInfo({type:"Frost2",time:FROST_CAST_SPEED,empowered:true,diversity:true}),
				// Affliction affinity fireball
				'a'    : mage.getAttackFromInfo({type:"Affliction2",time:AFFLICTION_CAST_SPEED,empowered:true}),
				// Affliction runic diversity and frost boosted
				'A'    : mage.getAttackFromInfo({type:"Affliction2",time:AFFLICTION_CAST_SPEED,diversity:true,dotIncrease:true}),
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