define(["./Attack"], function (Attack) {
const Data = {
	FROST2_DAMAGE: 521.1281/241.75,
	FIRE2_DAMAGE: 834.0254/241.75,
	AFFLICTION2_DAMAGE: 195.1200/241.75,
	AFFLICTION2_DOT_DAMAGE: 189.6113/241.75,
	SUPER_DAMAGE: 1900/241.75, // Completely guessed number
	SELFISH_STREAK_BOOST: 1.08,
	RUNIC_DIVERSITY_MAGE: 1.2727,
	AFFINITY_FIRE_BOOST_MAGE: 1.136,
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
				tiles = "F";
			}
			if(spell.type == "Fire2"){
				damage = Data.FIRE2_DAMAGE;//15140;
				tiles = "B";
			}
			if(spell.type == "Affliction2"){
				damage = Data.AFFLICTION2_DAMAGE;//3542;
				dotDamage = Data.AFFLICTION2_DOT_DAMAGE;//3442;
				dotTimes = 12;
				dotMaxActive = 3;
				dmgBoostAmount = 1.05; 
				dmgBoostStayTime = 8; 
				dmgBoostMaxActive = 2;
				tiles = "A";
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