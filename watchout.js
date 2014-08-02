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
                        .range([10, 25]);

var scaleEnemySpeed = d3.scale.linear()
                          .domain([0, 1280])
                          .range([1000, 2000]);

var scalePlayer = d3.scale.linear()
                          .domain([0, 1280])
                          .range([10, 10]);

// generates a set amount of enemies with unique locations
var elementPos = function(numElements){
  var allElements = [];
  for ( var i = 0; i < numElements; i++ ){
    allElements.push([randomPos(width), randomPos(height)]);
  }
  return allElements;
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
var drag = d3.behavior.drag().on('drag', dragMove);

// CONTAINER creation
var svg = d3.select('.stage')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

// ENEMY creation
svg.selectAll('.enemy')
  .data( elementPos(scaleEnemyCount(window.innerWidth)) )
  .enter()
  .append('circle')
  .attr("class", "enemy")
  .attr('cx', function(d) {
    return d[0];
  })
  .attr('cy', function(d) {
    return d[1];
  })
  .attr('r', function(){ return scaleEnemy(window.outerWidth) + Math.floor(Math.random()*15); } )
  .attr('fill','#01B0F0');

// PLAYER creation
svg.selectAll('player')
  .data([[]])
  .enter()
  .append('circle')
  .attr("class", "player")
  .attr('cx', width/2 )
  .attr('cy', height/2 )
  .attr('r', scalePlayer(window.outerWidth))
  .attr('fill', '#FF358B')
  .call(drag);

// FOOD creation
svg.selectAll('.food')
  .data( elementPos(2) )
  .enter()
  .append('circle')
  .attr("class", "food")
  .attr('cx', function(d) {
    return d[0];
  })
  .attr('cy', function(d) {
    return d[1];
  })
  .attr('r', 5 )
  .attr('fill', '#AEEE00');

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

var moveEnemy = function() {
  d3.selectAll('.enemy').each(function(){
      d3.select(this)
        .transition().duration(scaleEnemySpeed(window.outerWidth))
        .attr('cx', randomPos(width) )
        .attr('cy', randomPos(height) );
  });

  d3.selectAll('.food').each(function(){
    var moveCX = Number(d3.select(this).attr('cx')) + Math.floor(Math.random()*100) - Math.floor(Math.random()*100);
    var moveCY = Number(d3.select(this).attr('cy')) + Math.floor(Math.random()*100) - Math.floor(Math.random()*100);

    d3.select(this)
      .transition().duration(scaleEnemySpeed(window.outerWidth))
      .attr('cx', moveCX)
      .attr('cy', moveCY);
  });
};

var checkClash = function() {
  // get position of player and compare to EVERY enemy on page
  var playerPosX = svg.select('.player').attr('cx');
  var playerPosY = svg.select('.player').attr('cy');
  var playerSize = svg.select('.player').attr('r');

  // loop through each food and check if outer edge collides with player
  d3.selectAll('.food').each(function(){
    var foodPosX = d3.select(this).attr('cx');
    var foodPosY = d3.select(this).attr('cy');
    var foodSize = d3.select(this).attr('r');
    var distanceBetween =  Math.sqrt( Math.pow((playerPosX - foodPosX),2) + Math.pow((playerPosY - foodPosY),2) );
    var collideDistance = Number(playerSize) + Number(foodSize);

    // if collides, add to collisions, save high score if applies and reset current score
    if ( distanceBetween < collideDistance ){

      // increase the score by 150
      stats.currentScore = Number(stats.currentScore) + 150;

      // get random position and move food to that spot
      svg.select('.player').attr('r', scalePlayer(window.outerWidth));
      var moveCX = randomPos(window.innerWidth);
      var moveCY = randomPos(window.innerHeight);
      d3.select(this).transition().duration(1).attr('cx', moveCX).attr('cy', moveCY);
    }

  });

  // loop through each enemy and check if outer edge collides with player
  d3.selectAll('.enemy').each(function(){
    var enemyPosX = d3.select(this).attr('cx');
    var enemyPosY = d3.select(this).attr('cy');
    var enemySize = d3.select(this).attr('r');
    var distanceBetween =  Math.sqrt( Math.pow((playerPosX - enemyPosX),2) + Math.pow((playerPosY - enemyPosY),2) );
    var collideDistance = Number(playerSize) + Number(enemySize);

    // if collides, add to collisions, save high score if applies and reset current score
    if ( distanceBetween < collideDistance ){
      stats.collisions++;
      pause = true;
      svg.select('.player').attr('r', scalePlayer(window.outerWidth))
                           .transition().attr('fill', 'none')
                           .transition().attr('fill', 'yellow');
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

// update scoreboard and add tally over time
setInterval( function(){ updateScore(); }, 10);
setInterval( function(){ stats.currentScore += 1; }, 200);

// increse player size over time and moves enemy randomly
setInterval( function(){
  var rad = Number(d3.selectAll('.player').attr('r')) + 1.5;
  d3.selectAll('.player').transition().attr('r', rad );
  moveEnemy();
}, scaleEnemySpeed(window.outerWidth));

// check any collisions between elements in the game
var enemyCheck = setInterval( function(){
  if(!pause) {
    return checkClash();
  }
}, 5);
