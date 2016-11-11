var w = 1000;
var h = 800;

//create svg element
var svg = d3.select('section')
            .append('svg')
            .attr({
                  width: w,
                  height: h
            });



//get data
var jsonUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
d3.json(jsonUrl, function(dataset) {
      //force layout
      var force = d3.layout.force()
                           .nodes(dataset.nodes)
                           .links(dataset.links)
                           .size([w,h])
                           .linkDistance(50)
                           .charge(-100)
                           .start();

      //render link and nodes
      var edges = svg.selectAll('line')
                    .data(dataset.links)
                    .enter()
                    .append('line')
                    .style('stroke', '#ccc')
                    .style('stroke-width', 1);

      var colors = d3.scale.category20();

      var nodes = svg.selectAll('circle')
                    .data(dataset.nodes)
                    .enter()
                    .append('circle')
                    .attr({
                        fill : function(d, i) {
                              return colors(i);
                              },
                        r: 5      
                        })
                    .call(force.drag);

      //super simple tooltip
      nodes.append('title')
           .text(function(d) {
                  return d.country + ' | ' + d.code.toUpperCase();
           })


      force.on('tick', function() {

            edges.each(function(d) {

                 d3.select(this).attr({
                        x1: d.source.x,
                        y1: d.source.y,
                        x2: d.target.x,
                        y2: d.target.y
                 }) 
            })

            nodes.attr({
                  cx: function(d) {
                        return d.x;
                        },
                  cy: function(d) {
                        return d.y;
                        }
                  })
      })
            /*
            OR..

            force.on('tick', function()  {
                  
                  edges.attr('x1', function(d) {
                        return d.source.x
                  })

                  ...do for all
            }) */
})
























                     