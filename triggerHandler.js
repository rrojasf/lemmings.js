function TriggerHandler()
{
  this.triggers = new Array();
  this.triggerId = 1;

  var self = this;
  
  this.TRIGGER = {
    NONE : 0,		// no effect (harmless)
    EXIT : 1,		// lemming reaches the exit
    BLOCKER_LEFT : 2,	// not used in DOS metadata, but reserved for 2D-objectmap
    BLOCKER_RIGHT : 3,	// not used in DOS metadata, but reserved for 2D-objectmap
    TRAP : 4,		// trap that animates once and kills a lemming
    DROWN : 5,		// used for watertype objects
    VAPORIZE : 6,	// desintegration
    ON_WAY_WALL_LEFT : 7,	// bash en mine restriction (arrows)
    ON_WAY_WALL_RIGHT : 8,	// bash en mine restriction (arrows)
    STEEL : 9			// not used by DOS metadata, but reserved for 2D-objectmap
  }

  function Trigger()
  {
    this.id = 0,
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.type = self.TRIGGER.NONE;
    this.disableTicksCount = 0;
    this.disabledUntisTick = 0;
  }

 
  this.add = function(x, y, width, height, triggerType, disableTicksCount)
  {
    if (typeof ticks === 'undefined') ticks = 0;
    if (typeof disableTicksCount === 'undefined') disableTicksCount = 0;

    var newId = self.triggerId++;
    var newT = new Trigger();

    if (width > 0)
    {
      newT.x1 = x;
      newT.x2 = x + width;
    }
    else
    {
      newT.x1 = x + width;
      newT.x2 = x;
    }

    if (height > 0)
    {
      newT.y1 = y;
      newT.y2 = y + height;
    }
    else
    {
      newT.y1 = y + height;
      newT.y2 = y;
    }

    newT.type = triggerType;
    newT.id = newId;
    newT.disableTicksCount = disableTicksCount;

    self.triggers.push(newT);

    return newId;
  }


  this.remove = function(id)
  {
    var l = self.triggers.length;

    for (var i=0; i<l; i++)
    {
      if (self.triggers[i].id == id)
      {
        self.triggers.splice(i, 1);
        return;
      }
    }
  }

  this.trigger = function(x, y, tick)
  {
    var l = self.triggers.length;

    for (var i=0; i<l; i++)
    {
      var T = self.triggers[i];

      if ((x >= T.x1) && (y >= T.y1) && (x <= T.x2) && (y <= T.y2))
      {
        if (T.disabledUntisTick <= tick)
        {
          T.disabledUntisTick = tick + T.disableTicksCount;
          return T.type;
        }
      }
    }

    return null;
  }


}