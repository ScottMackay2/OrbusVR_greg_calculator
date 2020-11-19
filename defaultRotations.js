// This code is used to inject all rotations and tilesets into the local memory of a new client who never used this program.
// These are the best rotations I could find in my limited time.
var needsDefaultValues = true;
for(var i=1;i<10;i++){
	if(localStorage[i] != undefined){
		needsDefaultValues = false;
		break;
	}
}

// Only triggers very first time a new user uses this program.
if(needsDefaultValues){
	console.log("Setting all class parameters to default");
	// Mage
	var chartNum = 1;
	localStorage[chartNum] = "X b a(F b B B B B B B A) x 100";
	localStorage[chartNum*100 + 1] = "AFB";
	localStorage[chartNum*100 + 2] = "AF2";
	localStorage[chartNum*100 + 3] = "3B2";
	localStorage[chartNum*100 + 4] = "A2F";
	localStorage[chartNum*100 + 5] = "0BA";

	// Scoundrel
	chartNum++;
	localStorage[chartNum] = "X f BBBB(CCB CBB CB)*15 SssSsC BBBB(CCB CBB CB)*15 \nD*100";
	localStorage[chartNum*100 + 1] = "A26";
	localStorage[chartNum*100 + 2] = "362";
	localStorage[chartNum*100 + 3] = "F26";
	localStorage[chartNum*100 + 4] = "F62";
	localStorage[chartNum*100 + 5] = "F6A2";

	// Shaman
	chartNum++;
	localStorage[chartNum] = "X \n@T(APPPP@@T@@@pPPPPP@@@T@pPPPP) (@@T@@#pPPPPP)*100 \n@@T@####(SssT)*100 \n@@##T@####(VFFT)*100 \n@@####T@####(IiLLT)*100";
	localStorage[chartNum*100 + 1] = "SBP";
	localStorage[chartNum*100 + 2] = "PSB";
	localStorage[chartNum*100 + 3] = "SBX";
	localStorage[chartNum*100 + 4] = "0PSB";
	localStorage[chartNum*100 + 5] = "0PS";

	// Ranger
	chartNum++;
	localStorage[chartNum] = "X e (O z z s s u s s V z Z s s s s s)(V z z s s u s s V z Z z s s s s)*6 Y w w w w p w w w w (V z z s s u s s V z Z s s s s s)*7";
	localStorage[chartNum*100 + 1] = "6F2";
	localStorage[chartNum*100 + 2] = "26F";
	localStorage[chartNum*100 + 3] = "F2A";
	localStorage[chartNum*100 + 4] = "A26F";
	localStorage[chartNum*100 + 5] = "6F2A";

	// Fire mage (with heals)
	chartNum++;
	localStorage[chartNum] = "X b (hBBBBBBBBBBBBBBBBBBBBB)x32";
	localStorage[chartNum*100 + 1] = "2BH";
	localStorage[chartNum*100 + 2] = "3BH";
	localStorage[chartNum*100 + 3] = "3HB";
	localStorage[chartNum*100 + 4] = "";
	localStorage[chartNum*100 + 5] = "";

	localStorage[chartNum*1000] = 1;

	// Manipulation ranger (used advanced timing to cheat the tileset system)
	chartNum++;
	localStorage[chartNum] = "X e (a b s c d s s u A b s c D s s s)(A b s c d s s u A b s c D s s s)*6 G h w i j p w W w w (u A b s c D s s s A b s c d s s)*7";
	localStorage[chartNum*100 + 1] = "7F62";
	localStorage[chartNum*100 + 2] = "6A2";
	localStorage[chartNum*100 + 3] = "7F2";
	localStorage[chartNum*100 + 4] = "7F26";
	localStorage[chartNum*100 + 5] = "A7F26";

	localStorage[chartNum*1000] = 1;

}



// X b (A b V b B B B B B) x 100

// ABF A2B AB2
// #############################

// X BBBB(CCB CBB CB)*50
// D*60

// A26 362 326 F62 F6A2
// #############################

// X
// @T(APPPP@@T@@@pPPPPP@@@T@pPPPP) (@@T@@#pPPPPP)*100
// @@T@####(SssT)*100
// @@##T@####(VFFT)*100
// @@####T@####(IiLLT)*100

// SBP PSB SBX PSBX 0PS

// #############################
// X e (O z z s s u s s V z Z s s s s s)(V z z s s u s s V z Z z s s s s)*6 Y w w w w w w W w (V z z s s u s s V z Z s s s s s)*7

// 6F2 26F F2A A26F 6F2A

// #############################

// X b (hBBBBBBBBBBBBBBBBBBBBB)x32

// 2BH 3BH 3HB

// #############################

// X e (a z b c d s s u A z b c D s s s)(A z b c d s s u A z b c D s s s)*6 G w h i j w w W w (u A z b c D s s s A z b c d s s)*7

// 7F62 6A2 7F2 7F26 A7F26

// #############################

// X e (a o c d s s s s u A o c d s s s s s)(A o c d s s s s u A o c d s s s s s)*6 G o i j w w w w W w (u A o c d s s s s s A o c d s s s s)*7

// 7F3 7F36 7F362 F362 7362