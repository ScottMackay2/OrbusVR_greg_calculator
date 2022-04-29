const MAX_TIME_SECONDS = 230;

// Warning: This value can not change currently (a few bits of code have hardcoded behavior around 0.1 stepsize, 
// if that is still the case... No need to change this anyway.
const STEP_SIZE = 0.1; 

// Very special very laggy feature. This feature will make all charts not draw the average dps. But dps on all individual runs
// will be drawn. Which will give alot more drawing time. Recommended to keep most graphs disabled when enabling this feature.
var multiDrawEnabled = false;

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

Number.prototype.countDecimals = function () {
	if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
	return this.toString().split(".")[1].length || 0; 
}

// Fill the X axis with labels that will be used as time spacing between datapoints. 
var labelsAxisX = [];
for(var i=0;i<MAX_TIME_SECONDS/STEP_SIZE;i+=1){
	labelsAxisX.push((STEP_SIZE*i).toFixed(STEP_SIZE.countDecimals()));
}

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

	this.type = ATTACK_NORMAL;

	this.modifierFunc = modifierFunc;
	this.preModifierFunc = preModifierFunc;
	this.prePreModifierFunc = prePreModifierFunc;
};

var updateEditTimemout = null;
var updateEditTextTimemout = null;
var chartFilling = false;
var chartCanRefillTimeoutFunc = function(){
	chartFilling = false;
	$("#loadingText").css({visibility: "collapse"});
};
var startLoadingIconFunc = function(){
	chartFilling = false;
	$("#loadingText").css({visibility: "inherit"});
};

function loadAllCharts(){
	// TODO Save the Loadouts when Button Press.
	var timeoutFunc = function(){
		if(chartFilling){
			updateEditTimemout = setTimeout(timeoutFunc, 1000);
		} else{
			chartFilling = true;

			fillChart();
			setTimeout(chartCanRefillTimeoutFunc, 1000);
		}
	};

	// Trigger the first chart rendering immediately.
	if(updateEditTimemout == null){
		timeoutFunc();
		updateEditTimemout = new Object(); // Make sure next triggers are going to the else statement by adding an empty Object in.
	} else if(chartFilling == false){
		clearTimeout(updateEditTimemout);
		clearTimeout(updateEditTextTimemout);
		updateEditTimemout = setTimeout(timeoutFunc, 1000);
		updateEditTextTimemout = setTimeout(startLoadingIconFunc, 900);
	}
}



function  updateTilesetPercentages(chartName){
	// Clear to empty boosts.
	$("#tileset_percent_total").val(0);
	for(var i=1;i<=5;i++){
		$("#tileset_percent_"+i).val(0);
	}

	var graphSpecificData;
	for(var j=0;j<dpsChart.data.datasets.length;j++) {
		if (dpsChart.data.datasets[j].label == chartName) {
			graphSpecificData = dpsChart.data.datasets[j];
		}
	}

	$("#triggered_tiles").val("");
	if(graphSpecificData != undefined && globalTilesetsEnabledFlag){
		var totalNonTilesetDmg = graphSpecificData.addedTotalDamage-graphSpecificData.addedDmgTilesets;
		for(var i=0;i<graphSpecificData.usedTilesets.length;i++){
			var tileset = graphSpecificData.usedTilesets[i];
			var percentBoost = tileset.addedDmg*100.0/totalNonTilesetDmg;
			$("#tileset_percent_"+tileset.idx).val(percentBoost.toFixed(2));
			$("#tileset_numprocs_"+tileset.idx).val(tileset.numProcs.toLocaleString())
			var sumInt = tileset.intList.reduce((a,b) => a + b, 0)
			$("#tileset_avgint_"+tileset.idx).val((sumInt/ tileset.intList.length).toFixed(2))
		}

		$("#tileset_percent_total").val((graphSpecificData.addedDmgTilesets*100.0/totalNonTilesetDmg).toFixed(2));
		$("#triggered_tiles").val(graphSpecificData.triggeredTiles);
	}

}

function updateTilesetProcChart(chartName){

	var graphSpecificData;
	for(var j=0;j<dpsChart.data.datasets.length;j++) {
		if (dpsChart.data.datasets[j].label == chartName) {
			graphSpecificData = dpsChart.data.datasets[j];
		}
	}

	// Prepare the canvas to draw on.
	var canvas = document.getElementById("tiles_graph");
	var you = document.getElementById("line_chart");
	var ctx = canvas.getContext("2d");
	ctx.canvas.width = (you.width)-100;
	ctx.canvas.height = 100;
	ctx.stokeStyle = "#FF0000";
	ctx.fillStyle = graphSpecificData.borderColor;
	ctx.strokeRect(0, 0, ctx.canvas.width, 100);


	// Draw all the tilesets their proc times
	for(var i=0;i<graphSpecificData.usedTilesets.length;i++){
		var tileset = graphSpecificData.usedTilesets[i];
		var totalTilesetUptime = (tileset.condition.length-1)*2;
		var widthTileset = totalTilesetUptime / MAX_TIME_SECONDS * ctx.canvas.width;
		for(var i2=0;i2<tileset.proccedInfoList.length;i2++){
			var startLocX = tileset.proccedInfoList[i2].time / MAX_TIME_SECONDS * ctx.canvas.width;
			ctx.fillRect(startLocX, i*20, widthTileset, 20);
			ctx.strokeRect(startLocX, i*20, widthTileset, 20);
		}
	}

}

function updateLocalDataToNew(e){
	//TODO Ask Scott why I don't Use this and if I should. Whoops! XD
	var chartNum = $("#chartNum").val();
	if(updateEditTimemout != null){
		clearTimeout(updateEditTimemout);
		clearTimeout(updateEditTextTimemout);
	}

	const UPDATE_AFTER = 1200;

	var timeoutFunc = function(){
		if(chartFilling){
			updateEditTimemout = setTimeout(timeoutFunc, UPDATE_AFTER);
		} else{
			chartFilling = true;

			// Draw the info with the current configuration.
			fillChart(chartNum);
			setTimeout(chartCanRefillTimeoutFunc, UPDATE_AFTER);
		}
	};

	if(chartFilling == false){
		clearTimeout(updateEditTimemout);
		clearTimeout(updateEditTextTimemout);
		updateEditTimemout = setTimeout(timeoutFunc, UPDATE_AFTER);
		updateEditTextTimemout = setTimeout(startLoadingIconFunc, UPDATE_AFTER-100);
	}
}

// Calculates all dps over the whole timeline of the chart.
function fillChart(){
	dotSpecificData.data = [];
	dotSpecificData.pointBackgroundColor = [];
	dotSpecificData.customLabels = [];
	// Reset the data
	dpsChart.data.datasets = [];
	// TODO: This will have to be moved to load for all the datasets when multiple allowed. COMPARISON
	loadChartDatasets(
		$("#classData").val(), // Class
		$("#loadoutName").val()
	);

	// TODO: This will have to be changed when making a comparison to load both atasets. COMPARISON
	var graphSpecificData = dpsChart.data.datasets[0];

	if(graphSpecificData == undefined){
		return;
	}

	// Retrieve the current attack pattern.
	var attackPatternStr = $("#attacks").val();
	
	// Retrieve the current tilesets.
	graphSpecificData.usedTilesets = [];
	graphSpecificData.numAfflictions = 0;
	graphSpecificData.numFireBoosts = 0;
	graphSpecificData.numBurnCards = 0;
	graphSpecificData.numPoisonCards = 0;
	if(globalTilesetsEnabledFlag){
		for(var i=1;i<MAX_AVAILABLE_TILESETS+1;i++){
			var tilesetData = $("#tileset"+i).val()
			if(tilesetData != undefined){
				tilesetData = tilesetData.replace(/ /g,'');
				if(tilesetData.length >= MINIMUM_TILESET_LENGTH){
					graphSpecificData.usedTilesets.push({"idx":i,"condition":tilesetData,addedDmg:0, numProcs:0, intList: [] });
				}
			}
		}
		graphSpecificData.addedDmgTilesets = 0;
	}
	
	var allTotalDamageDataPoints = [];
	var totalDamageDataPoints = [];
	let calcCount = parseInt($("#calcCount").val());
	var calculateAttacksAmount = calcCount != undefined ? calcCount : 1;
	for(var i10=0;i10<calculateAttacksAmount;i10++){
		if(multiDrawEnabled){
			totalDamageDataPoints = [];
		}

		// Set charged strikes start count. If randomized a random rotation can not be influenced
		graphSpecificData.chargedStrikesCount = globalRandomizedStartLocationChargedStrikes ? parseInt(Math.random()*11-1) : -1;

		const DAMAGE_MULTIPLIER = globalWeaponAffixBoosts;
		const DOT_MULTIPLIER = globalWeaponAffixBoosts;

		graphSpecificData.critChance = globalArmourCritChance;
		graphSpecificData.dpsMultiplierFromCritting = globalDpsMultiplierFromCritting;

		// Convert the raw string of actions to actual data.
		var attackPatternsData = [];
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
					newAttack.damage*=DAMAGE_MULTIPLIER;
					newAttack.dotDamage*=DOT_MULTIPLIER;
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
		var prevNormalAttackTimePassed = -100; // Minus number to trigger start of combat tile.

		// Generate a random startFrame from where the hits a second tiles start triggering.
		// var RANDOM_ADDED_TIME_HITS_A_SEC = Math.random();

		// Generate a random startFrame from where the hits a second tiles start triggering and
		// make them seperate attacks that trigger the hits per second tiles.
		var ROW_OF_HITS_PER_SEC = "999";
			attackPatternsData[ROW_OF_HITS_PER_SEC] = {patternTimePassed:Math.random()-1, patternIdx:0};
		var newAttackPattern = [];
		for(var i2=0;i2<MAX_TIME_SECONDS;i2++){
			var newAttack = new Attack(1, 0, false, 	0, 0, 0,  	0, 0, 0,  	0, 10, "","");
			newAttack.type = ATTACK_HITS_PER_SECOND;
			newAttackPattern.push(newAttack);
		}
		attackPatternsData[ROW_OF_HITS_PER_SEC].pattern = newAttackPattern;


		// Initialize variables.
		var usedPrevTimePassed = 0;
		var usedPrevTotalDamage = 0;
		var prevTimePassed = 0;
		var prevTotalDamage = 0;
		var timePassed = 0;
		var totalDamage = 0;
		var hitCount = 0;
		var lastpointTimeX = -1;
		var dmgBoosts = [];
		var activeDots = [];

		// Clear active tilesets from previous tileset calculation.
		var usedTilesets = graphSpecificData.usedTilesets;
		graphSpecificData.activeTilesets = [];
		for (var i = 0; i < usedTilesets.length; i++) {
			usedTilesets[i].conditionLeft = usedTilesets[i].condition;
			usedTilesets[i].conditionStartTime = 0;
			usedTilesets[i].interferenceCount = -1;
			usedTilesets[i].proccedInfoList = [];
		}

		var stringStoringAllTiles = "";

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
				modifierFuncBoostPercent = attack.preModifierFunc(attack, targetPatternData, graphSpecificData, timePassed);
			}



			// Make the current Orbus bug that triggers the charged strikes to crit an attack even on hits that don't add to the counter.
			// Caused by the 10th hit will crit before it even knows if the 10th hit is a normal number that crits. So it becomes
			// a crit after the 9th hit no matter if it is a normal hit or DoT.
			// If "attack.damage > 0" would be replaced by "attack.hitCount > 0" then the bug would be fixed. If any dev ever reads this xD
			var chargedStrikesWillCrit = false;
			if(graphSpecificData.chargedStrikesCount >= 9 && attack.damage > 0){
				graphSpecificData.chargedStrikesCount = -1;
				chargedStrikesWillCrit = true;
			}

			// Only attacks that are hitting add to the charged strikes counter. (only when charged strikes is enabled though)
			if(globalUsingChargedStrikes && attack.hitCount > 0){
				graphSpecificData.chargedStrikesCount++;
			}

			// Determine if this hit is going to crit.
			var critBoostPercent = 1;
			if(attack.canCrit){
				// Is crit
				if(Math.random() <= graphSpecificData.critChance || chargedStrikesWillCrit){
					attack.isCritting = true;
					critBoostPercent = globalArmourCritDamage;
				} else{
					attack.isCritting = false;
				}
				// This removes all the randomizer of dps from critting itself. This way the dps is more accurate on average.
				if(globalAveragingCritsFlag && !chargedStrikesWillCrit){
					critBoostPercent = graphSpecificData.dpsMultiplierFromCritting;
				}
			}

			// Execute a function call after calculating if crit has been done.
			if(attack.modifierFunc != undefined){
				modifierFuncBoostPercent *= attack.modifierFunc(attack, targetPatternData, graphSpecificData, timePassed);
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
						addedDmgBoostPercent*= 1+dmgBoosts[id].amount;
					}
				}
			}

			if(attack.type == ATTACK_NORMAL){

				// Go through all current tileset procs and remove the expired ones.
				// Expires later for a tileset that is longer.
				// 3 long = 4 seconds
				// 4 long = 6 seconds
				// 5 long = 8 seconds
				for(var i3=graphSpecificData.activeTilesets.length-1;i3>=0;i3--){
					var tilesetTimePassed = timePassed-graphSpecificData.activeTilesets[i3].time;
					var totalTilesetUptime = (graphSpecificData.activeTilesets[i3].tileset.condition.length-1)*2;
					if(tilesetTimePassed > totalTilesetUptime-TILESET_HUMAN_UPTIME_CORRECTION){ // Seems to still count even over 4 secs. Like 4.1ish	
						var goneOne = graphSpecificData.activeTilesets.splice(i3, 1);
					}
				}

			}

			// Calculate the added damage by doing most boosts time the default damage of the attack.
			const BLEED_BOOST = (globalUsingBleed) ? 1+BLEED_ACTUAL_DMG_INC*globalDpsMultiplierFromCritting : 1;
			const NO_TILESET_DMG = attack.damage * addedDmgBoostPercent*critBoostPercent*modifierFuncBoostPercent*BLEED_BOOST;

			if(globalTilesetsEnabledFlag){
				var targetTilesets = graphSpecificData.activeTilesets;
				if(attack.type == ATTACK_DOT){
					targetTilesets = attack.dotTiles; // Hitchhiked variable for active tilesets variable.
				}

				// Calculate total tileset added damage.
				var tilesetBoost = 0;
				var tilesetBoostAmt = 0;
				for(var i3=targetTilesets.length-1;i3>=0;i3--){
					addedTilesetDamagePercent += targetTilesets[i3].tilesetBoostAmount;
					targetTilesets[i3].tileset.addedDmg += NO_TILESET_DMG * targetTilesets[i3].tilesetBoostAmount;
					graphSpecificData.addedDmgTilesets += NO_TILESET_DMG * targetTilesets[i3].tilesetBoostAmount;
					tilesetBoost += NO_TILESET_DMG * targetTilesets[i3].tilesetBoostAmount;
					tilesetBoostAmt += targetTilesets[i3].tilesetBoostAmount;
				}

				if(attack.type == ATTACK_DOT){
					graphSpecificData.numAfflictions += 1;
					var curtiles = attack.dotTiles;
					for(var i4=curtiles.length-1;i4>=0;i4--) {
						if (curtiles[i4].tileset.condition == "B26") {
							graphSpecificData.numFireBoosts += 1;
						}
					}
				}

				// Add the damage to the total tileset damage boosting.
				
			}

			// Add to total damage.
			const ADDED_DMG = NO_TILESET_DMG*addedTilesetDamagePercent;
			totalDamage += ADDED_DMG;
			if(i10 == 0 && ADDED_DMG != 0){
				dotSpecificData.data.push({x:timePassed, y:ADDED_DMG});
				dotSpecificData.pointBackgroundColor.push("#118800");
				dotSpecificData.customLabels.push(["DAMAGE:"+parseInt(ADDED_DMG), "tiles:"+attack.tiles]);
			}

			// Draw dps graph, but only when either time or damage is going forward.
			if(attack.damage > 0 || (attack.time > 0 && attack.dotTimes > 0)){
				var newPointTimeX = (Math.floor(timePassed*10)/10);
				var damageTimeLocX = parseInt(newPointTimeX*10);
				if(totalDamageDataPoints[damageTimeLocX] == undefined){
					totalDamageDataPoints[damageTimeLocX] = 0;
				}
				totalDamageDataPoints[damageTimeLocX]+=ADDED_DMG;
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
				for(var i4=0;i4<graphSpecificData.activeTilesets.length;i4++){
					copyTilesetStats.push({
						"tileset":graphSpecificData.activeTilesets[i4].tileset,
						"tilesetBoostAmount":graphSpecificData.activeTilesets[i4].tilesetBoostAmount
					});
				}
				// for(var i3=graphSpecificData.activeTilesets.length-1;i3>=0;i3--){
				// 	graphSpecificData.activeTilesets[i3].tileset.addedDmg += graphSpecificData.activeTilesets[i3].tilesetBoostAmount*attack.dotDamage*attack.dotTimes;
				// }

				
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

			stringStoringAllTiles+=newTriggeredTiles;

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
							tileset.numProcs += 1;
							tileset.intList.push(Math.min(9, tileset.interferenceCount));
							tileset.conditionLeft = tileset.condition; // Reset back for next trigger.
							
							tileset.interferenceCount = (tileset.interferenceCount > 9 ? 9 : tileset.interferenceCount);

							// Add the tileset to one of the procced tilesets.
							graphSpecificData.activeTilesets.push({
									time: timePassed, 
									tileset: tileset,
									tilesetBoostAmount: DEFAULT_TILESET_BOOST - 0.01*tileset.interferenceCount
								});

							// Remove the first triggered tileset if a forth tileset is introduced.
							if(graphSpecificData.activeTilesets.length > MAX_ALLOWED_ACTIVE_TILESETS){
								graphSpecificData.activeTilesets.shift();
							}

							if(i10 == calculateAttacksAmount-1){
								tileset.proccedInfoList.push({
									time: timePassed
								});
							}

							break;
						}
					}
				}
			}

		} while(true);

		if(multiDrawEnabled){
			allTotalDamageDataPoints.push(totalDamageDataPoints);
		}
	}

	if(multiDrawEnabled == false){
		allTotalDamageDataPoints.push(totalDamageDataPoints);
	}


	// Make all draw points of the graph showing the dps over time. (the whole reason for all the above code xD)
	graphSpecificData.data = [];
	var totalTotalDamage = 0;
	for(var i0=0;i0<allTotalDamageDataPoints.length;i0++){
		var totalDamage = 0;
		var singleTotalDamageDataPoints = allTotalDamageDataPoints[i0];
		for(var i=0;i<singleTotalDamageDataPoints.length;i++){
			if(singleTotalDamageDataPoints[i] != undefined){
				totalDamage+=singleTotalDamageDataPoints[i];
				var dps = Math.round(totalDamage/(multiDrawEnabled == false ? calculateAttacksAmount : 1) / (i/10));
				var damage = Math.round(singleTotalDamageDataPoints[i]/(multiDrawEnabled == false ? calculateAttacksAmount : 1) / (i/10));
				var timePassed = (i/10).toFixed(STEP_SIZE.countDecimals());
				if(parseFloat(timePassed) >= START_DRAWING_AFTER_X_SECONDS){
					graphSpecificData.data.push({x:timePassed, y:dps});
				}
			}
		}
		totalTotalDamage+=totalDamage;

		// Used to loop back the graph to the beginning so the drawing can be repeated with the same graph.
		if(multiDrawEnabled){
			graphSpecificData.data.push({x:""+(MAX_TIME_SECONDS-0.1), y:0});
			graphSpecificData.data.push({x:"0.0", y:0});
		}
	}
	
	graphSpecificData.addedTotalDamage = totalTotalDamage;
	graphSpecificData.triggeredTiles = stringStoringAllTiles;

	updateTilesetPercentages($("#loadoutName").val());
	updateTilesetProcChart($("#loadoutName").val());

	dpsChart.update();
	dotChart.update();
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




initializeAllClassData();
loadAllCharts();