///------------------------
/// Class MainFileProvider
function MainFileProvider(gameObject)
{
  this.game = gameObject;
  this.parts = new Array(7);
  this.dfr = null;

  var self = this;

  this.load = function(onLoad)
  {
    //- the MAIN File
    self.dfr = new DatFileReader(self.game);

    self.dfr.read("lemmings/MAIN.DAT", function()
    {
      for (var i = 0; i < self.parts.length; i++)
      {
        self.parts[i] = self.dfr.getPart(i);
      }

      if (typeof onLoad !== "undefined") onLoad();

    });
  }

  this.getPart = function(partIndex)
  {
    return self.parts[partIndex];
  }




}
