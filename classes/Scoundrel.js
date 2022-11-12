define(["./Attack"], function (Attack) {
const SINGLE_RANK_MULT = 0.1436;
const SCOUNDREL_CARD_HUMAN_THINKING_TIME = 0.3;
const Data = {
	BASE_DAMAGE: 322.3172/241.75,
	POISON_DAMAGE: 215.447/241.75,

	CHARGE2_BULLET : {
		COUNT : 2,
		TIME : 1.21,
		DAMAGE_MULT : 2.1436,
	},
	CHARGE3_BULLET : {
		COUNT : 3,
		TIME : 1.71,
		DAMAGE_MULT : 3.5375,
	},
	CHARGE4_BULLET : {
		COUNT : 4,
		TIME : 2.21,
		DAMAGE_MULT : 5.2780,
	},

	SINGLE_RANK_MULT: SINGLE_RANK_MULT,
	RANK_V : (1 + SINGLE_RANK_MULT*5),

	POISON_DOT_COUNT: 10,
	POISON_EXTENDED_DOT_COUNT: 14,

	BURN_EFFECT_MULTIPLIER: 0.22725,
	FLAME_CARD_MULTIPLIER: 0.5,
	
	BREAK_SHOT_MULTIPLIER: 1.08,

	TRUE_GAMBLER_EXPIRE_TIME: 18,
	TRUE_GAMBLER_MAX_ACTIVE: 5,

	SUPER_BOOST : 1.1454,

	SCOUNDREL_CARD_SPAWN_TIME : 2.4+SCOUNDREL_CARD_HUMAN_THINKING_TIME, // Guess... Might be wrong...
	SCOUNDREL_CARD_SPAWN_TIME_QUICK_DRAW : 2.2+SCOUNDREL_CARD_HUMAN_THINKING_TIME,

	TILES : {
		POISON_CARD : "A",
		LIGHT_CARD : "SH",
		FLAME_CARD : "B",
		BURN_A_CARD : "F",

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
	Scoundrel: function(data){
		for (const [key, value] of Object.entries(data)) {
			this[key] = value;
		}

		const EFFECT_NONE = -1;
		const EFFECT_BOOST = 1;
		const EFFECT_CHEAT = 2;

		const CARD_NONE = -1;
		const CARD_FROST = 0;
		const CARD_POISON = 1;
		const CARD_ASH = 2;
		const CARD_WEAKNESS = 3;
		const CARD_FLAME = 4;
		const CARD_HEAL = 5;
		
		// Here's where we define what we do with every card. I wrote it so that:
		/*
			Format:
			[
				What do we do with this card? (ACTION_CARD_BURN, ACTION_CARD_USE),
				Do we burn / use this card with a specific card(s)? (CARD_X)
				What's the priority for putting this card on our belt?
			]
		*/
		const ACTION_CARD_BURN = 0;
		const ACTION_CARD_USE = 1;

		const ACTION_CARD_FROST = [ACTION_CARD_BURN, [], 0];
		const ACTION_CARD_HEAL = [ACTION_CARD_BURN, [], 0];
		const ACTION_CARD_ASH = [ACTION_CARD_BURN, [CARD_POISON], 1];
		const ACTION_CARD_WEAKNESS = [ACTION_CARD_BURN, [CARD_POISON], 1];
		const ACTION_CARD_FLAME = [ACTION_CARD_USE, [], 0];
		const ACTION_CARD_POISON = [ACTION_CARD_USE, [CARD_ASH, CARD_WEAKNESS], 2];

		const ACTIONS = [ACTION_CARD_FROST, ACTION_CARD_POISON, ACTION_CARD_ASH, ACTION_CARD_WEAKNESS, ACTION_CARD_FLAME, ACTION_CARD_HEAL];

		const START_STORED = CARD_POISON;
		const START_BURNED = EFFECT_CHEAT;
		const START_USED = CARD_POISON;

		let BASE_CRIT_CHANCE_SCOUNDREL = this.critChance;
		let BASE_CRIT_DAMAGE_SCOUNDREL = this.critDamage;
		print(BASE_CRIT_CHANCE_SCOUNDREL);

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
			if(this.talentlvl10 == "Stack the Deck"){
				newDeck.unshift(CARD_FLAME);
			}
			return newDeck;
		}

		function addToDeckRandom(deck, card){
			var newCardLocation = parseInt(Math.floor(Math.random()*(deck.length+1)));
			deck.splice(newCardLocation, 0, card);
		}

		function resetScoundrel(attack, targetPatternData, calcData, timePassed, iterations) {
			calcData.scoundrel = {};
			calcData.deck = generateRandomDeck();
			// Choose to place a poison card at start of fight in the belt, because it is a very
			// common scenario.
			calcData.storedCard = START_STORED;
			calcData.shootCard = START_USED;
			calcData.burnEffect = START_BURNED;

			// Reset the crit talent remembering.
			calcData.critTalentList = [];
			return 1;
		}

		function determineBurnEffect(card) {
			switch (card){
				case CARD_FROST: return EFFECT_BOOST
				case CARD_HEAL: return EFFECT_BOOST
				case CARD_WEAKNESS: return EFFECT_CHEAT
				case CARD_ASH: return EFFECT_CHEAT
				case CARD_POISON: return EFFECT_NONE
				case CARD_FLAME: return EFFECT_NONE
			}
		}

		function createBurnSet(cards) {
			var burnList = new Set()
			for (let i = 0; i < cards.length; i++) {
				burnList.add(determineBurnEffect(cards[i]));
			}
			return burnList;
		}

		function getCardName(card) {
			switch (card){
				case CARD_FROST: return "Ice Card"
				case CARD_HEAL: return "Light Card"
				case CARD_WEAKNESS: return "Weakness Card"
				case CARD_ASH: return "Ash Card"
				case CARD_POISON: return "Poison Card"
				case CARD_FLAME: return "Flame Card"
				default: return "None"
			}
		}

		function getBurnName(burn) {
			switch (burn){
				case EFFECT_BOOST: return "Empower"
				case EFFECT_CHEAT: return "Duplicate"
				default: return "None"
			}
		}

		function print(msg, iteration) {
			if (iteration == 0) {
				console.log(msg);
			}
		}

		function handleNewSpawnedCard(attack, targetPatternData, calcData, timePassed, iteration) {
			var cardInHand = calcData.deck.shift();
			attack.tiles = "";

			print("Drawn Card: " + getCardName(cardInHand) + "  -  Stored Card: " + getCardName(calcData.storedCard) + "  -  Burned Effect: " + getBurnName(calcData.burnEffect))
			
			

			if (ACTIONS[cardInHand][0] == ACTION_CARD_BURN) { // If you're supposed to burn the card
				if (ACTIONS[cardInHand][1].length == 0) { // If you're supposed to burn the card, but not use it with any particular card
					print(getCardName(cardInHand) + " Burned", iteration);
					calcData.burnEffect = determineBurnEffect(cardInHand);
					attack.tiles = Data.TILES.BURN_A_CARD;
				}
				else if (ACTIONS[cardInHand][1].includes(calcData.storedCard)) { // If you're supposed to burn the card with a specific card used, and your belt has that card
					print(getCardName(cardInHand) + " Burned with " + getCardName(calcData.storedCard), iteration);
					calcData.shootCard = calcData.storedCard;
					calcData.storedCard = CARD_NONE;
					calcData.burnEffect = determineBurnEffect(cardInHand);
					attack.tiles = Data.TILES.BURN_A_CARD;
				}
				else if (calcData.storedCard == CARD_NONE) {  // If you're supposed to burn the card with a specific card used, and your belt is empty
					print(getCardName(cardInHand) + " Stored", iteration);
					calcData.storedCard = cardInHand;
				}
				else if (ACTIONS[cardInHand][2] <= ACTIONS[calcData.storedCard][2]) { // If you're supposed to burn the card with a specific card used, and your belt has a higher priority card
					print(getCardName(cardInHand) + " Burned as Belted Card is " + getCardName(calcData.storedCard), iteration);
					calcData.burnEffect = determineBurnEffect(cardInHand);
					attack.tiles = Data.TILES.BURN_A_CARD;
				}
				else if (ACTIONS[cardInHand][2] > ACTIONS[calcData.storedCard][2]) { // If you're supposed to burn the card with a specific card used, and your belt has a higher priority card
					if (ACTIONS[calcData.storedCard][0] == ACTION_CARD_BURN) {
						print(getCardName(calcData.storedCard) + " Burned as Drawn Card is " + getCardName(cardInHand), iteration);
						calcData.burnEffect = determineBurnEffect(calcData.storedCard);
						calcData.storedCard = cardInHand;
						attack.tiles = Data.TILES.BURN_A_CARD;
					}
					else if (ACTIONS[calcData.storedCard][0] == ACTION_CARD_USE) {
						print(getCardName(calcData.storedCard) + " Used as Drawn Card is " + getCardName(cardInHand), iteration);
						calcData.shootCard = calcData.storedCard;
						calcData.storedCard = cardInHand;
					}
				}
			}

			else if (ACTIONS[cardInHand][0] == ACTION_CARD_USE) {
				if (ACTIONS[cardInHand][1].length == 0) { // If you're supposed to use the card, but not use it with any particular effect
					print(getCardName(cardInHand) + " Used", iteration);
					calcData.shootCard = cardInHand;
				}
				else if (createBurnSet(ACTIONS[cardInHand][1]).has(calcData.burnEffect)) { // If you're supposed to use the card with a specific card burned, and that card is already burned
					print(getCardName(cardInHand) + " Used with " + getBurnName(calcData.burnEffect) + " effect", iteration);
					calcData.shootCard = cardInHand;
				}
				else if (calcData.storedCard == CARD_NONE) {  // If you're supposed to use the card with a specific card used, and your belt is empty
					print(getCardName(cardInHand) + " Stored", iteration);
					calcData.storedCard = cardInHand;
				}
				else if (createBurnSet(ACTIONS[cardInHand][1]).has(determineBurnEffect(calcData.storedCard))) { // If you're supposed to use the card with a specific card burned, and your belt has that card
					print(getCardName(cardInHand) + " Used with " + getCardName(calcData.storedCard), iteration);
					calcData.shootCard = cardInHand;
					calcData.burnEffect = determineBurnEffect(calcData.storedCard);
					calcData.storedCard = CARD_NONE;
					attack.tiles = Data.TILES.BURN_A_CARD;
				}
				else if (ACTIONS[cardInHand][2] <= ACTIONS[calcData.storedCard][2]) { // If you're supposed to use the card with a specific card burned, and your belt has a higher priority card
					print(getCardName(cardInHand) + " Used as Belted Card is " + getCardName(calcData.storedCard), iteration);
					calcData.shootCard = cardInHand;
				}
				else if (ACTIONS[cardInHand][2] > ACTIONS[calcData.storedCard][2]) { // If you're supposed to burn the card with a specific card used, and your belt has a higher priority card
					if (ACTIONS[calcData.storedCard][0] == ACTION_CARD_BURN) {
						print(getCardName(calcData.storedCard) + " Burned as Drawn Card is " + getCardName(cardInHand), iteration);
						calcData.burnEffect = determineBurnEffect(calcData.storedCard);
						calcData.storedCard = cardInHand;
						attack.tiles = Data.TILES.BURN_A_CARD;
					}
					else if (ACTIONS[calcData.storedCard][0] == ACTION_CARD_USE) {
						print(getCardName(calcData.storedCard) + " Used as Drawn Card is " + getCardName(cardInHand), iteration);
						calcData.shootCard = calcData.storedCard;
						calcData.storedCard = cardInHand;
					}
				}
			}

			
			// Make a new deck if there are no cards left in the deck.
			if(calcData.deck.length == 0){
				print(" - DECK RESETS")
				calcData.deck = generateRandomDeck();
			}
			return 1;
		}

		function updateCritChance(attack, targetPatternData, calcData, timePassed, iteration){
			// Remove expired crit talent icons.
			while(true){
				var target = calcData.critTalentList[0];
				if(target == undefined || timePassed-target < Data.TRUE_GAMBLER_EXPIRE_TIME){
					break;
				}
				calcData.critTalentList.shift();
			}
			var increasedChance = 0.1 * calcData.critTalentList.length;
			calcData.critChance = BASE_CRIT_CHANCE_SCOUNDREL + increasedChance;
			calcData.dpsMultiplierFromCritting = 1 + calcData.critChance*(BASE_CRIT_DAMAGE_SCOUNDREL-1);
			return 1;
		}

		function increaseCritChance(attack, targetPatternData, calcData, timePassed, iteration){
			if(attack.isCritting){
				if(calcData.critTalentList.length >= Data.TRUE_GAMBLER_MAX_ACTIVE){
					calcData.critTalentList.shift(); // Remove first item in the list.
				}
				calcData.critTalentList.push(timePassed);
			}
			return 1;
		}

		var SCOUNDREL_NEW_SPAWNED_CARD = new Attack.Attack(0,  0, true,  	0, 0, 0, 	0.00, 0, 0, 	0, 4,"","");
		var SCOUNDREL_NEW_SPAWNED_POISON = new Attack.Attack(0,0, true,  	Data.POISON_DAMAGE*Data.RANK_V, 0, 10, 	0.00, 0, 0, 	0, 3,Data.TILES.POISON_CARD,"");
		function useCard(attack, targetPatternData, calcData, timePassed, iteration) {
			updateCritChance(attack, targetPatternData, calcData, timePassed, iteration);

			var boost = 1;

			// Add damage to the rotation when a card is being used to shoot.
			if(calcData.shootCard != CARD_NONE){
				if(calcData.burnEffect == EFFECT_BOOST){
					boost += Data.BURN_EFFECT_MULTIPLIER;
				}
				else if(calcData.burnEffect == EFFECT_CHEAT){
					addToDeckRandom(calcData.deck, calcData.shootCard);
				}

				// Add a new poison DoT right after the attack with the poison card.
				if(calcData.shootCard == CARD_POISON){
					var newAttack = clone(SCOUNDREL_NEW_SPAWNED_POISON);
					if(calcData.burnEffect == EFFECT_BOOST){
						newAttack.dotTimes = Data.POISON_EXTENDED_DOT_COUNT;
					} else{
						newAttack.dotTimes = Data.POISON_DOT_COUNT;
					}
					newAttack.dotDamage*=calcData.weaponMultiplier;
					targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
				}
				// Add the flame damage to the card.
				else if(calcData.shootCard == CARD_FLAME){
					boost += Data.FLAME_CARD_MULTIPLIER; // Increase total damage from flame itself.
					SCOUNDREL_NEW_SPAWNED_CARD.tiles = Data.TILES.FLAME_CARD;
					var newAttack = clone(SCOUNDREL_NEW_SPAWNED_CARD);
					targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
				} else if(calcData.shootCard == CARD_HEAL){
					SCOUNDREL_NEW_SPAWNED_CARD.tiles = DATA.TILES.LIGHT_CARD;
					var newAttack = clone(SCOUNDREL_NEW_SPAWNED_CARD);
					targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
				}
				calcData.burnEffect = EFFECT_NONE;
			}
			calcData.shootCard = CARD_NONE;
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
			const dotIncrease = this.dotIncrease || 0;

			if(attackData.bulletCount === "MAX"){
				if(this.talentlvl20 === "One Basket"){
					attackData.bulletCount = 4;
				} else{
					attackData.bulletCount = 3;
				}
			}

			if(attackData.bulletCount > 0){
				damage = Data.BASE_DAMAGE;//5851;
				damage*=(1+this.projectileIncrease);

				if(attackData.bulletCount == Data.CHARGE2_BULLET.COUNT){
					damage *= Data.CHARGE2_BULLET.DAMAGE_MULT;
					if(time == undefined){
						time = Data.CHARGE2_BULLET.TIME;
					}
				}
				if(attackData.bulletCount == Data.CHARGE3_BULLET.COUNT){
					damage *= Data.CHARGE3_BULLET.DAMAGE_MULT;
					if(time == undefined){
						time = Data.CHARGE3_BULLET.TIME;
					}
					if(this.talentlvl20 === "Break Shot"){
						dmgBoostAmount = Data.BREAK_SHOT_MULTIPLIER;
						dmgBoostStayTime = 10;
						dmgBoostMaxActive = 1;
					}
				}
				if(attackData.bulletCount == Data.CHARGE4_BULLET.COUNT){
					damage *= Data.CHARGE4_BULLET.DAMAGE_MULT;
					if(time == undefined){
						time = Data.CHARGE4_BULLET.TIME;
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
			if(attackData.type === "Poison"){
				dotDamage = Data.POISON_DAMAGE*(1+dotIncrease);
				dotTimes = Data.POISON_DOT_COUNT;
				tiles = Data.TILES.POISON_CARD;
			}
			if(time == undefined){
				time = 0;
			}
			if(attackData.reset === true){
				preModifierFuncs = resetScoundrel.bind({});
				attackID = 3;
			}
			if(attackData.tryGrabCard === true){
				const drawTime = this.talentlvl10 === "Quick Draw" ? Data.SCOUNDREL_CARD_SPAWN_TIME_QUICK_DRAW : Data.SCOUNDREL_CARD_SPAWN_TIME;
				if(time < drawTime){
					time = drawTime;
				}
				preModifierFuncs = handleNewSpawnedCard.bind({});
			}
			const RANK_MULT = (1 + Data.SINGLE_RANK_MULT*endRank);
			damage *= RANK_MULT;
			damage *= this.strBoost;
			dotDamage *= RANK_MULT;
			dotDamage *= this.intBoost;

			if(attackData.super === true){
				damage *= Data.SUPER_BOOST;
			}

			return new Attack.Attack(time, damage, CAN_CRIT, dotDamage, dotTimes, dotMaxActive, dmgBoostAmount, dmgBoostStayTime, dmgBoostMaxActive, hitCount, attackID, tiles, dotTiles, spawnsNormalAttack, modifierFuncs, preModifierFuncs);
		};
	}
}
});
