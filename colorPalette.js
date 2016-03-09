/// This file is part of "Lemmings.js" project, which is made available under the terms of the MIT License (MIT). Note the file "LICENSE" for license and warranty information.
/// 
/// The ColorPalette Class provides Collor Palettes for the game.
///  use:
///                             INDEX   RGBA
///  read:  ColorPalette.data[0 ... 16][0..3];
///  write: ColorPalette.setColor(INT index, INT r, INT g, INT b, BOOL locked)

function ColorPalette(gameObject)
{
	this.game = gameObject;

	this.data = new Array(16); //- 16 colors
	this.isColorLock = new Uint8Array(16);

	var self = this;

	//- locked colors are only changed if locked==true
	this.setColor = function(index, r, g, b, locked)
	{
		var color = new Uint8Array(4);

		if (typeof b === "undefined")
		{
			var intVal = r;
			locked = g;

			r = (intVal >>> 16) & 0xFF;
			g = (intVal >>> 8 ) & 0xFF;
			b = (intVal	  ) & 0xFF;
		}

		if (typeof locked === "undefined") locked = 0;

		//- if the color is locked we do not overwrite it.
		if ((self.isColorLock[index] != 0) && (!locked)) 
		{
			var v = (r<<16 | (g << 8) | (b << 0));
			return;
		}

		color[0] = r;
		color[1] = g;
		color[2] = b;
		color[3] = 255;

		self.data[index] = color;
		self.isColorLock[index] = locked;

		var v = (r<<16 | (g << 8) | (b << 0));
	}
}
