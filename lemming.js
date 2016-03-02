///------------------------
/// Class Lemming
function Lemming(gameObject, x, y)
{

  this.STATE = {
    UNKNOWN : {id:0, name: "unknown"},
    WALKING : {id:1, name: "Walk"},
    FALLING : {id:3, name: "fall"},
    DIGGING : {id:4, name: "digging"}
  };


  this.game = gameObject;
  this.x = x;
  this.y = y;
  this.dir = 1;
  this.state = this.STATE.WALKING;

  var self = this;

  this.tick = function()
  {
    if (self.state.id <= 0) return;

    var lineLen1 = self.game.gameTerrain.width * 4;
    var lineLen2 = lineLen1 + lineLen1;
    var lineLen3 = lineLen2 + lineLen1;
    var lineLen4 = lineLen3 + lineLen1;
    var lineLen5 = lineLen4 + lineLen1;
    var lineLen6 = lineLen5 + lineLen1;
    var lineLen7 = lineLen6 + lineLen1;

    var tH = self.game.gameTerrain.height;
    var data = self.game.gameTerrain.data;

    //- this is the base coordinate of the Lemming in the Terrain.data. +3 to address the alpha bit
    var dataPos = (self.y * lineLen1 + self.x * 4) + 3;

    //- out of y
    if ((self.y + 1) >= tH)
    {
      self.y += 2;
      self.state = self.STATE.FALLING;

      if (self.y > tH + 7) self.state = self.STATE.UNKNOWN;

      return;
    }

    
    if (data[dataPos + lineLen1] == 0)
    {
      //- there is no ground below
      if ((self.state != self.STATE.FALLING) && ((data[dataPos + lineLen2] != 0) || (data[dataPos + lineLen3] != 0) || (data[dataPos + lineLen4] != 0) || (data[dataPos + lineLen5] != 0) || (data[dataPos + lineLen6] != 0) || (data[dataPos + lineLen7] != 0)))
      {
        //- just jump but don't fall
        self.y++;
        if (data[dataPos + lineLen2] == 0) self.y++;
        if (data[dataPos + lineLen3] == 0) self.y++;
        if (data[dataPos + lineLen4] == 0) self.y++;
        if (data[dataPos + lineLen5] == 0) self.y++;
        if (data[dataPos + lineLen6] == 0) self.y++;
        if (data[dataPos + lineLen7] == 0) self.y++;
      }
      else
      {
        //- it's too deep -> fall
        self.y++;
        if (data[dataPos + lineLen2] == 0) self.y ++;

        self.state = self.STATE.FALLING;
        return;
      }
    }
    
      switch(self.state)
      {
        case self.STATE.WALKING:
          var basePos = dataPos + self.dir * 4;
          if (data[basePos] == 0)
          {
            self.x += self.dir;
	    break;
          }

          //- do we need to jump up?
          if (data[basePos - lineLen1] == 0)
          {
            self.x += self.dir;
            self.y --;
	    break;
          }

          if (data[basePos - lineLen2] == 0)
          {
            self.x += self.dir;
            self.y -= 2;
	    break;
          }

          if (data[basePos - lineLen3] == 0)
          {
            self.x += self.dir;
            self.y -= 3;
	    break;
          }

          if (data[basePos - lineLen4] == 0)
          {
            self.x += self.dir;
            self.y -= 4;
	    break;
          }

          if (data[basePos - lineLen5] == 0)
          {
            self.x += self.dir;
            self.y -= 5;
	    break;
          }

          if (data[basePos - lineLen6] == 0)
          {
            self.x += self.dir;
            self.y -= 6;
	    break;
          }

          if (data[basePos - lineLen7] == 0)
          {
            self.x += self.dir;
            self.y -= 6;
	    break;
          }

          //- this barrere is too high... turn around
          self.dir = -self.dir;
          break;

        case self.STATE.FALLING:
          //- can not fall anymore -> walk
          self.state = self.STATE.WALKING;
          break;


        case self.STATE.DIGGING:
          //- 
          self.y += 1;
          break;

      }
  }


  this.calcDistance = function(destX, destY)
  {
    var a = self.x - destX;
    var b = self.y - destY;

    return (a * a + b * b);
  }

}
