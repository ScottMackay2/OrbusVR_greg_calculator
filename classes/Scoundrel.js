define(["./Attack"], function (Attack) {
const SINGLE_RANK_MULT = 0.1436;
const Data = {
	BASE_DAMAGE: 322.3172/241.75,
	POISON_DAMAGE: 215.447/241.75,

	CHARGE2_MULTIPLIER: 2.1436,
	CHARGE3_MULTIPLIER: 3.5375,
	CHARGE4_MULTIPLIER: 5.2780,

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
};
return {
	Data: Data,
	Scoundrel: function(data){
		for (const [key, value] of Object.entries(data)) {
			this[key] = value;
		}

		const SCOUNDREL_HUMAN_THINKING_TIME = 0.3;
		const SCOUNDREL_CARD_TIME = 2.2+SCOUNDREL_HUMAN_THINKING_TIME;

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
		
		let BASE_CRIT_CHANCE_SCOUNDREL = this.critChance;
		let BASE_CRIT_DAMAGE_SCOUNDREL = this.critDamage;
		console.log(BASE_CRIT_CHANCE_SCOUNDREL);

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

		function updateCritChance(attack, targetPatternData, graphSpecificData, timePassed){
			// Remove expired crit talent icons.
			while(true){
				var target = graphSpecificData.classData.critTalentList[0];
				if(target == undefined || timePassed-target < Data.TRUE_GAMBLER_EXPIRE_TIME){
					break;
				}
				graphSpecificData.classData.critTalentList.shift();
			}
			var increasedChance = 0.1 * graphSpecificData.classData.critTalentList.length;
			graphSpecificData.critChance = BASE_CRIT_CHANCE_SCOUNDREL + increasedChance;
			graphSpecificData.dpsMultiplierFromCritting = 1 + graphSpecificData.critChance*(BASE_CRIT_DAMAGE_SCOUNDREL-1);
			return 1;
		}

		function increaseCritChance(attack, targetPatternData, graphSpecificData, timePassed){
			if(attack.isCritting){
				if(graphSpecificData.classData.critTalentList.length >= Data.TRUE_GAMBLER_MAX_ACTIVE){
					graphSpecificData.classData.critTalentList.shift(); // Remove first item in the list.
				}
				graphSpecificData.classData.critTalentList.push(timePassed);
			}
			return 1;
		}

		var SCOUNDREL_NEW_SPAWNED_CARD = new Attack.Attack(0,  0, true,  	0, 0, 0, 	0.00, 0, 0, 	0, 4,"","");
		var SCOUNDREL_NEW_SPAWNED_POISON = new Attack.Attack(0,0, true,  	Data.POISON_DAMAGE*Data.RANK_V, 0, 10, 	0.00, 0, 0, 	0, 3,"A","");
		function useCard(attack, targetPatternData, graphSpecificData, timePassed) {
			updateCritChance(attack, targetPatternData, graphSpecificData, timePassed);

			var boost = 1;

			// Add damage to the rotation when a card is being used to shoot.
			if(graphSpecificData.shootCard != CARD_NONE){
				if(graphSpecificData.burnEffect == EFFECT_BOOST){
					boost += Data.BURN_EFFECT_MULTIPLIER;
				}
				else if(graphSpecificData.burnEffect == EFFECT_CHEAT){
					addToDeckRandom(graphSpecificData.deck, graphSpecificData.shootCard);
				}

				// Add a new poison DoT right after the attack with the poison card.
				if(graphSpecificData.shootCard == CARD_POISON){
					var newAttack = clone(SCOUNDREL_NEW_SPAWNED_POISON);
					if(graphSpecificData.burnEffect == EFFECT_BOOST){
						newAttack.dotTimes = Data.POISON_EXTENDED_DOT_COUNT;
					} else{
						newAttack.dotTimes = Data.POISON_DOT_COUNT;
					}
					newAttack.dotDamage*=graphSpecificData.weaponMultiplier;
					targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
				}
				// Add the flame damage to the card.
				else if(graphSpecificData.shootCard == CARD_FLAME){
					boost += Data.FLAME_CARD_MULTIPLIER; // Increase total damage from flame itself.
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

				if(attackData.bulletCount == 2){
					damage *= Data.CHARGE2_MULTIPLIER;
					if(time == undefined){
						time = 1.21;
					}
				}
				if(attackData.bulletCount == 3){
					damage *= Data.CHARGE3_MULTIPLIER;
					if(time == undefined){
						time = 1.71;
					}
					if(this.talentlvl20 === "Break Shot"){
						dmgBoostAmount = Data.BREAK_SHOT_MULTIPLIER;
						dmgBoostStayTime = 10;
						dmgBoostMaxActive = 1;
					}
				}
				if(attackData.bulletCount == 4){
					damage *= Data.CHARGE4_MULTIPLIER;
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
			if(attackData.type === "Poison"){
				dotDamage = Data.POISON_DAMAGE*(1+dotIncrease);
				dotTimes = Data.POISON_DOT_COUNT;
				tiles = "A";
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