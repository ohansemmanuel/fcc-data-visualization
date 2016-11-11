
/*
//super simple tooltip
nodes.append('title')
     .text(function(d) {
            return d.country + ' | ' + d.code.toUpperCase();
     })
*/

force.on('tick', function() {

      edges.each(function(d) {

           d3.select(this).attr({
                  x1: d.source.x,
                  y1: d.source.y,
                  x2: d.target.x,
                  y2: d.target.y
           }) 
      })

      nodes.style('left', function (d) {
            return d.x - 8 + "px";
      }).style('top', function (d) {
            return d.y - 5 + "px";
      });
})

/*
OR..

force.on('tick', function()  {
      
      edges.attr('x1', function(d) {
            return d.source.x
      })

      ...do for all
})
*/






















                     