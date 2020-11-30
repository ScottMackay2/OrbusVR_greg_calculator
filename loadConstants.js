// File for global constants


// Different attack types have different type of effect. The dps code will make some attacks do different things.
const ATTACK_NORMAL = 0;
const ATTACK_DOT = 1;
const ATTACK_HITS_PER_SECOND = 3;


const MAGE_VALUE = 'mage';
const SCOUNDREL_VALUE = 'scoundrel';
const SHAMAN_VALUE = 'shaman';
const RANGER_VALUE = 'ranger';

const CONST_CLASSES = [MAGE_VALUE, SCOUNDREL_VALUE, SHAMAN_VALUE, RANGER_VALUE];

const lsKeyAttacks = 'lsKeyAttacks';
const lsKeyTilesets = 'lsKeyTilesets';
const lsKeyPotsFlag = 'lsKeyPotsFlag';
const lsKeyTilesetFlag = 'lsKeyTilesetFlag';
const lsKeyNumber = "class_loadouts";



/// Weapon Values
const ICEHEART_BOOST = 1.05;
const MAX_ADDED_CRIT_DMG_FROM_ARMOUR = 0.08; // 0.02 = 2% every armour piece. With 4 armour pieces.
const MAX_ADDED_PROJECTILE_DMG_FROM_ARMOUR = 0.04; // 0.01 = 1% every armour piece. With 4 armour pieces.

const RING_ADDED_CRIT_DMG_EMPOWERED = 0.03;
const RING_ADDED_CRIT_DMG = 70;
const BASE_CRIT_AMOUNT = 1.5+RING_ADDED_CRIT_DMG_EMPOWERED;

const BLEED_DEFAULT_DMG_INC = 2.48;
const BLEED_CHANCE_PERCENT = 0.02;
const BLEED_ACTUAL_DMG_INC = BLEED_DEFAULT_DMG_INC*BLEED_CHANCE_PERCENT;

