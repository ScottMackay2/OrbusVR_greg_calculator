function Attack(time, damage, canCrit, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, modifierFunc, preModifierFunc, prePreModifierFunc){
	this.time = time;
	this.damage = damage;
	this.canCrit = canCrit;
	
	this.dotDamage = dotDamage;
	this.dotTimes = dotTimes;
	this.dotMaxActive = dotMaxActive;
	
	this.dmgBoostAmount = dmgBoostAmount;
	this.dmgBoostStayTime = dmgBoostStayTime;
	this.dmgBoostMaxActive = dmgBoostMaxActive;

	this.attackID = attackID;
	this.dotID = -1;

	this.hitCount = hitCount;

	this.tiles = tiles;
	this.dotTiles = dotTiles;

	this.spawnsNormalAttack = spawnsNormalAttack;

	this.type = 0;

	this.modifierFunc = modifierFunc;
	this.preModifierFunc = preModifierFunc;
	this.prePreModifierFunc = prePreModifierFunc;
}

function getWeaponMultiplier(weaponLvl, weaponPlusLvl){
	return Math.floor(Math.pow(5,(weaponLvl+weaponPlusLvl/2)*0.06+1)*50);
}

define([], function () {
	return{
		getWeaponMultiplier: getWeaponMultiplier,
		classDataMultiplyByWeaponMult: function(classData){
			const WEAPON_RATIO = getWeaponMultiplier(globalWeaponLvl, globalWeaponPlusLvl);
			for (const [key, attack] of Object.entries(classData.attackTypes)){
				attack.damage*=WEAPON_RATIO;
				attack.dotDamage*=WEAPON_RATIO;
			}
			return classData;
		},
		Attack:Attack,
	};
});