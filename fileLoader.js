function FileLoader()
{
  this.loadedCount = 0;
  this.totalCount = 0;

  var self = this;

  // PUBLIC //

  /// ----------------------
  /// load data from URL
  this.load = function(url, onSuccessEvent)
  {
    self.totalCount++;
    console.log("Load file: "+ url);

    var loader = new ItemLoader(self);
    loader.loadThis(url, onSuccessEvent);
  }


  // PRIVATE //
  function ItemLoader(globalFileLoader)
  {
    this.fl = globalFileLoader;

    var self = this;

    this.loadThis = function(url, onSuccessEvent)
    {
      var xhr = new XMLHttpRequest(); 

      xhr.open('GET', url, true); 
      xhr.responseType = "blob";

      xhr.onreadystatechange = function ()
      {
        // if request finished and response is ready
        if (xhr.readyState == 4)
        {
          /// convert blob to 8Bit Array
          var fileReader = new FileReader();

          fileReader.onload = function() 
          {
            arrayBuffer = this.result;

            data = new Uint8Array(arrayBuffer);

            fr = new DataReader(data);
            fr.filename = url;

            //- OK, done!
            if (onSuccessEvent)
            {
              onSuccessEvent(fr);
            }
          };

          fileReader.readAsArrayBuffer(xhr.response);

          self.fl._fileLoaded();
        }
      }

      xhr.send(null);
    }
  }




  /// ----------------------
  /// load data from URL
  this._fileLoaded = function()
  {
    self.loadedCount++;

    if(self.onload) 
    {
      self.onload();
      self.onload = undefined;
    }
  }

}
