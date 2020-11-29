
restoreTilesets();
restoreAttacks();

function restoreDefaults() {
	restoreTilesets();
	restoreAttacks();
	$("#calcCount").val(100);
	loadAllCharts();
}

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


function restoreAttacks() {
	var curClass = parseInt($("#chartnum").val());
	var attackstr;

	switch (curClass) {
		case 1: // Mage
			attackstr = "X b a(F b B B B B B B A) x 100";
			break;
		case 2: // Scoundrel
			attackstr = "X f BBBB(CCB CBB CB)*15 SssSsC BBBB(CCB CBB CB)*15 \nD*150";
			break;
		case 3: // Shaman
			attackstr = "X \n@T(APPPP@@T@@@pPPPPP@@@T@pPPPP) (@@T@@#pPPPPP)*100 \n@@T@####(SssT)*100 \n@@##T@####(VFFT)*100 \n@@####T@####(IiLLT)*100";
			break;
		case 4: // Ranger
			attackstr = "X e (O z z s s u s s V z Z s s s s s)(V z z s s u s s V z Z z s s s s)*6 Y w w w w p w w w w (V z z s s u s s V z Z s s s s s)*7";
			break;
		case 5: // Firemage
			attackstr = "X b (hBBBBBBBBBBBBBBBBBBBBB)x32";
			break;
		case 6:
			attackstr = "X e (a b s c d s s u A b s c D s s s)(A b s c d s s u A b s c D s s s)*6 G h w i j p w W w w (u A b s c D s s s A b s c d s s)*7";
			break;
		default:
			attackstr = "No default";
	}
	$("#attacks").val(attackstr);
}

function restoreTilesets(){
	var curClass = parseInt($("#chartnum").val());

	// Get Current Class.
	var tileset1, tileset2, tileset3, tileset4, tileset5;

	// TODO: Should make the class values constant variables
	switch(curClass) {
		case 1: // Mage
			tileset1 = "AFB";
			tileset2 = "AF2";
			tileset3 = "3B2";
			tileset4 = "A2F";
			tileset5 = "0BA";
			break;
		case 2: // Scoundrel
			tileset1 = "A26";
			tileset2 = "362";
			tileset3 = "326";
			tileset4 = "F62";
			tileset5 = "F6A2";
			break;
		case 3: // Shaman
			tileset1 = "SBP";
			tileset2 = "PSB";
			tileset3 = "SBX";
			tileset4 = "0PSB";
			tileset5 = "0PS";
			break;
		case 4: // Ranger
			tileset1 = "6F2";
			tileset2 = "26F";
			tileset3 = "F2A";
			tileset4 = "A26F";
			tileset5 = "6F2A";
			break;
		case 5: // Firemage
			tileset1 = "2BH";
			tileset2 = "3BH";
			tileset3 = "3HB";
			tileset4 = "";
			tileset5 = "";
			break;
		case 6: // Manipulated Ranger
			tileset1 = "7F62";
			tileset2 = "6A2";
			tileset3 = "7F2";
			tileset4 = "7F26";
			tileset5 = "A7F26";
			break;
		default:
			tileset1 = "";
			tileset2 = "";
			tileset3 = "";
			tileset4 = "";
			tileset5 = "";
	}

	$("#tileset1").val(tileset1);
	$("#tileset2").val(tileset2);
	$("#tileset3").val(tileset3);
	$("#tileset4").val(tileset4);
	$("#tileset5").val(tileset5);

	for (i=1;i<6;i++) {
		$("#tileset_percent_" + i).val("");
		$("#tileset_numprocs_" + i).val("");
		$("#tileset_avgint_"+ i).val("");
	}
}
