const SVG_NS = "http://www.w3.org/2000/svg";
let syncCircle = null;

function SynchronizationCircle(synchronizationDuration, synchronizationRadius, svg){
	this.svg = svg;
	this.maxRadius = synchronizationRadius;
	this.radius = synchronizationRadius;
	this.minFlashTime = 12;
	this.cx = 0;
	this.cy = 0;
	this.restart = true;
	this.circle = null;
	this.intervalTime = 50;
	this.interval = null;

	/*
		How it should work updated:
		Fireflies may flash up to every 12 seconds, but do it randomly. They have a max time of a few min. 
		We don't keep track of order of flashes, so gonna get creative
		When a firefly flashes, it calls updateCircle()
		if >0, nothing happens (or maybe it changes color?)
		if =0, restart the circle
	*/

	this.initialize = function(){

		// get center of svg and set (x,y) accordingly
		this.calcCenter();

		// initialize circle
		this.circle = document.createElementNS(SVG_NS, "circle");

		// set center
		this.circle.setAttributeNS(null, "cx", this.cx);
		this.circle.setAttributeNS(null, "cy", this.cy);
		this.circle.setAttributeNS(null, "r", this.radius);

		// clear circle with white edges
		this.circle.setAttributeNS(null, "fill-opacity", 0);
		this.circle.setAttributeNS(null, "stroke", "#FFFFFF")
        this.circle.setAttributeNS(null, "stroke-width", "2");
  
        // make sure circle is in front of everything
        this.circle.setAttributeNS(null, "z-index", "3");

        // append to svg
        this.svg.appendChild(this.circle);
	}

	this.calcCenter = function(){
		// calculate center and reset cx, cy
		let rect = svg.getBoundingClientRect();
    	this.cx = rect.width/2;
    	this.cy = rect.height/2;

		// reset x,y 
		this.x = this.cx + this.radius;
		this.y = this.cy;
	}
	
}

function startCircleUpdate(){
	if (syncCircle.restart){
		syncCircle.restart = false;
		syncCircle.interval = setInterval(shrinkCircle, syncCircle.intervalTime);
	}
}

function shrinkCircle(){
	let timeDivision = syncCircle.minFlashTime * 1000 / syncCircle.intervalTime;
	let singleStep = syncCircle.maxRadius / timeDivision
	if (syncCircle.radius <= singleStep){
		clearInterval(syncCircle.interval);
		syncCircle.interval = null;
		syncCircle.restart = true;
		syncCircle.radius -= syncCircle.maxRadius;
	}
	else{
		syncCircle.radius -= singleStep;
		syncCircle.circle.setAttributeNS(null, "r", syncCircle.radius);
	}
}

/*IT IS TIME TO GET ENVIRONMENTALLY FUNKY*/

let fireflies = [];

function Firefly(startX, startY, svg){

	const radius = 3;

	this.circle = document.createElementNS(SVG_NS, "circle");
	
	// set center
	this.circle.setAttributeNS(null, "cx", startX);
	this.circle.setAttributeNS(null, "cy", startY);
	this.circle.setAttributeNS(null, "r", radius);
	
	//red circle
	this.circle.setAttributeNS(null, "fill", "#FF0000");
	this.circle.setAttributeNS(null, "stroke", "#FF0000")
	this.circle.setAttributeNS(null, "stroke-width", "2");
	  
	// make sure circle is in front of most things
	this.circle.setAttributeNS(null, "z-index", "2");
	startCircleUpdate()

	svg.appendChild(this.circle);
}

function setMorning(){
	document.getElementById("firefly-visual").style.backgroundColor = "aliceblue";
}

function setMidday(){
	document.getElementById("firefly-visual").style.backgroundColor = "#87ceeb";
}

function setNight(){
	document.getElementById("firefly-visual").style.backgroundColor = "#00008b";
	//start the fireflies flashing here!
}

//returns random int in the interval [start, end)
function randRange(start, end){
	return Math.floor(Math.random() * (end - start)) + start;
}

function addFireflies(){
	svg = document.querySelector("#firefly-visual");
	
	//width = svg.width;
	//height = svg.height;
	//I HAVE NO IDEA WHY THIS ISN'T WORKING
	//HARDCODING AS A STOPGAP - LELAND

	//we can talk about this in/before our meeting 
	//and if it still has relevance+ we don't have 
	//an answer I'll take it to oren or rosenbaum - Lau

	const width = 800;
	const height = 500;

	for (let i=0; i<5; i++){
		let x = randRange(3, 798);
		let y = randRange(3, 498);
		fireflies.push(new Firefly(x, y, svg));
	}
}

function removeFireflies(){
	if(fireflies.length < 5){
		return;
	}

	for (let i=0; i<5; i++){
		let pos = randRange(0, fireflies.length);
		let toDelete = fireflies.splice(pos, 1);
		toDelete[0].circle.remove();
	}
}

function drawFireflies(){
	const svg = document.querySelector("#firefly-visual");
	syncCircle = new SynchronizationCircle(100, 100, svg);
	syncCircle.initialize();
}