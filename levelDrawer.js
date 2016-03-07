function LevelDrawer(gameObject)
{
  this.game = gameObject;
  var self = this;


  
  this.load = function(doneCallback)
  {
    self.game.levelImageProvider = new LevelImageProvider(self.game);
    self.game.levelImageProvider.load(self.game.levelHandler.GraphicSet1, doneCallback);
  }


  //- create new self.game.gameTerrain
  this.createTerrain = function()
  {
    var lH = self.game.levelHandler;

    var img = self.game.gameContext.createImageData(lH.levelWidth, lH.levelHeight);
    //self.ClearImage(img);

    var iP = self.game.levelImageProvider;


    var lHT = lH.terrains;
    var tickNumber = self.game.tick;

    for (var i = 0; i < lHT.length; i++)
    {
      var tInfo = lHT[i];
      
      iP.copyImageTo(img, tInfo.id, tInfo, tickNumber);
    }

    this.game.gameTerrain = img;

    return true;
  }


  //- create new Object Trigger
  this.createObjectTrigger = function()
  {
    var tH = self.game.triggerHandler;

    var iP = self.game.levelImageProvider;

    var lH = self.game.levelHandler;
    var lHO = lH.objects;

    for (var i = 0; i < lHO.length; i++)
    {
      var oInfo = lHO[i];
      
      iP.addTrigger(tH, oInfo);
    }

    return true;
  }


  this.getObjects = function(img)
  {
    var iR = self.game.levelImageProvider;

    var lH = self.game.levelHandler;
    var lHO = lH.objects;
    var tickNumber = self.game.tick;

    for (var i = 0; i < lHO.length; i++)
    {
      var oInfo = lHO[i];
      
      iR.copyImageTo(img, oInfo.id, oInfo, tickNumber);
    }

    return img;
  }


  this.ClearImage = function(destImg)
  {
    var pixCount = destImg.height * destImg.width * 4;
    var i = 0;
    var imgData = destImg.data;

    while(i < pixCount)
    {
        imgData[i++] = 0; //- R
        imgData[i++] = 0; //- G
        imgData[i++] = 0; //- B
        imgData[i++] = 0; //- Alpha
    }
  }


}