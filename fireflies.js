const SVG_NS = "http://www.w3.org/2000/svg";
const testSVG = document.querySelector("#firefly-visual");

function SynchronizationCircle(synchronizationDuration, synchronizationRadius, svg){
	this.svg = svg;
	this.radius = synchronizationRadius;
	this.duration = synchronizationDuration;
	this.updateTiming = 50;
	this.cx = 0;
	this.cy = 0;
	this.x = 0;
	this.y = 0; 
	this.step = 0;
	this.totalSteps = 0;
	this.line = null;

	this.initialize = function(){

		// get center of svg and set (x,y) accordingly
		this.calcCenter();
		console.log("center at " + this.cx + ", " + this.cy);

		// calculate how many total steps in circle
		//this.totalSteps = this.duration / this.updateTiming;
		/*why are we doing this? I'm just going to make it a constant
		for now so the basic code works. If you want it to step according
		to how often it updates so it moves at a constant speed, then updateTiming
		should be the variable, not the constant. And also the math should be different.
							-Leland */
		this.totalSteps = 360;

		// initialize circle
		this.circle = document.createElementNS(SVG_NS, "circle");

		// set center-- TODO: query svg for sizing
		this.circle.setAttributeNS(null, "cx", this.cx);
		this.circle.setAttributeNS(null, "cy", this.cy);
		this.circle.setAttributeNS(null, "r", this.radius);

		// clear circle with white edges
		//this.circle.setAttributeNS(null, "fill-opacity", 0);
		this.circle.setAttributeNS(null, "fill", "#000000");
		this.circle.setAttributeNS(null, "stroke", "#FFFFFF")
        this.circle.setAttributeNS(null, "stroke-width", "2");
  
        // make sure circle is in front of everything
        this.circle.setAttributeNS(null, "z-index", "3");

        // append to svg
        this.svg.appendChild(this.circle);
        console.log("placed circle");

        // create the line tracker
        this.line = document.createElementNS(SVG_NS, "line");

        // set initial coordinates
        this.line.setAttributeNS(null, "x1", this.cx);
        this.line.setAttributeNS(null, "y1", this.cy);
        this.line.setAttributeNS(null, "x2", this.x);
        this.line.setAttributeNS(null, "y2", this.y);

        // make it white
        this.line.setAttributeNS(null, "stroke", "white");
        this.line.setAttributeNS(null, "stroke-width", 2);

        // bring it to the front
        this.line.setAttributeNS(null, "z-index", "3");

        // append to svg
        this.svg.appendChild(this.line);
        console.log("placed line");

		/* Removed the update interval set from here, put it inside
		the drawFireflies function because the way that setInterval works
		requires you to provide an anonymous inner function to make a function
		call with any arguments, and you can't use the this keyword in an anonymous
		inner function, so I moved it outside to where I could use
		the created object. 
			I was also thinking- shouldn't update update all the lines globally? Why
		does it take a parameter? I think update probably shouldn't even
		be in the circle code. Since it's just a circle, it doesn't
		need to be an object. (i.e. have methods). The circle function 
		could just set up the graphical parameters of the circle and return,
		and then your update can be elsewhere and you don't even need and initialize function anymore
		because your constructor already initializes everything.
			I would highly recommend this.
			If you're writing a function named "initialize" as a static property
		"initialized" in your constructor, then that code can just be part of the constructor code.
					-Leland*/
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

	this.update = function(line){
		//console.log("new update!");

		// calculate percentage through circle
		circlePercent = this.step / this.totalSteps;

		// calculate where that is on circle
		this.x = this.radius * Math.sin(2 * Math.PI * circlePercent) + this.cx;
  		this.y = this.radius * Math.cos(2 * Math.PI * circlePercent) + this.cy;
  		//console.log("new x,y: " + this.x + ", " + this.y);

		// update line
		line.setAttributeNS(null, "x2", this.x);
        line.setAttributeNS(null, "y2", this.y);

		//This way your update actually changes each time
		//<3 - Leland
		this.step = (this.step + 1 % this.totalSteps);
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
	  
	// make sure circle is **actually** in front of everything
	this.circle.setAttributeNS(null, "z-index", "4");

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
	const synchCircle = new SynchronizationCircle(100, 100, svg);
	synchCircle.initialize();
	// set interval call for update
	setInterval(function() {synchCircle.update(synchCircle.line)}, synchCircle.updateTiming);
}