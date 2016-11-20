//--------------------------------- Set up and initiate svg containers ---------------------------------------

var margin = {
	top: 50,
	right: 70,
	bottom: 50,
	left: 20
};

var width = $('#chart-placeholder').width() - margin.left - margin.right - 20;
var height = $('#chart-placeholder').height() - margin.top - margin.bottom - 20;

//SVG container
var svg = d3.select("#weatherChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + (width/2) + "," + (margin.top + height/2) + ")");


//---------------------------------------- Create scales ------------------------------------------------

//Parses a string into a date
var parseDate = d3.timeParse("%Y-%m-%d");

//Turn strings into actual numbers/dates
weatherData.forEach(function(Y){
		Y.data.forEach(function(d) {
			d.date = parseDate(d.date);
			d.maxTemp = +d.maxTemp;
			d.minTemp = +d.minTemp;
			d.precipitation = +d.precipitation;
	});
});

var maxOfmaxTemp = 45;//d3.max(weatherData[month].data,function(d){return d.maxTemp;});
var minOfminTemp = 0;//d3.min(weatherData[month].data,function(d){return d.minTemp;});

//Set the minimum inner radius and max outer radius of the chart
var	outerRadius = Math.min(width - margin.right - 40, height)/2,
	innerRadius = outerRadius * 0.4;

//Base the color scale on average temperature extremes
var colorScale = d3.scaleLinear()
	.domain([minOfminTemp,(minOfminTemp+maxOfmaxTemp)/2, maxOfmaxTemp])
	.range(["#FAD832", "#F53240"])
	.interpolate(d3.interpolateHcl);

//Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
var barScale = d3.scaleLinear()
	.range([innerRadius, outerRadius])
	// .domain([-15,30])
	.domain([minOfminTemp,maxOfmaxTemp]);

var precipitationScale = d3.scaleLinear()
	.range([0,outerRadius/3])
	.domain(d3.extent(weatherData[month].data, function(d){return Math.sqrt(d.precipitation);}));

//Scale to turn the date into an angle of 360 degrees in total
//With the first datapoint (Jan 1st) on top
var angle = d3.scaleLinear()
	.range([-180, 180])
	.domain(d3.extent(weatherData[month].data, function(d) { return d.date; }));

//---------------------------------------- Create Titles ----------------------------------------

var textWrapper = svg.append("g").attr("class", "textWrapper")
	.attr("transform", "translate(" + (-outerRadius-70) + "," + 0 + ")");

textWrapper.append("text")
	.attr("class", "subtitle")
    .attr("x", 0)
    .attr("y", -outerRadius + 20)
    .text(weatherData[month].year);

//------------------------------------------------------ Create Axes ---------------------------------------------------

//Wrapper for the bars and to position it downward
var barWrapper = svg.append("g")
	.attr("transform", "translate(" + 0 + "," + 0 + ")");

var gridlinesRange = [];
var gridlinesNum = 6;
for(var j = 0; j<gridlinesNum; j++){
	gridlinesRange.push(j*(maxOfmaxTemp - minOfminTemp)/(gridlinesNum-1) + minOfminTemp );
}
//Draw gridlines below the bars
var axes = barWrapper.selectAll(".gridCircles")
 	.data(gridlinesRange)
 	.enter().append("g");
//Draw the circles
axes.append("circle")
 	.attr("class", "axisCircles")
 	.attr("r", function(d) { return barScale(d); });
//Draw the axis labels
axes.append("text")
	.attr("class", "axisText")
	.attr("y", function(d) { return barScale(d); })
	.attr("dy", "0.3em")
	.text(function(d) { return d + "°C";});

//---------------------------------------- Month Labels ------------------------------------------------


//The start date number and end date number of the months in a year
var monthData = [
	{month: "January", 	startDateID: 0, 	endDateID: 30},
	{month: "February", startDateID: 31, 	endDateID: 58},
	{month: "March", 	startDateID: 59, 	endDateID: 89},
	{month: "April", 	startDateID: 90, 	endDateID: 119},
	{month: "May", 		startDateID: 120, 	endDateID: 150},
	{month: "June", 	startDateID: 151, 	endDateID: 180},
	{month: "July", 	startDateID: 181, 	endDateID: 211},
	{month: "August", 	startDateID: 212, 	endDateID: 242},
	{month: "September",startDateID: 243, 	endDateID: 272},
	{month: "October", 	startDateID: 273, 	endDateID: 303},
	{month: "November", startDateID: 306, 	endDateID: 333},
	{month: "December",	startDateID: 334, 	endDateID: 364}
];
var arc = d3.arc()
		.innerRadius(outerRadius + 10) 
		.outerRadius(outerRadius + 30);
var pie = d3.pie()
		.value(function(d) { return d.endDateID - d.startDateID; })
		.padAngle(0.01)
		.sort(null);

svg.selectAll(".monthArc")
	.data(pie(monthData))
   .enter().append("path")
	.attr("class", "monthArc")
	.attr("id", function(d,i) { return "monthArc_"+i; })
	.attr("d", arc);

svg.selectAll(".monthText")
	.data(monthData)
   .enter().append("text")
	.attr("class", "monthText")
	.attr("x", 40) //Move the text from the start angle of the arc
	.attr("dy", 13) //Move the text down
   .append("textPath")
   	// .attr("startOffset","50%")
	.attr("xlink:href",function(d,i){return "#monthArc_"+i;})
	.text(function(d){return d.month;});	


//Add a line to split the year
barWrapper.append("line")
	.attr("class", "yearLine")
	.attr("x1", 0)
	.attr("y1", -innerRadius * 0.65)
	.attr("x2", 0)
	.attr("y2", -outerRadius * 1.1);

//---------------------------------------------- Draw bars ----------------------------------------------


barWrapper.selectAll(".precipitationCircle")
	.data(weatherData[month].data)
	.enter().append("circle")
	// .transition().duration(750)
	.attr("class", "precipitationCircle")
	.attr("transform", function(d,i){ return "rotate(" + (angle(d.date)) + ")"; })
	.attr("cx", 0)
	.attr("cy", function(d){ return barScale(d.meanTemp);})
	.attr("r", function(d){ return precipitationScale(Math.sqrt(d.precipitation));});

//Draw a bar per day where the height is the difference between the minimum and maximum temperature
//And the color is based on the mean temperature
barWrapper.selectAll(".tempBar")
 	.data(weatherData[month].data)
 	.enter().append("rect")
 	// .transition().duration(750)
 	.attr("class", "tempBar")
 	.attr("transform", function(d,i) { return "rotate(" + (angle(d.date)) + ")"; })
 	.attr("width", 1.5)
	.attr("height", function(d,i) { return barScale(d.maxTemp) - barScale(d.minTemp); })
 	.attr("x", -0.75)
 	.attr("y", function(d,i) {return barScale(d.minTemp); })
 	.style("fill", function(d) { return colorScale(d.meanTemp); });

//---------------------------------------------- Create the gradient for the legend ----------------------------------------------

//Extra scale since the color scale is interpolated
var tempScale = d3.scaleLinear()
	.domain([minOfminTemp, maxOfmaxTemp])
	.range([0, width]);

//Calculate the variables for the temp gradient
var numStops = 10;
tempRange = tempScale.domain();
tempRange[2] = tempRange[1] - tempRange[0];
tempPoint = [];
for(var i = 0; i < numStops; i++) {
	tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
}//for i

//Create the gradient
svg.append("defs")
	.append("linearGradient")
	.attr("id", "legend-weather")
	.attr("x1", "0%").attr("y1", "100%")
	.attr("x2", "0%").attr("y2", "0%")
	.selectAll("stop") 
	.data(d3.range(numStops))                
	.enter().append("stop") 
	.attr("offset", function(d,i) { return tempScale( tempPoint[i] )/width; })   
	.attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });


//---------------------------------------------- Draw the legend ----------------------------------------------

var legendHeight = Math.min(outerRadius*2, 400);

//Color Legend container
var legendsvg = svg.append("g")
	.attr("class", "legendWrapper")
	.attr("transform", "translate(" + (outerRadius + margin.right ) + "," + 0 + ")");

//Draw the Rectangle
legendsvg.append("rect")
	.attr("class", "legendRect")
	.attr("x", 0)
	.attr("y", -legendHeight/2)
	.attr("ry", 8/2)
	.attr("width", 8)
	.attr("height", legendHeight)
	.style("fill", "url(#legend-weather)");
	
//Append title
legendsvg.append("text")
	.attr("class", "legendTitle")
	.attr("x", 0)
	.attr("y", legendHeight/2+30)
	.style("text-anchor", "middle")
	.text("Average Daily");
legendsvg.append("text")
	.attr("class", "legendTitle")
	.attr("x", 0)
	.attr("y", legendHeight/2+50)
	.style("text-anchor", "middle")
	.text("Temperatures");

//Set scale for x-axis
var yScale = d3.scaleLinear()
	 .range([legendHeight/2, -legendHeight/2])
	 .domain([minOfminTemp,maxOfmaxTemp] );

//Define x-axis
var yAxis = d3.axisRight(yScale)
	  .ticks(5)
	  .tickFormat(function(d) { return d + "°C"; });

//Set up X axis
legendsvg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + (10) + ",0)")
	.call(yAxis);


//-----------------------------------------------Update Fuction--------------------------------

function updateChart(){

	precipitationScale.domain(d3.extent(weatherData[month].data, function(d){return Math.sqrt(d.precipitation);}));	

	var updatePrecipitation = barWrapper.selectAll(".precipitationCircle")
		.data(weatherData[month].data,function(d) {return d;});

	updatePrecipitation.exit().remove();
	updatePrecipitation
		.enter().append("circle")
		.attr("class", "precipitationCircle")
		// .transition().duration(750)
		.attr("transform", function(d,i){ return "rotate(" + (angle(d.date)) + ")"; })
		.attr("cx", 0)
		.attr("cy", function(d){ return barScale(d.meanTemp);})
		.attr("r", function(d){ return precipitationScale(Math.sqrt(d.precipitation));});
	

	var updateTemp = barWrapper.selectAll(".tempBar")
	 	.data(weatherData[month].data, function(d) {return d;});

 	updateTemp.exit().remove();
 	updateTemp
	 	.enter().append("rect")
	 	.attr("class", "tempBar")
	 	// .transition().duration(750)
	 	.attr("transform", function(d,i) { return "rotate(" + (angle(d.date)) + ")"; })
	 	.attr("width", 1.5)
		.attr("height", function(d,i) { return barScale(d.maxTemp) - barScale(d.minTemp); })
	 	.attr("x", -0.75)
	 	.attr("y", function(d,i) {return barScale(d.minTemp); })
	 	.style("fill", function(d) { return colorScale(d.meanTemp); });

 	d3.select('.subtitle')
 		.transition().duration(450*2)
 		.text(weatherData[month].year);
 	

}