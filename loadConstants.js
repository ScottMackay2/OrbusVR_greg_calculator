// File for global constants


// Different attack types have different type of effect. The dps code will make some attacks do different things.
const ATTACK_NORMAL = 0;
const ATTACK_DOT = 1;
const ATTACK_HITS_PER_SECOND = 3;


const MAGE_VALUE = 'mage';
const SCOUNDREL_VALUE = 'scoundrel';
const SHAMAN_VALUE = 'shaman';
const RANGER_VALUE = 'ranger';

const CONST_CLASSES = [MAGE_VALUE, SCOUNDREL_VALUE, RANGER_VALUE, SHAMAN_VALUE];

const loadoutsKey = "class_loadouts";

/// Weapon Values
const ICEHEART_BOOST = 1.05;
const GIANTKILLER_BOOST = 1.03;
const MAX_ADDED_CRIT_DMG_FROM_ARMOUR = 0.08; // 0.02 = 2% every armour piece. With 4 armour pieces.
const MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR = 0.04; // 0.01 = 1% every armour piece. With 4 armour pieces.

const RING_CRIT_CHANCE = (35)/150*0.1;
const RING_EMPOWERED = 0.03;
const RING_ADDED_CRIT_DMG = 70;
const BASE_CRIT_AMOUNT = 1.5+RING_EMPOWERED;

const BLEED_DEFAULT_DMG_INC = 2.48;
const BLEED_CHANCE_PERCENT = 0.02;
const BLEED_ACTUAL_DMG_INC = BLEED_DEFAULT_DMG_INC*BLEED_CHANCE_PERCENT;

const BASE_BASE_CRIT_CHANCE = 0.1;
const BASE_BASE_CRIT_AMOUNT = 1.5;

let BASE_CRIT_CHANCE;
let STR_INT_BOOST;

$("#togglePots").click(function(){
	if(chartFilling == false){
		globalUsingPotsFlag = !globalUsingPotsFlag;
		updatePots(globalUsingPotsFlag);
		loadAllCharts();
	}
});

$("#toggleTilesets").click(function(){
	if(chartFilling == false){
		globalTilesetsEnabledFlag = !globalTilesetsEnabledFlag;
		updateTilesets(globalTilesetsEnabledFlag);
		loadAllCharts();
	}
});

function updatePots(usingPotsFlag){
	if(usingPotsFlag == false){
		$("#togglePots").html('Enable pots');
	} else{
		$("#togglePots").html('Disable pots');
	}

	// BASE_CRIT_CHANCE = (150+RING_ADDED_CRIT_DMG+(usingPotsFlag ? 250 : 0))/150*0.1; // 150 = 0.1 = 10% more crit chance.
	STR_INT_BOOST = 1+(165 + (usingPotsFlag ? 250 : 0))/150*0.05; // 150 = 0.05x = 5% more damage from the str/int stat.
}

function updateTilesets(tilesetsEnabledFlag){
	if(tilesetsEnabledFlag == false){
		$("#toggleTilesets").html('Enable tilesets');
		for (i=1;i<6;i++) {
			$("#tileset_numprocs_" + i).val("");
			$("#tileset_avgint_"+ i).val("");
		}
	} else{
		$("#toggleTilesets").html('Disable tilesets');
	}
}
