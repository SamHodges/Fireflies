const SVG_NS = "http://www.w3.org/2000/svg";
let syncCircle = null;
let firefliesFlash = false;

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
	console.log("restarting!");
	if (syncCircle.restart){
		syncCircle.restart = false;
		syncCircle.interval = setInterval(shrinkCircle, syncCircle.intervalTime);
		syncCircle.circle.setAttributeNS(null, "r", syncCircle.maxRadius);
		syncCircle.radius = syncCircle.maxRadius;
	}
}

function shrinkCircle(){
	// calculate how much to change by
	let timeDivision = syncCircle.minFlashTime * 1000 / syncCircle.intervalTime;
	let singleStep = syncCircle.maxRadius / timeDivision

	// check if done
	if (syncCircle.radius <= singleStep){
		// reset interval
		clearInterval(syncCircle.interval);
		syncCircle.interval = null;
		syncCircle.restart = true;
	}
	else{
		// if not, make it smaller
		syncCircle.radius -= singleStep;
		syncCircle.circle.setAttributeNS(null, "r", syncCircle.radius);
	}
}

/*IT IS TIME TO GET ENVIRONMENTALLY FUNKY*/

let fireflies = [];

function Firefly(startX, startY, svg){

	const radius = 3;
	// TODO: something wrong with setting id function!
	this.fireflyID = 0;
	this.waitInterval = null;

	this.setID = function(id){
		this.fireflyID = id;
		// console.log("Hi!");
		// console.log(this.fireflyID);
	}

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

	this.neighborFlash = false;
	this.waitTime;

	this.flash = function(){
		// check if right time of day
		if (firefliesFlash) {
			startCircleUpdate();

			let currentFirefly = fireflies[this.fireflyID];
			// flash
			this.circle.setAttributeNS(null, "r", 10);
			this.circle.setAttributeNS(null, "fill", "#FFFF00");
			this.circle.setAttributeNS(null, "stroke", "#FFFF00");

			setTimeout(function(currentFirefly) {
			    console.log("flashing!");
			    currentFirefly.circle.setAttributeNS(null, "r", 3);
				currentFirefly.circle.setAttributeNS(null, "fill", "#FF0000");
				currentFirefly.circle.setAttributeNS(null, "stroke", "#FF0000");
			}, 2000, currentFirefly);

			console.log("Waiting!");
			// call wait for 12 seconds
			setTimeout(nextFlash, 12000, currentFirefly);

			
		}

		function nextFlash(currentFirefly){
			// choose random time
			let maxTime = 10
			currentFirefly.waitTime = Math.floor(Math.random() * maxTime); 
			console.log("waittime: " + currentFirefly.waitTime);

			// wait for that amount of time
			// call flash again if hasn't been triggered by neighbor
			mainFlash(currentFirefly);
		}

		
	}

}

function mainFlash(currentFirefly){
	currentFirefly.waitInterval = setInterval(checkNeighbors, 1000, currentFirefly);

	setTimeout(function() {
			    //console.log(id);
			}, currentFirefly.waitTime);
}

function checkNeighbors(currentFirefly){
	// check if neighbors flash, if they do
	console.log("waiting.... " + currentFirefly.waitTime)
	if (currentFirefly.waitTime <= 1){
		console.log("done!");
		clearInterval(currentFirefly.waitInterval);
		currentFirefly.waitInterval = null;
		if (!currentFirefly.neighborFlash){
			currentFirefly.flash();
		}
	}
	currentFirefly.waitTime -= 1;
}

function setMorning(){
	document.getElementById("firefly-visual").style.backgroundColor = "aliceblue";
	firefliesFlash = false;
}

function setMidday(){
	document.getElementById("firefly-visual").style.backgroundColor = "#87ceeb";
	firefliesFlash = false;
}

function setNight(){
	document.getElementById("firefly-visual").style.backgroundColor = "#00008b";
	firefliesFlash = true;
}

//returns random int in the interval [start, end)
function randRange(start, end){
	return Math.floor(Math.random() * (end - start)) + start;
}

function addFireflies(){
	svg = document.querySelector("#firefly-visual");
	
	let rect = svg.getBoundingClientRect();
    this.cx = rect.width/2;
    this.cy = rect.height/2;

	for (let i=0; i<1; i++){
		let x = randRange(3, 798);
		let y = randRange(3, 498);
		let newFirefly = new Firefly(x, y, svg)
		fireflies.push(newFirefly);
		newFirefly.flash();
	}

	setFireflyID(fireflies);
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

	setFireflyID(firflies);
}

function setFireflyID(firflies){
	// console.log("SET EM UP");
	for (let i=0; i<fireflies.length; i++){
		// console.log(i);
		fireflies[i].setID(i);
		// console.log(fireflies[i].fireflyID)
	}
}

function drawFireflies(){
	const svg = document.querySelector("#firefly-visual");
	syncCircle = new SynchronizationCircle(100, 100, svg);
	syncCircle.initialize();
}
