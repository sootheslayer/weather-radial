d3.csv('/Mumbai-2015.csv',function(data){

	//--------------------------------- Set up and initiate svg containers ---------------------------------------

	var margin = {
		top: 70,
		right: 20,
		bottom: 120,
		left: 20
	};
	var width = window.innerWidth - margin.left - margin.right - 20;
	var height = window.innerHeight - margin.top - margin.bottom - 20;

	//SVG container
	var svg = d3.select("#weatherChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")");


	//---------------------------------------- Create scales ------------------------------------------------

	//Parses a string into a date
	var parseDate = d3.timeParse("%m/%d/%Y");

	//Turn strings into actual numbers/dates
	data.forEach(function(d) {
		d.date = parseDate(d.date);
		d.maxTemp = +d.maxTemp;
		d.minTemp = +d.minTemp;
		d.precipitation = +d.precipitation;
	});

	var maxOfmaxTemp = d3.max(data,function(d){return d.maxTemp;});
	var minOfminTemp = d3.min(data,function(d){return d.minTemp;});

	//Set the minimum inner radius and max outer radius of the chart
	var	outerRadius = Math.min(width, height, 500)/2,
		innerRadius = outerRadius * 0.4;

	//Base the color scale on average temperature extremes
	var colorScale = d3.scaleLinear()
		// .domain([-15, 7.5, 30])
		.domain([minOfminTemp,(minOfminTemp+maxOfmaxTemp)/2, maxOfmaxTemp])
		.range(["#FAD832", "#F53240"])
		.interpolate(d3.interpolateHcl)
		;

	//Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
	var barScale = d3.scaleLinear()
		.range([innerRadius, outerRadius])
		// .domain([-15,30])
		.domain([minOfminTemp,maxOfmaxTemp]);

	var precipitationScale = d3.scaleLinear()
		.range([0,outerRadius/3])
		.domain(d3.extent(data, function(d){return Math.sqrt(d.precipitation);}));

	//Scale to turn the date into an angle of 360 degrees in total
	//With the first datapoint (Jan 1st) on top
	var angle = d3.scaleLinear()
		.range([-180, 180])
		.domain(d3.extent(data, function(d) { return d.date; }));	 

	//---------------------------------------- Create Titles ----------------------------------------

	var textWrapper = svg.append("g").attr("class", "textWrapper")
		.attr("transform", "translate(" + Math.max(-width/2, -outerRadius - 170) + "," + 0 + ")");

	//Append title to the top
	textWrapper.append("text")
		.attr("class", "title")
	    .attr("x", 0)
	    .attr("y", -outerRadius - 40)
	    .text("Daily Temperatures in Mumbai");
	textWrapper.append("text")
		.attr("class", "subtitle")
	    .attr("x", 0)
	    .attr("y", -outerRadius - 20)
	    .text("2015");

	//Append credit at bottom
	textWrapper.append("text")
		.attr("class", "credit")
	    .attr("x", 0)
	    .attr("y", outerRadius + 120)
	    .text("Inspiration from weather-radials.com");

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
	// var months = [ 				
	// 	{starts:1,text:"Jul"}, // the order here is different or else the labels would appear inverted 
	// 	{starts:32,text:"Aug"}, // because of rotation of axis.
	// 	{starts:62,text:"Sep"},
	// 	{starts:93,text:"Oct"},
	// 	{starts:123,text:"Nov"},
	// 	{starts:154,text:"Dec"},
	// 	{starts:185,text:"Jan"},
	// 	{starts:214,text:"Feb"},
	// 	{starts:245,text:"Mar"},
	// 	{starts:275,text:"Apr"},
	// 	{starts:306,text:"May"},
	// 	{starts:336,text:"Jun"},
	// ];
	// var calendarScale = d3.scaleLinear()
	// 	.range([-180,0,180])
	// 	.domain([1,185,366]);
	//Add January for reference
	// barWrapper.selectAll(".month")
	// 	.data(months)
	// 	.enter().append("text")
	// 	.attr("class", "month")
	// 	.attr("transform", function(d,i) { return "rotate(" + (calendarScale(d.starts)) + ")"; })
	// 	.attr("x", 7)
	// 	.attr("y", -outerRadius * 1.1)
	// 	.attr("dy", "0.9em")
	// 	.text(function(d){return d.text;});

	//Add a line to split the year
	barWrapper.append("line")
		.attr("class", "yearLine")
		.attr("x1", 0)
		.attr("y1", -innerRadius * 0.65)
		.attr("x2", 0)
		.attr("y2", -outerRadius * 1.1);

	//---------------------------------------------- Draw bars ----------------------------------------------


	barWrapper.selectAll(".precipitationCircle")
		.data(data)
		.enter().append("circle")
		.attr("class", "precipitationCircle")
		.attr("transform", function(d,i){ return "rotate(" + (angle(d.date)) + ")"; })
		.attr("cx", 0)
		.attr("cy", function(d){ return barScale(d.meanTemp);})
		.attr("r", function(d){ return precipitationScale(Math.sqrt(d.precipitation));});

	//Draw a bar per day where the height is the difference between the minimum and maximum temperature
	//And the color is based on the mean temperature
	barWrapper.selectAll(".tempBar")
	 	.data(data)
	 	.enter().append("rect")
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
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.selectAll("stop") 
		.data(d3.range(numStops))                
		.enter().append("stop") 
		.attr("offset", function(d,i) { return tempScale( tempPoint[i] )/width; })   
		.attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });


	//---------------------------------------------- Draw the legend ----------------------------------------------

	var legendWidth = Math.min(outerRadius*2, 400);

	//Color Legend container
	var legendsvg = svg.append("g")
		.attr("class", "legendWrapper")
		.attr("transform", "translate(" + 0 + "," + (outerRadius + 70) + ")");

	//Draw the Rectangle
	legendsvg.append("rect")
		.attr("class", "legendRect")
		.attr("x", -legendWidth/2)
		.attr("y", 0)
		.attr("rx", 8/2)
		.attr("width", legendWidth)
		.attr("height", 8)
		.style("fill", "url(#legend-weather)");
		
	//Append title
	legendsvg.append("text")
		.attr("class", "legendTitle")
		.attr("x", 0)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text("Average Daily Temperature");

	//Set scale for x-axis
	var xScale = d3.scaleLinear()
		 .range([-legendWidth/2, legendWidth/2])
		 .domain([minOfminTemp,maxOfmaxTemp] );

	//Define x-axis
	var xAxis = d3.axisBottom(xScale)
		  .ticks(5)
		  .tickFormat(function(d) { return d + "°C"; });

	//Set up X axis
	legendsvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (10) + ")")
		.call(xAxis);

});