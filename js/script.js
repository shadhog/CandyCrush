(function($){
    $.fn.shake = function(settings) {
        if(settings == undefined){
			var settings = {
				interval: 85,
				distance: 8,
				times: 4,
				complete: function(){}
			};
		}

        //$(this).css('position','relative');

		var temp =  $(this).position().left, shakeLeft, shakeIndex = $(this).css('z-index');
		$(this).css('z-index',10000);
        for(var iter=0; iter<(settings.times+1); iter++){
			shakeLeft = temp+((iter%2 == 0 ? settings.distance : settings.distance * -1));
            $(this).animate({ left: shakeLeft}, settings.interval);
        }

        $(this).animate({ left: temp}, settings.interval, settings.complete);  
		$(this).css('z-index',shakeIndex);
    }; 
	$.fn.bounce = function(settings) {
		if(settings == undefined){
			var settings = {
				interval: 85,
				distance: 8,
				times: 4,
				complete: function(){}
			};
		}

		var temp =  $(this).position().top, bounceTop, shakeIndex = $(this).css('z-index');
		$(this).css('z-index',10000);
        for(var iter=0; iter<(settings.times+1); iter++){
			bounceTop = temp+((iter%2 == 0 ? settings.distance : settings.distance * -1));
            $(this).animate({ top: bounceTop}, settings.interval);
        }

        $(this).animate({ top: temp}, settings.interval, settings.complete);  
		$(this).css('z-index',shakeIndex);
    };
})(jQuery);


$( document ).ready(function() {
	var background = $('.background');
	var game = $('#game');
	var scoreDiv = $('#score');
	//var numberOfImages = 25;
	var numberOfImages = 4;
	var blocks = [];
	var boardSize = 8;
	var numberOfBlocks = boardSize*boardSize;
	var gameWidth = game.width();
	var blockSize = gameWidth/boardSize;
	var animatioDelay = 250;
	var anyMoreMatches = false;
	var elementID = 0;
	var score = 0;
	 
	
		
		
	var mkw = 5;
	//var mkw = parseInt(getUrlParameter('mkw'));
	// FUNCTAION TO GET PARAMETERS FROM ADDRESS
	function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};
	
	// CHECK FOR VALID MKW
	if( typeof mkw !== 'undefined' && mkw > 1 && mkw < 30) {
		$(window).load(function() {
			background.animate({'border-width': 0}, 2000);
		
			boardSize = mkw;
			numberOfBlocks = (boardSize) * (boardSize);
			blockSize = gameWidth/boardSize;
			initialize();
			setDraggable();
			printBoard('Start State:');
			checkAndRemove(0);
			
			
			
			function setDraggable() {
				// http://touchpunch.furf.com/
				var start,stop,movedBlock;
				$('.block').draggable({
					opacity: 0.0000000001,
					helper: "clone",
					start: function(event, ui) {
						start = ui.position;
					},
					drag: function(event, ui) {			
					},
					stop: function(event, ui) {
						stop = ui.position;
						first = findBlockByCode($(this).attr('data-code'));
						var firstX = first.x,
							firstY = first.y;
						if((Math.abs(start.left-stop.left) > Math.abs(start.top-stop.top))) {
							//console.log('has moved ' + ((start.left < stop.left) ? 'right':'left'));
							if(start.left < stop.left) { 									// Right
								if(firstY+1 < boardSize) {
									if(blocks[firstX][firstY+1] != null) {
										switchBlocks(first, blocks[firstX][firstY+1]);
										if(getCheckMatch()) {
											checkAndRemove(0);
										}
										else {
											switchBlocks(first, blocks[firstX][firstY]);
										}
									}
									else notValidMove(first, 'shake');
								}
								else notValidMove(first, 'shake');
							}
							else { 															// Left
								if(firstY-1 >= 0) {
									if(blocks[firstX][firstY-1] != null) {
										switchBlocks(first, blocks[firstX][firstY-1]);
										if(getCheckMatch()) {
										checkAndRemove(0);
										}
										else {
											switchBlocks(first, blocks[firstX][firstY]);
										}
									}
									else notValidMove(first, 'shake');
								}
								else notValidMove(first, 'shake');
							}
						}
						else {
							//console.log('has moved ' + ((start.top < stop.top) ? 'down':'up'));
							if(start.top < stop.top) { 										// Down
								if(firstX+1 < boardSize) {
									if(blocks[firstX+1][firstY] != null) {
										switchBlocks(first, blocks[firstX+1][firstY]);
										if(getCheckMatch()) {
										checkAndRemove(0);
										}
										else {
											switchBlocks(first, blocks[firstX][firstY]);
										}
									}
									else notValidMove(first, 'bounce');
								}
								else notValidMove(first, 'bounce');
							}
							else { 															// Up
								if(firstX-1 >= 0) {
									if(blocks[firstX-1][firstY] != null) {
										switchBlocks(first, blocks[firstX-1][firstY]);
										if(getCheckMatch()) {
										checkAndRemove(0);
										}
										else {
											switchBlocks(first, blocks[firstX][firstY]);
										}
									}
									else notValidMove(first, 'bounce');
								}
								else notValidMove(first, 'bounce');
							}
						}
					}
				});
			}
		
			


			function checkAndRemove(addMoreDelay) {
				game.addClass('wait');
				setTimeout(function(){ 
					console.log('checkAndRemove');
					checkForThreeMatch();
					removeThreeMatch();
				}, animatioDelay+addMoreDelay);
			}
			
			
			function initialize() {
				var arr = [];
				for( var x = 0 ; x < numberOfBlocks ; x++ ) {
					arr[x] = new block((parseInt(x/boardSize)),(x%boardSize));
				}
				convertArrayToMatrix(arr);
			}
			
			function convertArrayToMatrix(arr) {
				while(arr.length) blocks.push(arr.splice(0,boardSize));
			}
			
			
			function block(x,y) {
				this.x = x;
				this.y = y;
				this.id = Math.floor(Math.random() * numberOfImages);
				this.image = setImage(x,y,this.id);
				this.code = this.image.attr('data-code');
				
				function setImage(x,y,id) {
					return $('<img>', {
						class: 'block',
						src: 'images/' + id + '.png'
					}).attr({
						'data-code': elementID++
					}).css({
						'left': y * blockSize,
						'top': x * blockSize,
						'width': blockSize
					}).appendTo(game);
				}
				
				this.redraw = function(animate) {
					if(animate) {
						$(this.image).animate({
							'left': this.y * blockSize,
							'top': this.x * blockSize,
							'width': blockSize
						}, animatioDelay);
					}
					else {
						$(this.image).css({
							'left': this.y * blockSize,
							'top': this.x * blockSize,
							'width': blockSize
						});
					}
				}
				
				/*this.getCheckMatch = function() {
					var match = false;
					if(x+2 < boardSize){
						if(this.getID() == blocks[y][x+1].getID() && this.getID() == blocks[y][x+2].getID()){
							match = true;
						}
					}
					if(y+2 < boardSize) {
						if(this.getID() == blocks[y+1][x].getID() && this.getID() == blocks[y+2][x].getID()){
							match = true;
						}
					}
					return match;
				}*/
				
				/*this.checkForThreeMatch = function() {
					if(this.x+2 < boardSize){
						if(this.getID() == blocks[this.y][this.x+1].getID() && this.getID() == blocks[this.y][this.x+2].getID()){
							this.getImage().addClass('match');
							blocks[this.y][this.x+1].getImage().addClass('match');
							blocks[this.y][this.x+2].getImage().addClass('match');
						}
					}
					if(this.y+2 < boardSize) {
						if(this.getID() == blocks[this.y+1][this.x].getID() && this.getID() == blocks[this.y+2][this.x].getID()){
							this.getImage().addClass('match');
							blocks[this.y+1][this.x].getImage().addClass('match');
							blocks[this.y+2][this.x].getImage().addClass('match');
						}
					}
				}*/
				
				this.moveTo = function(x,y) {
					this.x = x;
					this.y = y;
					blocks[x][y] = this;
					this.redraw(true);
				}
				
				this.getX = function() {
					return this.x;
				}
				
				this.getY = function() {
					return this.y;
				}
				
				this.getImage = function() {
					return $(this.image);
				}
				this.getID = function() {
					return this.id;
				}
				
			}
			
			function checkForThreeMatch() {
				for ( var y = 0 ; y < boardSize ; y++ ) {
					for ( var x = 0 ; x < boardSize ; x++ ) {
						if(x+2 < boardSize){
							if(blocks[y][x].getID() == blocks[y][x+1].getID() && blocks[y][x].getID() == blocks[y][x+2].getID()){
								blocks[y][x].getImage().addClass('match');
								blocks[y][x+1].getImage().addClass('match');
								blocks[y][x+2].getImage().addClass('match');
								updateScore(10);
							}
						}
						if(y+2 < boardSize) {
							if(blocks[y][x].getID() == blocks[y+1][x].getID() && blocks[y][x].getID() == blocks[y+2][x].getID()){
								blocks[y][x].getImage().addClass('match');
								blocks[y+1][x].getImage().addClass('match');
								blocks[y+2][x].getImage().addClass('match');
								updateScore(10);
							}
						}
					}
				}
			}	
			
			function updateScore(plus) {
				score += plus;
				scoreDiv.html(score);
			}
			
			function getCheckMatch() {
				for ( var y = 0 ; y < boardSize ; y++ ) {
					for ( var x = 0 ; x < boardSize ; x++ ) {
						if(x+2 < boardSize){
							if(blocks[y][x].getID() == blocks[y][x+1].getID() && blocks[y][x].getID() == blocks[y][x+2].getID()){
								return true;
							}
						}
						if(y+2 < boardSize) {
							if(blocks[y][x].getID() == blocks[y+1][x].getID() && blocks[y][x].getID() == blocks[y+2][x].getID()){
								return true;
							}
						}
					}
				}
			}
			
			
			$(window).on('resize', resizeCanvas);
			

			function resizeCanvas() {
				gameWidth = game.width();
				blockSize = gameWidth/boardSize;
				for ( var y = 0 ; y < boardSize ; y++ ) {
					for ( var x = 0 ; x < boardSize ; x++ ) {
						if(blocks[x][y] != null) {
							blocks[x][y].redraw();
						}
					}
				}
			}
			
			
		
			function switchBlocks(block1, block2) {
				var temp = block1,
					tempX = block2.x,
					tempY = block2.y;
				block2.moveTo(block1.getX(),block1.getY());
				blocks[block1.getX()][block1.getY()] = block2;
				block1.moveTo(tempX,tempY);
				blocks[tempX][tempY] = temp;
			}
			
			function notValidMove(block, dirction) {
				console.error('Not Valid Move');
				if(dirction == 'shake') block.getImage().shake();
				if(dirction == 'bounce') block.getImage().bounce();
			}
			
			function findBlockByCode(code) {
				for ( var y = 0 ; y < boardSize ; y++ ) {
					for ( var x = 0 ; x < boardSize ; x++ ) {
						if(blocks[y][x] != null) {
							if(blocks[y][x].code == code) {
								return blocks[y][x];
							}
						}
					}
				}
			}
			
		
			
			function removeThreeMatch() {
				$('.match').fadeOut(animatioDelay);
				setTimeout(function(){ 
					$('.match').remove();
					for ( var y = 0 ; y < boardSize ; y++ ) {
						for ( var x = 0 ; x < boardSize ; x++ ) {
							if(blocks[x][y].getImage().hasClass('match')) blocks[x][y] = null;
						}
					}
					printBoard('Marking The 3 Matches:');
					for(var x = boardSize-1; x >= 0 ; x--) {
						var bottom = boardSize-1;
						for(var y = boardSize-1; y >= 0 ; y--) {
							if(blocks[y][x] != null && bottom != y) {
								blocks[y][x].moveTo(bottom,x);
								blocks[y][x] = null;
								bottom--;
							}
							else if(blocks[y][x] != null) {
								bottom--;
							}
							
						}
					}
					printBoard('After Colapsing: ');
					fillTable();
				}, animatioDelay);
			}
			
			
			
			function fillTable() {
				var temp, fillAnimation = animatioDelay;
				anyMoreMatches = false;
				for( var x = 0 ; x < boardSize ; x++ ) {
					for( var y = 0 ; y < boardSize ; y++ ) {
						if(blocks[y][x] == null) {
							blocks[y][x] = new block(y,x);
							temp = blocks[y][x].getImage().css('top');
							blocks[y][x].getImage().css('top', -blockSize);
							blocks[y][x].getImage().animate({'top': temp}, fillAnimation);
							fillAnimation += 40;
							anyMoreMatches = true;
						}
					}
				}
				
				if(anyMoreMatches) checkAndRemove(fillAnimation);
				else {
					game.removeClass('wait');
					setDraggable();
				}
			}
			

			function printBoard(massage) {
				var print = massage + '\n';
				for ( var y = 0 ; y < boardSize ; y++ ) {
					for ( var x = 0 ; x < boardSize ; x++ ) {
						if(blocks[y][x] == null) print += '- ';
						else print += blocks[y][x].getID() + ' ';
					}
					print += '\n'
				}
				console.log(print);
			}

		});
		
		
		
		
		

		/*  This is the Confetti code  */

		// globals
		var canvas;
		var ctx;
		var W;
		var H;
		var mp = 150; //max particles
		var particles = [];
		var angle = 0;
		var tiltAngle = 0;
		var confettiActive = true;
		var animationComplete = true;
		var deactivationTimerHandler;
		var reactivationTimerHandler;
		var animationHandler;

		// objects

		var particleColors = {
			colorOptions: ["DodgerBlue", "OliveDrab", "Gold", "pink", "SlateBlue", "lightblue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"],
			colorIndex: 0,
			colorIncrementer: 0,
			colorThreshold: 10,
			getColor: function () {
				if (this.colorIncrementer >= 10) {
					this.colorIncrementer = 0;
					this.colorIndex++;
					if (this.colorIndex >= this.colorOptions.length) {
						this.colorIndex = 0;
					}
				}
				this.colorIncrementer++;
				return this.colorOptions[this.colorIndex];
			}
		}

		function confettiParticle(color) {
			this.x = Math.random() * W; // x-coordinate
			this.y = (Math.random() * H) - H; //y-coordinate
			this.r = RandomFromTo(10, 30); //radius;
			this.d = (Math.random() * mp) + 10; //density;
			this.color = color;
			this.tilt = Math.floor(Math.random() * 10) - 10;
			this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
			this.tiltAngle = 0;

			this.draw = function () {
				ctx.beginPath();
				ctx.lineWidth = this.r / 2;
				ctx.strokeStyle = this.color;
				ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
				ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
				return ctx.stroke();
			}
		}

		$(document).ready(function () {
			SetGlobals();
			//InitializeButton();
			//InitializeConfetti();

			$(window).resize(function () {
				W = window.innerWidth;
				H = window.innerHeight;
				canvas.width = W;
				canvas.height = H;
			});

		});

		/*function InitializeButton() {
			$('#stopButton').click(DeactivateConfetti);
			$('#startButton').click(RestartConfetti);
		}*/

		function SetGlobals() {
			canvas = document.getElementById("canvas");
			ctx = canvas.getContext("2d");
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W;
			canvas.height = H;
		}

		function InitializeConfetti() {
			particles = [];
			animationComplete = false;
			for (var i = 0; i < mp; i++) {
				var particleColor = particleColors.getColor();
				particles.push(new confettiParticle(particleColor));
			}
			StartConfetti();
		}

		function Draw() {
			ctx.clearRect(0, 0, W, H);
			var results = [];
			for (var i = 0; i < mp; i++) {
				(function (j) {
					results.push(particles[j].draw());
				})(i);
			}
			Update();

			return results;
		}

		function RandomFromTo(from, to) {
			return Math.floor(Math.random() * (to - from + 1) + from);
		}


		function Update() {
			var remainingFlakes = 0;
			var particle;
			angle += 0.01;
			tiltAngle += 0.1;

			for (var i = 0; i < mp; i++) {
				particle = particles[i];
				if (animationComplete) return;

				if (!confettiActive && particle.y < -15) {
					particle.y = H + 100;
					continue;
				}

				stepParticle(particle, i);

				if (particle.y <= H) {
					remainingFlakes++;
				}
				CheckForReposition(particle, i);
			}

			if (remainingFlakes === 0) {
				StopConfetti();
			}
		}

		function CheckForReposition(particle, index) {
			if ((particle.x > W + 20 || particle.x < -20 || particle.y > H) && confettiActive) {
				if (index % 5 > 0 || index % 2 == 0) //66.67% of the flakes
				{
					repositionParticle(particle, Math.random() * W, -10, Math.floor(Math.random() * 10) - 20);
				} else {
					if (Math.sin(angle) > 0) {
						//Enter from the left
						repositionParticle(particle, -20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
					} else {
						//Enter from the right
						repositionParticle(particle, W + 20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
					}
				}
			}
		}
		function stepParticle(particle, particleIndex) {
			particle.tiltAngle += particle.tiltAngleIncremental;
			particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 2;
			particle.x += Math.sin(angle);
			particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
		}

		function repositionParticle(particle, xCoordinate, yCoordinate, tilt) {
			particle.x = xCoordinate;
			particle.y = yCoordinate;
			particle.tilt = tilt;
		}

		function StartConfetti() {
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W;
			canvas.height = H;
			(function animloop() {
				if (animationComplete) return null;
				animationHandler = requestAnimFrame(animloop);
				return Draw();
			})();
		}

		function ClearTimers() {
			clearTimeout(reactivationTimerHandler);
			clearTimeout(animationHandler);
		}

		function DeactivateConfetti() {
			confettiActive = false;
			ClearTimers();
		}

		function StopConfetti() {
			animationComplete = true;
			if (ctx == undefined) return;
			ctx.clearRect(0, 0, W, H);
		}

		function RestartConfetti() {
			ClearTimers();
			StopConfetti();
			reactivationTimerHandler = setTimeout(function () {
				confettiActive = true;
				animationComplete = false;
				InitializeConfetti();
			}, 100);

		}

		window.requestAnimFrame = (function () {
			return window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame || 
			function (callback) {
				return window.setTimeout(callback, 1000 / 60);
			};
		})();

	}
	// WHAT TO SHOW INSTEAD OF GAME IF NO MKW
	else {
		$('body').html('NO MKW!');
	}
	
});