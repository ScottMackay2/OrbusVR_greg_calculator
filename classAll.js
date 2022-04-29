var dpsChart;
var dotChart;
var dotSpecificData;

function getCurrentWeaponMultiplier(){
	return Math.pow(1.0495, globalWeaponLvl*2 + globalWeaponPlusLvl);
}

function initializeAllClassData(){
	// Set the classes in the UI.
	var classOptions = document.getElementById('classData');
	for (i=1; i<= CONST_CLASSES.length; i++) {
		var newOption = new Option(CONST_CLASSES[i-1]);
		classOptions.options.add(newOption);
	}

	updateLoadoutListOfClass();

	var myTimeout;

	// Pre init the chart data.
	if(dpsChart == undefined){
		dpsChart = new Chart(document.getElementById("line_chart"), {
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
					}],
					yAxes: [{
						afterFit: function(scaleInstance) {
							scaleInstance.width = 100; // sets the width to 100px
						}
					}]
				}
			}
		});
		dpsChart.data = {
			labels: labelsAxisX
		};
	}

	if(dotChart == undefined){
		dotChart = new Chart(document.getElementById("dot_chart"), {
			type: 'scatter',
			data: {
		    datasets: [{
		        label: 'Damage chart',
		        data: [],
		        borderColor: 'white',
		        pointBackgroundColor: [],
		        customLabels:[],
		    }]
		    },
			options: {
				scales: {
			        x: {
			        	type: 'linear',
			            max: 230,
			        }
			    },
				plugins: {
		        tooltip: {
		            callbacks: {
		                label: function(context) {
		                    let label = context.dataset.customLabels[context.dataIndex] || '';
		                    return label;
		                }
		            }
		        }
		    },
				responsive: true,
				legend: { display: false },
			}
		});

		dotSpecificData = dotChart.data.datasets[0];
		dotSpecificData.backgroundColor = "#00FF00";
	}
}

function convertClassData(classData){
	// This is the dps from lvl 0 to lvl X+Y weapon without intellect and strength boost.
	const PLUS_X_PLUS_Y_WEAPON_RATIO = getCurrentWeaponMultiplier(); // About 1.3362x a.k.a. 33.6% dps boost.

	const DAMAGE_MULTIPLIER = PLUS_X_PLUS_Y_WEAPON_RATIO;
	const DOT_MULTIPLIER = PLUS_X_PLUS_Y_WEAPON_RATIO;
	for (const [key, attack] of Object.entries(classData.attackTypes)){
		attack.damage*=DAMAGE_MULTIPLIER;
		attack.dotDamage*=DOT_MULTIPLIER;
	}
	return classData;
}

function loadChartDatasets(orbusClass, name) {
	// TODO: The colors wont work as it currently is color per class

	switch (orbusClass) {
		case MAGE_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#3e95cd",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(ClassMage.getData()),
				}
			);
			break;
		case SCOUNDREL_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#9e954d",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(ClassScoundrel.getData()),
				}
			);
			break;
		case SHAMAN_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#000000",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(ClassShaman.getData()),
				}
			);
			break;
		case RANGER_VALUE:
			dpsChart.data.datasets.push(
				{
					data: [],
					label: name,
					borderColor: "#5eD54d",
					fill: false,
					usedTilesets: [],
					classData: convertClassData(ClassRanger.getData()),
				}
			);
			break;
	}
}