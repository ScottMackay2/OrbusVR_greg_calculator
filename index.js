const MAX_TIME_SECONDS = 230;

// Warning: This value can not change currently (a few bits of code have hardcoded behavior around 0.1 stepsize, 
// if that is still the case... No need to change this anyway.
const STEP_SIZE = 0.1; 

// Block any tilesets that are shorter than 3.
const MINIMUM_TILESET_LENGTH = 3;

// Specify how many tilesets are possible to have (4 armour pieces + 1 weapon)
const MAX_AVAILABLE_TILESETS = 5;

// Specifies how many tilesets can be up at the same time.
const MAX_ALLOWED_ACTIVE_TILESETS = 3;

// Specifies how much dps a tileset boosts without interference.
// In theory there is a system in place that would increase or decrease this 10%
// which is dependant on how rare the tiles are that are used. But in practice most useful tilesets
// seem to end up to always be a 10% boost. (future research needed for maybe any useful higher boost tileset?)
const DEFAULT_TILESET_BOOST = 0.10;

// Making tilesets expire a bit faster than reality, because in reality no human can do every action
// with an exact timing which doesn't lose time. This way you don't get a false hope of a tileset
// being useful while in fact it is in reality impossible to use. 
// (Example: a tileset that will expire in 0.1 seconds but a charged piercing shot hits the target.
// In reality human error did not make that 0.1 seconds remaining)
const TILESET_HUMAN_UPTIME_CORRECTION = 0.2;

// Constant making sure not more then 5 hits per second tiles can trigger.
const MAX_HIT_COUNT = 5;

// Don't draw the charts of the first X seconds because of extreme dps on such short timeframes.
const START_DRAWING_AFTER_X_SECONDS = 5;

// A dot takes this amount of time before it triggers the next tick. This is important for accuracy of the program.
// Note, the found time seems to vary and get more than the current value depending on the DoT type. 
// (example of DoTs: Mage DoT, Shaman DoT, Heal DoT)
const TIME_SPACING_DOTS = 1.06;

let minCalcData;
let maxCalcData;
let tilesetState = 0;

let timeItWillTakeToCalculateTilesets;

Number.prototype.countDecimals = function () {
	if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
	return this.toString().split(".")[1].length || 0; 
}

let statusMsgTilesets = document.getElementById("tilesetsStatusMsg");

let totalDamageDataPoints;
let REPEAT_FIGHT_COUNT;
let REPEAT_FIGHT_TILESETS_COUNT;
let FILTER_TILESETS_BELOW_PERCENT;
let FILTER_START_IDX_TILESETS_BELOW_PERCENT;

// Fill the X axis with labels that will be used as time spacing between datapoints. 
var labelsAxisX = [];
for(var i=0;i<MAX_TIME_SECONDS/STEP_SIZE;i+=1){
	labelsAxisX.push((STEP_SIZE*i).toFixed(STEP_SIZE.countDecimals()));
}

let ChartInitializer;

function clearTilesetStatsInterface(){
	// Clear to empty data.
	for(var i=1;i<=MAX_AVAILABLE_TILESETS;i++){
		$("#tileset_percent_"+i).val("");
		$("#tileset_number_of_procs_"+i).val("");
		$("#tileset_avgint_"+i).val("");
	}

	$("#tileset_percent_total").val("");
	$("#min_tileset_percent_total").val("");
	$("#max_tileset_percent_total").val("");
	$("#min_triggered_tiles").val("");
	$("#max_triggered_tiles").val("");
}

function populateTilesetStatsTable(calcData){
	if(globalTilesetsEnabledFlag){
		for(var i=0;i<calcData.tilesetData.usedTilesets.length;i++){
			var tileset = calcData.tilesetData.usedTilesets[i];
			$("#tileset_percent_"+tileset.idx).val(tileset.percentBoost.toFixed(2));
			$("#tileset_number_of_procs_"+tileset.idx).val(tileset.number_of_procs.toLocaleString());
			$("#tileset_avgint_"+tileset.idx).val(tileset.averageInterference.toFixed(2));
		}

		$("#tileset_percent_total").val(calcData.tilesetData.totalTilesetPercent.toFixed(2));

		$("#min_tileset_percent_total").val(calcData.tilesetData.minTotalTilesetPercent.toFixed(2));
		$("#max_tileset_percent_total").val(calcData.tilesetData.maxTotalTilesetPercent.toFixed(2));
		$("#min_triggered_tiles").val(minStringStoringAllTiles);
		$("#max_triggered_tiles").val(maxStringStoringAllTiles);
	}
}

function updateTotalTilesetPercent(calcData){
	let totalNonTilesetDmg = calcData.addedTotalDamage-calcData.tilesetData.addedDmgTilesets;
	calcData.tilesetData.totalTilesetPercent = calcData.tilesetData.addedDmgTilesets*100.0/totalNonTilesetDmg;
}

function updateTilesetData(calcData){
	if(globalTilesetsEnabledFlag){
		let totalNonTilesetDmg = calcData.addedTotalDamage-calcData.tilesetData.addedDmgTilesets;
		for(var i=0;i<calcData.tilesetData.usedTilesets.length;i++){
			let tileset = calcData.tilesetData.usedTilesets[i];
			tileset.percentBoost = tileset.addedDmg*100.0/totalNonTilesetDmg;

			let sumInt = tileset.interferenceList.reduce((a,b) => a + b, 0);
			tileset.averageInterference = sumInt/ tileset.interferenceList.length;
		}

		updateTotalTilesetPercent(calcData);

		minCalcData = {tilesetData:{}};
		maxCalcData = {tilesetData:{}};
		minCalcData.addedTotalDamage = minMaxData.lowestTotal;
		maxCalcData.addedTotalDamage = minMaxData.highestTotal;
		minCalcData.tilesetData.addedDmgTilesets = minMaxData.lowestRunAddedTilesetDmg;
		maxCalcData.tilesetData.addedDmgTilesets = minMaxData.highestRunAddedTilesetDmg;

		calcData.tilesetData.minTotalTilesetPercent = minCalcData.tilesetData.addedDmgTilesets*100.0/(minCalcData.addedTotalDamage-minCalcData.tilesetData.addedDmgTilesets);
		calcData.tilesetData.maxTotalTilesetPercent = maxCalcData.tilesetData.addedDmgTilesets*100.0/(maxCalcData.addedTotalDamage-maxCalcData.tilesetData.addedDmgTilesets);
	}
}

function populateTilesetProcChart(graphSpecificData, calcData){
	var you = document.getElementById("line_chart");

	// Prepare the canvas to draw on.
	var minCanvas = document.getElementById("min_tiles_graph");
	var minCtx = minCanvas.getContext("2d");
	minCtx.canvas.width = (you.width);
	minCtx.canvas.height = 100;
	minCtx.stokeStyle = "#FF0000";
	minCtx.fillStyle = graphSpecificData.borderColor;
	minCtx.strokeRect(0, 0, minCtx.canvas.width, 100);


	// Draw all the tilesets their proc times
	for(var i=0;i<calcData.tilesetData.usedTilesets.length;i++){
		var tileset = calcData.tilesetData.usedTilesets[i];
		var totalTilesetUptime = (tileset.condition.length-1)*2;
		var widthTileset = totalTilesetUptime / MAX_TIME_SECONDS * minCtx.canvas.width;
		for(var i2=0;i2<tileset.minRunProccedInfoList.length;i2++){
			var startLocX = tileset.minRunProccedInfoList[i2].time / MAX_TIME_SECONDS * minCtx.canvas.width;
			minCtx.fillRect(startLocX, i*20, widthTileset, 20);
			minCtx.strokeRect(startLocX, i*20, widthTileset, 20);
		}
	}

	// Prepare the canvas to draw on.
	var maxCanvas = document.getElementById("max_tiles_graph");
	var maxCtx = maxCanvas.getContext("2d");
	maxCtx.canvas.width = (you.width);
	maxCtx.canvas.height = 100;
	maxCtx.stokeStyle = "#FF0000";
	maxCtx.fillStyle = graphSpecificData.borderColor;
	maxCtx.strokeRect(0, 0, maxCtx.canvas.width, 100);


	// Draw all the tilesets their proc times
	for(var i=0;i<calcData.tilesetData.usedTilesets.length;i++){
		var tileset = calcData.tilesetData.usedTilesets[i];
		var totalTilesetUptime = (tileset.condition.length-1)*2;
		var widthTileset = totalTilesetUptime / MAX_TIME_SECONDS * maxCtx.canvas.width;
		for(var i2=0;i2<tileset.maxRunProccedInfoList.length;i2++){
			var startLocX = tileset.maxRunProccedInfoList[i2].time / MAX_TIME_SECONDS * maxCtx.canvas.width;
			maxCtx.fillRect(startLocX, i*20, widthTileset, 20);
			maxCtx.strokeRect(startLocX, i*20, widthTileset, 20);
		}
	}
}

function getAttackPatterns(graphSpecificData){
	var attackPatternsData = [];
	var attackPatternStr = $("#attacks").val();
	attackPatternStr = attackPatternStr.replace(/ /g,''); // Remove spaces
	var attackPatternsStr = attackPatternStr.split("\n");
	for (var i2 = 0; i2 < attackPatternsStr.length; i2++) {
		var attackPattern = [];
		var prevAttack=undefined;
		var prevChar=undefined;
		var lastBracketOpenIdx=-1;
		var attackPattStr = attackPatternsStr[i2];
		for (var i = 0; i < attackPattStr.length; i++) {
			var chr = attackPattStr.charAt(i);
			var newAttack = graphSpecificData.classData.attackTypes[chr];
			if(newAttack != undefined){
				newAttack = clone(newAttack);
				if(newAttack.prePreModifierFunc != undefined){
					newAttack.prePreModifierFunc(newAttack);
				}
				attackPattern.push(newAttack);
			}
			if(chr == '('){
				lastBracketOpenIdx = i;
			}
			// When the 'x' is used it will repeat the last 'attack' that many times.
			// here is extracted how many times this is. A '()' bracket will repeat
			// everything between the brackets.
			if(chr == 'x' || chr == '*'){
				var amount = 0;
				var startNumIdx = i+1;
				while(i+1 < attackPattStr.length && '0123456789'.indexOf(attackPattStr.charAt(i+1)) !== -1){
					i++;
					amount*=10;
					amount += parseInt(attackPattStr.charAt(i));
				}
				amount-=1;

				
				if(prevChar == ')'){
					attackPattStr = attackPattStr.substr(0, startNumIdx) + (""+amount) + attackPattStr.substr(i + 1);
					if(amount > 0){
						i = lastBracketOpenIdx;
					}
				} else if(prevAttack != undefined){
					for(var repeat=0;repeat<amount;repeat++){
						attackPattern.push(prevAttack);
					}
				}
			}
			prevAttack = newAttack;
			prevChar = chr;
		}
		attackPatternsData["100_"+i2] = {pattern:attackPattern, patternIdx:0, patternTimePassed:0};
	}
	return attackPatternsData;
}

const ROW_OF_HITS_PER_SEC = "999";
function calculateOneFight(calcData, i10){
	let localStoringAllTiles = '';
	let localHitChartData = {data: [], pointBackgroundColor: [], customLabels: []};
	let localTotalDamageDataPoints = [];
	let localAddedDmgTilesets = 0;

	// Set charged strikes start count. If randomized a random rotation can not be influenced
	let chargedStrikesCount = globalRandomizedStartLocationChargedStrikes ? parseInt(Math.random()*11-1) : -1;

	calcData.critChance = globalArmourCritChance;
	calcData.dpsMultiplierFromCritting = globalDpsMultiplierFromCritting;

	// Convert the raw string of actions to actual data.
	let attackPatternsData = getAttackPatterns(calcData);

	let prevNormalAttackTimePassed = -100; // Minus number to trigger start of combat tile.

	// Generate a random startFrame from where the hits a second tiles start triggering.
	// var RANDOM_ADDED_TIME_HITS_A_SEC = Math.random();

	// Generate a random startFrame from where the hits a second tiles start triggering and
	// make them seperate attacks that trigger the hits per second tiles.
	let newAttackPattern = [];
	for(var i2=0;i2<MAX_TIME_SECONDS;i2++){
		var newAttack = new Attack(1, 0, false, 	0, 0, 0,  	0, 0, 0,  	0, 10, "","");
		newAttack.type = ATTACK_HITS_PER_SECOND;
		newAttackPattern.push(newAttack);
	}
	attackPatternsData[ROW_OF_HITS_PER_SEC] = {
		patternTimePassed:Math.random()-1, 
		patternIdx:0,
		pattern: newAttackPattern
	};

	// Initialize variables.
	let usedPrevTimePassed = 0;
	let usedPrevTotalDamage = 0;
	let prevTimePassed = 0;
	let prevTotalDamage = 0;
	let timePassed = 0;
	let totalDamage = 0;
	let hitCount = 0;
	let lastpointTimeX = -1;
	let dmgBoosts = [];
	let activeDots = [];

	// Initialize active tilesets.
	let usedTilesets = calcData.tilesetData.usedTilesets;
	let activeTilesets = [];
	let localProccedInfoLists = [];
	for (var i = 0; i < usedTilesets.length; i++) {
		usedTilesets[i].conditionLeft = usedTilesets[i].condition;
		usedTilesets[i].conditionStartTime = 0;
		usedTilesets[i].interferenceCount = -1;
		localProccedInfoLists[i] = [];
	}

	// Go through all individual attacks in chronological order.
	var closestTimePassed = -1;
	do{
		// Find out in which attack pattern row is the closest is for the next timeframe.
		closestTimePassed = MAX_TIME_SECONDS;
		var targetPatternData=null;
		for (var key in attackPatternsData) {
			var attackPatternData = attackPatternsData[key];
			if(attackPatternData.patternIdx < attackPatternData.pattern.length){
				var newTimePassed = attackPatternData.patternTimePassed + attackPatternData.pattern[attackPatternData.patternIdx].time;
				if(newTimePassed < closestTimePassed){
					closestTimePassed = newTimePassed;
					targetPatternData = attackPatternData;
				}
			}
		}
		// When last attack found of all attack patterns, exit loop.
		if(targetPatternData == null || closestTimePassed > MAX_TIME_SECONDS){
			break;
		}

		var attackPattern = targetPatternData.pattern;
		var attack = attackPattern[targetPatternData.patternIdx];
		timePassed=closestTimePassed;

		// Set the next index of attack of that pattern. (keeping track how many attack have been done in that attack row)
		targetPatternData.patternIdx++;
		targetPatternData.patternTimePassed = closestTimePassed;

		// Execute a function call before calculating if crit has been done.
		var modifierFuncBoostPercent = 1;
		if(attack.preModifierFunc != undefined){
			modifierFuncBoostPercent = attack.preModifierFunc(attack, targetPatternData, calcData, timePassed, i10);
		}

		var chargedStrikesWillCrit = false;
		if(chargedStrikesCount >= 9 && attack.hitCount > 0){
			chargedStrikesCount = -1;
			chargedStrikesWillCrit = true;
		}

		// Only attacks that are hitting add to the charged strikes counter. (only when charged strikes is enabled though)
		if(globalUsingChargedStrikes && attack.hitCount > 0){
			chargedStrikesCount++;
		}

		// Determine if this hit is going to crit.
		var critBoostPercent = 1;
		if(attack.canCrit){
			// Is crit
			if(Math.random() <= calcData.critChance || (chargedStrikesWillCrit && attack.hitCount > 0)){
				attack.isCritting = true;
				critBoostPercent = globalArmourCritDamage;
			} else{
				attack.isCritting = false;
			}
			// This removes all the randomizer of dps from critting itself. This way the dps is more accurate on average.
			if(globalAveragingCritsFlag && (!chargedStrikesWillCrit && attack.hitCount > 0)){
				critBoostPercent = calcData.dpsMultiplierFromCritting;
			}
		}

		// Execute a function call after calculating if crit has been done.
		if(attack.modifierFunc != undefined){
			modifierFuncBoostPercent *= attack.modifierFunc(attack, targetPatternData, calcData, timePassed);
		}

		// if(attack.type == ATTACK_INACTIVE){
		// 	continue;
		// }

		var addedDmgBoostPercent = 1.0;
		var addedTilesetDamagePercent = 1.0;


		// Loop through all current active damage boosts and update their number for this timeframe.
		// (damage boosting is also affecting currently ticking dots)
		for (var id in dmgBoosts) {
			if (Object.prototype.hasOwnProperty.call(dmgBoosts, id)) {
				// Remove boosts that are past their due date.
				while(timePassed > dmgBoosts[id].expire[0]){ 
					dmgBoosts[id].expire.shift();
				}

				for(var i3=0;i3<dmgBoosts[id].expire.length;i3++){
					addedDmgBoostPercent*= dmgBoosts[id].amount;
				}
			}
		}

		if(attack.type == ATTACK_NORMAL){

			// Go through all current tileset procs and remove the expired ones.
			// Expires later for a tileset that is longer.
			// 3 long = 4 seconds
			// 4 long = 6 seconds
			// 5 long = 8 seconds
			for(var i3=activeTilesets.length-1;i3>=0;i3--){
				var tilesetTimePassed = timePassed-activeTilesets[i3].time;
				var totalTilesetUptime = (activeTilesets[i3].tileset.condition.length-1)*2;
				if(tilesetTimePassed > totalTilesetUptime-TILESET_HUMAN_UPTIME_CORRECTION){ // Seems to still count even over 4 secs. Like 4.1ish	
					var goneOne = activeTilesets.splice(i3, 1);
				}
			}

		}

		// Calculate the added damage by doing most boosts time the default damage of the attack.
		const BLEED_BOOST = (globalUsingBleed) ? 1+BLEED_ACTUAL_DMG_INC*globalDpsMultiplierFromCritting : 1;
		const NO_CRIT_DMG = attack.damage * addedDmgBoostPercent*modifierFuncBoostPercent*BLEED_BOOST;
		const NO_TILESET_DMG = NO_CRIT_DMG*globalWeaponAffixBoosts + NO_CRIT_DMG*(critBoostPercent-1);

		if(globalTilesetsEnabledFlag){
			var targetTilesets = activeTilesets;
			if(attack.type == ATTACK_DOT){
				targetTilesets = attack.dotTiles; // Hitchhiked variable for active tilesets variable.
			}

			// Calculate total tileset added damage.
			// var tilesetBoost = 0;
			for(var i3=targetTilesets.length-1;i3>=0;i3--){
				const tilesetBoostAmount = targetTilesets[i3].tilesetBoostAmount;
				addedTilesetDamagePercent += tilesetBoostAmount;
				targetTilesets[i3].tileset.addedDmg += NO_TILESET_DMG * tilesetBoostAmount;
				calcData.tilesetData.addedDmgTilesets += NO_TILESET_DMG * tilesetBoostAmount;
				localAddedDmgTilesets += NO_TILESET_DMG * tilesetBoostAmount;
				// tilesetBoost += NO_TILESET_DMG * tilesetBoostAmount;
			}
			
		}

		// Add to total damage.
		const ADDED_DMG = NO_TILESET_DMG*addedTilesetDamagePercent;
		totalDamage += ADDED_DMG;
		if(ADDED_DMG != 0){
			localHitChartData.data.push({x:timePassed, y:ADDED_DMG});
			localHitChartData.pointBackgroundColor.push("#118800");
			localHitChartData.customLabels.push(["DAMAGE:"+parseInt(ADDED_DMG), "tiles:"+attack.tiles]);
		}

		// Draw dps graph, but only when either time or damage is going forward.
		if(attack.damage > 0 || (attack.time > 0 && attack.dotTimes > 0)){
			var newPointTimeX = (Math.floor(timePassed*10)/10);
			var damageTimeLocX = parseInt(newPointTimeX*10);
			if(totalDamageDataPoints[damageTimeLocX] == undefined){
				totalDamageDataPoints[damageTimeLocX] = 0;
			}
			totalDamageDataPoints[damageTimeLocX]+=ADDED_DMG;
			if(localTotalDamageDataPoints[damageTimeLocX] == undefined){
				localTotalDamageDataPoints[damageTimeLocX] = 0;
			}
			localTotalDamageDataPoints[damageTimeLocX]+=ADDED_DMG;
		}

		// Attacks with DoT effect will affect the list of attacks were every second
		// a new DoT attack is added for specified DoT dotTimes amount.
		if(attack.dotTimes > 0){

			var addedTimeSinceStartNextDot = 1;
			var amountOfDotsAdded = 0;
			var timePassed2 = 0;

			// Initialize the object that tracks active DoT's of this DoT ID. (attackID)
			if(activeDots[attack.attackID] == undefined){
				activeDots[attack.attackID] = {currentTarget:0, maxTarget:(attack.dotMaxActive-1)};
			} 
			// Remember the current index of the DoT that is applied. So overriding DoT's with same ID can 
			// be replaced later on in the calculations.
			else{
				activeDots[attack.attackID].currentTarget++;
				// Loop back around the ID to the first if dotMaxActive has reached max.
				if(activeDots[attack.attackID].currentTarget > activeDots[attack.attackID].maxTarget){
					activeDots[attack.attackID].currentTarget = 0;
				}
			}

			timePassed2 = timePassed;

			// Add the DoT's increased damage from tilesets
			var copyTilesetStats = [];
			for(var i4=0;i4<activeTilesets.length;i4++){
				copyTilesetStats.push({
					"tileset":activeTilesets[i4].tileset,
					"tilesetBoostAmount":activeTilesets[i4].tilesetBoostAmount
				});
			}
			
			var ROW_OF_DOT = "100_"+attack.attackID+"_"+activeDots[attack.attackID].currentTarget;
			attackPatternsData[ROW_OF_DOT] = {patternTimePassed:timePassed, patternIdx:0};
			var attackDotPattern = [];
			for(var i2=0;i2<attack.dotTimes;i2++){
				var newDotAttack;
				if(attack.spawnsNormalAttack === true){
					newDotAttack = new Attack(TIME_SPACING_DOTS, attack.dotDamage, true, 0, 0, 0,  0, 0, 0,  1, attack.attackID, attack.dotTiles, copyTilesetStats);
					newDotAttack.type = ATTACK_NORMAL;
				} else{
					newDotAttack = new Attack(TIME_SPACING_DOTS, attack.dotDamage, true, 0, 0, 0,  0, 0, 0,  0, attack.attackID, attack.dotTiles, copyTilesetStats);
					newDotAttack.type = ATTACK_DOT;
					newDotAttack.dotID = activeDots[attack.attackID].currentTarget;
				}
				
				attackDotPattern.push(newDotAttack);
			}
			attackPatternsData[ROW_OF_DOT].pattern = attackDotPattern;
		}

		// Only real attacks have affect on some calculations (DoT's do not). So do calculations
		// in this IF statement that only change when a normal attack has been done.
		if(attack.type == ATTACK_NORMAL){
			// Calculate the damage boost addition of this attack.
			if(attack.dmgBoostMaxActive > 0){
				if(dmgBoosts[attack.attackID] == undefined){
					dmgBoosts[attack.attackID] = {amount:attack.dmgBoostAmount, expire:[]};
				}
				// Add a new boost.
				dmgBoosts[attack.attackID].expire.push(timePassed+attack.dmgBoostStayTime);
				// Remove boosts that get overwritten.
				while(dmgBoosts[attack.attackID].expire.length > attack.dmgBoostMaxActive){ 
					dmgBoosts[attack.attackID].expire.shift();
				}
			}
		}

		// Make a variable keeping track of all tiles that are triggered on this attack.
		// First tiles are direct tiles from the attack. New tiles will be added after this.
		var newTriggeredTiles = attack.tiles;

		// Add delay tiles for not hitting the enemy on time.
		if(attack.hitCount > 0){
			var gapBetweenAttacks = timePassed-prevNormalAttackTimePassed;
			if(gapBetweenAttacks >= 1){
				if(gapBetweenAttacks >= 6){
					newTriggeredTiles = "0" + newTriggeredTiles; // Start combat
				}
				else if(gapBetweenAttacks >= 4){
					newTriggeredTiles = "9" + newTriggeredTiles; // 4 to 6 seconds delay
				}
				else if(gapBetweenAttacks >= 3){
					newTriggeredTiles = "8" + newTriggeredTiles; // Helix
				}
				else if(gapBetweenAttacks >= 2){
					newTriggeredTiles = "7" + newTriggeredTiles; // I
				}
				else{
					newTriggeredTiles = "6" + newTriggeredTiles; // Z
				}
			}
			prevNormalAttackTimePassed = timePassed;
		}

		// When more then a second passed since the last hits per second tiles has been determined.
		// Triggered by a dummy attack exactly timed on the hits per second moment.
		if(attack.type == ATTACK_HITS_PER_SECOND){
			// If less then 2 seconds passed hit detection is allowed.
			if(hitCount > 1){
				newTriggeredTiles = Math.min(hitCount, MAX_HIT_COUNT) + newTriggeredTiles;
			}
			hitCount = 0;
		}

		// Do hits per second calculations which can only change when a normal attack does damage.
		// This also adds new tiles to the triggered tiles (the hits per second tiles)
		if(attack.hitCount > 0){
			hitCount += attack.hitCount;
		}

		localStoringAllTiles+=newTriggeredTiles;

		// Check for all tilesets adding in the new tiles and see if they proc (and proc the tileset if 
		// they do) 
		for(var i2=0;i2<usedTilesets.length;i2++){
			var tileset = usedTilesets[i2];

			// Reset the detection of tileset triggering if the whole tileset did not trigger after 6 seconds.
			if(timePassed - tileset.conditionStartTime >= 6){
				tileset.conditionLeft = tileset.condition;
			}

			// Go through new available tiles to see if the
			// tileset procs
			for(var i3=0;i3<newTriggeredTiles.length;i3++){
				var tile = newTriggeredTiles[i3];
				// If the first tile does not match with the current tileset condition then add interference.
				

				if(!tileset.conditionLeft.startsWith(tile)){
					tileset.interferenceCount++;
				} 
				// If the first tile matches remove the first tile from the condition till the condition is empty
				else{

					// On the very first tile proccing, the interference has to be reset to 0 and the start of
					// detecting the tileset has to be remembered (to cancel the tileset trigger on 6+ seconds)
					if(tileset.conditionLeft == tileset.condition){
						tileset.conditionStartTime = timePassed;
						tileset.interferenceCount = 0;
					}

					// Remove first character.
					tileset.conditionLeft = tileset.conditionLeft.replace(tile, '');
					
					// All tiles were available in tileset so the tileset PROC's!
					if(tileset.conditionLeft.length == 0){
						tileset.number_of_procs += 1;
						tileset.interferenceList.push(Math.min(9, tileset.interferenceCount));
						tileset.conditionLeft = tileset.condition; // Reset back for next trigger.
						
						tileset.interferenceCount = (tileset.interferenceCount > 9 ? 9 : tileset.interferenceCount);

						// Add the tileset to one of the procced tilesets.
						activeTilesets.push({
								time: timePassed, 
								tileset: tileset,
								tilesetBoostAmount: DEFAULT_TILESET_BOOST - 0.01*tileset.interferenceCount
							});

						// Remove the first triggered tileset if a forth tileset is introduced.
						if(activeTilesets.length > MAX_ALLOWED_ACTIVE_TILESETS){
							activeTilesets.shift();
						}

						
						localProccedInfoLists[i2].push({
							time: timePassed
						});

						break;
					}
				}
			}
		}

	} while(true);
	if(minMaxData.lowestTotal === -1 || totalDamage < minMaxData.lowestTotal){
		minMaxData.lowestTotal = totalDamage;
		minHitSpecificData.data = localHitChartData.data;
		minHitSpecificData.pointBackgroundColor = localHitChartData.pointBackgroundColor;
		minHitSpecificData.customLabels = localHitChartData.customLabels;
		minStringStoringAllTiles= localStoringAllTiles;
		minMaxData.lowestRunDataPoints = localTotalDamageDataPoints;
		minMaxData.lowestRunAddedTilesetDmg = localAddedDmgTilesets;
		$.each(localProccedInfoLists, function(key, proccedInfoList){
			calcData.tilesetData.usedTilesets[key].minRunProccedInfoList = proccedInfoList;
		});
	}
	if(minMaxData.highestTotal === -1 || totalDamage > minMaxData.highestTotal){
		minMaxData.highestTotal = totalDamage;
		maxHitSpecificData.data = localHitChartData.data;
		maxHitSpecificData.pointBackgroundColor = localHitChartData.pointBackgroundColor;
		maxHitSpecificData.customLabels = localHitChartData.customLabels;
		maxStringStoringAllTiles = localStoringAllTiles;
		minMaxData.highestRunDataPoints = localTotalDamageDataPoints;
		minMaxData.highestRunAddedTilesetDmg = localAddedDmgTilesets;
		$.each(localProccedInfoLists, function(key, proccedInfoList){
			calcData.tilesetData.usedTilesets[key].maxRunProccedInfoList = proccedInfoList;
		});
	}

	return {
		totalDamage: totalDamage,
		timePassed: timePassed
	};
}

function fillDpsGraphData(graphData, totalDamageDataPoints, REPEAT_FIGHT_COUNT){
	graphData.data = [];
	var totalTotalDamage = 0;
	var totalDamage = 0;
	for(var i=0;i<totalDamageDataPoints.length;i++){
		if(totalDamageDataPoints[i] != undefined){
			totalDamage+=totalDamageDataPoints[i];
			let timePassed = i/10.0;
			var dps = Math.round(totalDamage/REPEAT_FIGHT_COUNT / timePassed);
			if(parseFloat(timePassed) >= START_DRAWING_AFTER_X_SECONDS){
				graphData.data.push(
					{
						x:timePassed, 
						y:dps
					}
				);
			}
		}
	}
}

function initializeTilesetsData(calcData, usedTilesets){
	calcData.tilesetData.usedTilesets = [];
	calcData.tilesetData.addedDmgTilesets = 0;
	for(let i=0;i<usedTilesets.length;i++){
		if(usedTilesets[i] != undefined){
			calcData.tilesetData.usedTilesets.push({
				"idx":i,
				"condition":usedTilesets[i],
				"addedDmg":0, 
				"number_of_procs":0, 
				"interferenceList": [], 
				"minRunProccedInfoList": [], 
				"maxRunProccedInfoList": []
			});
		}
	}
}

function retreiveCurrentInterfaceTilesets(){
	let usedTilesets = [];
	if(globalTilesetsEnabledFlag){
		for(let i=1;i<MAX_AVAILABLE_TILESETS+1;i++){
			let tilesetData = $("#tileset"+i).val();
			if(tilesetData != undefined){
				tilesetData = tilesetData.replace(/ /g,'');
				if(tilesetData.length >= MINIMUM_TILESET_LENGTH){
					usedTilesets[i] = tilesetData;
				}
			}
		}
	}
	return usedTilesets;
}

function initializeBeforeCalculations(calcData){
	totalDamageDataPoints = [];
	minMaxData = {
		lowestTotal: -1,
		lowestRunDataPoints: {},
		lowestRunAddedTilesetDmg: 0,
		highestTotal: -1,
		highestRunDataPoints: {},
		highestRunAddedTilesetDmg: 0
	};
	calcData.addedTotalDamage = 0;
	calcData.addedTimePassed = 0;
	calcData.averageTilesetBoostPercent = 0;
	calcData.tilesetData = {};

	calcData.weaponMultiplier = getWeaponMultiplier(globalWeaponLvl, globalWeaponPlusLvl);
}

function initializeGraphData(){
	const loadoutName = $("#loadoutName").val();

	// Reset the data
	let graphSpecificData = ChartInitializer.getEmptyChartDatasets(loadoutName);
	dpsChart.data.datasets[0] = graphSpecificData;
	return graphSpecificData;
}

function doAllCalculations(tilesets, repeatFightCount, stopEarlyBelowPercent, startIndexOfStopEarly){
	let calcData = {};

	const orbusClass = $("#classData").val();
	ChartInitializer.loadAttacksOfClass(orbusClass, calcData);
	
	initializeBeforeCalculations(calcData);

	// Retrieve the current tilesets.
	initializeTilesetsData(calcData, tilesets);

	for(let i10=0;i10<repeatFightCount;i10++){
		const oneFightData = calculateOneFight(calcData, i10);
		calcData.addedTotalDamage += oneFightData.totalDamage;
		calcData.addedTimePassed += oneFightData.timePassed;
		if(i10 >= startIndexOfStopEarly && stopEarlyBelowPercent != undefined){
			updateTotalTilesetPercent(calcData);
			if(calcData.tilesetData.totalTilesetPercent < stopEarlyBelowPercent){
				return false; // Stop with calculations when tileset group is too weak.
			}
		}
	}

	calcData.dps = calcData.addedTotalDamage/calcData.addedTimePassed;
	updateTilesetData(calcData);

	return calcData;
}

function populateDpsGraphs(graphSpecificData, calcData){
	let minGraphSpecificData = JSON.parse(JSON.stringify(graphSpecificData));
	let maxGraphSpecificData = JSON.parse(JSON.stringify(graphSpecificData));

	// Make all draw points of the graph showing the dps over time. (the whole reason for all the above code xD)
	fillDpsGraphData(graphSpecificData, totalDamageDataPoints, REPEAT_FIGHT_COUNT);
	fillDpsGraphData(minGraphSpecificData, minMaxData.lowestRunDataPoints, 1);
	fillDpsGraphData(maxGraphSpecificData, minMaxData.highestRunDataPoints, 1);
	minDpsChart.data.datasets[0] = minGraphSpecificData;
	maxDpsChart.data.datasets[0] = maxGraphSpecificData;
}

// Calculates all dps over the whole timeline of the chart.
function calculateFightAndPopulateUI(){
	let graphSpecificData = initializeGraphData();
	if(graphSpecificData == undefined){return;}

	clearTilesetStatsInterface();
	
	setTimeout(function(){
		const tilesets = retreiveCurrentInterfaceTilesets();
		
		REPEAT_FIGHT_COUNT = parseInt($("#calcCount").val());
		REPEAT_FIGHT_COUNT = REPEAT_FIGHT_COUNT != undefined ? REPEAT_FIGHT_COUNT : 1;
		const calcData = doAllCalculations(tilesets, REPEAT_FIGHT_COUNT);

		populateDpsGraphs(graphSpecificData, calcData);
		populateTilesetStatsTable(calcData);
		populateTilesetProcChart(graphSpecificData, calcData);

		dpsChart.update();

		minDpsChart.update();
		minHitChart.update();

		maxDpsChart.update();
		maxHitChart.update();
		console.log(calcData);
	}, 50);
}


function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}

let allPossibleTilesetGroupsGlobal;
let sortedTilesetsByDps;

let updateEditTextTimemout = null;
let chartFilling = false;
let startLoadingIconFunc = function(){
	chartFilling = false;
	$("#loadingText").css({visibility: "inherit"});
};
let clearLoadingIconFunc = function(){
	chartFilling = false;
	$("#loadingText").css({visibility: "collapse"});
};

function preStartCalculation(){
	if(chartFilling == false){
		clearTimeout(updateEditTextTimemout);
		clearLoadingIconFunc();
		updateEditTextTimemout = setTimeout(function(){
			chartFilling = true;
			startLoadingIconFunc();
			setTimeout(function(){
				calculateFightAndPopulateUI();
				setTimeout(clearLoadingIconFunc, 500); // Make the "Calculation..." show at-least for some time.
			}, 100);
		}, 900);
	}
}

function obtainAllPossibleTilesetCombinations(possibleTiles){
	let allPossibleTilesets = createAllPossibleVariations(possibleTiles, 3);
	// allPossibleTilesets = allPossibleTilesets.concat(createAllPossibleVariations(possibleTiles, 4));
	for(let i=0;i<allPossibleTilesets.length;i++){
		allPossibleTilesets[i] = allPossibleTilesets[i].join("");
	}

	// Remove any impossible tilesets.
	if(possibleTiles.indexOf("0") >= 0){
		for(let i=allPossibleTilesets.length-1;i>=0;i--){
			if(allPossibleTilesets[i].indexOf("0") > 0){
				allPossibleTilesets.splice(i, 1);
			}
		}
	}

	let newAllPossibleTilesetGroups = createAllPossibleCombinations(allPossibleTilesets, 5);

	return newAllPossibleTilesetGroups;
}

function prepareTilesetResults(results){
	results.sort( function compare( a, b ) {
	if ( a.dps < b.dps ){
		return 1;
	}
	if ( a.dps > b.dps ){
		return -1;
		}
		return 0;
	});
	return results;
}

function findAndRankAllTilesetGroups(allPossibleTilesetGroups){
	const startTime = Date.now();
	let results = [];
	for(let i=0;i<allPossibleTilesetGroups.length;i++){
		let tilesets = allPossibleTilesetGroups[i];
		
		calcData = doAllCalculations(tilesets, REPEAT_FIGHT_TILESETS_COUNT, FILTER_TILESETS_BELOW_PERCENT, FILTER_START_IDX_TILESETS_BELOW_PERCENT);
		if(calcData !== false){
			results.push({
				dps:calcData.dps, 
				tilesets:tilesets, 
				averageBoost: calcData.tilesetData.totalTilesetPercent.toFixed(2),
				minBoost: calcData.tilesetData.minTotalTilesetPercent.toFixed(2),
				maxBoost: calcData.tilesetData.maxTotalTilesetPercent.toFixed(2)
			});
		}
	}

	let preSortedTilesetsByDps = prepareTilesetResults(results);

	if(preSortedTilesetsByDps.length > 0){
		sortedTilesetsByDps = preSortedTilesetsByDps;
		document.getElementById("recalculateTopTileset").value = sortedTilesetsByDps.length;

		renderjson.set_icons('+', '-');
		renderjson.set_show_to_level(1);
		document.getElementById('bestResultTilesetsJson').innerHTML = "";
		document.getElementById('worseResultTilesetsJson').innerHTML = "";

		let best10 = sortedTilesetsByDps.slice(0, 10);
		let worse10 = sortedTilesetsByDps.slice(Math.max(10, sortedTilesetsByDps.length-10), sortedTilesetsByDps.length);

		document.getElementById('bestResultTilesetsJson').appendChild(renderjson(best10));
		document.getElementById('worseResultTilesetsJson').appendChild(renderjson(worse10));

		console.log(sortedTilesetsByDps);
	}
	else{
		document.getElementById('worseResultTilesetsJson').innerHTML = "<span style='color:#F00'>No tilesets met your criteria... Not keeping the current tilesets...</span>";
		return false;
	}
	statusMsgTilesets.innerHTML = "<b>Calculation took:"+millisecondsToTimeRemaining(Date.now()-startTime) + ". Found "+sortedTilesetsByDps.length + " tilesets.</b>";
	return true;
}

function prepareFindingBestTilesets(possibleTiles){
	const TARGET_MAX_CALC_TIME = 1500;
	const BASE_CALC_COUNT = 100;

	let timePassed=0;
	let calculations = 0;
	let maxRepeatFight = REPEAT_FIGHT_TILESETS_COUNT;
	
	let startTime = Date.now();
	doAllCalculations(possibleTiles[0], BASE_CALC_COUNT);
	let initialTimePassed = (Date.now()-startTime) * maxRepeatFight / BASE_CALC_COUNT;

	const steps = Math.max(1, Math.min(possibleTiles.length/5, TARGET_MAX_CALC_TIME/initialTimePassed));
	const indexShiftEachStep = Math.max(1, parseInt(possibleTiles.length/steps));

	startTime = Date.now();
	for(let i=0;i<possibleTiles.length;i+=indexShiftEachStep){
		const result = doAllCalculations(possibleTiles[i], maxRepeatFight, FILTER_TILESETS_BELOW_PERCENT, FILTER_START_IDX_TILESETS_BELOW_PERCENT);
		calculations+=maxRepeatFight;
		timePassed = Date.now()-startTime;
	}
	
	let maxCalculations = possibleTiles.length*REPEAT_FIGHT_TILESETS_COUNT;
	let localTimeItWillTakeToCalculateTilesets = maxCalculations/calculations * timePassed;

	timeItWillTakeToCalculateTilesets = millisecondsToTimeRemaining(localTimeItWillTakeToCalculateTilesets);
	statusMsgTilesets.innerHTML = "There are <b>"+possibleTiles.length+"</b> inique combinations and it will take approximately <b>"+timeItWillTakeToCalculateTilesets+"</b>. Are you sure?";
}

function setTilesetPromptState(newState){
	if(newState == 0){
		document.getElementById("possibleTiles").removeAttribute("readonly");
		document.getElementById("tilesetsStatusMsg").innerHTML = "";
		document.getElementById("redoTilesetCalculationContainer").style.display = "none";
		document.getElementById("resetTilesetsButton").classList.remove("active-button");
		document.getElementById("startFindingTheBestTilesetCombinations").classList.remove("active-button");
	} 
	else if(newState == 1){
		document.getElementById("possibleTiles").removeAttribute("readonly");
		document.getElementById("tilesetsStatusMsg").style.display = "block";
		document.getElementById("redoTilesetCalculationContainer").style.display = "none";
		document.getElementById("resetTilesetsButton").classList.remove("active-button");
		document.getElementById("startFindingTheBestTilesetCombinations").classList.add("active-button");
		document.getElementById("startFindingTheBestTilesetCombinations").innerHTML = "Yes (Start calculation)";
	}
	else if(newState == 2){
		document.getElementById("possibleTiles").setAttribute("readonly", true);
		document.getElementById("redoTilesetCalculationContainer").style.display = "inline-block";
		document.getElementById("resetTilesetsButton").classList.add("active-button");
		document.getElementById("startFindingTheBestTilesetCombinations").classList.remove("active-button");
	}
	else if(newState == 3){
		document.getElementById("possibleTiles").setAttribute("readonly", true);
		document.getElementById("tilesetsStatusMsg").style.display = "block";
		document.getElementById("redoTilesetCalculationContainer").style.display = "inline-block";
		document.getElementById("resetTilesetsButton").classList.add("active-button");
		document.getElementById("startFindingTheBestTilesetCombinations").classList.add("active-button");
		document.getElementById("startFindingTheBestTilesetCombinations").innerHTML = "Yes (Finetune calculation)";
	}
	tilesetState = newState;
}

document.getElementById("resetTilesetsButton").addEventListener("click", function(){
	setTilesetPromptState(0);
});

document.getElementById("calculateButton").addEventListener("click", function(){
	preStartCalculation();
});

document.getElementById("openFindBestTilesetButton").addEventListener("click", function(){
	document.getElementById("myForm").style.display = "block";
});

document.getElementById("closeFindTilesetButton").addEventListener("click", function(){
	document.getElementById("myForm").style.display = "none";
});

function rertrieveInterfaceDataTilesets(){
	REPEAT_FIGHT_TILESETS_COUNT = parseInt($("#repeatFightCount").val());
	if(REPEAT_FIGHT_TILESETS_COUNT < 1){REPEAT_FIGHT_TILESETS_COUNT = 1;}
	FILTER_TILESETS_BELOW_PERCENT = parseFloat($("#filterBelowTilesetPercent").val());
	FILTER_START_IDX_TILESETS_BELOW_PERCENT = parseInt($("#filterStartIdxBelowTilesetPercent").val()) - 1;
	if(FILTER_START_IDX_TILESETS_BELOW_PERCENT < 0) {FILTER_START_IDX_TILESETS_BELOW_PERCENT = 0;}
}

let finetunedTilesetGroups;
document.getElementById("checkTilesetsButton").addEventListener("click", function(){
	if(tilesetState == 0 || tilesetState == 1){
		let possibleTiles = document.getElementById("possibleTiles").value.replaceAll(" ", "").split("");
		const MAX_POSSIBLE_TILES = 5;
		if(possibleTiles.length > MAX_POSSIBLE_TILES){
			statusMsgTilesets.innerHTML = "<span style='color:#F00'>Sorry. The max allowed of tiles are "+MAX_POSSIBLE_TILES+". Or the program will just crash for having to many options xD</span>";
		} else{
			rertrieveInterfaceDataTilesets();
			allPossibleTilesetGroupsGlobal = obtainAllPossibleTilesetCombinations(possibleTiles);
			prepareFindingBestTilesets(allPossibleTilesetGroupsGlobal);
			setTilesetPromptState(1);
		}
	}
	else if(tilesetState == 2 || tilesetState == 3){
		finetunedTilesetGroups = [];
		let theTopSize = parseInt(document.getElementById("recalculateTopTileset").value);
		for(let i=0;i<Math.min(theTopSize, sortedTilesetsByDps.length);i++){
			finetunedTilesetGroups.push(sortedTilesetsByDps[i].tilesets);
		}

		rertrieveInterfaceDataTilesets();

		if(finetunedTilesetGroups.length > 0){
			prepareFindingBestTilesets(finetunedTilesetGroups);
			setTilesetPromptState(3);
		}
		else{
			statusMsgTilesets.innerHTML = "<span style='color:#F00'>There are no tiles left to use. Reset calculation...</span>";
		}
	}
});

document.getElementById("startFindingTheBestTilesetCombinations").addEventListener("click", function(){
	// const date = new Date();
	// const hour = date.getHours();
	// const minutes = date.getMinutes();
	// statusMsgTilesets.innerHTML = "<b>Started calculation at "+hour+":"+minutes+". Will take around "+timeItWillTakeToCalculateTilesets+"</b>";
	// setTimeout(function(){
		if(tilesetState == 1){
			if(findAndRankAllTilesetGroups(allPossibleTilesetGroupsGlobal)){
				setTilesetPromptState(2);
			}
		} else if(tilesetState == 3){
			if(findAndRankAllTilesetGroups(finetunedTilesetGroups)){
				setTilesetPromptState(2);
			}
		} else{
			statusMsgTilesets.innerHTML = "Press the check button first before continuing...";
		}
	// },500);
});

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

require(["./ChartInitializer"], 
function(newChartInitializer){
	ChartInitializer = newChartInitializer;
    ChartInitializer.initializeAllClassData();
    preStartCalculation();
});