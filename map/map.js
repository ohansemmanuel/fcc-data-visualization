//define width and height of svg
var w = 800;
var h = 500;

//global variables to be used to hold paths and circles, particularly for the zoom function
var countries;
var meteorites;

//tooltip ID
var tooltip = d3.select('#tooltip');

//define projection
var projection = d3.geo.mercator()
	           		   .center([0,40])
					   .translate([w/2, h/2])
					   .scale([w/8]);

//create a function that takes a number, adds commas and removes decimal numbers
//e.g 1234567.89 --> 1,234,567
var formatMass = d3.format(',');

//define path generator
var path = d3.geo.path()
				 .projection(projection);


//create svg
var svg = d3.select('section')
			.append('svg')
			.attr({
				width: w,
				height: h
			});

//Define quantize scale to sort data values into buckets of color
//Colors by Cynthia Brewer (colorbrewer2.org), YlOrRd
var color = d3.scale.quantize()
					.range([ "#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026" ]);

//load data...draw the map!
var jsonUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

d3.json(jsonUrl, function(json) {
	//let's create a group and append a rect to fill the svg.
	//all this does is to technically capture the zoom event
	//so it works when the mouse is positioned over the oceans too

	var countriesGroup = svg.append('g')
							.attr('id', 'countriesGroup')
							.call(zoom);

	countriesGroup.append('rect')
				  .attr({
				  	x: 0,
				  	y: 0,
				  	width: w,
				  	height: h
				  })
				  .style('fill-opacity', 0);	

	countries = countriesGroup.selectAll('path')
				   .data(json.features)
				   .enter()
				   .append('path')
				   .attr('d', path)
				   .style("fill", "steelblue");
});

//add points
d3.json(jsonUrl, function(data) {

	//domain for colors
	color.domain([d3.min(data.features, function(d) {
						return +(d.properties.mass);
				}),	
					d3.max(data.features, function(d) {
						return +(d.properties.mass);
				})]);	

	 meteorites = svg.selectAll('circle')
					 .data(data.features)
					 .enter()
					 .append('circle')
					 .attr('cx', function(d) {
					 				 return projection([d.properties.reclong,d.properties.reclat])[0] 
					 				})
					 .attr('cy', function(d) {
					 				 return projection([d.properties.reclong,d.properties.reclat])[1] 
									 })
					 .attr('r', function(d){
					 			/*
					 			sqrt to have the proportions kinda based on area...multiply by 0.00003? 
					 			That's just cos i like the size at that scale
								*/
								return Math.sqrt(+d.properties.mass * 0.00003);
					 })
					 .style('fill-opacity', 0.8)
					 .style('fill', function(d) {
					 	//why multiply by 70? the scale wasn't displaying a wide color range without that. So i had to test by
					 	//multiplying by a number of values till i got something that looked cool :-)
					 	return color(+(d.properties.mass) * 70);
					 })
					 .on('mouseover', function(d) {
					 	//get mouse positions
					 	var xPos = d3.event.pageX;
					 	var yPos = d3.event.pageY;


					 	//get needed data
					 	var fall = d.properties.fall;
					 	var mass = d.properties.mass;
					 	var name = d.properties.name;
					 	var nameType = d.properties.nametype;
					 	var recclass = d.properties.recclass;
					 	var year = d.properties.year;

					 	//update html of the tooltip ID
					 	tooltip.html('Fall: ' + fall + '<br>' +
					 				 'Year: '+ year + '<br>' +
					 				 'Mass: ' + formatMass(mass) + 'kg<br>' +
					 				 'Name: ' + name + '<br>' +
					 				 'Nametype: ' + nameType + '<br>' +
					 				 'Recclass: ' + recclass + '<br>'
					 				)
					 		   .style('left', xPos + 25 +'px')
					 	       .style('top', yPos - 50 + 'px')
							   .transition()
					 		   .duration(500);
					 	//show tooltip	   
					 	tooltip.attr('class', 'show');
						})//end on mouseover
					    .on('mouseout', function() {
							tooltip.transition()
					 		   	   .duration(500);		    	
					        tooltip.attr('class', 'hidden')
					 	});//end mouseout		 
})

//Let's get our zoom buttons working!

//1. Declare maximum zoom in and out variables
var maxZoomIn = w * 2;
var maxZoomOut = w;

//2. define zoom behaviour
var zoom = d3.behavior.zoom()
			 .translate(projection.translate())
			 .scale(projection.scale())
			 .scaleExtent([maxZoomOut, maxZoomIn])
			 //handle zoom event @ double-click or mousewheel roll!!
			 .on('zoom', function(d) {
			 	//get the translate and scale values from this event
			 	var t = d3.event.translate;
			 	var s = d3.event.scale;

			 	//update the zoom & projecion objects with these
			 	zoom.translate(t);
			 	projection.translate(t).scale(s);

			 	//recalculate paths (given new t and s values)
			 	countries.attr('d', path);
			 	//same with metoerites. Update position
			 	meteorites.attr({
			 		cx: function(d) {
			 			return projection([d.properties.reclong,d.properties.reclat])[0];
			 		},
			 		cy: function(d) {
			 			return projection([d.properties.reclong,d.properties.reclat])[1];
			 		}
			 	})
			 }); //end on zoom event 

//3. Define zoomIn and zoomOut function we will call
//later

var zoomIn = function() {
	var newScale = Math.min(projection.scale() * 2, maxZoomIn);
	zoomTo(newScale);
}			 

var zoomOut = function () {
	var newScale = Math.min(projection.scale() / 2, maxZoomOut);
	zoomTo(newScale);
}

//4. Let's have some fun writing the actual zoomTo function
var zoomTo = function(newScale) {
	var t = projection.translate();
	var s = projection.scale();

	t[0] -= w/2;  //remove inintial translation Line 18
	t[0] *= newScale / s; //apply new scale, remove old
	t[0] += w/2;  //translate back to center

	t[1] -= h/2;
	t[1] *= newScale / s;
	t[1] += h/2;

	zoom.translate(t).scale(newScale);
	projection.translate(t).scale(newScale);


	//transition paths and circles into place
	countries.transition()
			 .ease('linear')
			 .delay(270)
			 .duration(500) //this is supposed to keep the transition smooth as metorites are called after. see better way to do this
			 .attr('d', path);

	meteorites.transition()
			  .ease('linear')
			  .duration(500)
			  .attr('cx', function(d) {
					 return projection([d.properties.reclong,d.properties.reclat])[0] ;
			   })
			  .attr('cy', function(d) {
					 return projection([d.properties.reclong,d.properties.reclat])[1] ;
				});					  
} //end zoomTo

d3.select("#zoomIn")
	.on("click", function() {
		zoomIn();
});
d3.select("#zoomOut")
	.on("click", function() {
		zoomOut();
});	





















