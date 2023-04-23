const SVG_NS = "http://www.w3.org/2000/svg";
const testSVG = document.querySelector("#firefly-visual");

function synchronizationCircle(synchronizationDuration, synchronizationRadius, svg){
	this.svg = svg;
	this.radius = synchronizationRadius;
	this.duration = synchronizationDuration;
	this.updateTiming = 500;
	this.cx = 0;
	this.cy =0;
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
		this.totalSteps = this.duration / this.updateTiming;

		// initialize circle
		this.circle = document.createElementNS(SVG_NS, "circle");

		// set center-- TODO: query svg for sizing
		this.circle.setAttributeNS(null, "cx", this.cx);
		this.circle.setAttributeNS(null, "cy", this.cy);
		this.circle.setAttributeNS(null, "r", this.radius);

		// clear circle with white edges
		//this.circle.setAttributeNS(null, "fill-opacity", 0);
		this.circle.setAttributeNS(null, "fill", "#FFFFFF");
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
        
		// set interval call for update
		 setInterval(this.update(this.line), this.updateTiming); 
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
		console.log("new update!");

		// calculate percentage through circle
		circlePercent = this.step / this.totalSteps;

		// calculate where that is on circle
		this.x = this.radius * Math.sin(2 * Math.PI * circlePercent) + this.cx;
  		this.y = this.radius * Math.cos(2 * Math.PI * circlePercent) + this.cy;
  		console.log("new x,y: " + this.x + ", " + this.y);

		// update line
		line.setAttributeNS(null, "x2", this.x);
        line.setAttributeNS(null, "y2", this.y);
	}

}

/*IT IS TIME TO GET ENVIRONMENTALLY FUNKY*/
let timeOfDay = null;
//^ will be used in the fireflies method to determine light emission

function environment(){
	//gets the daytime button and changes the background of the screen
	addEventListener("click", dayTime());
	this.dayTime = function(){
		var ev = document.getElementById("day");
		ev.document.getElementById("firefly-visual").setAttribute('style', 'backgroundColor: aliceblue');
		timeOfDay = 'dayTime';
	}
	
	//midday
	addEventListener("click", midDay());

	this.midDay = function(){
		var ev = document.getElementById("midDay");
		ev.document.getElementById("firefly-visual").setAttribute('style', 'backgroundColor: #87CEEB');
		timeOfDay = 'midDay';
	}

	//nighttime
	addEventListener("click", nightTime());

	this.nightTime = function(){
		var ev = document.getElementById("nightTime");
		ev.document.getElementById("firefly-visual").setAttribute('style', 'backgroundColor: #00008B');
		timeOfDay = 'nightTime';
	}

	/*adding fireflies*/

	/*removing fireflies*/

}

/*and i added a comment at the end of drawingFireflies to clarify timeOfDay's use irt light emission*/

function drawFireflies(){
	const svg = document.querySelector("#firefly-visual");
	const synchCircle = new synchronizationCircle(100, 100, svg);
	synchCircle.initialize();
	//if timeOfDay is string 'nightTime', emit light
}