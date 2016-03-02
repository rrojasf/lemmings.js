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

  this.levelIndex[2] = [ 91,  93,  95,  97,  99, 101, 103, 105, 107, 109,
                        112, 113, 115, 117, 119, 121, 123, 125, 127, 150,
                        129,   9, 131, 133, 135, 137, 139, 141, 143, 145 ];

  this.CodeBase = "AJHLDHBBCJ";


  function codeInfo()
  {
    this.levelIndex = 0;
    this.percent = 100;
    this.lemmingsType = 0;
  }

  this.reverseCode = function(codeString)
  {
    var code = new codeInfo();
  }

  this.createCode = function(levelIndex, percent)
  {
    //---
    //- credits: Herman Perks (Lemmings code generator)
    //---

    if (typeof percent === "undefined") percent = 100;

    var result = new Array(9);
    var Lbit = [3, 2, 2, 0, 1, 0, 2]; //- where to place the Level bits in result
    var Pbit = [2, 0, 1, 1, 3, 2, 0]; //- where to place the Percentage bits in result

    //- CodeBase Offsets
    var Ofc = Array(self.CodeBase.length);
    for (var i = 0; i < self.CodeBase.length; ++i)
    {
        Ofc[i] = self.CodeBase.charCodeAt(i);
    }

    //- bit selector
    var bitmask = 1;

    for (var j = 0; j < 7; j++)
    {
      //- add level bit
      var nibble = (levelIndex & bitmask) << Lbit[j];
   
      //- add percent bit
      nibble = nibble + ((percent & bitmask) << Pbit[j]);

      //- rotate the order
      var i = (j + 8 - (levelIndex % 8)) % 7;

      //- assemble the rotated character
      result[i] = Ofc[j] + (nibble >>> j);

      // next bit
      bitmask = bitmask << 1;
    }


    //- add level characters 
    result[7] = Ofc[7] + ((levelIndex & 0x0F));
    result[8] = Ofc[8] + ((levelIndex & 0xF0) >>> 4);

    //- calculating the checksum
    var csum = 0;
    for (var i = 0; i < 9; i++) csum += result[i];

    //- add checksum
    result[9] = Ofc[9] + (csum & 0x0F);

    //- combine all characters to a proper level string
    var Levelcode = "";
    for (var i = 0; i < 10; i++)
    {
      Levelcode += String.fromCharCode(result[i]);
    }

    return Levelcode;
  } 

}