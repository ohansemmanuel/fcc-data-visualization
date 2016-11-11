var jsonUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

var month = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
			];

var colors = ["#192e56", "#20537b", "#29707d", "#287c69", "#89c76e", "#bbd64f", "#afaacd", "#e2a8c3", "#fece3b", "#68cff3", "#8e8e8e"];

var margin = {top: 5, right: 0, bottom: 90, left: 100};

var w = 1200 - margin.left - margin.right;
var h = 550 - margin.top - margin.bottom;

var temperature = []; //empty array to hold temp values down down below
var tooltip = d3.select('#tooltip');

//create svg
var svg = d3.select('section')
			.append('svg')
			.attr({
				width: (w + margin.left + margin.right),
				height: (h + margin.top + margin.bottom)
			})
			.append("g")
    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			

d3.json(jsonUrl, function(data) {
	
	//get base temperature
	var baseTemp = data.baseTemperature;

	//get temperature data
	var tempData = data.monthlyVariance;

	//let's pull out the year and variance in the data unto different arrays
		//1.Year
	var yrData = tempData.map(function(x) {
		return x.year;
	});
		//remove duplicates, there are 12 duplcates
	yrData = yrData.filter(function (v,i) {
		return yrData.indexOf(v) == i;
	});

	//go through the yrData and compute a new property 'temp' to hold temperature
	tempData.forEach(function(x) {
		x.temp = x.variance + baseTemp;
		temperature.push(x.temp) //add unto array
	});

	var colorScale = d3.scale.quantile()
							 .domain([d3.min(temperature), d3.max(temperature)])
							 .range(colors);

	//create scale
	var xScale = d3.time.scale()
					    .domain([new Date(d3.min(yrData), 0), 
					   			new Date(d3.max(yrData), 0)])
					    .range([0, w]);

	//create axis
	var xAxis = d3.svg.axis()
					  .scale(xScale)
					  .orient('bottom')
					  .ticks(d3.time.years, 10);

	//The y-axis technically has no axis and scale...we interpolate

	//width and height of the grids (gridwidth = gw)...remember the heatmap is a stacked layout of grids??...layman definition though
	var gw = w / yrData.length;
	var gh = h / month.length;

	var temps = svg.selectAll('rect')
				   .data(tempData)
				   .enter()
				   .append('rect')
				   .attr({
				   	x: function(d) {
				   		//since axis doesn't start from zero, subract year from minimum yr (the start of the axis)
				   		return ((d.year - d3.min(yrData)) * gw);
				   	},
				   	y: function(d) {
				   		//first should read zero, second should be gh, 3rd --> gh * 2 
				   		return ((d.month - 1) * gh);
				   	},
				   	width: gw,
				   	height: gh
				   })
				   .on('mouseover', function (d) {
					   		//event position
					   		var xPos = d3.event.pageX;
					   		var yPos = d3.event.pageY;
					   		//update html
					   		tooltip.html(
					   			'<strong>' + d.year + ' - ' + 
					   			month[d.month - 1] + '</strong><br>' + 
					   			(Math.floor(d.temp * 1000) / 1000) + ' &#8451 <br>' +
					   			'<em>' + d.variance + ' &#8451 </em>')
					   			.style('top', yPos - 25 + 'px')
					   			.style('left', xPos + 15 + 'px');//position tooltip

				   		tooltip.transition()
				   			   .duration(200)
				   			   .attr('class', 'show');

				   })
				   .on('mouseout', function(d) {
				   		tooltip.transition()
				   			   .duration(500)
				   			   .attr('class', 'hidden');
				   })
				   .style('fill', function(d) {
				
					// temp --> remember we added this property after looping through the array?		   
					return colorScale(d.temp);
		 			});		 
//call x-axis {play around: call this before loading data}		 	
svg.append('g')
   .attr('class', 'axis')
   .attr('transform', 'translate(0,' + h +')')
   .style({
   	fill: 'black',
   	'font-size': '9pt',
   	'font-weight': '600'
   })
   .call(xAxis);

//add text, 'Years' below the x-axis
svg.append('g')
   .attr({
   	class: 'xLabel',
   	transform: 'translate(' + (w/2) + ',' + (h + 45) + ')'
   })
   .append('text')
   .attr('text-anchor', 'middle')
   .text('Years')
   .style('fill', 'black');

//y-axis? sorta! aint exacly an axis though
svg.append('g')
   .attr('transform', 'translate(-' + (gh * 1.9) + ',' + (gh/1.5) + ')')
   .selectAll('text')
   .data(month)
   .enter()
   .append('text')
   .text(function(d) {
   		return d;
   })
   .attr({
   	x: 0,
   	y: function(d,i) {
   		return i * gh;
   	},
   })
   .style({
   	'fill': 'black',
   	'font-size': '9pt',
   	'font-weight': '600'
   })

//let's add the color legend...lotta calculations here :-)
var elw = 35 //elw = Each legend Width 
var legend = svg.selectAll('.legend')
//colorScale.quantiles() only returns 10 values excluding zero, so we add zero to the begining of the returned array via concat
				.data([0].concat(colorScale.quantiles()))
				.enter()
				.append('g')
				.attr('class', 'legend')

		  legend.append('rect')			
				.attr({
					class: 'legend',
					x: function(d,i) {
						return elw * i + (w - elw * colors.length);	
						},
					y: h + 50,
					width: elw,
					height: gh / 2
				})
				.style('fill', function(d,i) {
					return colors[i];
				});


		  legend.append('text')
		  		.text(function (d) {
		  			return (Math.floor(d*10) / 10); //simple hack to keep the formating at 1decimal place
		  		})	
		  		.attr({
		  			x: function(d,i) {
		  				return elw * i + (w - elw * colors.length) + (elw/3);
		  			},
		  			y: h + gh + 50
		  		});





})

 
