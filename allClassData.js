// Different attack types have different type of effect. The dps code will make some attacks do different things.
const ATTACK_NORMAL = 0;
const ATTACK_DOT = 1;
const ATTACK_HITS_PER_SECOND = 3;

var dpsChart;
function initializeAllClassData(){
	const ICEHEART_BOOST = 1.05;

	const MAX_ADDED_CRIT_DMG_FROM_ARMOUR = 0.08; // 0.02 = 2% every armour piece. With 4 armour pieces.
	const MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR = 0.04; // 0.01 = 1% every armour piece. With 4 armour pieces.

	const RING_ADDED_CRIT_DMG_EMPOWERED = 0.03;
	const RING_ADDED_CRIT_DMG = 70;
	const BASE_CRIT_AMOUNT = 1.5+RING_ADDED_CRIT_DMG_EMPOWERED;
	const BASE_CRIT_CHANCE = (150+RING_ADDED_CRIT_DMG+(usingPotsFlag ? 250 : 0))/150*0.1; // 150 = 0.1 = 10% more crit chance.

	const STR_INT_BOOST = 1+(165 + (usingPotsFlag ? 250 : 0))/150*0.05; // 150 = 0.05x = 5% more damage from the str/int stat.

	const BLEED_DEFAULT_DMG_INC = 2.48;
	const BLEED_CHANCE_PERCENT = 0.02;
	const BLEED_ACTUAL_DMG_INC = BLEED_DEFAULT_DMG_INC*BLEED_CHANCE_PERCENT;

	// ####################################################################################
	// Mage
	const PROJECTILE_BOOST_MAGE = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
	const CRIT_AMOUNT_MAGE = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
	const CRIT_CHANCE_MAGE = BASE_CRIT_CHANCE;
	const CRIT_DMG_INC_MAGE = 1+CRIT_CHANCE_MAGE*(CRIT_AMOUNT_MAGE-1);
	const BLEED_BOOST_MAGE = 1+BLEED_ACTUAL_DMG_INC*CRIT_DMG_INC_MAGE;
	const NORMAL_BOOST_MAGE = BLEED_BOOST_MAGE * PROJECTILE_BOOST_MAGE;
	const SELFISH_STREAK_BOOST_MAGE = 1.08;

	const RUNIC_DIVERSITY_MAGE = 1.2727;
	const AFFINITY_FIRE_BOOST_MAGE = 1.136;

	// ####################################################################################
	// Shaman
	const PROJECTILE_BOOST_SHAMAN = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
	const CRIT_AMOUNT_SHAMAN = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
	const CRIT_CHANCE_SHAMAN = BASE_CRIT_CHANCE;
	const CRIT_DMG_INC_SHAMAN = 1+CRIT_CHANCE_SHAMAN*(CRIT_AMOUNT_SHAMAN-1);
	const BLEED_BOOST_SHAMAN = 1+BLEED_ACTUAL_DMG_INC*CRIT_DMG_INC_SHAMAN;
	const NORMAL_BOOST_SHAMAN = BLEED_BOOST_SHAMAN * PROJECTILE_BOOST_SHAMAN;

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

	const NEW_SPAWNED_LIGHTNING = new Attack(SHAMAN_RETHROW_LIGHTING_TIME,  	19711*NORMAL_BOOST_SHAMAN, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"X","", lightningSpawnMoreAttacks);
	function lightningSpawnMoreAttacks(attack, targetPatternData, graphSpecificData, timePassed) {
		if(attack.isCritting) {
			var newAttack = clone(NEW_SPAWNED_LIGHTNING);
			targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
		}
		return 1;
	}
	// ####################################################################################
	// Scoundrel
	const TALENT_ADDED_CRIT_SCOUNDREL = 0.5;
	const PROJECTILE_BOOST_SCOUNDREL = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
	const CRIT_AMOUNT_SCOUNDREL = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
	const CRIT_CHANCE_SCOUNDREL = BASE_CRIT_CHANCE;
	const CRIT_DMG_INC_SCOUNDREL_NO_TALENT = 1+(CRIT_CHANCE_SCOUNDREL)*(CRIT_AMOUNT_SCOUNDREL-1);
	const CRIT_DMG_INC_SCOUNDREL = 1+(CRIT_CHANCE_SCOUNDREL+TALENT_ADDED_CRIT_SCOUNDREL)*(CRIT_AMOUNT_SCOUNDREL-1);
	const BLEED_BOOST_SCOUNDREL = 1+BLEED_ACTUAL_DMG_INC*CRIT_DMG_INC_SCOUNDREL;
	const NORMAL_BOOST_SCOUNDREL = BLEED_BOOST_SCOUNDREL * PROJECTILE_BOOST_SCOUNDREL;
	// The boost should be 1.25x. Sadly having a rank V downgrades it to 1.1454x.
	const SUPER_BOOST_SCOUNDREL = 1.1454;

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
	// // then 8 cards too. This means the time of a single card needs to be reduced tor
	// const CARD_TIME_REDUCTION_SCOUNDREL = 1.0 / 8.0 * 7.9473;

	const SCOUNDREL_HUMAN_THINKING_TIME = 0.3;
	const SCOUNDREL_CARD_TIME = 3.05+SCOUNDREL_HUMAN_THINKING_TIME;


	const EFFECT_BOOST = 1;
	const EFFECT_CHEAT = 2;

	const CARD_FROST = 1;
	const CARD_POISON = 2;
	const CARD_ASH = 3;
	const CARD_WEAKNESS = 4;
	const CARD_FLAME = 5;
	const CARD_HEAL = 6;

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
		return shuffleArray([CARD_FROST, CARD_POISON, CARD_ASH, CARD_WEAKNESS, CARD_FLAME, CARD_HEAL]);
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
		graphSpecificData.shootCard = -1;
		graphSpecificData.burnEffect = -1;

		// Reset the crit talent remembering.
		graphSpecificData.classData.critTalentList = [];
		return 1;
	}

	const BURN_CARD_TILE = "F";
	function spawnNewCard(attack, targetPatternData, graphSpecificData, timePassed) {
		// Grab first card from the deck and remove it from the deck.	var card = graphSpecificData.deck.shift();
		var card = graphSpecificData.deck.shift();
		attack.tiles = "";

		// Place the card in the most optimal position depending on what card and what state the deck is.
		if(card == CARD_FROST || card == CARD_HEAL){
			if(graphSpecificData.burnEffect == EFFECT_BOOST){
				graphSpecificData.shootCard = card;
			} else{
				graphSpecificData.burnEffect = EFFECT_BOOST;
				attack.tiles = BURN_CARD_TILE;
			}
		}
		else if(card == CARD_POISON){
			if(graphSpecificData.storedCard == CARD_ASH || graphSpecificData.storedCard == CARD_WEAKNESS){
				graphSpecificData.shootCard = card;
				graphSpecificData.storedCard = -1;
				graphSpecificData.burnEffect = EFFECT_CHEAT;
				attack.tiles = BURN_CARD_TILE;
			} else if(graphSpecificData.storedCard == CARD_POISON){
				graphSpecificData.shootCard = card;
			} 
			else{
				graphSpecificData.storedCard = card;
			}
		}
		else if(card == CARD_ASH || card == CARD_WEAKNESS){
			if(graphSpecificData.storedCard == CARD_ASH || graphSpecificData.storedCard == CARD_WEAKNESS){
				graphSpecificData.shootCard = card;
			}
			else if(graphSpecificData.storedCard == CARD_POISON){
				graphSpecificData.shootCard = CARD_POISON;
				graphSpecificData.storedCard = -1;
				graphSpecificData.burnEffect = EFFECT_CHEAT;
				attack.tiles = BURN_CARD_TILE;
			}
			else{
				graphSpecificData.storedCard = card;
			}
		}
		else if(card == CARD_FLAME){
			graphSpecificData.shootCard = card;
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
			// console.log("EXPIRE");
		}
		var increasedChance = 0.1 * graphSpecificData.classData.critTalentList.length;
		graphSpecificData.classData.critChance = CRIT_CHANCE_SCOUNDREL + increasedChance;
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
	var SCOUNDREL_NEW_SPAWNED_POISON = new Attack(0,  		0, true,  	3911*1.718, 10, 10, 	0.00, 0, 0, 	0, 3,"A","");
	function useCard(attack, targetPatternData, graphSpecificData, timePassed) {
		var boost = updateCritChance(attack, targetPatternData, graphSpecificData, timePassed);

		// Add damage to the rotation when a card is being used to shoot.
		if(graphSpecificData.shootCard != -1){
			// Add a new poison DoT right after the attack of the
			if(graphSpecificData.shootCard == CARD_POISON){
				graphSpecificData.numPoisonCards += 1;

				if(graphSpecificData.burnEffect == EFFECT_CHEAT){
					addToDeckRandom(graphSpecificData.deck, CARD_POISON);
				}
				else if(graphSpecificData.burnEffect == EFFECT_BOOST){
					SCOUNDREL_NEW_SPAWNED_POISON.dotTimes = 14;
				} else{
					SCOUNDREL_NEW_SPAWNED_POISON.dotTimes = 10;
				}
				var newAttack = clone(SCOUNDREL_NEW_SPAWNED_POISON);
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			}
			// Add the flame damage to the card.
			else if(graphSpecificData.shootCard == CARD_FLAME){
				boost *= 1.5; // Increase total damage from flame itself.d
				SCOUNDREL_NEW_SPAWNED_CARD.tiles = "B";
				var newAttack = clone(SCOUNDREL_NEW_SPAWNED_CARD);
				graphSpecificData.numBurnCards += 1;
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			} else if(graphSpecificData.shootCard == CARD_HEAL){
				SCOUNDREL_NEW_SPAWNED_CARD.tiles = "SH";
				var newAttack = clone(SCOUNDREL_NEW_SPAWNED_CARD);
				targetPatternData.pattern.splice(targetPatternData.patternIdx+1, 0, newAttack);
			}
			graphSpecificData.burnEffect = -1;
		}
		graphSpecificData.shootCard = -1;
		return boost;
	}



	// ####################################################################################
	// Ranger
	const PROJECTILE_BOOST_RANGER = 1+MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR;
	const CRIT_AMOUNT_RANGER = BASE_CRIT_AMOUNT+MAX_ADDED_CRIT_DMG_FROM_ARMOUR;
	const CRIT_CHANCE_RANGER = BASE_CRIT_CHANCE;
	const CRIT_DMG_INC_RANGER = 1+CRIT_CHANCE_RANGER*(CRIT_AMOUNT_RANGER-1);
	const BLEED_BOOST_RANGER = 1+BLEED_ACTUAL_DMG_INC*CRIT_DMG_INC_RANGER;
	const NORMAL_BOOST_RANGER = BLEED_BOOST_RANGER * PROJECTILE_BOOST_RANGER;
	const RANGER_6_GLOBES = 41129/25900;
	const RANGER_2_GLOBES = (25900+((41129-25900)*2/6))/25900;
	const ARROW_SIGHT_RANGER = 1.10; // Stand at-least 30 meters away talent. Go get a default 10% boost.


	var mageData = {
		attackTypes : {
			// Default boost of class
			'X'    : new Attack(0.00,		0, true,												0, 0, 0,			SELFISH_STREAK_BOOST_MAGE*STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),
			// Fireball
			'b'    : new Attack(0.43,		15140*NORMAL_BOOST_MAGE, true,							0, 0, 0,			0.00, 0, 0, 	1, 0,"B",""),
			// Fireball empowered
			'B'    : new Attack(0.43,		15140*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	0, 0, 0,			0.00, 0, 0, 	1, 0,"B",""),
			// Frost boosted by fireball
			'f'    : new Attack(0.43,		9460*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	0, 0, 0,			0.00, 0, 0, 	1, 0,"F",""),
			// Frost boosted by runic diversity (3th spell)
			'F'    : new Attack(0.43,		9460*RUNIC_DIVERSITY_MAGE*NORMAL_BOOST_MAGE, true,		0, 0, 0,			0.00, 0, 0, 	1, 0,"F",""),
			// Frost boosted by runic diversity and fireball.
			'V'    : new Attack(0.43,		9460*RUNIC_DIVERSITY_MAGE*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	0, 0, 0,		0.00, 0, 0, 	1, 0,"F",""),

			// Affliction affinity fireball
			'a'    : new Attack(0.55,		3542*AFFINITY_FIRE_BOOST_MAGE*NORMAL_BOOST_MAGE, true,	3442, 12, 3,		0.05, 8, 2, 	1, 1,"A",""),
			// Affliction runic diversity and frost boosted
			'A'    : new Attack(0.55,		3542*RUNIC_DIVERSITY_MAGE*NORMAL_BOOST_MAGE, true,		3442, 15, 3,		0.05, 8, 2, 	1, 1,"A",""),
			// Renew (constant heal tile)
			'h'    : new Attack(0.0,		0, true,												0, 20, 1,			0.00, 0, 0, 	0, 0,"","H"),
			// Time spacing (doing nothing)
			'#'    : new Attack(0.1,		0, true,												0, 0, 0,			0.00, 0, 0, 	0, 0,"",""), 
		},
		critChance : CRIT_CHANCE_MAGE,
		critDamage : CRIT_AMOUNT_MAGE
	};

	// rank V (71.897% increase) Most scoundrel damage is pre-calculated to have the rank V dps increase.
	var scoundrelData = {
		attackTypes : {
			// Default boost of class
			'X'    : new Attack(0.00,  		0, true,															0, 0, 0, 		STR_INT_BOOST-1, 999, 3, 	0, 3,"","", resetScoundrel),

			// Normal bullet with rank V boost
			'B'    : new Attack(0.22,  		5851*1.718*NORMAL_BOOST_SCOUNDREL, true, 							0, 0, 0, 		0.00, 0, 0, 	1, 0,"","", increaseCritChance, updateCritChance),
			
			// Charged shot (2 bullet charge) with rank V boost
			'c'    : new Attack(1.21,  		5851*1.718*2.14*NORMAL_BOOST_SCOUNDREL, true,  						0, 0, 0, 		0.00, 0, 0, 	1, 0,"","", increaseCritChance, useCard),
			// Charged shot (full 3 bullet charge) without a rank as first shot taking no time.
			'f'    : new Attack(0.00,  		5851*3*NORMAL_BOOST_SCOUNDREL, true,  								0, 0, 0, 		0.08, 10, 1, 	1, 0,"","", increaseCritChance, useCard),
			// Charged shot (full 3 bullet charge) with rank V boost
			'C'    : new Attack(1.71,  		5851*1.718*3.53*NORMAL_BOOST_SCOUNDREL, true,  						0, 0, 0, 		0.08, 10, 1, 	1, 0,"","", increaseCritChance, useCard),
			// Charged shot (delayed 3 bullet charge for tileset testing) with rank V boost
			'F'    : new Attack(2.11,  		5851*1.718*3.53*NORMAL_BOOST_SCOUNDREL, true,  						0, 0, 0, 		0.08, 10, 1, 	1, 0,"","", increaseCritChance, useCard),

			// Normal bullet while having the super activated. With rank V boost
			's'    : new Attack(0.22,  		SUPER_BOOST_SCOUNDREL*5851*1.718*NORMAL_BOOST_SCOUNDREL, true, 	0, 0, 0, 		0.00, 0, 0, 	1, 0,"","", increaseCritChance, updateCritChance),
			// Charged shot while having the super activated. With rank V boost
			'S'    : new Attack(1.71,  		SUPER_BOOST_SCOUNDREL*5851*1.718*3.53*NORMAL_BOOST_SCOUNDREL, true, 	0, 0, 0, 	0.08, 10, 1, 	1, 0,"","", increaseCritChance, useCard),

			// (D)eck (action that spawns a new card and do something with it. Then it will be used on the charged shot)
			'D'    : new Attack(SCOUNDREL_CARD_TIME,  		0, true,  									0.00, 0, 0, 	0.00, 0, 0, 	0, 0,"","", spawnNewCard), // Nothing card
		},
		critChance : CRIT_CHANCE_SCOUNDREL,
		critDamage : CRIT_AMOUNT_SCOUNDREL,
		critTalentList : []
	};

	var shamanData = {
		attackTypes : {
			// Default boost of class
			'X'    : new Attack(0.00,  							0, true,  													0, 0, 0, 		STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),

			// Place totem. (triggers a tile)
			'T'    : new Attack(0,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"T",""),

			// Lava pulse (very first placement relative to fight start no time passed)
			'p'    : new Attack(0.00,  							8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),
			// Lava pulse default timing.
			'P'    : new Attack(SHAMAN_PULSE_ATTACK_TIME,  		8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),
			// Lava pulse next time replaced (a shorter timeframe between lava pulses because it got replaced)
			'A'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	8448*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"P",""),

			// Stun default timing
			's'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		6257*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0,		0.00, 0, 0, 	1, 0,"S",""),
			// Stun after replacing totems (auto crit + faster timing)
			'S'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	6257*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		0, 0, 0, 		0.00, 0, 0, 	1, 0,"S",""),

			// Lightning (with shorter timeframe because spawned relative to previous lightning crit, used as spawn for new lightnings)
			'i'    : NEW_SPAWNED_LIGHTNING,
			// Lightning which can have a chance to spawn a new lightning with default time spacing.
			'L'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		19711*NORMAL_BOOST_SHAMAN, true,  							0, 0, 0, 		0.00, 0, 0, 	1, 0,"X","", lightningSpawnMoreAttacks),
			// First lightning after replacing totems (auto crit + faster timing)
			'I'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	19711*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		0, 0, 0, 		0.00, 0, 0, 	1, 0,"X",""),
			
			// Fire default timing.
			'F'    : new Attack(SHAMAN_ORB_ATTACK_TIME,  		33165*NORMAL_BOOST_SHAMAN, true,  							2347, 3, 1, 	0.00, 0, 0, 	1, 2,"B",""),
			// Fire after placing totems again (auto crit + faster timing)
			'V'    : new Attack(SHAMAN_REPLACE_ATTACK_TIME,  	33165*CRIT_AMOUNT_SHAMAN*NORMAL_BOOST_SHAMAN, false,  		2347, 3, 1, 	0.00, 0, 0, 	1, 2,"B",""),

			// # small timing used to offset the orb throwing between the different totems. @ is a bigger jump in time.
			'#'    : new Attack(0.1,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"",""),
			'@'    : new Attack(0.5,  							0, true,  													0, 0, 0, 		0.00, 0, 0, 	0, 0,"",""),
		},
		critChance : CRIT_CHANCE_SHAMAN,
		critDamage : CRIT_AMOUNT_SHAMAN
	};

	const ARROW_8 = 0.817;
	const ARROW_9 = 0.92; // People are less good in timing 0.9 arrows exactly, so adding +0.02 for the perfect human.
	var rangerData = {
		attackTypes : {
			// Default boost of class
			'X'    : new Attack(0.00,  				0, true,															0, 0, 0, 			ARROW_SIGHT_RANGER*STR_INT_BOOST-1, 999, 3, 	0, 3,"",""),

			// The nothing arrow (shot as fast as possible to trigger tilesets and ofset hits for charged strikes)
			'o'    : new Attack(0.02,  				1, true,															0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),

			//@@ Normal arrows @@//
			// Normal 0.8 second arrow (before full globes)
			'e'    : new Attack(ARROW_8,  			11633*NORMAL_BOOST_RANGER, true,  									0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Normal 0.8 second arrow
			's'    : new Attack(ARROW_8,  			11633*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Weakspot 0.8 second arrow (1.5x) 
			'S'    : new Attack(ARROW_8,  			11633*1.5*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// 0.9 second arrow
			'z'    : new Attack(ARROW_9,  			12734*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// 0.9 second arrow on weakspot (1.5x)
			'Z'    : new Attack(ARROW_9,  			12734*1.5*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),

			//@@ (Time bended normal arrows with curves) @@//
			// 0.9 second arrow affected by the previous curved charged shot. (this arrow is not curved itself)
			'b'    : new Attack(ARROW_9-0.1,		12734*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// 0.9 second arrow time increased by a curved shot.
			'c'    : new Attack(ARROW_9+0.1,		12734*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Normal 0.8 second arrow (time decreased by prev arrow)
			'd'    : new Attack(ARROW_8-0.1,  		11633*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Normal 0.8 second arrow (time decreased by prev arrow)(1.5x crit spot)
			'D'    : new Attack(ARROW_8-0.1,		11633*1.5*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			
			//@@ Charged shots. @@//
			// 0.8 charged piercing on weakspot (2x damage)
			'a'    : new Attack(1.1+ARROW_9,  		30304*1.825*NORMAL_BOOST_RANGER*RANGER_2_GLOBES, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),
			// 0.8 charged piercing on weakspot (2x damage)
			'A'    : new Attack(1.1+ARROW_9,  		30304*1.825*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),
			// 0.8 charged piercing on weakspot (2x damage)
			'O'    : new Attack(1+ARROW_8,  		29629*1.825*NORMAL_BOOST_RANGER*RANGER_2_GLOBES, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),
			// 0.8 second charged piercing
			'T'    : new Attack(1+ARROW_8,  		29629*1.825*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.05, 30, 1, 	1, 1,"F",""),
			// 0.8 charged piercing on weakspot (2x damage)
			'V'    : new Attack(1+ARROW_8,  		29629*1.825*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  				0, 0, 0, 			0.05, 30, 1, 	2, 1,"F",""),

			//@@ Poison stuff @@//
			// Poison arrow shot at 0.8 seconds
			'u'    : new Attack(ARROW_8,  			11633*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					4380*RANGER_6_GLOBES, 			8, 10, 			0.00, 0, 0, 	2, 2,"A",""),
			// Poison arrow shot at 0.8 seconds but used as 0 timeframe shot that stays the whole fight (This was used to proof the dps decrease amount on not shot on cooldown directly)
			'U'    : new Attack(0.00,  				11633*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  					4380*8/12.5*RANGER_6_GLOBES, 	999, 10, 		0.00, 0, 0, 	0, 0,"",""),

			//@@ Super arrows. @@//
			// Super 0.8 arrow
			'w'    : new Attack(ARROW_8,  			(11633+12014)*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Super 0.8 arrow on weakspot 1.5x
			'W'    : new Attack(ARROW_8,  			(11633+12014)*1.5*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  		0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Super charged piercing weakspot hit
			'Y'    : new Attack(1+ARROW_8,  		(29629+12014)*1.825*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  		0, 0, 0, 			0.00, 0, 0, 	2, 0,"F",""),
			// Super 0.8 arrow
			'p'    : new Attack(ARROW_8,  			(15362+12014)*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),

			// Super charged piercing weakspot hit with a curve.
			'G'    : new Attack(1.1+ARROW_9,  		(30304+12014)*1.825*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  		0, 0, 0, 			0.00, 0, 0, 	2, 0,"F",""),
			// 0.9 second arrow affected by the previous curved charged shot.
			'h'    : new Attack(ARROW_9-0.1,		(12734+12014)*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// 0.9 second arrow time increased by a curved shot.
			'i'    : new Attack(ARROW_9+0.1,		(12734+12014)*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
			// Normal 0.8 second arrow (time decreased by prev arrow)
			'j'    : new Attack(ARROW_8-0.1,  		(11633+12014)*NORMAL_BOOST_RANGER*RANGER_6_GLOBES, true,  			0, 0, 0, 			0.00, 0, 0, 	1, 0,"",""),
		},
		critChance : CRIT_CHANCE_RANGER,
		critDamage : CRIT_AMOUNT_RANGER
	};

	var myTimeout;

	// Pre init the chart data.
	if(dpsChart == undefined){
		dpsChart = new Chart(document.getElementById("line-chart"), {
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
					}]
				}
			}
		});
	}
	dpsChart.data = {
		labels: labelsAxisX,
		datasets: [{ 
			data: [],
			hidden: (parseInt($("#chartnum").val()) == 1 ? false : true),
			label: "1: mage",
			borderColor: "#3e95cd",
			fill: false,
			usedTilesets : [],
			classData : mageData,
			calcCount : 100,
			chargedStrikes: false,
			randomizedChargedStrikes: true,
			otherBoost: ICEHEART_BOOST,
		},
		{ 
			data: [],
			hidden: (parseInt($("#chartnum").val()) == 2 ? false : true),
			label: "2: scoundrel",
			borderColor: "#9e954d",
			fill: false,
			usedTilesets : [],
			classData : scoundrelData,
			calcCount : 100,
			chargedStrikes: false,
			randomizedChargedStrikes: true,
			// To add to the realistic view of iceheart, alot of non-boss enemies are not frosted and alot of boss fights without a mage are not 
			// frosted either. This is why I remove 2%, even though it might be even more on the average situation...
			// Although in theory this is the only number that isn't fully correct, but in practice it proves to be almost impossible to always
			// have frost on enemies, and the full 5% boost credit should be taken with a grain of salt for every non-mage class.
			otherBoost: ICEHEART_BOOST - 0.02,
		},
		{ 
			data: [],
			hidden: (parseInt($("#chartnum").val()) == 3 ? false : true),
			label: "3: shaman",
			borderColor: "#000000",
			fill: false,
			usedTilesets : [],
			classData : shamanData,
			calcCount : 50,
			chargedStrikes: true,
			randomizedChargedStrikes: true,
			otherBoost: 1,
		},
		{ 
			data: [],
			hidden: (parseInt($("#chartnum").val()) == 4 ? false : true),
			label: "4: ranger",
			borderColor: "#5eD54d",
			fill: false,
			usedTilesets : [],
			classData : rangerData,
			calcCount : 200,
			chargedStrikes: false,
			randomizedChargedStrikes: true,
			otherBoost: ICEHEART_BOOST - 0.02,
		},
		{ 
			data: [],
			hidden: (parseInt($("#chartnum").val()) == 5 ? false : true),
			label: "5: fire mage",
			borderColor: "#9e0000",
			fill: false,
			usedTilesets : [],
			classData : mageData,
			calcCount : 200,
			chargedStrikes: false,
			randomizedChargedStrikes: true,
			otherBoost: 1,
		},
		{ 
			data: [],
			hidden: (parseInt($("#chartnum").val()) == 6 ? false : true),
			label: "6: manip_ranger",
			borderColor: "#9e9e9e",
			fill: false,
			usedTilesets : [],
			calcCount : 100,
			classData : rangerData,
			chargedStrikes: false,
			randomizedChargedStrikes: true,
			otherBoost: ICEHEART_BOOST - 0.02,
		},
		]
	};
}