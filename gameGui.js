///--- Class GameGui ---///
function GameGui(gameObject)
{
  this.game = gameObject;

  this.width = 320;
  this.height = 40;

  this.guiCanvas = document.createElement('canvas');
  this.guiCanvas.width  = this.width;
  this.guiCanvas.height = this.height;
  this.guiContext = this.guiCanvas.getContext("2d");

  this.panelImg = null;


  this.letters = null;
  this.letterPos = new Uint8Array(12);

  this.RELESERATE_MIN = 10;
  this.RELESERATE = 11;

  this.selectionPos = gameObject.SKILL.CLIMBER.value;

  var self = this;

  this.load = function()
  {
    var mainFile = self.game.mainFileProvider;

    var fr2 = mainFile.getPart(2);
    var fr6 = mainFile.getPart(6);

    var panel = new ImageSet(self.game.palette.data);
    panel.loadFromFile(fr6, 4, 320, 40, 1);

    self.panelImg = self.guiContext.createImageData(self.width, self.height);
    panel.copyTo(self.panelImg, 0, 0, 0, 200); //- don't use the MaskIndex so set it > 16

    //----------
    //- read number letters
    fr2.setOffset(0x1900);
    this.letters = new ImageSet(self.game.palette.data);
    this.letters.loadFromFile(fr2, 1, 8, 8, 20, 2);

    self.letterPos[self.RELESERATE_MIN] = 16 * 0; //- relese count min
    self.letterPos[self.RELESERATE]     = 16 * 1; //- relese count max

    var SKILL = self.game.SKILL;
    self.letterPos[SKILL.CLIMBER.value] = 16 * 2;
    self.letterPos[SKILL.FLOATER.value] = 16 * 3;
    self.letterPos[SKILL.BOMBER.value]  = 16 * 4;
    self.letterPos[SKILL.BLOCKER.value] = 16 * 5;
    self.letterPos[SKILL.BUILDER.value] = 16 * 6;
    self.letterPos[SKILL.BASHER.value]  = 16 * 7;
    self.letterPos[SKILL.MINER.value]   = 16 * 8;
    self.letterPos[SKILL.DIGGER.value]  = 16 * 9;
  }


  this.getGui = function()
  {
    this.guiContext.putImageData(self.panelImg, 0, 0);

    var skills = self.game.skills;
    var SKILL  = self.game.SKILL;

    self.printSkill(SKILL.CLIMBER.value);
    self.printSkill(SKILL.FLOATER.value);
    self.printSkill(SKILL.BOMBER.value);
    self.printSkill(SKILL.BLOCKER.value);
    self.printSkill(SKILL.BUILDER.value);
    self.printSkill(SKILL.BASHER.value);
    self.printSkill(SKILL.MINER.value);
    self.printSkill(SKILL.DIGGER.value);

    self.printNumber(self.game.releaseRateMin, self.letterPos[self.RELESERATE_MIN]);
    self.printNumber(self.game.releaseRate   , self.letterPos[self.RELESERATE]);



    var posX = self.letterPos[self.selectionPos];
    self.guiContext.beginPath();
    self.guiContext.strokeStyle = "white";
    self.guiContext.lineWidth = "1";
    self.guiContext.rect(posX + 1.5, 16.5, 14, 23);
    self.guiContext.stroke(); 

    return self.guiCanvas;
  }

  this.printSkill = function(skill)
  {
    var value = self.game.levelHandler.skills[skill];
    var x = self.letterPos[skill];

    this.printNumber(value, x);
  }


  this.printNumber = function(value, x)
  {
    var letterImg = self.guiContext.createImageData(8, 8);
    self.letters.copyTo(letterImg, Math.floor(value / 10) * 2 + 1, 0, 0, 200);
    self.letters.copyTo(letterImg, Math.floor(value % 10) * 2 + 0, 0, 0, 0);

    self.guiContext.putImageData(letterImg, x + 4, 17);
  }


  this.onClick = function(x, y)
  {
    if (y > 16)
    {
      //- click on the skills panel
      var pos = Math.floor(x / 16);

      switch (pos)
      { 
        case 0:
          self.game.decReleaseRate();
          return true;
        case 1:
          self.game.incReleaseRate();
          return true;
        case 10:
          self.game.switchBreak();
          return;
        case 11:
          return;
       }

       if ((pos > 1) && (pos < 10))
       {
         self.selectionPos = pos - 1;
       }

     }
     else
     {
     
     }
  }

  return false;

}
