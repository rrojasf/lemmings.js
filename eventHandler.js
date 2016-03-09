/// This file is part of "Lemmings.js" project, which is made available under the terms of the MIT License (MIT). Note the file "LICENSE" for license and warranty information.
/// 
/// The EventHandler Class provides the Interface between the game and the user.
///
function EventHandler(gameObject)
{
	this.game = gameObject;
	this.mouseDownViewX = -1;
	this.mouseDownViewY = -1;
	this.mouseDownX = -1;
	this.mouseDownY = -1;
	this.mouseDownButton = -1;
	this.intervalId = 0;

	var self = this;

	//- corrects the viewX/viewY if the are out of visibility-range
	this.checkViewRange = function()
	{
		var gameW = self.game.gameCanvas.width;
		var gameH = self.game.gameCanvas.height;
		var outW = self.game.displayCanvas.width;
		var outH = self.game.displayCanvas.height;

		var scale = self.game.viewScale;

		//- is view-point in range? 
		//-  first: view Point to large?
		if (gameH * scale - self.game.viewY * scale < outH) self.game.viewY = gameH - outH / scale;
		if (gameW * scale - self.game.viewX * scale < outW) self.game.viewX = gameW - outW / scale;

		//-	first: view Point to small?
		if (self.game.viewX < 0) self.game.viewX = 0;
		if (self.game.viewY < 0) self.game.viewY = 0;
	}
	

	function MouseMove(clientX, clientY)
	{
		var x = clientX;
		var y = clientY;

		//- Move Point of View
		if (self.mouseDownButton == 0)
		{
			var scale = self.game.viewScale;

			self.game.viewX = self.mouseDownViewX + (self.mouseDownX - x) / scale;
			self.game.viewY = self.mouseDownViewY + (self.mouseDownY - y) / scale;

			self.checkViewRange();

			//- rerender the scene
			self.game.doRendering();
		}
	}


	this.game.displayCanvas.addEventListener("mousemove", function(e)
	{
		MouseMove(e.clientX, e.clientY);
	});

	
	this.game.displayCanvas.addEventListener("touchmove", function(e)
	{
		MouseMove(e.touches[0].clientX, e.touches[0].clientY);
	});


	function MouseDown(clientX, clientY, button, currentTarget)
	{
		var parentPosition = getPosition(currentTarget);
		var x = clientX - parentPosition.x;
		var y = clientY - parentPosition.y;

		if (self.intervalId != 0) clearInterval(self.intervalId);
		self.intervalId = 0;

		if (y >= self.game.guiPosY)
		{
			//- the user clicked in to the GUI

			//- transforme the coordinates to the gui-coordinat-system
			var guiX = x / self.game.guiScale;
			var guiY = (y - self.game.guiPosY) / self.game.guiScale;

			function callGameGuiMouseClick()
			{
				return self.game.gameGui.onClick(guiX, guiY);
			}

			//- if the function retuns TRUE then this button shoud be called periodically
			if (callGameGuiMouseClick())
			{
				self.intervalId = setInterval(callGameGuiMouseClick, 50);
			}

		}
		else
		{
			//- user clicked in the game area

			//- transforme the coordinates to the game-coordinat-system
			var gameX = x / self.game.viewScale + self.game.viewX ;
			var gameY = y / self.game.viewScale + self.game.viewY ;

			//- find nearest lemming the user clicked at.
			var bestDist = 10000000;
			var bestIndex = -1;

			var l = self.game.lemmings.length;
			for (var i = 0; i < l; i++)
			{
				var dist = self.game.lemmings[i].calcDistance(gameX, gameY);
				if (dist < bestDist)
				{
					bestDist = dist;
					bestIndex = i;
				}
			}

			if (bestDist < 60) //- sqrt(60) = 7 pixel
			{
				//console.log("dist: "+ bestDist);
				self.game.gameGui.onClickLemming(bestIndex);
			}
			else
			{
				//- save start of Mousedown
				self.mouseDownX = clientX;
				self.mouseDownY = clientY;
				self.mouseDownButton = button;
				self.mouseDownViewX = self.game.viewX;
				self.mouseDownViewY = self.game.viewY;
			}
		}
	}


	this.game.displayCanvas.addEventListener("touchstart", function(e)
	{
		MouseDown(e.touches[0].clientX, e.touches[0].clientY, 0, e.currentTarget);
	});

	this.game.displayCanvas.addEventListener("mousedown", function(e)
	{
		MouseDown(e.clientX, e.clientY, e.button, e.currentTarget);
	});


	function MouseUp()
	{
		if (self.intervalId!=0) clearInterval(self.intervalId);
		self.intervalId = 0;

		self.mouseDownX = -1;
		self.mouseDownY = -1;
		self.mouseDownButton = -1;
	}

	this.game.displayCanvas.addEventListener("mouseup", function(e)
	{
		MouseUp();
	});


	this.game.displayCanvas.addEventListener("mouseleave", function(e)
	{
		MouseUp();
	});

	
	this.game.displayCanvas.addEventListener("touchend", function(e)
	{
		MouseUp();
	});

	this.game.displayCanvas.addEventListener("touchleave", function(e)
	{
		MouseUp();
	});

	this.game.displayCanvas.addEventListener("touchcancel", function(e)
	{
		MouseUp();
	});



	this.game.displayCanvas.addEventListener("wheel", function(e)
	{
		if (self.intervalId!=0) clearInterval(self.intervalId);
		self.intervalId = 0;

		//- Zoom view?
		if (e.deltaY > 0) 
		{
			self.game.viewScale += 0.5;
			if (self.game.viewScale > 10) self.game.viewScale = 10;
		}
		if (e.deltaY < 0)
		{
			self.game.viewScale -= 0.5;
			if (self.game.viewScale < 0.5) self.game.viewScale = 0.5;
		}

		self.checkViewRange();

		self.game.doRendering();
	});


	function getPosition(element) 
	{
		var xPosition = 0;
		var yPosition = 0;
			
		while (element)
		{
			xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;
		}
		return { x: xPosition, y: yPosition };
	}

}