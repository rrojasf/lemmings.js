function ColorPalette(gameObject)
{
  this.game = gameObject;

  this.data = new Array(16); //- 16 colors
  this.isColorLock = new Uint8Array(16);

  var self = this;

  this.setColor = function(index, r, g, b, locked)
  {
    var color = new Uint8Array(4);

    if (typeof b === "undefined")
    {
      var intVal = r;
      locked = g;

      r = (intVal >>> 16) & 0xFF;
      g = (intVal >>> 8 ) & 0xFF;
      b = (intVal       ) & 0xFF;
    }

    if (typeof locked === "undefined") locked = 0;

    //- if the color is locked we do not overwrite it.
    if ((self.isColorLock[index] != 0) && (!locked)) 
    {
      var v = (r<<16 | (g << 8) | (b << 0));
      console.log("color locked: "+ index +" - 0x"+ v.toString(16));
      return;
    }

    color[0] = r;
    color[1] = g;
    color[2] = b;
    color[3] = 255;

    self.data[index] = color;
    self.isColorLock[index] = locked;

    var v = (r<<16 | (g << 8) | (b << 0));

    console.log("color: "+ index +" - 0x"+ v.toString(16));
  }
}
