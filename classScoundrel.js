var savedScoundrel;
function Scoundrel(data){
	for (const [key, value] of Object.entries(data)) {
		this[key] = value;
	}

	const RANK_V = (1 + 0.1436*5);
	const SUPER_BOOST_SCOUNDREL = 1.1454;

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

var ClassScoundrel = {
	getData: function() {
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
};