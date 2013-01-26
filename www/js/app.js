
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

define(function(require) {
    // Zepto provides nice js and DOM methods (very similar to jQuery,
    // and a lot smaller):
    // http://zeptojs.com/
    var $ = require('zepto');

    // Need to verify receipts? This library is included by default.
    // https://github.com/mozilla/receiptverifier
    require('receiptverifier');

    // Want to install the app locally? This library hooks up the
    // installation button. See <button class="install-btn"> in
    // index.html
    require('./install-button');

    // Simple input library for our game
    var input = require('./input');

    // Create the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 480;
    document.body.appendChild(canvas);
    
    var newRound = 0;

    // The player's state
    var player = {
        x: 0,
        y: 0,
        sizeX: 25,
        sizeY: 25,
        grow: 0
    };
    
    // safezone
    var safeZone = {
    	x: 0,
    	y: canvas.height - 50,
    	sizeX: 100,
    	sizeY: 25,
    	move: 0
    };
    
    var current = {
    	playerx: 0,
        playery: 0,
        playersizeX: 25,
        playersizeY: 25,
        playergrow: 0,
        safeZonex: 0,
    	safeZoney: canvas.height - 50,
    	safeZonesizeX: 100,
    	safeZonesizeY: 25,
    	safeZonemove: 0
    };
    
    // Reset game to original state
    function reset() {
        player.x = current.playerx;
        player.y = current.playery;
        player.sizeX = current.playersizeX;
        player.sizeY = current.playersizeY;
        player.grow = current.playergrow;
        safeZone.x = current.safeZonex;
        safeZone.y = current.safeZoney;
        safeZone.sizeX = current.safeZonesizeX;
        safeZone.sizeY = current.safeZonesizeY;
        safeZone.move = current.safeZonemove;
    };
    
    function level2(){
    	player.x = 200;
        player.y = canvas.height-25;
        player.sizeX = 25;
        player.sizeY = 25;
        player.grow = 0;
        safeZone.x = 0;
        safeZone.y = 0;
        safeZone.sizeX = 100;
        safeZone.sizeY = 25;
        safeZone.move = 0;
    }

    // Pause and unpause
    function pause() {
        running = false;
    }

    function unpause() {
        running = true;
        then = Date.now();
        main();
    }

    // Update game objects
    function update(dt) {
        // Speed in pixels per second
        
        if(newRound == 0){
        	current.playerx = player.x;
			current.playery = player.y;
			current.playersizeX = player.sizeX;
			current.playersizeY = player.sizeY;
			current.playergrow = player.grow;
			current.safeZonex = safeZone.x;
			current.safeZoney = safeZone.y;
			current.safeZonesizeX = safeZone.sizeX;
			current.safeZonesizeY = safeZone.sizeY;
			current.safeZonemove = safeZone.move;
        	newRound = 1;
        }
        
        var playerSpeed = 100;

        if(input.isDown('DOWN')) {
            // dt is the number of seconds passed, so multiplying by
            // the speed gives u the number of pixels to move
            player.y += playerSpeed * dt;
        }

        if(input.isDown('UP')) {
            player.y -= playerSpeed * dt;
        }

        if(input.isDown('LEFT')) {
            player.x -= playerSpeed * dt;
        }

        if(input.isDown('RIGHT')) {
            player.x += playerSpeed * dt;
        }
        
        player.grow += 1;
        if(player.grow >= 200){
        	doublePlayerSize();
        	player.grow = 0;
        }
        
        safeZone.move += 1;
        if(safeZone.move >= 50){
        	safeZone.x += 5;
        	safeZone.move = 0;
        }
        
        if(player.sizeX > safeZone.sizeX){
        	// player has lost as it's too big
        	var retry = window.confirm("You didn't get to the safe zone in time. Try again?");
        	if(retry == true){
        		newRound = 0;
        		reset();
        	} else {
        		// end the game?
        	}
        }
        
        if(player.sizeX <= safeZone.sizeX){
        	if( (player.x >= safeZone.x) && (player.x <= (safeZone.x + safeZone.sizeX)) && (player.y >= safeZone.y) && (player.y <= safeZone.y + safeZone.sizeY) ){
        		//player wins as it's inside the canvas
        		reset();
        		
        		var next = window.confirm("Player is safe! Choose yes to go to the next round, click cancel to restart this round.");
        		
        		if(next == true){
        			// go to the next round
        			alert("We shall move to the next round!");
        			level2();
        			newRound = 0;
        		} else {
        			// restart the current round
        			alert("We shall restart the current round");
        		}
        	}
        }
    };

    // Draw everything
    function render() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'purple';
        ctx.fillRect(player.x, player.y, player.sizeX, player.sizeY);
        
        ctx.fillStyle = 'blue';
        ctx.fillRect(safeZone.x, safeZone.y, safeZone.sizeX, safeZone.sizeY);
        
    };
    
    function doublePlayerSize(){
    	player.sizeX = player.sizeX * 2;
 	   	player.sizeY = player.sizeY * 2;
 	   	player.grow = 0;
    };
    
    function winnerMessage(){
    	
    	// canvas writing
    	var CanvasText = new CanvasText;
	
  
		CanvasText.config({
			canvasId: "canvas",
			fontFamily: "Verdana",
			fontSize: "14px",
			fontWeight: "normal",
			fontColor: "#fff",
			lineHeight: "12"
		});
		
		var text = 'The player wins!';
		CanvasText.drawText({
			text:text,
			x: 20,
			y: 30
		});
		
    }
    
    // The main game loop
    function main() {
        if(!running) {
            return;
        }

        var now = Date.now();
        var dt = (now - then) / 1000.0;

        update(dt);
        render();

        then = now;
        requestAnimFrame(main);
    };

    // Don't run the game when the tab isn't visible
    window.addEventListener('focus', function() {
        unpause();
    });

    window.addEventListener('blur', function() {
        pause();
    });

    // Let's play this game!
    reset();
    var then = Date.now();
    var running = true;
    main();
});
