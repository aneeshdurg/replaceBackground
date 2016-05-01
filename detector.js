var timed = false;

//sets up camera
function initialize(){
		video = document.getElementById("vid");
		canvas = document.getElementById("c");
		context = canvas.getContext("2d");
		width = 320;//640;
		height = 240;//480; 
		canvas.width = width;
		canvas.height = height;
		xe = width;
		ye = height;
		
		detect = new detector();

		var constraints = {
			video: {
				mandatory: {
					maxWidth: 320,
					maxHeight: 180
				}
			}
		}
		navigator.getUserMedia(constraints, this.startStream, function(){});
}

function startStream(stream){
		video.src = URL.createObjectURL(stream);
		video.play();
		requestAnimationFrame(draw);
}
	
//calls other functions to do detection/edit frame
function draw(){
	var start = 0;
	if(!timed){
		start = new Date().getTime();
	}	
	detect.doStuff();	
	if(!timed){
		timed = true;
		var end = new Date().getTime();
		console.log(end-start);
	}
	requestAnimationFrame(draw);
}

function threshDelta(incr){
	if(incr){
		defaultThresh++;
	}
	else
		defaultThresh--;
	document.getElementById("dThresh").innerHTML = "Threshold: "+defaultThresh;
}


function changeImage(){
	name = document.getElementById("imgname").value;
	tempimg.src = "imgs/"+name+".jpg";
	tempimg.width = width;
	tempimg.height = height;
	tempimg.onload = function(){
		detect.setImage();
	}
}

function speeddelta(incr){
	if(incr)
		speed++;
	else
		speed--;
	if(speed<0){
		speed = 0;
	}
}

function toggleInvert(){
	invert = !invert;
}

var name = "space";
var tempimg = new Image();
var counter = 0;
var defaultThresh = 70;
var doreplBk = true;
var speed = 1;
var invert = false;
class detector{
	
	constructor(){
		this.frame = null;
		this.gray = null;
		changeImage();
	}

	setImage(){
		var tempcanv = document.createElement('canvas');
		tempcanv.width = width;
		tempcanv.height = height;
		var tempctx = tempcanv.getContext('2d');
		tempctx.drawImage(tempimg, 0, 0, width, height);
		this.otherData = tempctx.getImageData(0, 0, width, height);
	}
		
	doStuff(){
		if(document.getElementById("imgname").value!=name)
			changeImage();
		this.frame = this.readFrame();
		if(this.frame){
			this.bgr2gray();
			if(doreplBk)
				this.replaceBack();
			context.putImageData(this.frame, 0, 0);
			counter++;
		}	
	}	

	replaceBack(){
		if(this.otherData == null){
			return;
		}
		for(var i = 0; i<height; i++){
			for(var j = 0; j<width; j++){
				var k = i*width+j;
				var xoff = (j-speed*counter)%width;
				if(xoff==width-1)
					xoff = 0;
				var l = i*width+xoff+2*width;
				var condition = this.gray[k]>defaultThresh;
				if(invert)
					condition = !condition;
				if(condition){
					var x = i/width + (i%width+counter)%width;
					var y = i/width;
					this.frame.data[4*k] = this.otherData.data[4*l];
					this.frame.data[4*k+1] = this.otherData.data[4*l+1];
					this.frame.data[4*k+2] = this.otherData.data[4*l+2];	
				}
			}
		}	
	}

	//gets frame
	readFrame(){
		try{
			context.save();
			context.scale(-1, 1);
			context.drawImage(video, -width, 0, width, height);
			context.restore();
		} catch(e){
			console.log(e);
			return null;
		}
		return context.getImageData(0, 0, width, height);
	}


	bgr2gray(){
		this.gray = new Array(this.frame.data.length/4);
		for(var i = ys; i<ye; i++){
			for(var j = xs; j<xe; j++){
				var k = i*4*width+4*j
				var lumin = 0.21*this.frame.data[k]+0.72*this.frame.data[k+1]+0.07*this.frame.data[k+2];
				this.gray[k/4] = lumin;
			}
		}
	}
}
