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

var enemyShape = "M70.151,80.099c-10.254,3.286-21.438-1.19-26.59-10.641l-0.465-0.852l-8.659,4.561l0.472,0.875c7.366,13.65,23.444,20.118,38.23,15.38c16.945-5.43,26.314-23.633,20.884-40.579l-0.3-0.937l-9.323,2.987l0.3,0.937C88.482,63.635,81.955,76.316,70.151,80.099z";


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
var drag = d3.behavior.drag()
             .on('drag', dragMove);

// CONTAINER creation
var svg = d3.select('.stage')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

// ENEMY creation
svg.selectAll('.enemy')
  // .data( elementPos(scaleEnemyCount(window.innerWidth)) )
  .data( elementPos(scaleEnemyCount(3)) )
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
  .attr('fill','red');

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

// FOOD creation
svg.selectAll('.food')
  .data( elementPos(2) )
  .enter()
  .append('svg:image')
  .attr("class", "food")
  .attr('x', function(d) {
    return d[0];
  })
  .attr('y', function(d) {
    return d[1];
  })
  .attr('width', 50)
  .attr('height', 50)
  .attr("xlink:href", "diamond.svg");


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
    var moveCX = Number(d3.select(this).attr('x')) + Math.floor(Math.random()*100) - Math.floor(Math.random()*100);
    var moveCY = Number(d3.select(this).attr('y')) + Math.floor(Math.random()*100) - Math.floor(Math.random()*100);

    d3.select(this)
      .transition().duration(scaleEnemySpeed(window.outerWidth))
      .attr('x', moveCX)
      .attr('y', moveCY);
  });

};

var checkClash = function() {
  // get position of player and compare to EVERY enemy on page
  var playerPosX = svg.select('.player').attr('cx');
  var playerPosY = svg.select('.player').attr('cy');
  var playerSize = svg.select('.player').attr('r');

  // loop through each food and check if outer edge collides with player
  d3.selectAll('.food').each(function(){
    var foodPosX = d3.select(this).attr('x');
    var foodPosY = d3.select(this).attr('y');
    var foodSize = d3.select(this).attr('width');
    var distanceBetween =  Math.sqrt( Math.pow((playerPosX - foodPosX),2) + Math.pow((playerPosY - foodPosY),2) );
    var collideDistance = Number(playerSize) + Number(foodSize);

    // if collides, add to collisions, save high score if applies and reset current score
    if ( distanceBetween < collideDistance ){
      svg.select('.player').attr('r', scalePlayer(window.outerWidth));
      stats.currentScore += 100;
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
      svg.select('.player').attr('r', scalePlayer(window.outerWidth));
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
setInterval( function(){
  var rad = Number(d3.selectAll('.player').attr('r')) + 1.5;
  d3.selectAll('.player').transition().attr('r', rad );
  return moveEnemy();
}, scaleEnemySpeed(window.outerWidth));
var enemyCheck = setInterval( function(){
  if(!pause) {
    return checkClash();
  }
}, 5);
