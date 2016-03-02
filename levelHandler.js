///--- Class LevelHandler ---///
function LevelHandler(gameObject)
{
  function LevelObject()
  {
    this.x = 0;
    this.y = 0;
    this.id = 0;
    this.frameIndex = 0;

    this.isUpsideDown = false;
    this.noOverwrite = false;
    this.onlyOverwrite = false;
    this.isErase = false;
  }



  this.game = gameObject;

  this.levelName = "";
  this.levelWidth = 1600;
  this.levelHeight = 160;
  this.releaseRate = 0;
  this.releaseCount = 0;
  this.needCount = 0;
  this.timeLimit = 0;
  this.skills = new Array(8);
  this.screenPositionX = 0;
  this.GraphicSet1 = 0;
  this.GraphicSet2 = 0;
  this.isSuperLemming = false;

  this.objects = new Array(); //-> LevelObject
  this.terrains = new Array(); //-> LevelObject
  this.dfr = null;


  this.game.gameTerrain = null;

  var self = this;


  this.getEntryPos = function()
  {
    for (var i = 0; i < self.objects.length; i++)
    {
      var ob = self.objects[i];
      if (ob.id == 1) 
      {
        return { x: ob.x + 23,  y: ob.y + 10};
      }
    }
  }


  /// Load a Level
  this.load = function(onLoadDoneCallback, levelId)
  {
    var levelPos = self.game.levelIndexProvider.LevelFileFromLevelIndex(levelId);

    self.dfr = new DatFileReader(self.game);
    self.dfr.read("lemmings/LEVEL00"+ levelPos.fileId +".DAT", onLevelLoadDone);
   

    function onLevelLoadDone()
    {
      console.log("Levels in file: "+ self.dfr.getPartCount());

      var fr = self.dfr.getPart(levelPos.fileLevelIndex);

      fr.setOffset(0);

      self.releaseRate = fr.readWord();
      self.releaseCount = fr.readWord();
      self.needCount = fr.readWord();
      self.timeLimit = fr.readWord();

      //- read amount of skills
      var SKILL = self.game.SKILL;
      self.skills[SKILL.CLIMBER.value] = fr.readWord();
      self.skills[SKILL.FLOATER.value] = fr.readWord();
      self.skills[SKILL.BOMBER.value] = fr.readWord();
      self.skills[SKILL.BLOCKER.value] = fr.readWord();
      self.skills[SKILL.BUILDER.value] = fr.readWord();
      self.skills[SKILL.BASHER.value] = fr.readWord();
      self.skills[SKILL.MINER.value] = fr.readWord();
      self.skills[SKILL.DIGGER.value] = fr.readWord();

      self.screenPositionX = fr.readWord();

      self.GraphicSet1 = fr.readWord();
      self.GraphicSet2 = fr.readWord();

      self.isSuperLemming = (fr.readWord() != 0);

      ////////////////
      //- read objects
      self.objects = new Array();

      fr.setOffset(0x0020);
      for (var i = 0; i < 32; i++)
      {
        var newOb = new LevelObject();

        newOb.x = fr.readWord() - 16;
        newOb.y = fr.readWord();
        newOb.id = fr.readWord();

        var flags = fr.readWord();
        newOb.isUpsideDown =  ((flags & 0x0080) > 0);
        newOb.noOverwrite =   ((flags & 0x8000) > 0);
        newOb.onlyOverwrite = ((flags & 0x4000) > 0);

        if (flags == 0) continue;

        self.objects.push(newOb);

        //console.log("ob: x:"+ newOb.x +"  y:"+ newOb.y +"  id:"+ newOb.id +"  isO:"+ newOb.onlyOverwrite);
      }

      ////////////////
      //- read terrain
      self.terrains = new Array();

      fr.setOffset(0x0120);
      for (var i = 0; i < 400; i++)
      {
        var newOb = new LevelObject();

        var v = fr.readDWord();
        if (v == -1) continue;

        newOb.x = ((v >> 16) & 0x0FFF) - 16;

	var y = ((v >> 7) & 0x01FF);
        newOb.y = y - ((y > 256)?516:4);

        newOb.id = (v & 0x007F) + 16; //- to jump over the 16 object-ids.

        var flags = ((v >> 29) & 0x000F);
        newOb.isUpsideDown = ((flags & 2) > 0);
        newOb.noOverwrite = ((flags & 4) > 0);
        newOb.isErase = ((flags & 1) > 0);

        //- the original game does not allow the combination: (noOverwrite | isErase)
        if (newOb.noOverwrite) newOb.isErase = 0;

        self.terrains.push(newOb);

        //console.log(" ob["+ i +"]: x:"+ newOb.x +"  y:"+ newOb.y +"  id:"+ newOb.id +"  m:0x"+ newOb.modifier.toString(16));
      }


      this.levelName = fr.readString(32, 0x07E0);
      console.log("Level Name: "+ this.levelName);

      if (typeof onLoadDoneCallback !== "undefined") onLoadDoneCallback();
    }

  }



}
