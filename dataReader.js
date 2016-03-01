function DataReader(dataArray, offset, length, filename)
{
  this.data = new Array();
  this.filename = filename;

  if (typeof dataArray !== 'undefined')
  {
    if (dataArray instanceof DataReader)
    {
      //- copy constructor
      this.data = dataArray.data;
    }
    else
    {
      this.data = dataArray;
    }
  }

  if (typeof offset === 'undefined') offset = 0;
  if (typeof length === 'undefined') length = this.data.length - offset;

  this.hiddenOffset = offset;
  this.length = length;
  this.pos = this.hiddenOffset;


  var self = this;


  /// Read one Byte from stream
  this.readByte = function(offset)
  {
    if (typeof offset !== 'undefined') self.pos = offset + self.hiddenOffset;

    var v = self.data[self.pos];
    self.pos++;

    return v;
  }

  /// Read one DWord (4 Byte) from stream (little ending)
  this.readDWord = function()
  {
    var v = (self.data[self.pos]<<24) | (self.data[self.pos + 1]<<16) | (self.data[self.pos + 2]<<8) | (self.data[self.pos + 3]);
    self.pos += 4;
    return v;
  }

  /// Read one DWord (4 Byte) from stream (big ending)
  this.readIntBE = function()
  {
    v = (self.data[self.pos]) | (self.data[self.pos + 1]<<8) | (self.data[self.pos + 2]<<16) | (self.data[self.pos + 3]<<24);
    self.pos += 4;
    return v;
  }

  /// Read one Word (2 Byte) from stream (big ending)
  this.readWord = function()
  {
    v = (self.data[self.pos]<<8) | (self.data[self.pos + 1]);
    self.pos += 2;
    return v;
  }

  /// Read one Word (2 Byte) from stream (big ending)
  this.readWordBE = function()
  {
    v = (self.data[self.pos]) | (self.data[self.pos + 1]<<8);
    self.pos += 2;
    return v;
  }

  /// Read [lenght] bytes and converts it to a number
  this.readInt = function(length) 
  {
    var v = 0;
    for (var i = length; i > 0; i--)
    {
      v = (v<<8) | self.data[self.pos];
      self.pos++;
    }

    return v;
  }


  /// Read a String
  this.readString = function(length, offset)
  {
    if (typeof offset !== 'undefined') self.pos = offset + self.hiddenOffset;
 
    var result = "";
    for (var i = 0; i < length; i++) 
    {
      v = self.data[self.pos];
      self.pos++;

      result += String.fromCharCode(v);
    }
    return result;
  }

  this.getOffset = function()
  {
    return self.pos - self.hiddenOffset;
  }

  this.setOffset = function(newPos)
  {
    self.pos = newPos + self.hiddenOffset;
  }

  this.eof = function()
  {
    var pos = self.pos - self.hiddenOffset;
    return ((pos >= self.length) || (pos < 0));
  }

  this.reverse = function()
  {
    this.data.reverse();
  }

}