var needsDefaultValues = true;

var debug = true; // ONLY FOR TESTING

if (localStorage[lsKeyNumber] !== undefined || debug){
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

	res[MAGE_VALUE] = {
		'default': {
			lsKeyAttacks: "X b a(F b B B B B B B A) x 100",
			lsKeyTilesets: ['AFB', 'AF2', '3B2', 'A2F', '0BA'],
			lsKeyPotsFlag: true,
			lsKeyTilesetFlag: true
		},
		'firemage': {
			lsKeyAttacks: "X b (hBBBBBBBBBBBBBBBBBBBBB)x32",
			lsKeyTilesets: ['2BH', '3BH', '3HB'],
			lsKeyPotsFlag: true,
			lsKeyTilesetsFlag: true,
		}
	};
	res[SHAMAN_VALUE] = {
		'default': {
			lsKeyAttacks: "X \n@T(APPPP@@T@@@pPPPPP@@@T@pPPPP) (@@T@@#pPPPPP)*100 \n@@T@####(SssT)*100 \n@@##T@####(VFFT)*100 \n@@####T@####(IiLLT)*100",
			lsKeyTilesets: ['SBP', 'PSB', 'SBX', '0PSB', '0PS'],
			lsKeyPotsFlag: true,
			lsKeyTilesetsFlag: true,
		}
	};
	res[SCOUNDREL_VALUE] = {
		'default': {
			lsKeyAttacks: "X f BBBB(CCB CBB CB)*15 SssSsC BBBB(CCB CBB CB)*15 \nD*150",
			lsKeyTilesets: ['A26', '362', '326', 'F62', 'F6A2'],
			lsKeyPotsFlag: true,
			lsKeyTilesetsFlag: true,
		}
	};
	res[RANGER_VALUE] = {
		'default': {
			lsKeyAttacks: "X e (O z z s s u s s V z Z s s s s s)(V z z s s u s s V z Z z s s s s)*6 Y w w w w p w w w w (V z z s s u s s V z Z s s s s s)*7",
			lsKeyTilesets: ['6F2', '26F', 'F2A', 'A26F', '6F2A'],
			lsKeyPotsFlag: true,
			lsKeyTilesetsFlag: true,
		},
		'manip_ranger': {
			lsKeyAttacks: "X e (a b s c d s s u A b s c D s s s)(A b s c d s s u A b s c D s s s)*6 G h w i j p w W w w (u A b s c D s s s A b s c d s s)*7",
			lsKeyTilesets: ['7F62', '6A2', '7F2', '7F26', 'A7F26'],
			lsKeyPotsFlag: true,
			lsKeyTilesetFlag: true,
		}
	}
}

// Load Outs Object Management
// Create

// Read
function readLoadOuts(name){

	// Get the data to load.
	var curClass = $("#classData").val();
	var allLoadOuts = JSON.parse(localStorage[lsKeyNumber]);
	var loadOuts = allLoadOuts[curClass];

	$("#attacks").val(loadOuts[name][lsKeyAttacks]);
	var tiles = loadOuts[name][lsKeyTilesets];
	for (i=1; i<= tiles.length; i++ ) {
		if (i == 6) {
			// Trying to load too many tilesets.
			break;
		}
		$('#tileset' + i).val(tiles[i-1]);
	}
}

// Update
function updateLoadOutList(){
	localStorage[lsKeyNumber] = JSON.stringify(res);

	var curClass = $("#classData").val();
	var allLoadOuts = JSON.parse(localStorage[lsKeyNumber]);
	var loadOuts = allLoadOuts[curClass];

	var loadOutNames = Object.keys(loadOuts);
	$("#nameLoadOut").empty();
	for (var i=0; i< loadOutNames.length; i++) {
		$("#nameLoadOut").append(new Option(loadOutNames[i]));
	}
	// Load by default the first element, but allow for passing in which loadout to load.
	readLoadOuts(loadOutNames[0])
}

// Delete

function toggleTilesets(e){
	if(tilesetsEnabledFlag){
		$("#toggleTilesets").html('Enable tilesets');
		for (i=1;i<6;i++) {
			$("#tileset_numprocs_" + i).val("");
			$("#tileset_avgint_"+ i).val("");
		}
	} else{
		$("#toggleTilesets").html('Disable tilesets');
	}
	tilesetsEnabledFlag = !tilesetsEnabledFlag;
	loadAllCharts();
}