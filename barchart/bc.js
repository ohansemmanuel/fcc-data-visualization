var jsonUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json'
d3.json(jsonUrl, function(data) {
    var theData = data.data;
    //global variables, width and height and padding variable
    var margin = {top: 10, right: 75, bottom: 30, left: 75} //play
    var w = 800 - margin.left - margin.right;
    var h = 300 - margin.top - margin.bottom;

    //format to dollars
    var dollar = d3.format('$, .2f');

    //tooltip
    var tooltip = d3.select('#tooltip');

    //month array to be used on getMonth()
    var months = ['January',
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
                  'December'];

    //create scale function
    var xScale = d3.time.scale()
                        .domain([
                            new Date(theData[0][0]),
                            new Date(theData[theData.length-1][0])
                            ])
                        .range([0, w]);

    var yScale = d3.scale.linear()
                         .domain([0, d3.max(theData, function(d){
                                return d[1];
                         })])
                         .range([h, 0]);

    //create Axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient('bottom')
                      .ticks(d3.time.years, 5) //play with this

    var yAxis = d3.svg.axis()
                      .scale(yScale)  
                      .orient('left')
                      .ticks(10) //play

    //svg to hold our chart
    var svg = d3.select('section')
                .append('svg')
                .attr('class', 'chart')
                .attr('width', w + margin.left + margin.right)
                .attr('height', h + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll('rect')
       .data(theData)
       .enter()
       .append('rect')
       .attr('x', function (d) {
            return xScale(new Date(d[0]));
       })
       .attr('y', function (d) {
            return yScale(d[1]);
       })
       .attr('width', (w / theData.length)) //play with 
       .attr('height', function(d) {
            return h - yScale(d[1]);
       })
       .attr('fill', 'rgba(140, 172, 234, 0.4)')
       .on('mouseover', function (d) {

            //mouse's positions
            var posX = d3.event.pageX;
            var posY = d3.event.pageY;

            //get date stuffs to be shown in the tooltip
            var date = new Date(d[0]);
            var year = date.getFullYear();
            var month = date.getMonth();
            var amount = d[1];

            //set class to change color of current bar
            var rect = d3.select(this);
                       rect.attr('class', 'mouseover');

            //update tooltip position and value (add transition effect)
            tooltip.transition()
                   .duration(200)              
            tooltip.html('<strong>' + dollar(d[1]) + '&nbsp;Billion </strong><br>'  + '<em>' + year + ' - ' + months[month] + '</em>') 
                   .style('left', (posX + 5)+ 'px')
                   .style('top', (posY - 50) + 'px')
            //show tooltip
            tooltip.attr('class', 'show')

       })
       .on('mouseout', function () {
            //change this rect color
            var rect = d3.select(this)
                          rect.attr('class', 'mouseoff')
            tooltip.transition()
                   .duration(500);   
            //hide tooltip
            tooltip.attr('class', 'hidden')  ;  
       })

      //call axis-Y
      svg.append('g')
         .attr('class', 'axis')
         .call(yAxis)
         .append('text')
         .attr('transform', 'rotate(-90)')
         .attr('y', 6)
         .attr('dy', '0.8em')
         .style('text-anchor', 'end')
         .text('Gross Domestic Product, USA');

      //call axis-X
      svg.append('g')
         .attr('class', 'axis')
         .attr('transform', 'translate(0, ' + h + ')')
         .call(xAxis);
})
