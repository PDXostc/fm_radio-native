//Define Icons
var IconFolder = "DNA_common/images/", IconLinks = [], IconType = ".png", IconCount=0;
var Debug = false;

var registeredApps;
var jReq = new XMLHttpRequest();
	jReq.onload = reqListener;
	jReq.open("get", "/DNA_common/json/apps.json", true);
	jReq.send();
function reqListener(e){
	registeredApps = JSON.parse(this.responseText)[0];
}

//Definitions
var ScreenScale=1.5;
	ScreenWidth = 720*ScreenScale,
	ScreenHeight = 1280*ScreenScale, /*1920 or 1800, 1220 for testing*/
	VerticalOffset = -200, /*-200, 200 for testing */
	ClickSensitivity = 50,
	DragSensitivity = 50,
	Edges = true,
	Fading = false,
	Scaling = true,
	Gradients = Fading,
	EdgeScaling = false,
	EdgeFading = Fading,
	IgnoreDistantLinks = true,
	HideBacks = true,
	Flipping = true,
	AnimatedLines = true,
	AnimationHeight = 6,
	AnimationHeight2 = 12,
	Background = "DNA_common/images/Hex-Background.jpg",
	ImageCenter = 0,
	NucleotideSize = 100*ScreenScale,
	IconSize = 100*ScreenScale,
	ShowFPS = 0,
	FPS = 60,
	Framerate = 1000/FPS,
	Speed=-1,
	Count=0,
	MinSpeed = 1,
	MaxSpeed = 5,
	AnimateStrand = null,
	listenerID = null,
	WidthMultiplier = 0.30,
	RungSpacing = 0,
	Twist = 0,
	TwistHeight = -40,
	Setting=[],
	ClickableDistance = 0.0; //(1.0 to -1.0) Larger numbers allow farther icon clicks
	
	/* === === === === === */
	
var MinRungCount = 6,
	MaxRungCount = 10,
	MinStrandCount = 2,
	SkipRows=2,
	StrandCount=2,
	RungCount=10;

	/* === === === === === */
	
	//RungCount: Number of rungs to display (4-360)
	//Change to constant 41 or 81 when vertical scrolling is complete?

//Temp
var iter=0;

//Empty globals
var canvas = $("#dnaCanvas"),
	canvas2 = $("#spdCanvas"),
	Canv = canvas,
	context = canvas[0].getContext('2d');

var DnaArray = [],
	C = {},
	G = {};

G.LHDist=0, G.SpeedTimer=0; //Last Horizontal Distance, for drag speed
G.Timer=0; //How long screen is touched
G.Icon=0; //Icon Count
G.Largest=0;
G.Callback=false;
G.Mousedown=false;
G.MouseX=0, G.MouseY=0; //Current Mouse Coords
G.LastMouseX=0, G.LastMouseY=0; //Last Mouse Coords
G.Q=[]; //Drawing Queue
G.X={},G.Y={},G.Num={};
G.LastX={}, G.LastY={}, G.Strand={};
G.NewCos={}, G.SColor={}, G.HexScale={}, G.IconScale={};
G.HotZone = {};

var img=new Image();
img.src=Background;

var fpsFilter = 2; // the low pass filter to apply to the FPS average
var fpsDesired = 50; // your desired FPS, also works as a max
var fpsAverage = fpsDesired;
var timeCurrent, timeLast = Date.now();
var drawing = false;

//FPS Functions
function fpsUpdate() {
    textAt(50,450,"FPS: "+fpsAverage.toFixed(2));
}
function frameDraw() {
    if(drawing) { return; } else { drawing = true; }

    timeCurrent = Date.now();
    var fpsThisFrame = 1000 / (timeCurrent - timeLast);
    if(timeCurrent > timeLast) {
        fpsAverage += (fpsThisFrame - fpsAverage) / fpsFilter;
        timeLast = timeCurrent;
    }

    drawing = false;
}
if(ShowFPS){
	setInterval(frameDraw, 10 / fpsDesired);
}

//Constants
C = {
    "DC": Math.PI / 180
};

//Object Prototypes
DNA = function (commonContext, Twist, XVal, YVal, Height, Width) {
    this.x = XVal;
    this.y = YVal;
    this.radiusHeight = Height;
    this.radiusWidth = Width;
    this.revS = Math.round(Twist);
    this.Context = commonContext;
    this.Update();
};
DNA.prototype = {
    moveToNext: function () {
        this.revS+=Speed;
        while (this.revS > 359){ this.revS = this.revS - 360; }
        while (this.revS < 0){ this.revS = this.revS + 360; }
    },
    Update: function () {
        var MainArray = [];
		var b = 0;
        for (revS = 0; revS < 360; revS++) {
			var a = [];
			var rev={};
			a[0] = Math.sin(revS * C.DC);
			for(i=0;i<StrandCount;i++){
				var w=360/StrandCount; //Cut circle into wedges
				rev[i]=(revS>360-w*i)?revS-(360-w*i):revS+(w*i);
				//b is sine
				b = Math.sin(rev[i] * C.DC);
				//c is cosine, off of which scaling is based
				c=Math.cos(rev[i] * C.DC);
				a.push(c);
				//c(second var) controls distance from center
				a.push(this.x + b * this.radiusWidth);
				//d(third var) controls vertical spin
				a.push(this.y + c * this.radiusHeight);
			}

            MainArray.push(a);
        }
        this.posCacheValues = MainArray;
    },
    UpdateStrand: function (c) {
		for(i=0;i<StrandCount;i++){
			n=i*3;
			G.Strand[i]=c[n+1];	G.X[i]=c[n+2]; G.Y[i]=c[n+3];
		}
	},
    paintLines: function (offset) {
		var a = this.Context;
        this.UpdateStrand(this.posCacheValues[Math.floor(this.revS)]);
		/*
		if(offset>5) offset=5;
		this.totalOffset=offset;
			NewY=Math.floor(c[CH.Y1])+this.totalOffset;c[CH.Y1]=NewY;
			if(Math.abs(NewY-c[CH.Y1]>100)) NewY=0;
			NewY2=Math.floor(c[CH.Y2])+this.totalOffset;c[CH.Y2]=NewY2;
			if(Math.abs(NewY2-c[CH.Y2]>100)) NewY2=0;
			NextY=Math.floor(c[CH.Y1])+this.totalOffset;c[CH.Y1]=NextY;
			if(Math.abs(NextY-c[CH.Y1]>100)) NextY=0;
			NextY2=Math.floor(c[CH.Y2])+this.totalOffset;c[CH.Y2]=NextY2;
			if(Math.abs(NextY2-c[CH.Y2]>100)) NextY2=0;
			textAt(30,this.y,":: "+NextY2);
		// */
		//Draw Helix Rung to First Edge
		a.lineWidth=5.0;
		str={};
		for(var i in G.X){
			G.NewCos[i]=(G.LastCos+G.Strand[i])/2;
			//Use the cosine value to obtain proper color gradient for helix rung
			if(Gradients){
				//Todo: Divide color in half?
				//str1="#"+getRGB(-G.Strand[i],102)+getRGB(-G.Strand[i],204)+getRGB(-G.Strand[i],256);
			}else{
				str[i]="#66CCFF";
			}
			if(Edges && EdgeFading){
				G.SColor[i]="#"+getRGB(G.NewCos[i],256)+getRGB(G.NewCos[i],256)+getRGB(G.NewCos[i],256);
			}else{
				G.SColor[i]="#FFFFFF";
			}

			a.lineWidth=2.0;
			//Draw rung to center (with gradient? Colors need to be halved!)
			if(Gradients){
				//drawLine(a,G.X[i],G.Y[i],this.x,this.y,str1,str2);
			}else{
				queueLine(a,G.X[i],G.Y[i],this.x,this.y,str[i]);
			}
			
			if(Edges){

				//Todo: Draw closer side last!
				DrawSide(a,G.Strand[i],G.X[i],G.Y[i],G.LastX[i], G.LastY[i],G.SColor[i]);
				/*
				if(G.Strand[0]>0){
					//Side 1 is closer, and should be drawn last. (Keep white over gray)
					DrawSide(a,G.Strand[0],G.X[0],G.Y[0],G.LastX[0], G.LastY[0],G.SColor[0]);
					DrawSide(a,G.Strand[1],G.X[1],G.Y[1],G.LastX[1], G.LastY[1],G.SColor[1]);
				}else{
					//Side 0 is closer
					DrawSide(a,G.Strand[1],G.X[1],G.Y[1],G.LastX[1], G.LastY[1],G.SColor[1]);
					DrawSide(a,G.Strand[0],G.X[0],G.Y[0],G.LastX[0], G.LastY[0],G.SColor[0]);
				}
				*/
			}
			//Keep track of last rung position
			G.LastX[i]=G.X[i];
			G.LastY[i]=G.Y[i];
		
		// */
		}
		G.LastCos=G.Strand[0];
    },
    paintIcons: function () {
		//Called each rung
        var a = this.Context;
        this.UpdateStrand(this.posCacheValues[Math.floor(this.revS)]);

		Count++;
		if(Count>=RungCount)
			Count=0;

		//Side Images
		var SideImg={};

// --------------------------------------
		//Increment through the icons
		for(var i in G.X){
			//i=Current Strand [0-3]
			//Count=Current Rung [0-13]
			//G.Icon=Current Icon [0-20]
			//G.Num[i]=Current Node [0-35]
			//IconLinks[] = [image, link]

			var Buffer = SkipRows*StrandCount;
			i=parseInt(i);
			G.HexScale[i]=NucleotideSize;
			G.IconScale[i]=IconSize;
			G.Num[i]=Count*StrandCount-StrandCount+i;
			
			G.Icon=G.Num[i]-Buffer;
			while(G.Icon>=IconLinks.length)
				G.Icon=G.Icon-IconLinks.length;
			
			//If strand is within buffered zone
			var StrandLength = StrandCount*RungCount;
			if(G.Num[i] >= Buffer && G.Num[i] < StrandLength-Buffer){

				//Assign icon images
				SideImg[i] = IconLinks[G.Icon][0];

				if(ImageCenter!==2){
					//scale the images according to the cosine
					if(Scaling){
						G.HexScale[i]=rescale(G.HexScale[i],G.Strand[i]);
						G.IconScale[i]=rescale(G.IconScale[i],G.Strand[i]);
					}
					
					//Create model for nucleotide icons
					buildStrand(G.Num[i],G.X[i],G.Y[i],G.HexScale[i],G.Strand[i],IconLinks[G.Icon][1]);
					
					//Add images to queue
					placeImage(a, G.Strand[i], document.getElementById('nucleotide'), G.X[i],G.Y[i],G.HexScale[i], 1);
					placeImage(a, G.Strand[i], SideImg[i], G.X[i],G.Y[i],G.IconScale[i],0,1);

					//display debugging information: Bounding boxes and link text
					if (Canv.length && Canv[0].getContext && Debug){
						var Context = Canv[0].getContext("2d");
						Context.lineWidth=2.0;
						//display hotzones and function callbacks
						if(G.HotZone[G.Num[i]]["Cos"] < ClickableDistance && IgnoreDistantLinks){
							drawRect(Context,G.HotZone[G.Num[i]]["X"],G.HotZone[G.Num[i]]["Y"],G.HotZone[G.Num[i]]["X"]+G.HotZone[G.Num[i]]["S"],G.HotZone[G.Num[i]]["Y"]+G.HotZone[G.Num[i]]["S"],"#FF0000");
							textAt(G.HotZone[G.Num[i]]["X"],G.HotZone[G.Num[i]]["Y"],G.HotZone[G.Num[i]]["F"].toString().substring(13,G.HotZone[G.Num[i]]["F"].toString().length-1));
						}
						//display cosines
						textAt(G.X[i],G.Y[i], G.Strand[i]);
					}
				}
			}
		}
    }
};
function buildStrand(N,X,Y,S,C,F){
		G.HotZone[N]={};
		G.HotZone[N]["X"]=X-(S/2);
		G.HotZone[N]["Y"]=Y-(S/2);
		G.HotZone[N]["S"]=S;
		G.HotZone[N]["Cos"]=C;
		G.HotZone[N]["F"]=F;
}

//Display Functions
var Display = function (commonContext) {
    this.commonContext = commonContext;
};
Display.prototype = {
    createStrand: function (Twist, XVal, Setting) {
	//var Setting=[1RungSpacing,2Twist,3TwistHeight,5VerticalOffset,6Width];
		Length=IconLinks.length;
		var YVal=Setting[5] + Twist * Setting[1];
		var Width=Setting[6];
		var Height=Setting[3];
		Twist=Twist*Setting[2];

        //var ReturnVal = new DNA(this.commonContext, Twist, XVal, YVal, Height, Width, [Icon,Icon]); //return ReturnVal;
        return new DNA(this.commonContext, Twist, XVal, YVal, Height, Width);
    }
};

//Strand Definitions
var Spinner = function (fps, canvas, Context, models) {
    this.fps = fps;
    this.timeoutFnId = null;
    this.models = models;
    this.Context = Context;
    this.canvas = canvas;
    this.canvasH = canvas.height;
    this.canvasW = canvas.width;
	this.offset = 0;
    this.Update();
};
Spinner.prototype = {
    Update: function () {
        this.opacity = 0;
    },
    play: function () {
        var b = this;
        var a = function () {
            b.frameAction(b);
        };
        this.timeoutFnId = setInterval(a, Framerate);
		G.Paused=false;
    },
    pause: function () {
        var b = this;
        clearInterval(b.timeoutFnId);
		G.Paused=true;
    },
    frameAction: function (b) {
		//redraw canvas
        b.canvas.width = b.canvas.width;
		if(ShowFPS)
			fpsUpdate();
		//butt,round,square
        b.Context.lineCap = "round";
        if (b.opacity < 1) {
            b.opacity += 0.04;
            $(b.canvas).css("opacity", b.opacity);
        }
        for (var c = 0; c < RungCount; c++) {
            var d = b.models[c];
            d.moveToNext();
            d.paintLines(this.offset);
        }
        for (var c = 0; c < RungCount; c++) {
            var d = b.models[c];
            d.paintIcons(this.offset);
        }
		unqueue(b.Context);
		
		if(G.Mousedown){
			//Keep track of how long screen is touched
			G.Timer=G.Timer+1;
			if(G.Timer==1){
				//Capture the start location
				G.DragStartX=G.MouseX;
				G.DragStartY=G.MouseY;
				//console.log("G.DragStartX: "+G.DragStartX);
				//console.log("G.DragStartY: "+G.DragStartY);
			}else if(G.Timer>ClickSensitivity){
				//Sensitivity indicates the click is too long to run a function
				G.ClickedTooLong=true;
			}else{
				G.ClickedTooLong=false;
			}
		}else{
			if(G.Timer>0){
				//Mouse has just been let up, so capture end position
				G.DragEndX=G.MouseX;
				G.DragEndY=G.MouseY;
				if(getDistance(G.DragStartX,G.DragStartY,G.DragEndX,G.DragEndY)>DragSensitivity){
					//Dragging happened, so deactivate the clicking routine
					G.Mouseclick=false;
					G.DraggedTooFar=true;
					if(!G.ClickedTooLong && G.LastMouseX==G.MouseX){
						//Quick dragging happened, so set the molecule to spin
						G.LastMouseX=G.MouseX-G.LastDir;
					}
				}else{
					G.DraggedTooFar=false;
				}
			}
			//Reset the timer
			G.Timer=0;
		}
		
		//Visual Debugging Indicator Lights
		//if(G.ClickedTooLong) drawLine(context,10,10,20,20,"Red");
		//else drawLine(context,10,10,20,20,"Green");
		//if(G.DraggedTooFar) drawLine(context,10,30,20,40,"Red");
		//else drawLine(context,10,30,20,40,"Green");

		initDrag();
		
		//A click has been registered
		if(G.Mouseclick){
			for(var i in G.HotZone){
				try{
					//if the coordinates line up, and the icon isn't too far away
					if(G.LastMouseX>G.HotZone[i]["X"] && G.LastMouseX<G.HotZone[i]["X"]+G.HotZone[i]["S"] && G.HotZone[i]["Cos"] < ClickableDistance){
						if(G.LastMouseY>G.HotZone[i]["Y"] && G.LastMouseY<G.HotZone[i]["Y"]+G.HotZone[i]["S"]){
							//run the callback function
							G.HotZone[i]["F"]();
							//stop checking icons for clicks, the icon has been found!
							i=Object.keys(G.HotZone).length;
						}
					}
				}catch(e){
					if(typeof(G.HotZone[i])!=='undefined')
						console.log('Runs '+G.HotZone[i]["F"]);
				}
			}
			//stop the mouse click routine!
			G.Mouseclick=false;
		}
    }
};

//Queue Functions
function queueLine(cos,x1,y1,x2,y2,color, color2){
	G.Q.push({"o":0,"x":x1,"y":y1,"x2":x2,"y2":y2,"c":color,"t":0});
}
function queueImage(img, x, y, scalex, scaley, cos){
	G.Q.push({"o":cos,"x":x, "y":y, "x2":scalex, "y2":scaley, "c":img, "t":1});
}
function unqueue(Canvas){
	//Sort on G.Q[i]["o"]
	G.Q.sort(function (a,b) { return a.o - b.o; });
	
	for(i=G.Q.length;i>0;i--){
		if(typeof(G.Q[i])!== typeof undefined){
			if(G.Q[i]["t"]==0)
				drawLine(Canvas,G.Q[i]["x"],G.Q[i]["y"],G.Q[i]["x2"],G.Q[i]["y2"],G.Q[i]["c"]);
			else if(typeof G.Q[i]["c"] != "undefined"){
				try{
					Canvas.drawImage(G.Q[i]["c"],G.Q[i]["x"],G.Q[i]["y"],G.Q[i]["x2"], G.Q[i]["y2"]);
				}catch(e){}
			}
			G.Q.pop();
		}
	}
}
var Increm=0;
//Graphics functions
function drawLine(a,x1,y1,x2,y2,color, color2){
	if(false){
		a.beginPath();
		//Center point
		a.moveTo(x1,y1);
		//First edge point
		a.lineTo(x2,y2);
		if(color2){
			var grad=a.createLinearGradient(x1,y1,x2,y2);
			grad.addColorStop(0, color);
			grad.addColorStop(1, color2);
			a.strokeStyle = grad;
		}else{
			//darkcolor
			a.strokeStyle = color;
		}
		a.stroke();
		a.closePath();
	}
	
	dist=getDistance(x1,y1,x2,y2);
	ang=getAngle(x1,y1,x2,y2)-AnimationHeight/32; //angles were misbehaving, and Math.floor made them wibbly

	var imgPreload=document.getElementById("Particle");
	var imgPreload2=document.getElementById("Particle2");
	var img=imgPreload;
	var ah=AnimationHeight;
	if(color!=="#66CCFF"){
		 img=imgPreload2;
		 ah=AnimationHeight2;
	}else{
		ang=ang-0.5; //rung center fix
	}
	drawRotated(ang,img,x1-5,y1,ah,dist,color); //offset to account for outer line width
}
function drawRotated(degrees,img,x1,y1,AnimationHeight,dist,image){
	context.save();
	context.translate(x1,y1);
	context.rotate(degrees*Math.PI/180);
	context.globalAlpha = 0.5;
	context.drawImage(img,0,0,dist+2,AnimationHeight); //adding pixels to dist connects all the images
	context.globalAlpha = 1.0;
	context.restore();
}
function drawRect(C,X1,Y1,X2,Y2,Color){
	drawLine(C,X1,Y1,X1,Y2,Color);
	drawLine(C,X1,Y1,X2,Y1,Color);
	drawLine(C,X2,Y1,X2,Y2,Color);
	drawLine(C,X1,Y2,X2,Y2,Color);
}
function DrawSide(a,cos,xval,yval,lastx,lasty,colorstr){
	//Draw Helix Side 1
	if(lasty<yval){ //Only when applicable
		if(EdgeScaling){
			a.lineWidth=(-cos+1)*5;
			if(cos>=1)
				a.lineWidth=1;
		}
		if(a.lineWidth<1)a.lineWidth=1;
		queueLine(cos, xval, yval, lastx, lasty, colorstr);
	}
}
function placeImage(canvas, cosine, img, x, y, scale, force, override){
	override = override || 0;
	if(Fading)
		canvas.globalAlpha = (cosine+1)/2;
	scalex=scale;
	if(Flipping) scalex=Math.abs(cosine)*scalex;
	if(HideBacks && !force) scalex=(cosine > 0 ? 0 : 1)*scalex;
	scaley=scale;
	
	//canvas.drawImage(img,x-(scalex/2),y-(scaley/2),scalex,scaley);
	cosine=cosine-override; //used for culling images properly
	queueImage(img, x-(scalex/2), y-(scaley/2), scalex, scaley, cosine);
}
function getDistance(x,y,x2,y2){
	return Math.sqrt((x -= x2) * x + (y -= y2) * y);
}
function getAngle(x,y,x2,y2){
	Result=Math.atan2(y2 - y, x2 - x) * (180 / Math.PI) + 0;
	while(Result < 0)
		Result = Result + 360;
	return Result;
}
function getRGB(target,range){
	//Determine colors
	pad="00";
	str=(Math.floor((target+1)*range/2)).toString(16);
	if(target>=1) str=(range-1).toString(16);
	return pad.substring(0, 2 - str.length)+str;
}
function textAt(x,y,text){
	context.font = '18pt Calibri';
	context.fillStyle = 'white';
	context.fillText(text, x, y);
}
function writeMessage(message){
	context.clearRect(0, 0, canvas2.width, canvas2.height);
	context.font = '18pt Calibri';
	context.fillStyle = 'white';
	context.fillText(message, 15, 25);
}
function addIcon(Icon, Callback, Path, Id){
	var img=new Image();
	if(Path)
		img.src=Path;
	else
		img.src=IconFolder+Icon+IconType;
	img.onload=function (){}
	if(Callback!==null)
		IconLinks.push([img,Callback]);
	else
		IconLinks.push([img,function (){ tizen.application.launch(Id);tizen.application.getCurrentApplication().exit(); }])
	IconCount++;
}
function rescale(scale,cos){
	return scale-((cos+1)/2)*(scale/2);
}

//Input functions
function getMousePos(canvas, evt){
	var rect = canvas[0].getBoundingClientRect();
	if(typeof(evt.clientX) == typeof(undefined) && typeof(evt.touches[0].clientX) == typeof(undefined)){
		return {
			x: evt.changedTouches[0].clientX - rect.left,
			y: evt.changedTouches[0].clientY - rect.top
		};
	}else if(typeof(evt.clientX) == typeof(undefined)){
		return {
			x: evt.touches[0].clientX - rect.left,
			y: evt.touches[0].clientY - rect.top
		};
	}else{
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}
}
function setMousedown(down){
	if(G.Mousedown===true && down===false && G.Timer<ClickSensitivity)
		G.Mouseclick=true;
	else{
		G.Mouseclick=false;
		delete G.LastDir;
	}
	G.Mousedown=down;
}
function getMouseloc(evt){
	var mousePos = getMousePos(canvas, evt);
	G.MouseX = mousePos.x;
	G.MouseY = mousePos.y;
}
function initDrag(){
	if(G.LHDist!=0 && G.LHDist!=MinSpeed){ G.SpeedTimer++; }
	if(G.SpeedTimer>5){
		if(G.LHDist>MinSpeed){ G.LHDist=G.LHDist-1; }
		else if(G.LHDist<-1*MinSpeed){ G.LHDist=G.LHDist+1; }
		Speed=G.LHDist;
		G.SpeedTimer=0;
	}
	if(G.Mousedown){
		var dist=getDistance(G.DragStartX,G.DragStartY,G.MouseX,G.MouseY);
		if(dist>DragSensitivity||typeof(G.LastDir)!=typeof(undefined)){
				G.LHDist=Math.round(getDistance(G.LastMouseX,0,G.MouseX,0)); //Last Horizontal Distance
				if(G.LHDist>MaxSpeed){ G.LHDist=MaxSpeed; }
				if(G.MouseX>G.LastMouseX){
					G.LHDist=-1*G.LHDist;
					Speed=G.LHDist;
					G.LastDir=-1;
				}else if(G.MouseX<G.LastMouseX){
					Speed=G.LHDist;
					G.LastDir=1;
				}else{
					Speed=0;
				}
		}else{
			Speed=0;
			G.LHDist=0;
		}
		if(G.MouseY>G.LastMouseY){
			AnimateStrand.offset+=1;
		}else if(G.MouseY<G.LastMouseY){
			AnimateStrand.offset-=1;
		}
	}
	if(Debug)
		writeMessage('S:'+Speed+' Lmx:'+G.LastMouseX+' Lmy:'+G.LastMouseY+' Click:'+G.Mousedown);
	G.LastMouseX=G.MouseX;
	G.LastMouseY=G.MouseY;
}

var JagAPI = {
	Listen: function(canvas, event, callback, useCapture) { //useCapture not supported
		//click order of events:
		//touchstart touchmove touchend mouseover mousemove mousedown mouseup click dblclick
		switch(event){
			case "mousedown":
				canvas.addEventListener('touchstart', callback);
			break;
			case "mousemove":
				canvas.addEventListener('touchmove', callback);
			break;
			case "mouseup":
				canvas.addEventListener('touchend', callback);
			break;
		}
		canvas.addEventListener(event, callback);
	}
}

//Misc functions
function initListeners(){
	JagAPI.Listen(canvas[0],'mousedown',	function (evt) {	getMouseloc(evt);setMousedown(true);});
	JagAPI.Listen(canvas[0],'mouseup',		function (evt) {	setMousedown(false);});
	JagAPI.Listen(canvas[0],'mouseout',		function (evt) {	setMousedown(false);});
	JagAPI.Listen(canvas[0],'mousemove',	function (evt) {	getMouseloc(evt);});
}

//App Icon functions
function onAppRecallSuccess(list) {
	var i = 0;
	var path="";
	try {
		index = 0;
		var applications = [];
		
		list.sort(function (x, y) {
			return x.appName > y.appName ? 1 : -1;
		});

		for (i = 0; i < list.length; i++) {
			var app = list[i];
			if(app.name != "Home Screen"){
				if (registeredApps[app.id]) {
					addIcon(app.name, null, registeredApps[app.id], app.id);
				}else{
					if(app.iconPath.substr(app.iconPath.length - 4) != ".png"){
						var path="./DNA_common/images/tizen_inactive.png";
					}else{
						var path=app.iconPath;
					}
					addIcon(app.name, null, path, app.id);
				}
			}
		}
	} catch (exc) {
		console.log(exc.message);
	} finally {
		G.Callback();
	}
}
function getInstalledApps(callback){
	G.Callback = callback;
	//Add defaults until app pulls icons properly
	/*for(i=0;i<SkipRows*StrandCount;i++){
		addIcon('Dashboard',	function (){ tizen.application.launch("JLRPOCX033.Dashboard");			});
	}*/
	"use strict";
	if (typeof tizen !== 'undefined') {
		try {
			// get the installed applications list
			tizen.application.getAppsInfo(onAppRecallSuccess, function (err) {
				// Workaround due to https://bugs.tizen.org/jira/browse/TIVI-2018
				window.setTimeout(function () {
					getInstalledApps();
				}, 1000);
				onError(err);
			},callback);
		} catch (exc) {
			console.error(exc.message);
		}
	}else{
		//Add some defaults for the Web Simulator
		//addIcon syntax: Image Name, Callback Function
		addIcon('dashboard_inactive',	function (){ tizen.application.launch("JLRPOCX033.Dashboard");			});
		addIcon('fingerprint_inactive',	function (){ tizen.application.launch("JLRPOCX011.FingerPrint");		});
		addIcon('hvac_inactive',		function (){ tizen.application.launch("JLRPOCX008.HVAC");				});
		addIcon('news_inactive',		function (){ tizen.application.launch("JLRPOCX007.News");				});
		addIcon('phone_inactive',		function (){ tizen.application.launch("JLRPOCX031.phone");				});
		//IconCount=30; //for testing purposes
		callback();
	}
}

var Layout = new Display(context);

getInstalledApps(function (){
	//Calculations!
	//Increase strands to hold appropriate number of icons when MaxRungCount is exceeded
	StrandCount = MinStrandCount;
	while(IconCount > MaxRungCount * StrandCount){StrandCount++;}

	//Increase rungs to hold appropriate number of icons when necessary
	RungCount = (IconCount<MinRungCount*StrandCount) ? MinRungCount+SkipRows*2 : Math.ceil(IconCount/StrandCount)+SkipRows*2;

	RungSpacing = 1/RungCount*(ScreenHeight+480),
	Twist = 360 / RungCount,
	TwistHeight = -40,
	Width = ScreenWidth*WidthMultiplier;
	
	Setting=[null,RungSpacing,Twist,TwistHeight,Speed,VerticalOffset,Width];

	initListeners();
    AnimateStrand = null;
	//Create and call anonymous function
    (function (Setting) {
		if (AnimateStrand !== null) AnimateStrand.pause();
        if (canvas.length && canvas[0].getContext) {
			//var Setting=[0RungCount];
            for (var numStrand = 0; numStrand < RungCount; numStrand++) {
                DnaArray.push(Layout.createStrand(numStrand, (canvas[0].width/2), Setting));
            }
            AnimateStrand = new Spinner(FPS, canvas[0], context, DnaArray);
            AnimateStrand.play();
        }
    })(Setting);
});
