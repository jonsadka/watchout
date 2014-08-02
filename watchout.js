// start slingin' some d3 here.
//
// Our game stage:
var width = window.innerWidth;
var height = window.innerHeight;
var stats = {
  highScore: 0,
  currentScore: 0,
  collisions: 0
};
var pause = false;
var scaleEnemy = d3.scale.linear()
                        .domain([0, 1280])
                        .range([0, 8]);

var scaleEnemyCount = d3.scale.linear()
                        .domain([0, 1280])
                        .range([10, 35]);

var scalePlayer = d3.scale.linear()
                          .domain([0, 1280])
                          .range([5, 15]);


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
// create a function to handle drag events
var dragMove = function(d){
  d3.select(this)
  .attr('cx', d3.event.x)
  .attr('cy', d3.event.y);
};
// create drag behavior
var drag = d3.behavior.drag()
             .on('drag', dragMove);


// CONTAINER creation
var svg = d3.select('.stage')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#333');

// SCOREBOARD creation
svg.selectAll('scoreboard')
   .data(['High Score: ' + stats.highScore, 'Current Score: ' + stats.currentScore, 'Collisions: ' + stats.collisions])
   .enter()
   .append('text')
   .text(function(d){ return d; } )
   .attr('class', 'scoreboard')
   .attr('x', 20)
   .attr('y', function(d, i) {
      return 30 + i*18;
   })
   .attr('font-size', '15px')
   .attr('fill', '#fff');

// ENEMY creation
svg.selectAll('.enemy')
  .data( enemyPos(scaleEnemyCount(window.innerWidth) ) )
  .enter()
  .append('circle')
  .attr("class", "enemy")
  .attr('cx', function(d) {
    return d[0];
  })
  .attr('cy', function(d) {
    return d[1];
  })
  .attr('r', function(){ return scaleEnemy(window.outerWidth) + Math.floor(Math.random()*15)} )
  .attr('fill', 'red');

// PLAYER creation
svg.selectAll('player')
  .data([[]])
  .enter()
  .append('circle')
  .attr("class", "player")
  .attr('cx', width/2 )
  .attr('cy', height/2 )
  .attr('r', scalePlayer(window.outerWidth))
  .attr('fill', 'yellow')
  .call(drag);


var moveEnemy = function() {
  d3.selectAll('.enemy').each(function(){
      d3.select(this)
        .transition()
        .attr('cx', randomPos(width) )
        .attr('cy', randomPos(height) );
  });
};

var checkClash = function() {
  // get position of player and compare to EVERY enemy on page
  var playerPosX = svg.select('.player').attr('cx');
  var playerPosY = svg.select('.player').attr('cy');
  var playerSize = svg.select('.player').attr('r');

  // loop through each enemy and check if outer edge collides with player
  d3.selectAll('.enemy').each(function(){
    var enemyPosX = d3.select(this).attr('cx');
    var enemyPosY = d3.select(this).attr('cy');
    var enemySize = d3.select(this).attr('r');
    var distanceBetween =  Math.sqrt( Math.pow((playerPosX - enemyPosX),2) + Math.pow((playerPosY - enemyPosY),2) );
    var collideDistance = +playerSize + +enemySize;

    // if collides, add to collisions, save high score if applies and reset current score
    if ( distanceBetween < collideDistance ){
      stats.collisions++;
      pause = true;
      if(stats.currentScore > stats.highScore) {
        stats.highScore = stats.currentScore;
      }
      stats.currentScore = 0;
      setTimeout( function(){ pause = false; }, 500);
    }

  });
};

var updateScore = function() {
  d3.selectAll('.scoreboard')
      .data(['High Score: ' + stats.highScore, 'Current Score: ' + stats.currentScore, 'Collisions: ' + stats.collisions])
     .text(function(d){ return d; } );
};


setInterval( function(){ updateScore(); }, 10);
setInterval( function(){ stats.currentScore += 1; }, 10);
setInterval( function(){ return moveEnemy(); }, 1000);
var enemyCheck = setInterval( function(){
  if(!pause) {
    return checkClash();
  }
}, 5);
