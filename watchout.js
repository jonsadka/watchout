// start slingin' some d3 here.
//
// Our game stage:
var width = 960;
var height = 500;

// generates a set amount of enemies with unique locations
var enemyPos = function(numEnemies){
  var allEnemies = [];
  for ( var i = 0; i < numEnemies; i++ ){
    allEnemies.push([randomPos(width), randomPos(height)]);
  }
  return allEnemies;
};

// generates a random position
var randomPos = function( size ){
  return Math.floor( Math.random() * size );
};

// CONTAINER creation
var svg = d3.select('.stage')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#333');

// ENEMY creation
svg.selectAll('circle')
  .data(enemyPos(5))
  .enter()
  .append('circle')
  .attr("class", "enemy")
  .attr('cx', function(d) {
    return d[0];
  })
  .attr('cy', function(d) {
    return d[1];
  })
  .attr('r', function(d) {
    return Math.sqrt(height - d[1]);
  })
  .attr('fill', 'red')
  .attr('stroke-width', '3')
  .attr('stroke', 'blue');

// PLAYER creation
svg.selectAll('rect')
  .data([[]])
  .enter()
  .append('rect')
  .attr("class", "player")
  .attr('width', 35 )
  .attr('height', 15 )
  .attr('x', width/2 )
  .attr('y', height/2 )
  .attr('fill', 'yellow')
  .attr('stroke-width', '3')
  .attr('stroke', 'yellow');

var moveEnemy = function() {
  d3.selectAll('.enemy').each(function(){
      d3.select(this)
        .transition()
        .attr('cx', randomPos(width) )
        .attr('cy', randomPos(height) );
  });
};

var checkClash = function() {

};

setInterval( function(){ return moveEnemy(); }, 1000);
setInterval( function(){ return checkClash(); }, 100);
