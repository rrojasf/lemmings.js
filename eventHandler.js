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
    var outW =  self.game.displayCanvas.width;
    var outH =  self.game.displayCanvas.height;

    var scale = self.game.viewScale;

    //- is view-point in range? 
    //-  first: view Point to large?
    if (gameH * scale - self.game.viewY * scale < outH) self.game.viewY = gameH - outH / scale;
    if (gameW * scale - self.game.viewX * scale < outW) self.game.viewX = gameW - outW / scale;

    //-  first: view Point to small?
    if (self.game.viewX < 0) self.game.viewX = 0;
    if (self.game.viewY < 0) self.game.viewY = 0;
  }
  

  this.game.displayCanvas.addEventListener("mousemove", function(e)
  {
    var x = e.clientX;
    var y = e.clientY;

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

  });

  this.game.displayCanvas.addEventListener("mousedown", function(e)
  {
    var parentPosition = getPosition(e.currentTarget);
    var x = e.clientX - parentPosition.x;
    var y = e.clientY - parentPosition.y;

    if (self.intervalId!=0) clearInterval(self.intervalId);
    self.intervalId = 0;

    if (y >= self.game.guiPosY)
    {
      var guiX = x / self.game.guiScale;
      var guiY = (y - self.game.guiPosY) / self.game.guiScale;

      function callGameGuiMouseClick()
      {
        //- the user clicked in to the GUI
        return self.game.gameGui.onClick(guiX, guiY);
      }

      //- if the function retuns TRUE then this button can be called periodically
      if (callGameGuiMouseClick())
      {
        self.intervalId = setInterval(callGameGuiMouseClick, 50);
      }

    }
    else
    {
      //- save start of Mousedown
      self.mouseDownX = e.clientX;
      self.mouseDownY = e.clientY;
      self.mouseDownButton = e.button;
      self.mouseDownViewX = self.game.viewX;
      self.mouseDownViewY = self.game.viewY;
    }

  });



  this.game.displayCanvas.addEventListener("mouseup", function(e)
  {
    if (self.intervalId!=0) clearInterval(self.intervalId);
    self.intervalId = 0;

    self.mouseDownX = -1;
    self.mouseDownY = -1;
    self.mouseDownButton = -1;
  });

  this.game.displayCanvas.addEventListener("mouseleave", function(e)
  {
    if (self.intervalId!=0) clearInterval(self.intervalId);
    self.intervalId = 0;

    self.mouseDownX = -1;
    self.mouseDownY = -1;
    self.mouseDownButton = -1;
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