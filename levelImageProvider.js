/// This file is part of "Lemmings.js" project, which is made available under the terms of the MIT License (MIT). Note the file "LICENSE" for license and warranty information.
/// 
/// The LevelImageProvider Class provides images for the map objects (Ground and Objects like Exit and Water) loaded from the "VGAGRx.DAT" files.
///  It also provides the trigger-information of the objects.
///
function LevelImageProvider(gameObject)
{
  this.game = gameObject;
  this.gData = null;
  this.vData = null;
  this.onLoad = null;
  this.frPart0 = null;
  this.frPart1 = null;

  var self = this;


  ///--- Class ImageReader ---///
  this.load = function(typeIndex, onLoadCallback)
  {
    //- reset
    self.vData = null;
    self.gData = null;
    self.onLoad = onLoadCallback;

    //- we need to load two files after that call this.readImage();
    self.gData = new GroundReader(gameObject);
    self.gData.load(typeIndex, self.readImage);


    //- and the the VGAGRx File
    dfr = new DatFileReader(gameObject);
    dfr.read("lemmings/VGAGR"+ typeIndex +".DAT", function()
    {
      self.vData = dfr;
      self.readImages();
    });
    
  }


  this.readImages = function()
  {
    /// chech if all data are loaded:
    if (self.gData === null) return;
    if (self.vData === null) return;

    self.frPart0 = self.vData.getPart(0);
    self.frPart1 = self.vData.getPart(1);

    if (typeof self.onLoad !== "undefined") self.onLoad();
  }


  this.getImageData = function(index, frameIndex)
  {
    var t = self.gData.iObjects[index];

    var dataOffset = t.image_loc;
    var maskOffset = t.mask_loc;

    var fr;
    if (t.isTerrain)
    {
      fr = self.frPart0;
    }
    else
    {
      fr = self.frPart1;

      var frame = t.firstFrameIndex;

      if (t.animationLoop)
      {
        var frame = frameIndex % t.frameCount;
      }

      dataOffset += frame * t.frame_data_size;
      maskOffset = dataOffset + t.mask_loc;
    }

    var pixCount = t.width * t.height;  
 
    var pixBuf = new Uint8Array(pixCount);

    fr.setOffset(dataOffset);

    var bitBuf = 0;
    var bitBufLen = 0;

    //- 4 bit per Pixle
    for (var i = 0; i < 4; i++)
    {
      for (var p = 0; p < pixCount; p++)
      {
        if (bitBufLen <= 0)
        {
          bitBuf = fr.readByte();
          bitBufLen = 8;
        }

        pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
        bitBuf = (bitBuf << 1);
        bitBufLen--;
      }
    }

    //- apply mask
    fr.setOffset( maskOffset);
    for (var p = 0; p < pixCount; p++)
    {
      if (bitBufLen <= 0)
      {
        bitBuf = fr.readByte();
        bitBufLen = 8;
      }

      if ((bitBuf & 0x80) == 0) pixBuf[p] = 255; 
      bitBuf = (bitBuf << 1);

      bitBufLen--;
    }

    return pixBuf;

  }


  this.getImage = function(index, frameIndex)
  {
    var pixBuf = self.getImageData(index, frameIndex);

    var t = self.gData.iObjects[index];

    var w = t.width;
    var h = t.height;
    var pixCount = w * h;

    var img = self.game.gameContext.createImageData(w, h);
    var imgData = img.data;
    var i = 0;

    var pal = self.game.palette;

    for (var p = 0; p < pixCount; p++)
    {
      var color = pal[pixBuf[p]];

      imgData[i+0] = color[0] ; //- R
      imgData[i+1] = color[1] ; //- G
      imgData[i+2] = color[2]; //- B
      imgData[i+3] = 255; //- Alpha

      i += 4;
    }

    return img;
  }


  this.addTrigger = function(destTrigger, imageInfo)
  {
    var t = self.gData.iObjects[imageInfo.id];
 
    if (t.trigger_effect_id == 0) return false;

    //console.log("ef: "+ t.trigger_effect_id);

    var destX = imageInfo.x;
    var destY = imageInfo.y;

    destTrigger.add(destX + t.trigger_left, destY + t.trigger_top, t.trigger_width, t.trigger_height, t.trigger_effect_id);
  }


  this.copyImageTo = function(destImg, index, imageInfo, tickIndex)
  {
    var pixBuf = self.getImageData(index, imageInfo.frameIndex + tickIndex);

    var t = self.gData.iObjects[index];

    var w = t.width;
    var h = t.height;
    var pixCount = w * h;

    var imgData = destImg.data;
    var destW = destImg.width;
    var destH = destImg.height;

    var pal = self.game.palette.data;

    var destX = imageInfo.x;
    var destY = imageInfo.y;

    var upsideDown = imageInfo.isUpsideDown;
    var noOverwrite = imageInfo.noOverwrite;
    var isErase = imageInfo.isErase;
    var onlyOverwrite = imageInfo.onlyOverwrite;

    var colorIndex = 0;

    for (var y = 0; y < h; y++)
    {
      var outY = y + destY;
      if ((outY < 0) || (outY >= destH)) continue;

      for (var x = 0; x < w; x++)
      {
        var outX = x + destX;
        if ((outX < 0) || (outX >= destW)) continue;

        if (upsideDown)
        {
          colorIndex = pixBuf[(h - y - 1) * w + x];
        }
        else
        {
          colorIndex = pixBuf[y * w + x];
        }

        if (colorIndex == 255) continue;

        var i = (outY * destW + outX) * 4;

        if (imgData[i + 3] > 0)
        {
          //- some data have been drawn here before
          if (noOverwrite) continue;
        }
        else
        {
          if (onlyOverwrite) continue;
        }

        if (isErase)
        {
          imgData[i + 0] = 0; //- R
          imgData[i + 1] = 0; //- G
          imgData[i + 2] = 0; //- B
          imgData[i + 3] = 0; //- Alpha
        }
        else
        {
          var color = pal[colorIndex];

          imgData[i + 0] = color[0]; //- R
          imgData[i + 1] = color[1]; //- G
          imgData[i + 2] = color[2]; //- B
          imgData[i + 3] = 255; //- Alpha
        }
      }
    }

  }

}