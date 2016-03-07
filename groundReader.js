///------------------------
/// Class GroundReader
function GroundReader(gameObject)
{

  ///------------------------
  /// Class ImageObject
  function ImageObject()
  {
    this.isTerrain = true;
    this.animationLoop = false;
    this.firstFrameIndex = 0;
    this.frameCount = 0;
    this.width = 0;
    this.height = 0;
    this.frame_data_size = 0;
    this.mask_loc = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.trigger_left = 0;
    this.trigger_top = 0;
    this.trigger_width = 0;
    this.trigger_height = 0;
    this.trigger_effect_id = 0;
    this.image_loc = 0;
    this.preview_image_index = 0;
    this.unknown = 0;
    this.trap_sound_effect_id = 0;
  }


  this.game = gameObject;
  this.fReader = null;
  this.iObjects = new Array(16 + 64);
  //this.palettes = new Array(16);
  this.onLoadFun = null;

  var self = this;

  ///------------------------
  ///--- Class GroundReader ---///
  this.load = function(typeIndex, onLoad)
  {
    self.onLoadFun = onLoad; 

    //- reset 
    self.fReader = null;

    //- the GROUNDxO File
    self.game.fileLoader.load("lemmings/GROUND"+ typeIndex +"O.DAT", function(data)
    {
      self.fReader = new DataReader(data);
      self.readGround(); 
    });

  }


  this.readGround = function()
  {
    /// read the object from GROUNDxO.DAT
    var frO = self.fReader;
    frO.setOffset(0);

    for (var i = 0; i < 16; i++)
    {
      var ob = new ImageObject();

      var flags = frO.readWordBE();

      ob.isTerrain = false;
      ob.animationLoop = ((flags & 1) == 0);
      ob.firstFrameIndex = frO.readByte();
      ob.frameCount = frO.readByte();
      ob.width = frO.readByte();
      ob.height = frO.readByte();
      ob.frame_data_size = frO.readWordBE();
      ob.mask_loc = frO.readWordBE();
      ob.unknown1 = frO.readWordBE();
      ob.unknown2 = frO.readWordBE();
      ob.trigger_left = frO.readWordBE() * 4;
      ob.trigger_top = frO.readWordBE() * 4 - 4;
      ob.trigger_width = frO.readByte() * 4;
      ob.trigger_height = frO.readByte() * 4;
      ob.trigger_effect_id = frO.readByte();
      ob.image_loc = frO.readWordBE();
      ob.preview_image_index = frO.readWordBE();
      ob.unknown = frO.readWordBE();
      ob.trap_sound_effect_id = frO.readByte();

      if (frO.eof())
      {
        console.log("ImageReader.readGround() : unexpected end of file [ImageObject]!");
        return;
      }

      //- add Object
      self.iObjects[i] = ob;

      //console.log("h: "+ ob.height +" w:"+ ob.width +" i:"+ ob.firstFrameIndex);
    }



    for (var i = 0; i < 64; i++)
    {
      var ob = new ImageObject();

      ob.isTerrain = true;
      ob.width = frO.readByte();
      ob.height = frO.readByte();
      ob.image_loc = frO.readWordBE();
      ob.mask_loc = frO.readWordBE();
      ob.unknown1 = frO.readWordBE();


      if (frO.eof())
      {
        console.log("ImageReader.readGround() : unexpected end of file [TerrainObjec] !");
        return;
      }

      //- add Object
      self.iObjects[i + 16] = ob;

      //console.log("h: "+ ob.height +" w:"+ ob.width +"  pos: "+ ob.image_loc);
 
    }

    /// jump over the EGA palettes
    frO.setOffset(frO.getOffset() + 3 * 8);


    /// read the VGA palette index 8..15
    for (var i = 8; i < 16; i++)
    {
      var r = frO.readByte() << 2;
      var g = frO.readByte() << 2;
      var b = frO.readByte() << 2;
      self.game.palette.setColor(i, r, g, b);
    }

    /// read the VGA palette index 0..7
    for (var i = 0; i < 8; i++)
    {
      var r = frO.readByte() << 2;
      var g = frO.readByte() << 2;
      var b = frO.readByte() << 2;
      self.game.palette.setColor(i, r, g, b);
    }



    if (self.onLoadFun)
    {
      self.onLoadFun();
    }

  }

}