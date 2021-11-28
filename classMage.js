const SELFISH_STREAK_BOOST_MAGE = 1.08;
const RUNIC_DIVERSITY_MAGE = 1.2727;
const AFFINITY_FIRE_BOOST_MAGE = 1.136;
function Mage(data){
	for (const [key, value] of Object.entries(data)) {
		this[key] = value;
	}
	this.getAttackFromInfo = function(spell){
		const TIME = spell.time;
		let damage = 0;
		let CAN_CRIT = true;
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

		if(spell.type == "Fire2"){
			damage = 834.0254;//15140;
			tiles = "B";
		}
		if(spell.type == "Frost2"){
			damage = 521.1281;//9460;
			tiles = "F";
		}
		if(spell.type == "Affliction2"){
			damage = 195.1200;//3542;
			dotDamage = 189.6113;//3442;
			dotTimes = 12;
			dotMaxActive = 3;
			dmgBoostAmount = 0.05; 
			dmgBoostStayTime = 8; 
			dmgBoostMaxActive = 2;
			tiles = "A";
			attackID = 1;
		}
		if(spell.talentlvl10 == "Selfish Streak"){
			damage*=SELFISH_STREAK_BOOST_MAGE;
			dotDamage*=SELFISH_STREAK_BOOST_MAGE;
		}
		damage*=this.intBoost;
		dotDamage*=this.intBoost;
		damage*=(1+this.projectileIncrease);
		
		if(this.talentlvl15 == "Runic Diversity"){
			if(spell.diversity == true){
				damage*=RUNIC_DIVERSITY_MAGE;
			}
		}

		if(this.talentlvl20 == "Affinity"){
			if(spell.empowered == true){
				damage*=AFFINITY_FIRE_BOOST_MAGE;
			}
			if(spell.dotIncrease == true){
				dotTimes += 3;
			}
		}

		return new Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack);
	};
}

var ClassMage = {
	getData: function(){
		var mage = new Mage({
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
				'H'    : new Attack(3.172,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"","H"),
				// Time spacing (doing nothing)
				'#'    : new Attack(0.1,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"",""),
				// Time spacing (renew)
				'@'    : new Attack(14,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"",""),
			},
		};
		return mageData;
	}
};