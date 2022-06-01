var needsDefaultValues = true;

// Default off flags that can toggle if the dps classes are using pots and tilesets.
var globalLoadout;
var globalUsingPotsFlag;
var globalTilesetsEnabledFlag;
var globalAveragingCritsFlag;
var globalWeaponLvl;
var globalWeaponPlusLvl;
var globalWeaponAffixBoosts;
var globalUsingChargedStrikes;
var globalRandomizedStartLocationChargedStrikes;
var globalUsingBleed;
var globalArmourCritChance;
var globalArmourCritDamage;
var globalArmourProjectileDamage;
var globalDpsMultiplierFromCritting;
var globalStrengthBoost;
var globalIntellectBoost;

var debug = true; // ONLY FOR TESTING

if (localStorage[loadoutsKey] !== undefined || debug){
	needsDefaultValues = false;
}

if (needsDefaultValues || debug) {
// Local Storage will store the defaults for every class.
	var res = {};

	/* This dictionary will be in the following format:
    Class --> Predefined from the CONST_CLASSES variable
     - Loadout Name --> will have a default and then be updated
         - Attacks --> Attack String
         - Tiles --> List of up to 5 tilesets.
         - Pots --> Boolean
         - Tilesets --> Boolean
     */

    const MAGE_WEAPON_STATS = [{"lvl":30},{"plusLvl":7},{"strength":168},{"intellect":168},{"ICEHEART":{}},{"BLEED":{}}];
    const MAGE_ARMOUR_STATS = {critChance:2*RING_CRIT_CHANCE,critDamage:0.08+RING_EMPOWERED,projectileDamage:0.04};

	res[MAGE_VALUE] = {
		'Frost fire mage - beginner (viable: fire/frost: 0.7-1.0)': {
			savedAttacks: "b (fbBB)x80",
			savedTilesets: ['FB6', 'F6B', 'BF6', '0BF'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 0.8,
			FROST_HITS_PER_SECOND: 0.8,
			AFFLICTION_HITS_PER_SECOND: 0.00,
			borderColor : "#3e95cd",
		},
		'Frost fire mage - fast (viable: fire/frost: 1.5-2.125)': {
			savedAttacks: "b (fbBBBBBB)x80",
			savedTilesets: ['FB2', 'F2B', 'BF2', '0BF'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 1.5,
			FROST_HITS_PER_SECOND: 1.5,
			AFFLICTION_HITS_PER_SECOND: 0.00,
			borderColor : "#3e95cd",
		},
		'firespam mage - fast (viable: fire: 2.2-2.5)': {
			savedAttacks: "b Bx600",
			savedTilesets: ['32B', '3B2', '2B3'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.5,
			FROST_HITS_PER_SECOND: 0.00,
			AFFLICTION_HITS_PER_SECOND: 0.00,
			borderColor : "#3e95cd",
		},
		'firespam mage - insane (viable: fire: 2.6-2.7)': {
			savedAttacks: "b Bx800",
			savedTilesets: ['2B3', '23B', '3B2', '4B3', '5B4' /*The 4 hits a second procs by Orbus lagg sometimes*/],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.6,
			FROST_HITS_PER_SECOND: 0.00,
			AFFLICTION_HITS_PER_SECOND: 0.00,
			borderColor : "#3e95cd",
		},
		'firespam musky mage - needs musky renew (viable: 1.5 - 4.25 hits per second)': {
			savedAttacks: "b Bx1000\n(h@)x20",
			savedTilesets: ['0BH', '0HB', '2BH', '3BH', '4BH'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 4.25,
			FROST_HITS_PER_SECOND: 0.00,
			AFFLICTION_HITS_PER_SECOND: 0.00,
			borderColor : "#3e95cd",
		},
		// This mage type is used for having a bard around and the cast speed is not
		// 
		'firespam bard mage - needs bard heals (viable: 1.5 - 2.3 hits per second)': {
			savedAttacks: "b Bx1000\nHx100",
			savedTilesets: ['HB2', 'H2B', '2BH', '3B2', '0B2'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.3,
			FROST_HITS_PER_SECOND: 0.00,
			AFFLICTION_HITS_PER_SECOND: 0.00,
			borderColor : "#3e95cd",
		},
		'rotation mage - normal-affliction fast-fire (viable: affliction: 0.51-1.0, fire/frost: 1.25-2.5)': {
			savedAttacks: "b a(F b B B B B B B A) x 100",
			savedTilesets: ['6AFB', '6AF2', 'AFB2', '0B6A', '0B6'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.5,
			FROST_HITS_PER_SECOND: 2.5,
			AFFLICTION_HITS_PER_SECOND: 0.99,
			borderColor : "#3e95cd",
		},
		'rotation mage - normal-affliction insane-fire (viable: affliction: 0.5-1.0, fire/frost: 2.6-3.5)': {
			savedAttacks: "b a(F b B B B B B B B A) x 100",
			savedTilesets: ['6AFB', '6AF2', 'AFB3', '0B6A', '0B6'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 3.5,
			FROST_HITS_PER_SECOND: 3.5,
			AFFLICTION_HITS_PER_SECOND: 0.99,
			borderColor : "#3e95cd",
		},
		'rotation mage - insane-affliction fast-fire (viable: affliction: >1.0, fire/frost: 2.1-2.5)': {
			savedAttacks: "a(F b B B B B B B B A) x 100",
			savedTilesets: ['AFB', 'AF2B', 'AFB2', '3B2', '0AF'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.5,
			FROST_HITS_PER_SECOND: 2.5,
			AFFLICTION_HITS_PER_SECOND: 1.95,
			borderColor : "#3e95cd",
		},
		'rotation mage - insane-affliction insane-fire (viable: affliction: >1.0, fire/frost: 2.6-3.5)': {
			savedAttacks: "a(F b B B B B B B B B A) x 100",
			savedTilesets: ['AFB', 'AF3B', 'AFB3', '3B2', '0AF'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.6,
			FROST_HITS_PER_SECOND: 2.6,
			AFFLICTION_HITS_PER_SECOND: 1.95,
			borderColor : "#3e95cd",
		},
		'heal rotation mage - insane-affliction insane-fire (viable: affliction: >1.0, fire/frost: 2.6-3.5)': {
			savedAttacks: "a(F b B B B B B B B B A) x 100\n(h@)x20",
			savedTilesets: ['3BH', '3HB', '0AF', '2BH', 'AFB'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.9,
			FROST_HITS_PER_SECOND: 2.9,
			AFFLICTION_HITS_PER_SECOND: 1.95,
			borderColor : "#3e95cd",
		},
		'no frost rotation mage - fast-affliction insane-fire (viable: affliction: <1.0, fire: 2.1-2.5)': {
			savedAttacks: "b a(b B B B B B B B a) x 100",
			savedTilesets: ['6AB2', '6A2B', '6AB', '0B6', '0B6A'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.1,
			FROST_HITS_PER_SECOND: 2.1,
			AFFLICTION_HITS_PER_SECOND: 0.95,
			borderColor : "#3e95cd",
		},
		'no frost rotation mage - insane-affliction insane-fire (viable: affliction: >1.0, fire: 2.6-3.5)': {
			savedAttacks: "b a(b B B B B B B B B a) x 100",
			savedTilesets: ['AB2', 'A2B', 'A2B3', 'AB3', '0BA'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: MAGE_WEAPON_STATS,
			armourAffixes: MAGE_ARMOUR_STATS,
			calcCount:300,
			FIRE_HITS_PER_SECOND: 2.5,
			FROST_HITS_PER_SECOND: 2.5,
			AFFLICTION_HITS_PER_SECOND: 1.45,
			borderColor : "#3e95cd",
		},
	};
	res[SHAMAN_VALUE] = {
		'default': {
			savedAttacks: "@T(APPPP@T@@@pPPPPP@@@T@@@pPPPP) (@@T@@@pPPPPP)*100 \n@@T@@@(SssT)*100 \n@@##T@@@(VFFT)*100 \n@@####T@####(IiLLT)*100",
			savedTilesets: ['SBP', 'PSB', 'SBX', '0PSB', '0PS'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: false,
			weaponAffixes: [{"lvl":30},{"plusLvl":7},{"strength":168},{"intellect":168},{"CHARGED_STRIKES":{}},{"BLEED":{}}],
			armourAffixes: {critChance:2*RING_CRIT_CHANCE,critDamage:0.08+RING_EMPOWERED,projectileDamage:0.04},
			calcCount:100,
			borderColor : "#000000",
		}
	};
	res[SCOUNDREL_VALUE] = {
		'default': {
			savedAttacks: "X f BBBB(CCB CBB CB)*15 SssSsC BBBB(CCB CBB CB)*15 \nD*150",
			savedTilesets: ['A26', '26F', '2F6', 'F62', 'F6A2'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: [{"lvl":30},{"plusLvl":7},{"strength":168},{"intellect":168},{"ICEHEART":{}},{"BLEED":{}}],
			armourAffixes: {critChance:2*RING_CRIT_CHANCE,critDamage:0.08+RING_EMPOWERED,projectileDamage:0.04},
			calcCount:100,
			borderColor : "#9e954d",
		}
	};
	res[RANGER_VALUE] = {
		'default': {
			savedAttacks: "e (v z s c d u s s V z s c D s s s)(V z s c d u s s V z s c D s s s)*3 Y w w w w p w w w w (V z s c d u s s V z s c D s s s)*4 Y w w w w p w w w w (V z s c d u s s V z s c D s s s)*4 Y w w w w p w w w w (V z s c d u s s V z s c D s s s)*4",
			savedTilesets: ['6F2', '26F', 'F2A', 'A26F', '6F2A'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: [{"lvl":30},{"plusLvl":7},{"strength":168},{"intellect":168},{"CHARGED_STRIKES":{"randomize":true}},{"BLEED":{}}],
			armourAffixes: {critChance:2*RING_CRIT_CHANCE,critDamage:0.08+RING_EMPOWERED,projectileDamage:0.04},
			calcCount:100,
			borderColor : "#5eD54d",
		},
		'reliable tilesets': {
			savedAttacks: "e (f s s s k s s s s f s s s r s s s s)*20",
			// savedAttacks: "e (v z s c d u s s V z s c D s s s)(V z s c d u s s V z s c D s s s)*4 Y w w w w p w w w w (V z s c d u s s V z s c D s s s)*5 Y w w w w p w w w w (V z s c d u s s V z s c D s s s)*4",
			savedTilesets: ['F26', 'F6A', 'F6A3', 'A32', 'F62'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: false,
			weaponAffixes: [{"lvl":30},{"plusLvl":7},{"strength":168},{"intellect":168},{"CHARGED_STRIKES":{"randomize":true}},{"BLEED":{}}],
			armourAffixes: {critChance:2*RING_CRIT_CHANCE,critDamage:0.08+RING_EMPOWERED,projectileDamage:0.04},
			calcCount:300,
			borderColor : "#5eD54d",
		},
		'manip_ranger': {
			savedAttacks: "e (a b s c d s s u A b s c D s s s)(A b s c d s s u A b s c D s s s)*3 G h w i j p w W w w (u A b s c D s s s A b s c d s s)*4 G h w i j p w W w w (u A b s c D s s s A b s c d s s)*4 G h w i j p w W w w (u A b s c D s s s A b s c d s s)*4",
			savedTilesets: ['7F62', '6A2', '7F2', '7F26', 'A7F26'],
			usingPotsFlag: true,
			usingTilesetsFlag: true,
			averagingCrits: true,
			weaponAffixes: [{"lvl":30},{"plusLvl":7},{"strength":168},{"intellect":168},{"CHARGED_STRIKES":{"randomize":false}},{"BLEED":{}}],
			armourAffixes: {critChance:2*RING_CRIT_CHANCE,critDamage:0.08+RING_EMPOWERED,projectileDamage:0.04},
			calcCount:100,
			borderColor : "#5eD54d",
		}
	}
}

// Load Outs Object Management
// Create

// Read
function injectLoadout(loadoutName){
	// Get the data to load.
	var currentClass = $("#classData").val();
	var loadoutsOfClass = JSON.parse(localStorage[loadoutsKey])[currentClass];

	let targetLoadout = loadoutsOfClass[loadoutName];
	globalLoadout = targetLoadout;

	// Load the attacks of the loadout.
	$("#attacks").val(targetLoadout.savedAttacks);
	
	// Load the tilesets of the loadout.
	let tilesets = targetLoadout.savedTilesets;
	const MAX_TILESETS = Math.max(5, tilesets.length);
	for (i=0;i<MAX_TILESETS;i++) {
		$('#tileset' + (i+1)).val(tilesets[i]);
	}

	// Load the flags of the loadout
	globalUsingPotsFlag = targetLoadout.usingPotsFlag;
	updatePotsHtml(globalUsingPotsFlag);

	globalTilesetsEnabledFlag = targetLoadout.usingTilesetsFlag;
	globalAveragingCritsFlag = targetLoadout.averagingCrits;
	updateTilesets(globalTilesetsEnabledFlag);

	$("#calcCount").val(targetLoadout.calcCount);

	refreshLoadout();
}

function refreshLoadout(){
	const ADDED_POTS_STAT = (globalUsingPotsFlag ? 250 : 0);
	
	globalWeaponLvl = 30; // Default
	globalWeaponPlusLvl = 0; // Default
	globalWeaponAffixBoosts = 1;
	globalUsingChargedStrikes = false;
	globalUsingBleed = false;
	var strength = ADDED_POTS_STAT;
	var intellect = ADDED_POTS_STAT;
	for(let i=0;i<globalLoadout.weaponAffixes.length;i++){
		const AFFIX = globalLoadout.weaponAffixes[i];
		const AFFIX_NAME = Object.keys(AFFIX)[0];
		if(AFFIX_NAME == "lvl"){
			globalWeaponLvl = AFFIX[AFFIX_NAME];
		}
		else if(AFFIX_NAME == "plusLvl"){
			globalWeaponPlusLvl = AFFIX[AFFIX_NAME];
		}
		else if(AFFIX_NAME == "ICEHEART"){
			globalWeaponAffixBoosts*=ICEHEART_BOOST;
		}
		else if(AFFIX_NAME == "GIANTKILLER"){
			globalWeaponAffixBoosts*=GIANTKILLER_BOOST;
		}
		else if(AFFIX_NAME == "BLEED"){
			globalUsingBleed = true;
		}
		else if(AFFIX_NAME == "CHARGED_STRIKES"){
			globalUsingChargedStrikes = true;
			// Make charged strikes first proc of a fight iteration start at a random position. 
			// To simulate real life not remembering which hit is charged strikes.
			globalRandomizedStartLocationChargedStrikes = (AFFIX[AFFIX_NAME].randomize == true);
		}
		else if(AFFIX_NAME == "strength"){
			strength+=AFFIX[AFFIX_NAME];
		}
		else if(AFFIX_NAME == "intellect"){
			intellect+=AFFIX[AFFIX_NAME];
		}
	}

	globalArmourCritChance = BASE_BASE_CRIT_CHANCE + ADDED_POTS_STAT/150*0.1;
	globalArmourCritDamage = BASE_BASE_CRIT_AMOUNT;
	globalArmourProjectileDamage = 0;
	const ARMOUR_AFFIXES = Object.keys(globalLoadout.armourAffixes);
	for(let i=0;i<ARMOUR_AFFIXES.length;i++){
		const AFFIX = ARMOUR_AFFIXES[i];
		const VALUE = globalLoadout.armourAffixes[ARMOUR_AFFIXES[i]];
		if(AFFIX == "critChance"){globalArmourCritChance += VALUE;}
		if(AFFIX == "critDamage"){globalArmourCritDamage += VALUE;}
		if(AFFIX == "projectileDamage"){globalArmourProjectileDamage = VALUE;}
	}
	globalDpsMultiplierFromCritting = 1 + globalArmourCritChance*(globalArmourCritDamage-1);

	globalStrengthBoost=1 + strength/150*0.05;
	globalIntellectBoost=1 + intellect/150*0.05;
}

// Update
function updateLoadoutListOfClass(){
	// Load the current loadouts in local storage
	localStorage[loadoutsKey] = JSON.stringify(res);

	// 
	var currentClass = $("#classData").val();
	var loadoutsOfClass = Object.keys(JSON.parse(localStorage[loadoutsKey])[currentClass]);
	
	// Refill the dropdown of selected loadouts.
	$("#loadoutName").empty();
	for (var i=0; i< loadoutsOfClass.length; i++) {
		$("#loadoutName").append(new Option(loadoutsOfClass[i]));
	}

	// Load by default the first loadout of the selected class.
	injectLoadout(loadoutsOfClass[0]);
}