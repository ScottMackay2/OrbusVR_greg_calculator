define(["./Attack"], function (Attack) {
const Data = {
	FROST2_DAMAGE: 2.155648,
	FIRE2_DAMAGE: 3.449949,
	AFFLICTION2_DAMAGE: 0.807114,
	AFFLICTION2_DOT_DAMAGE: 0.784328,
	SUPER_DAMAGE: 7.859358, // Completely guessed number
	SELFISH_STREAK_BOOST: 1.08,
	RUNIC_DIVERSITY_MAGE: 1.2727,
	AFFINITY_FIRE_BOOST_MAGE: 1.136,

	TILES : {
		FROST : "F",
		FIRE : "B",
		AFFLICTION : "A",

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
	Mage: function(data){
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

			if(spell.type == "Frost2"){
				damage = Data.FROST2_DAMAGE;//9460;
				tiles = Data.TILES.FROST;
			}
			if(spell.type == "Fire2"){
				damage = Data.FIRE2_DAMAGE;//15140;
				tiles = Data.TILES.FIRE;
			}
			if(spell.type == "Affliction2"){
				damage = Data.AFFLICTION2_DAMAGE;//3542;
				dotDamage = Data.AFFLICTION2_DOT_DAMAGE;//3442;
				dotTimes = 12;
				dotMaxActive = 3;
				dmgBoostAmount = 1.05; 
				dmgBoostStayTime = 8; 
				dmgBoostMaxActive = 2;
				tiles = Data.TILES.AFFLICTION;
				attackID = 1;
			}
			if(spell.type == "Super"){
				damage = Data.SUPER_DAMAGE;//15140;
			}
			if(spell.talentlvl10 == "Selfish Streak"){
				damage*=Data.SELFISH_STREAK_BOOST;
				dotDamage*=Data.SELFISH_STREAK_BOOST;
			}
			damage*=this.intBoost;
			dotDamage*=this.intBoost;
			damage*=(1+this.projectileIncrease);
			
			if(this.talentlvl15 == "Runic Diversity"){
				if(spell.diversity == true){
					damage*=Data.RUNIC_DIVERSITY_MAGE;
				}
			}

			if(this.talentlvl20 == "Affinity"){
				if(spell.empowered == true){
					damage*=Data.AFFINITY_FIRE_BOOST_MAGE;
				}
				if(spell.dotIncrease == true){
					dotTimes += 3;
				}
			}

			return new Attack.Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack);
		};
	}
}
});