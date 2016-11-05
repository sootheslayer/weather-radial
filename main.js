$(document).ready(function() {
	$('select').material_select();

	$('select').on('change', function() {
	  month = +this.value;
	  console.log(month); // or $(this).val()
	});
});

var month = 0;

// d3.interval(function(){
// 	month++;
// 	if(month === 19){
// 		month = 0;
// 	}
// 	updateChart();
// 	console.log("updating " + month);
// },1500);

