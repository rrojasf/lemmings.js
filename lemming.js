///------------------------
/// Class Lemming
function Lemming(gameObject, x, y)
{

  this.STATE = {
    UNKNOWN  :   {id:0,  canSetState:false, isFalling:false,  name: "unknown"},
    WALKING  :   {id:1,  canSetState:true,  isFalling:false,  name: "walking"},
    FALLING  :   {id:3,  canSetState:false, isFalling:true,   name: "fall"},
    FLYING   :   {id:4,  canSetState:false, isFalling:true,   name: "falling"},
    DIGGING  :   {id:5,  canSetState:true,  isFalling:false,  name: "digging"},
    BLOCKING :   {id:6,  canSetState:false, isFalling:false,  name: "blocking"},
    BUILDING :   {id:7,  canSetState:true,  isFalling:false,  name: "build"},
    BASHING  :   {id:8,  canSetState:true,  isFalling:false,  name: "bush"},
    MINING   :   {id:9,  canSetState:true,  isFalling:false,  name: "mining"},
    CLIMBING :   {id:10, canSetState:false, isFalling:false,  name: "climbing"},
    OHNO     :   {id:11, canSetState:false, isFalling:false,  name: "Oh No"},
    EXPLODING:   {id:12, canSetState:false, isFalling:false,  name: "exploding"},
    UMBRELLA :   {id:13, canSetState:false, isFalling:true,   name: "flying 1"},
    PREUMBRELLA: {id:14, canSetState:false, isFalling:true,   name: "flying 2"},
    BOMBING  :   {id:15, canSetState:true,  isFalling:false,  name: "exploding"},
    SPLATTING:   {id:16, canSetState:false, isFalling:false,  name: "splatting"},
  };


  this.game = gameObject;
  this.x = x;
  this.y = y;
  this.dir = 1;
  this.state = this.STATE.WALKING;
  this.stateTicks = 0;
  this.hasUmbrella = false;
  this.canClimb = false;
  this.ticksToDie = 1000; //- if this number is 0 the lemming explode


  var self = this;

  this.tick = function()
  {
    if (self.state.id <= 0) return;

    this.stateTicks++;

    if (self.ticksToDie < 1000)
    {
      self.ticksToDie--;
      if (self.ticksToDie ==   0) self.state = self.STATE.OHNO;
      if (self.ticksToDie == -16) self.state = self.STATE.EXPLODING;
      if (self.ticksToDie <  -16) self.state = self.STATE.UNKNOWN;
    }

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

      if (self.y > tH + 7) self.removeLem();

      return;
    }

    
    if (data[dataPos + lineLen1] == 0)
    {
      //- there is no ground below

      if ((self.state.isFalling))
      {
        if (self.state == self.STATE.FALLING)
        {
          if ((self.hasUmbrella) && (self.stateTicks > 7)) self.changeState(self.STATE.PREUMBRELLA);
          self.y++;
          if (data[dataPos + lineLen2] == 0) self.y++;
          if (data[dataPos + lineLen3] == 0) self.y++;
        }
        else if (self.state == self.STATE.PREUMBRELLA)
        {
          if (self.stateTicks > 3) self.changeState(self.STATE.UMBRELLA);
          self.y++;
        }
        else //- UMBRELLA
        {
          self.y++;
          if (data[dataPos + lineLen2] == 0) self.y++;
        }
        

        return;
      }
      else if (((data[dataPos + lineLen2] != 0) || (data[dataPos + lineLen3] != 0) || (data[dataPos + lineLen4] != 0) || (data[dataPos + lineLen5] != 0) || (data[dataPos + lineLen6] != 0) || (data[dataPos + lineLen7] != 0)))
      {
        //- just jump down but don't fall
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
        self.changeState(self.STATE.FALLING);
        self.y+=2;

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

        case self.STATE.PREUMBRELLA:
        case self.STATE.UMBRELLA:
          //- can not fall anymore -> walk
          self.state = self.STATE.WALKING;
          break;

        case self.STATE.SPLATTING:
          if (self.stateTicks >= 16) self.removeLem();
          break;

        case self.STATE.FALLING:
          //- can not fall anymore -> walk
          if (self.stateTicks > 20) 
          {
            self.state = self.STATE.SPLATTING;
            self.stateTicks = 0;
          }
          else
          {
            self.state = self.STATE.WALKING;
          }
          break;

        case self.STATE.BLOCKING:
          break;

        case self.STATE.OHNO:
          break;

        case self.STATE.EXPLODING:
          break;

        case self.STATE.DIGGING:
          self.y += 1;
          break;

        case self.STATE.MINING:
          self.y += 1;
          self.x += 1;
          break;

        case self.STATE.BASHING:
          self.x += 1;
          break;
      

      }
  }

  //- return true if the state change is accepted
  this.changeState = function(newState)
  {
    switch (newState)
    {
      case self.STATE.WALKING:
      case self.STATE.FALLING:
      case self.STATE.PREUMBRELLA:
      case self.STATE.UMBRELLA:
        self.state = newState;
        self.stateTicks = 0;
        return true;

      case self.STATE.BOMBING:
        if (self.ticksToDie < 1000) return false;

        self.ticksToDie = self.game.TICKS_PER_SECOND * 5;
        return true;

      case self.STATE.BLOCKING:
      case self.STATE.BUILDING:
      case self.STATE.DIGGING:
      case self.STATE.MINING:
      case self.STATE.BASHING:
      case self.STATE.BUILDING:
        if (!self.state.canSetState) return false;

        self.state = newState;
        self.stateTicks = 0;
        return true;


        if (!lem.state.canSetState) return false;   
    }
    
    return false;


  }

  this.removeLem = function() 
  {
    self.state = self.STATE.UNKNOWN;
    self.stateTicks = 0;
  }

  this.calcDistance = function(destX, destY)
  {
    var a = self.x - destX;
    var b = self.y - destY;

    return (a * a + b * b);
  }

}
