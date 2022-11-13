function createAllPossibleCombinations(inputArray, targetLength) {
	let results = [];

	function combinate(arr, memo, startIdx){
		for(let i=startIdx;i<arr.length;i++){
			const item = arr[i];
			if (memo.length === targetLength-1) {
				results.push(memo.concat(item));
			}
			else{
				let newArr = arr.slice();
				// newArr.splice(i, 1);
				combinate(newArr, memo.concat(item), i+1);
			}
		}
	}

	combinate(inputArray, [], 0);
	return results;
}

function createAllPossibleVariations(inputArray, targetLength){
	let results = [];

	function variate(arr, memo){
		for(let i=0;i<arr.length;i++){
			const item = arr[i];
			if (memo.length === targetLength-1) {
				results.push(memo.concat(item));
			}
			else{
				let newArr = arr.slice();
				newArr.splice(i, 1);
				variate(newArr, memo.concat(item));
			}
		}
	}

	variate(inputArray, []);
	return results;
}

function createAllPossiblePermutations(inputArray) {
	return createAllPossibleVariations(inputArray, inputArray.length);
}

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const SECOND = 1000;
function millisecondsToTimeRemaining(milliseconds){
	if(milliseconds >= HOUR){
		const millisecondsMinutesLeft = milliseconds%HOUR;
		const hours = Math.floor(milliseconds/HOUR);
		const minutes = Math.round(millisecondsMinutesLeft/MINUTE);
		const s = hours === 1 ? "" : "s";
		const s2 = minutes === 1 ? "" : "s";
		return hours + " hour"+s+" and " + minutes + " minute"+s2;
	}
	if(milliseconds >= MINUTE){
		const minutes = Math.round(milliseconds/MINUTE);
		const s = minutes === 1 ? "" : "s";
		return minutes + " minute"+s;
	}
	if(milliseconds >= SECOND){
		const seconds = Math.round(milliseconds/SECOND);
		const s = seconds === 1 ? "" : "s";
		return seconds + " second"+s;
	}
	return Math.round(milliseconds) + " milliseconds";
}