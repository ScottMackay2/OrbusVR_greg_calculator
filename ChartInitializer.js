define(["./classes/Attack", "./classes/RangerData","./classes/ScoundrelData","./classes/ShamanData","./classes/MageData"], 
function (Attack, RangerData, ScoundrelData, ShamanData, MageData) {
return{
	initializeAllClassData: function(){
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
			dpsChart = this.initDpsChart('line_chart');
		}
		if(minDpsChart == undefined) {
			minDpsChart = this.initDpsChart('min_line_chart');
		}
		if(maxDpsChart == undefined) {
			maxDpsChart = this.initDpsChart('max_line_chart');
		}
		if(minHitChart == undefined){
			minHitChart = this.initHitChart('min_hit_chart');
			minHitSpecificData = minHitChart.data.datasets[0];
		}
		if(maxHitChart == undefined){
			maxHitChart = this.initHitChart('max_hit_chart');
			maxHitSpecificData = maxHitChart.data.datasets[0];
		}
	},

	initDpsChart: function(elementId) {
		let dpsChart = new Chart(document.getElementById(elementId), {
			type: 'line',
			data: undefined,
			options: {
				responsive: true,
				legend: {
					display: false
				},
				scales: {
					x: {
			        	type: 'linear',
			            min: 0,
			            max: 230,
			        },
				}
			}
		});
		dpsChart.data = {
			labels: labelsAxisX
		};
		return dpsChart;
	},

	initHitChart: function(elementId) {
		let hitChart = new Chart(document.getElementById(elementId), {
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
		hitChart.data.datasets[0].backgroundColor = "#00FF00";
		return hitChart;
	},

	loadChartDatasets: function(orbusClass, name) {
		// TODO: The colors wont work as it currently is color per class

		if(orbusClass == MAGE_VALUE){
			var classData = MageData.getData();
			var borderColor = "#3e95cd";
		}
		if(orbusClass == SCOUNDREL_VALUE){
			var classData = ScoundrelData.getData();
			var borderColor = "#9e954d";
		}
		if(orbusClass == SHAMAN_VALUE){
			var classData = ShamanData.getData();
			var borderColor = "#000000";
		}
		if(orbusClass == RANGER_VALUE){
			var classData = RangerData.getData();
			var borderColor = "#5eD54d";
		}

		dpsChart.data.datasets.push(
			{
				data: [],
				label: name,
				borderColor: borderColor,
				fill: false,
				usedTilesets: [],
				classData: Attack.classDataMultiplyByWeaponMult(classData),
			}
		);
	}
}
});