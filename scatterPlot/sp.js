/*
The y axis is plotted against 'minutes behind the fastest time' @ x-axis
I didn't realise this earlier...so let's fix that
step 1: Get the fastest time
step 2: Get the difference between each racers 'time' & fastest
        time - fastest time (time is in seconds)
step 3: 
*/

var jsonUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

d3.json(jsonUrl, function(dataset) {
    //STEP 1 : dynamically get the fastest time
var fastestTime = d3.min(dataset, function(d) {
                        return d.Seconds; 
                  });
console.log(fastestTime);
//STEP 2 
dataset.forEach(function(obj) {
    //add a behindTime property to each obj
    obj.behindTime = obj.Seconds - fastestTime;
});

//margins
var margin = {top: 15, right: 100, bottom: 200, left: 100};

//width and height of the svg
var w = 1000 - margin.left - margin.right;
var h = 700 - margin.top - margin.bottom;

//select tooltip container
var tooltip = d3.select('#tooltip');

//for tickFormat into Minutes & Seconds
var toMinutes = function(d) {
    var t = new Date(2012, 0, 1, 0, d);
    t.setSeconds(t.getSeconds() + d);
    var formatToTime = d3.time.format('%H:%M');
    return formatToTime(t);
}
//create scale functions

/*for the xScale use our added behindTime property
but notice i switched the maximum value to the first input of d3.max to swap the axis, sortoff
*/
var xScale = d3.scale.linear()
                     .domain([(d3.max(dataset, function(d) {
                                return d.behindTime;
                     }) + 30), 0])
                     .range([0, w]);

var yScale = d3.scale.linear()
                     .domain([1, (d3.max(dataset, function(d){
                                return d.Place;
                     }) + 1)])
                     .range([0, h]);


//create Axis
var xAxis = d3.svg.axis()
                   .scale(xScale)
                   .orient('bottom')
                   .ticks(6)
                   .tickFormat(toMinutes);
                   //format this dude to MINUTES

var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left')
                  .ticks(8);

var svg = d3.select('section')
            .append('svg')
            .attr('class', 'chart')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');


svg.selectAll('circle')
   .data(dataset)
   .enter()
   .append('circle')
   .attr('cx', function(d) {
        return xScale(d.behindTime);
   })
   .attr('cy', function (d) {
        return yScale(d.Place);
   })
   .attr('r', 5)
   .attr('fill', function(d) {
        if (d.Doping == '') {
            return 'steelblue';
        }
        return 'red';
   })
   .on('mouseover', function (d) {
        //mouse positions
        var xPos = d3.event.pageX;
        var yPos = d3.event.pageY;
        
        tooltip.transition()
               .duration(200);
        //populate ID with data
        tooltip.html('<strong>' + d.Name + ' : ' + d.Nationality + '</strong><br>' + '<em> Year: ' + d.Year + ' , Time: ' + d.Time + '</em><br><span class="small">' + d.Doping + '</span>')
               .style('left', xPos + 5 + 'px')
               .style('top', yPos - 50 + 'px');
        //show tooltip
        tooltip.attr('class', 'show');      
   })
   .on('mouseout', function() {
        tooltip.transition()
               .duration(800)
               .attr('class', 'hidden');
   })


   /*text labels...We want this to be displayed close to 
   each circle. Just use same positioning as circles and
   re-position them via 'transform'
    */

  svg.selectAll('text')
      .data(dataset)
      .enter()
      .append('text')
      .text(function (d) {
          return d.Name;
      })
      .attr('x', function(d) {
          return xScale(d.behindTime);
      })
      .attr('y', function(d) {
          return yScale(d.Place);
      })
      .attr('transform', 'translate(15, 4)')
      .attr('font-size', '10pt');

  svg.append('g')
     .attr('class', 'axis')
     .call(yAxis)
     .append('text')
     .attr('transform', 'rotate(-90)')
     .attr('y', -30)
     .text('Ranking')
     .style('text-anchor', 'end');


  svg.append('g')
     .attr('class', 'axis')
     .attr('transform', 'translate(0, ' + h + ')')
     .call(xAxis)
     .append('text')
     .attr('x', 420)
     .attr('y', 35)
     .style('text-anchor', 'middle')
     .text('Minutes behind fastest time');

})


