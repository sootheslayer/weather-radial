$(document).ready(function() {
	$('select').material_select();

	$('select').on('change', function() {
	  month = +this.value;
	  // console.log(month); // or $(this).val()
	  updateChart();
	});

	$('#animate-chart').click(function(event) {
		if(flag === 0){
			flag = 1;
			$('#animate-chart').text('pause');
		} else {
			flag = 0;
			$('#animate-chart').text('play');
		}
	});
});

var month = 0;
var flag = 0;


d3.interval(function(){
	if(flag === 1){
		month++;
		if(month === 19){
			month = 0;
		}
		updateChart();
	}
},1500);

