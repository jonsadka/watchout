///////////////////////////////////////////////////////////////////
var scales = {
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  scaleEnemyNum: d3.scale.linear().domain([320, 1280]).range([6, 16]),
  scaleEnemySize: d3.scale.linear().domain([320, 1280]).range([3, 15]),
  scaleEnemySpeed: d3.scale.linear().domain([0, 1280]).range([800, 1800]),
  scalePlayerSize: d3.scale.linear().domain([0, 1280]).range([10, 15])
}

var settings = {
  playerRadius: scales.scalePlayerSize(scales.windowWidth),
  enemyRadius: 10,
  enemyCount: Math.floor(scales.scaleEnemyNum(scales.windowWidth)),
  foodRadius: 5,
  foodCount: 2,
  duration: scales.scaleEnemySpeed(scales.windowWidth)
};

var mouse = { x: scales.windowWidth, y: scales.windowHeight };
var score = 0, bestScore = 0;

var rand  = function(number){ return Math.floor( Math.random() * number ); };
var randX = function(){ return rand(scales.windowWidth) };
var randY = function(){ return rand(scales.windowHeight) };

///////////////////////////////////////////////////////////////////

var board = d3.select('div.board').append('svg')
              .attr('width', scales.windowWidth).attr('height', scales.windowHeight);

var enemies = board.selectAll('.roundenemy')
                    .data(d3.range(settings.enemyCount))
                    .enter().append('circle').attr('class', 'roundenemy')
                    .attr('cx', randX )
                    .attr('cy', randY )
                    .attr('r', function() { return settings.enemyRadius + scales.scaleEnemySize( rand(scales.windowWidth) )} ) 
                    .attr('fill', '#01B0F0')

var food = board.selectAll('.roundfood')
                    .data(d3.range(settings.foodCount))
                    .enter().append('circle').attr('class', 'roundfood')
                    .attr('cx', randX )
                    .attr('cy', randY )
                    .attr('r', settings.foodRadius ) 
                    .attr('fill', '#AEEE00');

var moveEnemy = function(element){
  element.transition().duration(settings.duration).ease('cubic-in-out')
         .attr('cx', randX )
         .attr('cy', randY )
         .each('end', function(){ moveEnemy(d3.select(this)) });
};
moveEnemy(enemies);

var player = board.selectAll('.player')
                    .data([[scales.windowWidth / 2, scales.windowHeight / 2]])
                    .enter().append('circle').attr('class', 'player')
                    .attr('cx', function(d){ return d[0]; } )
                    .attr('cy', function(d){ return d[1]; } )
                    .attr('r', +settings.playerRadius ) 
                    .attr('fill', '#FF358B');

board.on('mousemove', function(){
  var loc = d3.mouse(this);
  mouse = { x: loc[0], y: loc[1] };
  d3.select('.player').attr('cx', loc[0] )
                      .attr('cy', loc[1] )
});

var scoreTicker = function(){
  score = score + 1;
  bestScore = Math.max(score, bestScore);
  d3.select('.scoreboard .current span').text(score);
  d3.select('.scoreboard .high span').text(bestScore);
};
setInterval(scoreTicker, 200);

///////////////////////////////////////////////////////////////////

var prevCollision = false;
var detectCollisions = function(){
  var enemyCollision = false;
  var foodCollision = false;

  // grow player radius
  var grownRadius = +d3.select('.player').attr('r') + .025;
  d3.select('.player').attr('r', grownRadius );

  enemies.each(function(){
    var cx = +d3.select(this).attr('cx');
    var cy = +d3.select(this).attr('cy');
    var x = cx - mouse.x;
    var y = cy - mouse.y;
    if( Math.sqrt(x*x + y*y) < +d3.select(this).attr('r') + grownRadius ){
      enemyCollision = true;
    }
  });

  if(enemyCollision) {
    score = 0;
    board.style('background-color', '#FF358B');
    if(prevCollision !== enemyCollision){
      d3.select('.player').attr('r', scales.scalePlayerSize(scales.windowWidth) );
    }
  } else {
    board.style('background-color', '#333333');
  }

  food.each(function(){
    var cx = +d3.select(this).attr('cx');
    var cy = +d3.select(this).attr('cy');
    var x = cx - mouse.x;
    var y = cy - mouse.y;
    if( Math.sqrt(x*x + y*y) < +d3.select(this).attr('r') + grownRadius ){
      foodCollision = true;
    }
  });

  if(foodCollision) {
    score += 100;
    if(prevCollision !== foodCollision){
      d3.select('.player').attr('r', scales.scalePlayerSize(scales.windowWidth) );
      d3.selectAll('.roundfood').attr('cx', randX ).attr('cy', randY );
    }
  }

  prevCollision = enemyCollision || foodCollision;
};

d3.timer(detectCollisions);
