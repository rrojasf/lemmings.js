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
  }

  this.reverseCode = function(codeString)
  {
    var code = new codeInfo();
  }

  this.createCode = function(levelIndex, percent, spurious)
  {
    //- spurious can be used to "randomize" the code output
    if (typeof spurious === "undefined") spurious = 0;
    if (typeof percent === "undefined") percent = 100;

    //- clear bit 3 and 4
    spurious = spurious & 0x67;


    var result = new Array(9);
    var Lbit = new Array(7);
    var Pbit = new Array(7);
    var Sbit = new Array(7);

//- Level bit places
Lbit[0] = 8;        //-  L0 at bit 3, nibble 0
Lbit[1] = 4;        //-  L1 at bit 2, nibble 1
Lbit[2] = 4;        //-  L2 at bit 2, nibble 2
Lbit[3] = 1;        //-  L3 at bit 0, nibble 3       (see comments above)
Lbit[4] = 2;        //-  L4 at bit 1, nibble 4
Lbit[5] = 1;        //-  L5 at bit 0, nibble 5
Lbit[6] = 4;        //-  L6 at bit 2, nibble 6

//- Percentage bit places
Pbit[0] = 4;        //-  %0 at bit 2, nibble 0
Pbit[1] = 1;        //-  %1 at bit 0, nibble 1
Pbit[2] = 2;        //-  %2 at bit 1, nibble 2
Pbit[3] = 2;        //-  %3 at bit 1, nibble 3       (see comments above)
Pbit[4] = 8;        //-  %4 at bit 3, nibble 4
Pbit[5] = 4;        //-  %5 at bit 2, nibble 5
Pbit[6] = 1;        //-  %6 at bit 0, nibble 6



// Spurious bit places: SPECIAL HANDLING BECAUSE OF DIFFERENT BIT-DISTRIBUTION!
// To avoid "(illegal!)" codes, you can also make Sbit%(4)=0 and/or Sbit%(3)=0
// For the old original Lemmings demo, more of these bits must be cleared then.
Sbit[0] = 2;        //-  S0 at bit 1, nibble 0
Sbit[1] = 8;        //-  S1 at bit 3, nibble 1
Sbit[2] = 1;        //-  S2 at bit 0, nibble 2       (see comments above)
Sbit[3] = 4;        //-  S3 at bit 2, nibble 3
Sbit[4] = 8;        //-  S4 at bit 3, nibble 3 (!)  Nibble 4 has 2 S-bits!
Sbit[5] = 1;        //-  S5 at bit 0, nibble 4 (!)  (3 entries shifted 1 nibble)
Sbit[6] = 2;        //-  S6 at bit 1, nibble 5 (!)  Nibble 7 has 0 S-bits!



var Ofc = Array(self.CodeBase.length);
    for (var i = 0; i < self.CodeBase.length; ++i)
    {
        Ofc[i] = self.CodeBase.charCodeAt(i);
    }



    var bitmask = 1; //- choose bit 0 to start with

    for (var j = 0; j < 7; j++)
    {
      //- do all logical rotating characters 
      //- actually: bitmask = 2 ^ (j + 1), but we don't use that for speed reasons

      //- level bit  = (bitmask * level bit)
      var nibble = (levelIndex & bitmask) * Lbit[j];
   
      //- percent bit + (bitmask * percent bit)
      nibble = nibble + (percent & bitmask) * Pbit[j];


      // put in spurious bits into the first 4 nibbles: j=0 to j=3.
      if (j <= 3)
      {
        //- + (bitmask * spurious bit)
        nibble = nibble + (spurious & bitmask) * Sbit[j];
      }

      //- put in spurious bits, take next j, do this from j=3 to j=5.
      //- do j=3 again, since it has 2 S-bits
      if ((j >= 3) && (j < 6))
      {
        //- because we take the previous bit, we must take the previous bitmask
        //- and correct to the previous bitmask value: hence the j+1, *2, /2
        //- + (bitmask * spurious bit)

        nibble = nibble + (spurious & (bitmask * 2)) * Sbit[j + 1] / 2;
      }

      //- rotate the order: create rotated index i from logical index j
      var I = (j + 8 - (levelIndex % 8)) % 7;

      //- assemble the rotated character.  nibble is nibble info * bitmask
      result[I] = Ofc[j] + nibble / bitmask

      // next level/percent/spurious bit
      bitmask = bitmask * 2;

  
    }

    //- assemble both level characters
    //- plain level code
    result[7] = Ofc[7] + (levelIndex & 0x0F);        
    result[8] = Ofc[8] + (levelIndex & 0xF0) / 16;

    //- calculate checksum: add all first 9 ASCII values together
    var csum = 0;
    for (var i=0; i < 9; i++)
    {
      csum = csum + result[i];
    }

    // assemble checksum character, use only the low nibble of the sum
    result[9] = Ofc[9] + (csum & 0x0F);

    //- combine all characters (with rotated indices) to a proper level string
    var Levelcode = "";

    for (var i=0; i < 10; i++)
    {
      Levelcode += String.fromCharCode(result[i]);
    }

    return Levelcode;
  } 

}