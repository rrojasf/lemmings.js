///------------------------
/// Class Lemming
function LemmingDrawer(gameObject)
{
  function Animation()
  {
    this.width = 0;
    this.height = 0;
    this.frames = new Array();
    this.xPos = 0;
    this.yPos = 0;
    this.isPingPong = false;
  }

  this.game = gameObject;

  this.animations = new Array(); //- Type: Animation()
  this.lemmingAnimation = new Array(40); //- Loockup table from this.game.lemmings.STATE -> this.animations(); First Element: left-move, Second: right-move

  var self = this;

  this.load = function()
  {
    var fr = self.game.mainFileProvider.getPart(0);

    var state = new Lemming().STATE;

    self.registerAnimation(state.WALKING,     1, fr, 2, 16, 10, 8); //- walking (r)
    self.registerAnimation(state.UNKNOWN,     1, fr, 2, 16, 10, 1); //- jumping (r)
    self.registerAnimation(state.WALKING,    -1, fr, 2, 16, 10, 8); //- walking (l)
    self.registerAnimation(state.UNKNOWN,    -1, fr, 2, 16, 10, 1); //- jumping (l)
    self.registerAnimation(state.DIGGING,     0, fr, 3, 16, 14, 16); //- digging
    self.registerAnimation(state.CLIMBING,    1, fr, 2, 16, 12, 8); //- climbing (r)
    self.registerAnimation(state.CLIMBING,   -1, fr, 2, 16, 12, 8); //- climbing (l)
    self.registerAnimation(state.DROWNING,    0, fr, 2, 16, 10, 16); //- drowning
    self.registerAnimation(state.UNKNOWN,     1, fr, 2, 16, 12, 8); //- post-climb (r)
    self.registerAnimation(state.UNKNOWN,    -1, fr, 2, 16, 12, 8); //- post-climb (l)
    self.registerAnimation(state.BUILDING,    1, fr, 3, 16, 13, 16); //- brick-laying (r)
    self.registerAnimation(state.BUILDING,   -1, fr, 3, 16, 13, 16); //- brick-laying (l)
    self.registerAnimation(state.BASHING,     1, fr, 3, 16, 10, 32); //- bashing (r)
    self.registerAnimation(state.BASHING,    -1, fr, 3, 16, 10, 32); //- bashing (l)
    self.registerAnimation(state.MINING,      1, fr, 3, 16, 13, 24); //- mining (r)
    self.registerAnimation(state.MINING,     -1, fr, 3, 16, 13, 24); //- mining (l)
    self.registerAnimation(state.FALLING,     1, fr, 2, 16, 10, 4); //- falling (r)
    self.registerAnimation(state.FALLING,    -1, fr, 2, 16, 10, 4); //- falling (l)
    self.registerAnimation(state.PREUMBRELLA, 1, fr, 3, 16, 16, 4); //- pre-umbrella (r)
    self.registerAnimation(state.UMBRELLA,    1, fr, 3, 16, 16, 4, true); //- umbrella (r)
    self.registerAnimation(state.PREUMBRELLA,-1, fr, 3, 16, 16, 4); //- pre-umbrella (l)
    self.registerAnimation(state.UMBRELLA,   -1, fr, 3, 16, 16, 4, true); //- umbrella (l)
    self.registerAnimation(state.SPLATTING,   0, fr, 2, 16, 10, 16); //- splatting
    self.registerAnimation(state.EXITING,     0, fr, 2, 16, 13, 8); //- exiting
    self.registerAnimation(state.UNKNOWN,     1, fr, 4, 16, 14, 14); //- fried
    self.registerAnimation(state.BLOCKING,    0, fr, 2, 16, 10, 16); //- blocking
    self.registerAnimation(state.UNKNOWN,     1, fr, 2, 16, 10, 8); //- shrugging (r)
    self.registerAnimation(state.UNKNOWN,     0, fr, 2, 16, 10, 8); //- shrugging (l)
    self.registerAnimation(state.OHNO,        0, fr, 2, 16, 10, 16); //- oh-no-ing
    self.registerAnimation(state.EXPLODING ,  0, fr, 3, 32, 32, 1); //- explosion
  }


  this.registerAnimation = function(state, dir, fr, bitsPerPixle, width, height, frames, usePingPong)
  {
    if (typeof usePingPong === "undefined") usePingPong = false;

    //- load animation frames from main file (fr)
    var animation = new ImageSet(self.game.palette.data);

    animation.loadFromFile(fr, bitsPerPixle, width, height, frames);
    animation.xPos = Math.floor(animation.width / 2);
    animation.yPos = animation.height - 1;
    animation.isPingPong = usePingPong;

    //- add animation to cach
    var newId = (self.animations.push(animation) - 1);

    if (dir >= 0)
    {
      self.lemmingAnimation[state.id * 2 + 1] = newId;
    }

    if (dir <= 0)
    {
      self.lemmingAnimation[state.id * 2 + 0] = newId;
    }
  }


  this.getImage = function(img)
  {
    var iR = self.game.levelImageProvider;

    var lems = self.game.lemmings;

    for (var i = 0; i < lems.length; i++)
    {
      var lemInfo = lems[i];
      if (lemInfo.state == lemInfo.STATE.UNKNOWN) continue;
      
      var aniIndex = self.lemmingAnimation[lemInfo.state.id * 2 + ((lemInfo.dir>0)?1:0)]

      var ani = self.animations[aniIndex];

      var frame = 0;
      if (ani.isPingPong)
      {
        frame = lemInfo.stateTicks % (ani.frames.length * 2);
        if (frame >= ani.frames.length) frame = (ani.frames.length * 2) - frame - 1;
      }
      else
      {
        frame = lemInfo.stateTicks % ani.frames.length;
      }

      ani.copyTo(img, frame, lemInfo.x - ani.xPos, lemInfo.y - ani.yPos);
    }

    return img;
  }


}
