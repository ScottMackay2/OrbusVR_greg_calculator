var dpsChart;

function getCurrentWeaponMultiplier(){
	return Math.pow(1.0495, globalWeaponLvl*2 + globalWeaponPlusLvl);
}

function initializeAllClassData(){
	// Set the classes in the UI.
	var classOptions = document.getElementById('classData');
	for (i=1; i<= CONST_CLASSES.length; i++) {
		var newOption = new Option(CONST_CLASSES[i-1]);
		classOptions.options.add(newOption);
	}

	updateLoadoutListOfClass();

	var myTimeout;

	// Pre init the chart data.
	if(dpsChart == undefined){
		dpsChart = new Chart(document.getElementById("line_chart"), {
			type: 'line',
			data: undefined,
			options: {
				responsive: true,
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						distribution: 'linear'
					}],
					yAxes: [{
						afterFit: function(scaleInstance) {
							scaleInstance.width = 100; // sets the width to 100px
						}
					}]
				}
			}
		});
		dpsChart.data = {
			labels: labelsAxisX
		};
	}
}

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

function getMageData(){
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
			// Time spacing (doing nothing)
			'#'    : new Attack(0.1,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"",""),
			// Time spacing (renew)
			'@'    : new Attack(14,		0, true,	0, 0, 0,	0.00, 0, 0, 	0, 0,"",""),
		},
	};
	return mageData;
}


function Shaman(data){
	for (const [key, value] of Object.entries(data)) {
		this[key] = value;
	}
	this.getAttackFromInfo = function(attackData){
		const TIME = attackData.time;
		let damage = 0;
		let CAN_CRIT = attackData.autoCrit == true ? false : true;
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
		let modifierFuncs = undefined;

		if(attackData.type == "Place"){
			tiles = "T";
		}
		if(attackData.type == "Lava"){
			damage = 465.3795;//8448;
			tiles = "P";
		}
		if(attackData.type == "Stun"){
			damage = 463.6167;//8416;
			tiles = "S";
		}
		if(attackData.type == "Lightning"){
			damage = 1111.6666;//20180;
			tiles = "X";
			if(attackData.autoCrit != true && this.talentlvl20 == "Strikes Twice"){
				modifierFuncs=this.extraFunc.bind({});
			}
			attackID = 2;
		}
		if(attackData.type == "Fire"){
			damage = 1878.6505;//34103;
			tiles = "B";
			if(this.talentlvl10 == "Fire Consumes"){
				dotDamage = 129.2904;//2347;
				dotTimes = 3;
				dotMaxActive = 1;
			}
		}

		if(attackData.autoCrit == true){
			damage*=globalArmourCritDamage;
		}
		damage*=this.intBoost*(1+this.projectileIncrease);
		dotDamage*=this.intBoost;

		return new Attack(TIME, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, modifierFuncs);
	};
}

function getShamanData(){
	var shaman = new Shaman({
		talentlvl5:"Stunning",talentlvl10:"Fire Consumes",talentlvl15:"Reach",talentlvl20:"Strikes Twice",talentlvl30:"All In",
		strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
	});

	// ####################################################################################
	// Shaman
	// const PROJECTILE_BOOST_SHAMAN = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
	// const CRIT_AMOUNT_SHAMAN = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
	// const NORMAL_BOOST_SHAMAN = PROJECTILE_BOOST_SHAMAN;

	// The time it takes between shaman throws of every orb type (stun, fire, lightning)
	const SHAMAN_ORB_ATTACK_TIME = 3.40;

	// When you replace a totem on the ground, you cut off time that it needs to
	// respawn a totem. So it takes less time between hits.
	const SHAMAN_REPLACE_ATTACK_TIME = SHAMAN_ORB_ATTACK_TIME-1.3;

	// The lava pulse totem takes this amount of time between attacks. Not controlled by the player how fast an orb is thrown.
	const SHAMAN_PULSE_ATTACK_TIME = 3.15;
	
	// Lighting when instantly respawned will hit the enemy with 0.4 seconds
	// of timeframe inbetween the hits.
	const SHAMAN_RETHROW_LIGHTING_TIME = 0.4;


	function lightningSpawnMoreAttacks(attack, targetPatternData, graphSpecificData, timePassed) {
		if(attack.isCritting) {
			var newAttack = clone(NEW_SPAWNED_LIGHTNING);
			targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
		}
		return 1;
	}
	shaman.extraFunc = lightningSpawnMoreAttacks;
	const NEW_SPAWNED_LIGHTNING = shaman.getAttackFromInfo({type:"Lightning", time:SHAMAN_RETHROW_LIGHTING_TIME});
	// const NEW_SPAWNED_LIGHTNING = new Attack(SHAMAN_RETHROW_LIGHTING_TIME,  	19711*NORMAL_BOOST_SHAMAN, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"X","", false, lightningSpawnMoreAttacks);
	

	var shamanData = {
		attackTypes : {
			// Default boost of class
			// 'X'    : new Attack(0.00,  							0, true,  													0, 0, 0, 		STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),

			// Place totem. (triggers a tile)
			'T'    : shaman.getAttackFromInfo({type:"Place", time:0}),
			// 'T'    : new Attack(0,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"T",""),

			// Lava pulse (very first placement relative to fight start no time passed)
			'p'    : shaman.getAttackFromInfo({type:"Lava", time:0}),
			// 'p'    : new Attack(0.00,  							8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),
			// Lava pulse default timing.
			'p'    : shaman.getAttackFromInfo({type:"Lava", time:SHAMAN_PULSE_ATTACK_TIME}),
			// 'P'    : new Attack(SHAMAN_PULSE_ATTACK_TIME,  		8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),
			// Lava pulse next time replaced (a shorter timeframe between lava pulses because it got replaced)
			'A'    : shaman.getAttackFromInfo({type:"Lava", time:SHAMAN_REPLACE_ATTACK_TIME}),
			// 'A'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),

			// Stun default timing
			's'    : shaman.getAttackFromInfo({type:"Stun", time:SHAMAN_ORB_ATTACK_TIME}),
			// 's'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		8416*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0,		0.00, 0, 0, 	1, 0,"S",""),
			// Stun after replacing totems (auto crit + faster timing)
			'S'    : shaman.getAttackFromInfo({type:"Stun", time:SHAMAN_REPLACE_ATTACK_TIME, autoCrit:true}),
			// 'S'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	8416*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		0, 0, 0, 		0.00, 0, 0, 	1, 0,"S",""),

			// Lightning (with shorter timeframe because spawned relative to previous lightning crit, used as spawn for new lightnings)
			'i'    : NEW_SPAWNED_LIGHTNING,
			// Lightning which can have a chance to spawn a new lightning with default time spacing.
			'L'    : shaman.getAttackFromInfo({type:"Lightning", time:SHAMAN_ORB_ATTACK_TIME}),
			// 'L'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		20180*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"X","", false, lightningSpawnMoreAttacks),
			// First lightning after replacing totems (auto crit + faster timing)
			'I'    : shaman.getAttackFromInfo({type:"Lightning", time:SHAMAN_REPLACE_ATTACK_TIME, autoCrit:true}),
			// 'I'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	20180*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		0, 0, 0, 		0.00, 0, 0, 	1, 0,"X",""),

			// Fire default timing.
			'F'    : shaman.getAttackFromInfo({type:"Fire", time:SHAMAN_ORB_ATTACK_TIME}),
			// 'F'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		34103*NORMAL_BOOST_SHAMAN, true,  							2347, 3, 1, 	0.00, 0, 0, 	1, 2,"B",""),
			// Fire after placing totems again (auto crit + faster timing)
			'V'    : shaman.getAttackFromInfo({type:"Fire", time:SHAMAN_REPLACE_ATTACK_TIME, autoCrit:true}),
			// 'V'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	34103*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		2347, 3, 1, 	0.00, 0, 0, 	1, 2,"B",""),

			// # small timing used to offset the orb throwing between the different totems. @ is a bigger jump in time.
			'#'    : new Attack(0.1,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"",""),
			'@'    : new Attack(0.5,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"",""),
		},
	};

	return shamanData;
}

var savedScoundrel;
function Scoundrel(data){
	for (const [key, value] of Object.entries(data)) {
		this[key] = value;
	}

	const RANK_V = (1 + 0.1436*5);
	const SUPER_BOOST_SCOUNDREL = 1.1454;

	const SCOUNDREL_HUMAN_THINKING_TIME = 0.3;
	const SCOUNDREL_CARD_TIME = 3.05+SCOUNDREL_HUMAN_THINKING_TIME;

	const EFFECT_NONE = -1;
	const EFFECT_BOOST = 1;
	const EFFECT_CHEAT = 2;

	const CARD_NONE = -1;
	const CARD_FROST = 1;
	const CARD_POISON = 2;
	const CARD_ASH = 3;
	const CARD_WEAKNESS = 4;
	const CARD_FLAME = 5;
	const CARD_HEAL = 6;
	
	let BASE_CRIT_CHANCE_SCOUNDREL = globalArmourCritChance;

	function shuffleArray(array){
		for(let i = array.length - 1; i > 0; i--){
			const j = Math.floor(Math.random() * i);
			const temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}

	function generateRandomDeck(){
		var newDeck = shuffleArray([CARD_FROST, CARD_POISON, CARD_ASH, CARD_WEAKNESS, CARD_FLAME, CARD_HEAL]);
		if(savedScoundrel.talentlvl10 == "Stack the Deck"){
			newDeck.unshift(CARD_FLAME);
		}
		return newDeck;
	}

	function addToDeckRandom(deck, card){
		var newCardLocation = parseInt(Math.floor(Math.random()*(deck.length+1)));
		deck.splice(newCardLocation, 0, card);
	}

	function resetScoundrel(attack, targetPatternData, graphSpecificData, timePassed) {
		graphSpecificData.deck = generateRandomDeck();
		// Choose to place a poison card at start of fight in the belt, because it is a very
		// common scenario.
		graphSpecificData.storedCard = CARD_POISON;
		graphSpecificData.shootCard = CARD_NONE;
		graphSpecificData.burnEffect = EFFECT_NONE;

		// Reset the crit talent remembering.
		graphSpecificData.classData.critTalentList = [];
		return 1;
	}

	const BURN_CARD_TILE = "F";
	function handleNewSpawnedCard(attack, targetPatternData, graphSpecificData, timePassed) {
		// Grab first card from the deck and remove it from the deck.
		var cardInHand = graphSpecificData.deck.shift();
		attack.tiles = "";

		// Always burn the frost and heal card for more tilesets dps. (worth more than the extra boost of getting an potency card hit)
		if(cardInHand == CARD_FROST || cardInHand == CARD_HEAL){
			graphSpecificData.burnEffect = EFFECT_BOOST;
			attack.tiles = BURN_CARD_TILE;
			if(graphSpecificData.storedCard == CARD_POISON){
				graphSpecificData.shootCard = CARD_POISON;
				graphSpecificData.storedCard = CARD_NONE;
			}
		}
		// Always shoot flame cards because they do more damage.
		else if(cardInHand == CARD_FLAME){
			graphSpecificData.shootCard = cardInHand;
		}
		else if(cardInHand == CARD_POISON){
			// Just shoot the card on already stored poison.
			if(graphSpecificData.burnEffect == EFFECT_CHEAT){
				graphSpecificData.shootCard = cardInHand;
			}
			else if(graphSpecificData.storedCard == CARD_POISON){
				graphSpecificData.shootCard = cardInHand;
			}
			// Shoot the card and also burn the already stored ash or weakness to spawn more poisons.
			else if(graphSpecificData.storedCard == CARD_ASH || graphSpecificData.storedCard == CARD_WEAKNESS){
				graphSpecificData.shootCard = cardInHand;
				graphSpecificData.storedCard = CARD_NONE;
				graphSpecificData.burnEffect = EFFECT_CHEAT;
				attack.tiles = BURN_CARD_TILE;
			}
			// Just store the card for later use
			else{
				graphSpecificData.storedCard = cardInHand;
			}
		}
		else if(cardInHand == CARD_ASH || cardInHand == CARD_WEAKNESS){
			if(graphSpecificData.storedCard == CARD_ASH || graphSpecificData.storedCard == CARD_WEAKNESS){
				graphSpecificData.burnEffect = EFFECT_CHEAT;
				attack.tiles = BURN_CARD_TILE;
				// graphSpecificData.shootCard = cardInHand;
			}
			else if(graphSpecificData.storedCard == CARD_POISON){
				graphSpecificData.shootCard = CARD_POISON;
				graphSpecificData.storedCard = CARD_NONE;
				graphSpecificData.burnEffect = EFFECT_CHEAT;
				attack.tiles = BURN_CARD_TILE;
			}
			else{
				graphSpecificData.storedCard = cardInHand;
			}
		}

		// Make a new deck if there are no cards left in the deck.
		if(graphSpecificData.deck.length == 0){
			graphSpecificData.deck = generateRandomDeck();
		}
		return 1;
	}

	const CRIT_BOOST_EXPIRE_TIME = 18;
	function updateCritChance(attack, targetPatternData, graphSpecificData, timePassed){
		// Remove expired crit talent icons.
		while(true){
			var target = graphSpecificData.classData.critTalentList[0];
			if(target == undefined || timePassed-target < CRIT_BOOST_EXPIRE_TIME){
				break;
			}
			graphSpecificData.classData.critTalentList.shift();
		}
		var increasedChance = 0.1 * graphSpecificData.classData.critTalentList.length;
		graphSpecificData.critChance = BASE_CRIT_CHANCE_SCOUNDREL + increasedChance;
		graphSpecificData.dpsMultiplierFromCritting = 1 + graphSpecificData.critChance*(globalArmourCritDamage-1);
		return 1;
	}

	function increaseCritChance(attack, targetPatternData, graphSpecificData, timePassed){
		if(attack.isCritting){
			if(graphSpecificData.classData.critTalentList.length >= 5){
				graphSpecificData.classData.critTalentList.shift(); // Remove first item in the list.
			}
			graphSpecificData.classData.critTalentList.push(timePassed);
		}
		return 1;
	}

	var SCOUNDREL_NEW_SPAWNED_CARD = new Attack(0,  		0, true,  	0, 0, 0, 	0.00, 0, 0, 	0, 4,"","");
	var SCOUNDREL_NEW_SPAWNED_POISON = new Attack(0,  		0, true,  	getCurrentWeaponMultiplier()*215.447*RANK_V, 10, 10, 	0.00, 0, 0, 	0, 3,"A","");
	function useCard(attack, targetPatternData, graphSpecificData, timePassed) {
		updateCritChance(attack, targetPatternData, graphSpecificData, timePassed);

		var boost = 1;

		// Add damage to the rotation when a card is being used to shoot.
		if(graphSpecificData.shootCard != CARD_NONE){
			if(graphSpecificData.burnEffect == EFFECT_BOOST){
				boost += 0.22725;
			}
			else if(graphSpecificData.burnEffect == EFFECT_CHEAT){
				addToDeckRandom(graphSpecificData.deck, graphSpecificData.shootCard);
			}

			// Add a new poison DoT right after the attack with the poison card.
			if(graphSpecificData.shootCard == CARD_POISON){
				if(graphSpecificData.burnEffect == EFFECT_BOOST){
					SCOUNDREL_NEW_SPAWNED_POISON.dotTimes = 14;
				} else{
					SCOUNDREL_NEW_SPAWNED_POISON.dotTimes = 10;
				}
				var newAttack = clone(SCOUNDREL_NEW_SPAWNED_POISON);
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			}
			// Add the flame damage to the card.
			else if(graphSpecificData.shootCard == CARD_FLAME){
				boost += 0.5; // Increase total damage from flame itself.
				SCOUNDREL_NEW_SPAWNED_CARD.tiles = "B";
				var newAttack = clone(SCOUNDREL_NEW_SPAWNED_CARD);
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			} else if(graphSpecificData.shootCard == CARD_HEAL){
				SCOUNDREL_NEW_SPAWNED_CARD.tiles = "SH";
				var newAttack = clone(SCOUNDREL_NEW_SPAWNED_CARD);
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			}
			graphSpecificData.burnEffect = EFFECT_NONE;
		}
		graphSpecificData.shootCard = CARD_NONE;
		return boost;
	}


	this.getAttackFromInfo = function(attackData){
		let time = attackData.time;
		let damage = 0;
		let CAN_CRIT = attackData.autoCrit == true ? false : true;
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
		let modifierFuncs=undefined;
		let preModifierFuncs=undefined;
		let endRank = attackData.rank || 0;

		if(attackData.bulletCount == "MAX"){
			if(this.talentlvl20 == "One Basket"){
				attackData.bulletCount = 4;
			} else{
				attackData.bulletCount = 3;
			}
		}

		if(attackData.bulletCount > 0){
			damage = 322.3172;//5851;
			damage*=(1+this.projectileIncrease);

			if(attackData.bulletCount == 2){
				damage *= 2.1436;
				if(time == undefined){
					time = 1.21;
				}
			}
			if(attackData.bulletCount == 3){
				damage *= 3.5375;
				if(time == undefined){
					time = 1.71;
				}
				if(this.talentlvl20 == "Break Shot"){
					dmgBoostAmount = 0.08;
					dmgBoostStayTime = 10;
					dmgBoostMaxActive = 1;
				}
			}
			if(attackData.bulletCount == 4){
				damage *= 5.2780;
				if(time == undefined){
					time = 2.21;
				}
			}
			modifierFuncs=increaseCritChance.bind({});
			if(attackData.bulletCount > 0){
				preModifierFuncs=useCard.bind({});
			} else{
				preModifierFuncs=updateCritChance.bind({});
			}
		} else{
			hitCount = 0;
		}
		if(time == undefined){
			time = 0;
		}
		if(attackData.reset === true){
			preModifierFuncs = resetScoundrel.bind({});
			attackID = 3;
		}
		if(attackData.tryGrabCard === true){
			if(time < SCOUNDREL_CARD_TIME){
				time = SCOUNDREL_CARD_TIME;
			}
			preModifierFuncs = handleNewSpawnedCard.bind({});
		}
		const RANK_MULT = (1 + 0.1436*endRank);
		damage *= RANK_MULT;

		if(attackData.super === true){
			damage *= SUPER_BOOST_SCOUNDREL;
		}

		return new Attack(time, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, modifierFuncs, preModifierFuncs);
	};
}

function getScoundrelData() {
	// ####################################################################################
	// Scoundrel
	// const TALENT_ADDED_CRIT_SCOUNDREL = 0.5;
	// const PROJECTILE_BOOST_SCOUNDREL = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
	// const CRIT_AMOUNT_SCOUNDREL = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
	// const CRIT_CHANCE_SCOUNDREL = BASE_CRIT_CHANCE;
	// const NORMAL_BOOST_SCOUNDREL = PROJECTILE_BOOST_SCOUNDREL;
	// The boost should be 1.25x. Sadly having a rank V downgrades it to 1.1454x.

	// The blue effect of frost (empower) happens X amount of times that poison is used.
	// It makes poison tick from 8x to 12x. So half a poison card of more damage. That is
	// why it is devided by two to get who extra poison cards of damage.
	// const AMOUNT_OF_EXTRA_POISON_FROM_EMPOWERED = 0.1968/2;

	// // The program is using 3 out of 8 cards being poison.
	// // Sadly this is the not complete truth. To make sure the calculation
	// // is using the exact right amount of damage increase, the poison card
	// // damage is reduced to mirror using 2.9473 poison cards every 7.9473 cards
	// // instead of 3 every 8.
	// const POISON_DAMAGE_MULTIPLIER_SCOUNDREL = 1.0 / 3.0 * (2.9473 + AMOUNT_OF_EXTRA_POISON_FROM_EMPOWERED);

	// // Because of the poison damage reduction, a full rotation of cards takes less time
	// // then 8 cards too. This means the time of a single card needs to be reduced to
	// // mirror the time it takes to make a full card rotation (7.9473 cards)
	// const CARD_TIME_REDUCTION_SCOUNDREL = 1.0 / 8.0 * 7.9473;

	var scoundrel = new Scoundrel({
		talentlvl5:"Slow Burn",talentlvl10:"Quick Draw",talentlvl15:"On the Line",talentlvl20:"Break Shot",talentlvl30:"True Gambler",
		strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
	});
	savedScoundrel = scoundrel;

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
			'B'    : scoundrel.getAttackFromInfo({time:0.22,bulletCount:1,rank:5,super:true}),
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
				+( IF(J2=="Yes",4.145,0)+IF(K2=="Piercing",2.5*IF(J2=="Yes",1.1,1),0) )*intBoost+IF(O2=="Multishot",1*MULTISHOT_CHANCE,0)
				)
				*(1+GLOBE_BOOST)+IF(P2=="Overcharge",0.1742*I2,0)*intBoost
				)
				*(1+IF(O2=="Arrow Sight",0.1,0) + IF(L2=="Yes",(0.2+IF(Q2=="Critical Aim",0.3,IF(Q2=="Needler",0.15,0)))*IF(J2=="Yes",1.65,1),0) + projectileIncrease);
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
			dotDamage = 241.3*GLOBE_BOOST*intBoost*(1+dotIncrease);
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
			let addedDmg = BASE_DAMAGE*5*GLOBE_BOOST*strBoost*(1+projectileIncrease);
			if(ARROW_CHARGED){
				addedDmg*=1.20;
			}
			damage+=addedDmg;
		}
		else if(arrow.type == "Fire Rain"){
			hitCount++;
			dotDamage = 172.35*GLOBE_BOOST*intBoost;
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

function getRangerData() {
	var ranger = new Ranger({
		talentlvl5:"Precision",talentlvl15:"Arrow Sight",talentlvl20:"Globe Master",talentlvl30:"Critical Aim",
		strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,projectileIncrease:globalArmourProjectileDamage
	});
	// var ranger = new Ranger({
	// 	weaponLvl:30,weaponPlusLvl:WEAPON_PLUS_LVL,
	// 	talentlvl5:"Precision",talentlvl15:"Arrow Sight",talentlvl20:"Globe Master",talentlvl30:"Critical Aim",
	// 	critDamage:4*0.02,critChance:0*0.01,
	// 	pots:false, strBoost:globalStrengthBoost, intBoost:globalIntellectBoost,
	// });
	// ranger.projectileIncrease = globalArmourProjectileDamage;

	// console.log(ranger.getAttackFromInfo({time:0.817,arrowBar:0.8,globes:6,charge:"No",weakCircle:"No",type:"Normal",super:"No"}));
	// ####################################################################################
	// Ranger

	// DPS Constants
	const PREC_ARROW_08 = 13261;
	const PREC_ARROW_09 = 14517;
	const PREC_CHARG_ARROW_08 = 25900;
	const PREC_CHARG_ARROW_09 = 27001;
	const PREC_CHARG_ARROW_6_GLOBES_08 = 41129;

	const PREC_CHARG_PIERCING_ARROW_08 = 110351;
	const PREC_CHARG_PIERCING_ARROW_09 = 113787;

	const PREC_CHARG_ARROW_WEAKSPOT_30_METER_08 = 47267;

	const RANGER_6_GLOBES = PREC_CHARG_ARROW_6_GLOBES_08/PREC_CHARG_ARROW_08; // Not sure these numbers but are correct? Its about 9.8% each globe.
	const RANGER_2_GLOBES = (PREC_CHARG_ARROW_08+((PREC_CHARG_ARROW_6_GLOBES_08-PREC_CHARG_ARROW_08)*2/6))/PREC_CHARG_ARROW_08;
	const TIME_08 = 0.817;
	const TIME_09 = 0.92; // People are less good in timing 0.9 arrows exactly, so adding +0.02 for the perfect human.
	
	// console.log(ranger.getAttackFromInfo(ranger,{time:TIME_08,arrowBar:0.8,globes:0,charge:"No",weakCircle:"No",type:"Normal",super:"No"}));

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
	console.log(rangerData);
	return rangerData;
}

function convertClassData(classData){
	// This is the dps from lvl 0 to lvl X+Y weapon without intellect and strength boost.
	const PLUS_X_PLUS_Y_WEAPON_RATIO = getCurrentWeaponMultiplier(); // About 1.3362x a.k.a. 33.6% dps boost.

	const DAMAGE_MULTIPLIER = PLUS_X_PLUS_Y_WEAPON_RATIO;
	const DOT_MULTIPLIER = PLUS_X_PLUS_Y_WEAPON_RATIO;
	for (const [key, attack] of Object.entries(classData.attackTypes)){
		attack.damage*=DAMAGE_MULTIPLIER;
		attack.dotDamage*=DOT_MULTIPLIER;
	}
	return classData;
}

function loadChartDatasets(orbusClass, name) {
	// TODO: The colors wont work as it currently is color per class
	switch (orbusClass) {
		case MAGE_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#3e95cd",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(getMageData()),
				}
			);
			break;
		case SCOUNDREL_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#9e954d",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(getScoundrelData()),
				}
			);
			break;
		case SHAMAN_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#000000",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(getShamanData()),
				}
			);
			break;
		case RANGER_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#5eD54d",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(getRangerData()),
				}
			);
			break;
	}
}