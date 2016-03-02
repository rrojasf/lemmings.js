function createGame(gameCavas, onGameLoaded)
{
  var game = new Object();

  game.gameCanvas = document.createElement('canvas');
  game.gameCanvas.width  = 1600;
  game.gameCanvas.height = 200;
  game.gameCanvas.className="PixelatedRendering";
  game.gameContext = game.gameCanvas.getContext("2d");


  game.displayCanvas = gameCavas;
  game.displayContext = game.displayCanvas.getContext("2d");

  //- Disable Interpolation for scaling
  if (typeof game.displayContext.imageSmoothingEnabled !== "undefined")
  {
    game.displayContext.imageSmoothingEnabled = false;
  }
  else
  {
    game.displayContext.mozImageSmoothingEnabled = false;
    game.displayContext.webkitImageSmoothingEnabled = false;
    game.displayContext.msImageSmoothingEnabled = false;
  }

      
       
  game.palette = new ColorPalette(game);

  game.palette.setColor(0, 0x000000, true);	// <- balck
  game.palette.setColor(1, 0x4040e0, true);	// blue: Lemmings Body
  game.palette.setColor(2, 0x00b000, true);	// green: Lemmings haar
  game.palette.setColor(3, 0xf3d3d3, true);	// white: Lemmings skin / Letters 
  game.palette.setColor(4, 0xb2b200, true);	// yellow
  game.palette.setColor(5, 0xf32020, true);	// dark red
  game.palette.setColor(6, 0x828282, true);	// gray
  game.palette.setColor(7, 0xe08020, false);	// this color is set by the level


  game.SKILL = {
    CLIMBER :	{value: 1, name: "Climber"}, 
    FLOATER :	{value: 2, name: "Floater"}, 
    BOMBER :	{value: 3, name: "Bomber"}, 
    BLOCKER :	{value: 4, name: "Blocker"}, 
    BUILDER :	{value: 5, name: "Builder"}, 
    BASHER :	{value: 6, name: "Basher"}, 
    MINER :	{value: 7, name: "Miner"}, 
    DIGGER :	{value: 8, name: "Digger"}
  };


  //- available amount of skills  
  game.skills = new Uint8Array(8);

  //- current relese rate
  game.releaseRate = 50;
  game.releaseRateMin = 50;
  game.nextReleaseTick = 10;
  game.releaseCount = 3;

  game.decReleaseRate = function()
  {
    game.releaseRate--;
    if (game.releaseRate < game.releaseRateMin) game.releaseRate = game.releaseRateMin;
  }

  game.incReleaseRate = function()
  {
    game.releaseRate++;
    if (game.releaseRate > 99) game.releaseRate = 99;
  }

  game.isBreak = false; //- is the game in pause mode?
  game.switchBreak = function()
  {
    game.isBreak = !game.isBreak;
  }

  //- List of all Lemmings
  game.lemmings = Array();

  //- View point
  game.viewX = 0;
  game.viewY = 0;
  game.viewScale = 2.5;

  game.guiPosY = game.gameCanvas.height - 30;
  game.guiScale = 2;

  //- Game Time
  game.tick = 0;

  //- URL Parameter: load Level Number...
  var hash = window.location.hash.substring(1);
  game.levelId = Number.parseInt(hash);
  if (isNaN(game.levelId)) game.levelId=0;

  game.fileLoader = new FileLoader();

  game.mainFileProvider = new MainFileProvider(game);
  game.mainFileProvider.load(function()
  {
    game.lemmingDrawer = new LemmingDrawer(game);
    game.lemmingDrawer.load();

  });

  game.levelIndexProvider = new LevelIndexProvider(game);
  game.levelIndexProvider.load();

alert(game.levelIndexProvider.createCode(60,100));

  game.levelHandler = new LevelHandler(game);
  game.levelHandler.load(onLevelLoaded, game.levelId);

  game.eventHandler = new EventHandler(game);


  function onLevelLoaded()
  {
    game.levelDrawer = new LevelDrawer(game);
    game.levelDrawer.load(onLevelDrawn);
    game.viewX = game.levelHandler.screenPositionX;

    for (var i=0; i<10; i++)
    {
      game.skills[i] = game.levelHandler.skills[i];
    }

    game.releaseRate = game.levelHandler.releaseRate;
    game.releaseRateMin = game.releaseRate;
  }


  function onLevelDrawn()
  {
    //- generate terrain layer
    game.levelDrawer.createTerrain();

    game.gameGui = new GameGui(game);
    game.gameGui.load();

    if (typeof onGameLoaded !== "undefined") onGameLoaded();
  }


  //////////////////////////
  ///- Public Functions -///
  game.startGame = function()
  {
    //- start game loop
    window.setInterval(function() {game.gameLoop(); }, 1000 / 15);
  }



  game.gameLoop = function()
  {
    if (!game.isBreak)
    {
      game.tick ++;

      if (game.releaseCount > 0)
      {
      if (game.tick >= game.nextReleaseTick)
      {
        game.releaseCount--;

        //- get the pos of the entry point
        var pos = game.levelHandler.getEntryPos();

        //- add one test lemming
        game.lemmings.push(new Lemming(game, pos.x, pos.y));
  
        //- next Lemming need to be released in ticks
        game.nextReleaseTick = game.tick + (Math.floor((99 - game.releaseRate) / 2) + 4);
      }
      }

      var c = game.lemmings.length;
      for (var i = 0; i < c; i++)
      {
        game.lemmings[i].tick();
      }
    }

    game.doRendering();
  }


  game.doRendering = function()
  {
    var gameW = game.gameCanvas.width;
    var gameH = game.gameCanvas.height;
    var outW =  game.displayCanvas.width;
    var outH =  game.displayCanvas.height;

    game.guiScale = outW / game.gameGui.width;
    var guiOutHeight = game.gameGui.height * game.guiScale;

    var outGameH = outH - guiOutHeight;

    game.guiPosY = outGameH;

    //-----------
    //- Draw Game

    //- clear the output with black
    game.displayContext.fillStyle = "rgba(0, 0, 0, 255)";
    game.displayContext.fillRect(0, 0, outW, outGameH);

    //- 1. Layer: deep copy of terrain Image
    var img = game.gameContext.createImageData(game.gameTerrain.width, game.gameTerrain.height);
    img.data.set(game.gameTerrain.data);

    //- 2. add Object Layer
    var img = game.levelDrawer.getObjects(img);
    game.gameContext.putImageData(img, 0, 0);

    //- 3. add Lemmings Layer
    var img = game.lemmingDrawer.getImage(img);
    game.gameContext.putImageData(img, 0, 0);

    //- Display Layers
    var dW = gameW - game.viewX; //- display width
    if ((dW * game.viewScale) > outW) 
    {
      dW = outW / game.viewScale;
      //game.viewScale = outW / dW;
    }

    var dH = gameH - game.viewY; //- display height
    if ((dH * game.viewScale) > outGameH)
    {
      dH = outGameH / game.viewScale;
      //game.viewScale = outH / dH;
    }

    //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
    game.displayContext.drawImage(game.gameCanvas, game.viewX, game.viewY, dW, dH, 0, 0, dW * game.viewScale , dH * game.viewScale);


    //-----------
    //- Draw GUI

    //- create GameGui Image
    var guiImg = game.gameGui.getGui();

    //- drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)
    game.displayContext.drawImage(guiImg, 0, 0, guiImg.width, guiImg.height, 0, outH - guiOutHeight, outW, guiOutHeight);
  }


  return game;
}
