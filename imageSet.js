function ImageSet(palette)
{
  this.palette = palette;
  this.width = 0;
  this.height = 0;
  this.frames = new Array();
  this.xPos = 0;
  this.yPos = 0;

  var self = this;

  this.copyTo = function(destImg, frameIndex, destX, destY, maskColorIndex)
  {
    var pal = self.palette;
    if ((typeof pal === "undefined") || (typeof pal[0] === "undefined") )
    {
      console.log("no palette defined!");
      return;
    }

    if (typeof maskColorIndex === "undefined") maskColorIndex = 0;

    var w = self.width;
    var h = self.height;
    var pixBuf = self.frames[frameIndex];

    var imgData = destImg.data;
    var destW = destImg.width;
    var destH = destImg.height;


    for (var y = 0; y < h; y++)
    {
      var outY = y + destY;
      if ((outY < 0) || (outY >= destH)) continue;

      for (var x = 0; x < w; x++)
      {
        var outX = x + destX;
        if ((outX < 0) || (outX >= destW)) continue;

        var colorIndex = pixBuf[y * w + x];

        if (colorIndex == maskColorIndex) continue;

        var color = pal[colorIndex];

        var i = (outY * destW + outX) * 4;

        imgData[i + 0] = color[0]; //- R
        imgData[i + 1] = color[1]; //- G
        imgData[i + 2] = color[2]; //- B
        imgData[i + 3] = 255; //- Alpha
      }
    }
  }


  this.loadFromFile = function(fr, bitsPerPixle, width, height, frames, colorIndexOffset)
  {
    var bitBuf = 0;
    var bitBufLen = 0;
    var pixCount = width * height;

    self.width = width;
    self.height = height;

    if (typeof colorIndexOffset === "undefined") colorIndexOffset = 0;


    for (f = 0; f < frames; f++)
    {
      var pixBuf = new Uint8Array(pixCount);

      //- read pixle data
      for (var i = 0; i < bitsPerPixle; i++)
      {
        for (var p = 0; p < pixCount; p++)
        {
          if (bitBufLen <= 0)
          {
            bitBuf = fr.readByte();
            bitBufLen = 8
          }

          pixBuf[p] = pixBuf[p] | ((bitBuf & 0x80) >> (7 - i));
          bitBuf = (bitBuf << 1);
          bitBufLen--;
        }
      }

      if (colorIndexOffset != 0)
      {
        for (var p = 0; p < pixCount; p++) 
        {
          if (pixBuf[p] > 0) pixBuf[p] += colorIndexOffset;
        }
      }

      self.frames.push(pixBuf);
    }

  }
}
