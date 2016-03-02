function LevelIndexProvider(gameObject)
{
  function LevelInfo()
  {
    this.levelName = 0;
    this.levelName = "";
    this.releaseRate = 0;
    this.releaseCount = 0;
    this.needCount = 0;
    this.timeLimit = 0;
    this.skills = new Array(8);
  }

  this.game = gameObject;
  this.levelTable = new Array();

  var self = this;

  this.load = function(onLoadCallback)
  {
     self.game.fileLoader.load("oddtable.dat", function(fr)
     {
       var lIinfo = new LevelInfo();

      lIinfo.releaseRate = fr.readWord();
      lIinfo.releaseCount = fr.readWord();
      lIinfo.needCount = fr.readWord();
      lIinfo.timeLimit = fr.readWord();

      //- read amount of skills
      var SKILL = self.game.SKILL;
      lIinfo.skills[SKILL.CLIMBER.value] = fr.readWord();
      lIinfo.skills[SKILL.FLOATER.value] = fr.readWord();
      lIinfo.skills[SKILL.BOMBER.value] = fr.readWord();
      lIinfo.skills[SKILL.BLOCKER.value] = fr.readWord();
      lIinfo.skills[SKILL.BUILDER.value] = fr.readWord();
      lIinfo.skills[SKILL.BASHER.value] = fr.readWord();
      lIinfo.skills[SKILL.MINER.value] = fr.readWord();
      lIinfo.skills[SKILL.DIGGER.value] = fr.readWord();

      lIinfo.levelName = fr.readString(32);

      self.levelTable.push(lIinfo);
     });
  }

  this.levelSection = ['fun', 'tricky', 'taxing', 'mayhem'];

  this.levelIndex = new Array(4);

  this.levelIndex[0] = [ 147, 155, 157, 149, 151, 153, 159,  14,  22,  54,
                          70,  16,  29,  32,  38,  42,  48,  72,  84, 104,
                         138,  23,  68,  96,  98, 116,  78, 100, 108, 134];

  this.levelIndex[1] = [   1,  30,  36,  50,  52,  56,  58,  80, 102, 120,
                         128, 130, 136,   5, 148, 152, 154, 156, 160,   7,
                          11,  13,  15,  17,  19,  21,  25,  27,  33,  31];

  this.levelIndex[2] = [ 37, 39, 41, 43, 45, 47, 49, 51, 53, 55,
                         57, 59, 61, 63,  3, 65, 67, 69, 71, 73,
                         75, 77, 79, 81, 83, 85, 87, 89, 35, 111];

  this.levelIndex[3] = [ 91,  93,  95,  97,  99, 101, 103, 105, 107, 109,
                        112, 113, 115, 117, 119, 121, 123, 125, 127, 150,
                        129,   9, 131, 133, 135, 137, 139, 141, 143, 145 ];


  //- class LevelFile
  function LevelFile()
  {
    this.fileId = 0;            //- name of "LEVEL__.DAT" file
    this.fileLevelIndex = 0;    //- level in "LEVEL__.DAT" file
    this.levelIndex = 0;        //- the levelindex (0 : "Just Dig", 1: "Only floaters can survive", 2 ...)
    this.levelSectionIndex = 0; //- Value from [this.levelSection]
    this.version = self.game.VERSION.LEMMINGS;

    this.useOddTable = false;
    this.oddIndex = -1;
  }


  this.LevelFileFromLevelIndex = function(levelIndex, gameVersion)
  {
     var ret = new LevelFile();

     var l = self.levelIndex.length;

     //- read index [levelIndex] from this.levelIndex -> read/indexed over all subarrays
     var levelPos = -1;
     var offset = 0;
     for (var i=0; i<l; i++)
     {
       var sectIndex = levelIndex - offset;
       if ((sectIndex >= 0) && (sectIndex < self.levelIndex[i].length))
       {
         levelPos = self.levelIndex[i][sectIndex];
         break;
       }
       offset += self.levelIndex[i].length;
     }

     //- need to decrement
     levelPos--;
     if (levelPos < 0) return null;

     ret.useOddTable = ((levelPos & 0x01) > 0);
     ret.fileId = (levelPos >>> 4);
     ret.fileLevelIndex = (levelPos >>> 1) & 0x07;
     ret.levelIndex = levelIndex;
     ret.oddIndex = (levelPos -1); // ????

     return ret;
  }

}