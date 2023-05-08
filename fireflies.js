const SVG_NS = "http://www.w3.org/2000/svg";
let syncCircle = null;
let firefliesFlash = false;

/*
TODO:
- circle -> countdown with text
people said it would be clearer if it was a countdown rather than a circle
make sure its not in the svg, but a html element above it

- better buttons
just adding formatting/css to the buttons, maybe making the day ones like a wheel with representations of morning/night/etc

- control speed
have a control to speed up/slow down fireflies using basespeed in the move interval

- don't synchronize until 15 fireflies

- let users add objects -- Laura
so they would place a plant, and that would affect whether fireflies can see each other + flash

- talk more about real life data
maybe include videos?

- centering svg/make it bigger/look nicer

- add more description of what the visual means for the user

- user choosing where to spawn fireflies

- move music to below svg

- a way to control distance radius
*/

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

function Firefly(startX, startY, startZ, svg, id){

	this.radius = 20;
	// TODO: something wrong with setting id function!
	this.fireflyID = id;
	this.waitInterval = null;
	this.x = startX;
	this.y = startY;
	this.z = startZ;
	this.moveEnd = 0;

	this.setID = function(id){
		this.fireflyID = id;
	}

	this.circle = document.createElementNS(SVG_NS, "circle");
	
	// set center
	this.circle.setAttributeNS(null, "cx", startX);
	this.circle.setAttributeNS(null, "cy", startY);
	this.circle.setAttributeNS(null, "r", this.radius/startZ);
	
	//red circle
	this.circle.setAttributeNS(null, "fill", "hsla(0, 100%, 50%)");
	this.circle.setAttributeNS(null, "stroke", "hsla(0, 100%, 50%)")
	this.circle.setAttributeNS(null, "stroke-width", "2");
	  
	// make sure circle is in front of most things
	this.circle.setAttributeNS(null, "z-index", "2");
	startCircleUpdate()

	svg.appendChild(this.circle);

	this.neighborFlash = false;
	this.waitTime;
	this.recharging = false;
	this.flashing = false;

	this.flash = function(){
		// check if right time of day
		if (firefliesFlash) {
			startCircleUpdate();

			// if (this.neighborFlash == true) console.log("early flash called!!!!");

			let currentFirefly = fireflies[this.fireflyID];
			// flash
			this.flashing = true;
			this.circle.setAttributeNS(null, "r", (this.radius*2)/startZ);
			this.circle.setAttributeNS(null, "fill", "#FFFF00");
			this.circle.setAttributeNS(null, "stroke", "#FFFF00");

			setTimeout(function(currentFirefly) {
			    // console.log("flashing!");

				currentFirefly.circle.setAttributeNS(null, "fill", "hsla(0, 100%, 50%)");
				currentFirefly.circle.setAttributeNS(null, "stroke", "#FF0000");
				currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius/startZ);
				currentFirefly.flashing = false;

				// go through fireflies and set off neighbors
				for (let i=0; i<fireflies.length; i++){
					let distance = Math.sqrt((currentFirefly.x - fireflies[i].x)**2 + (currentFirefly.y - fireflies[i].y)**2);
					if (distance < 250){
						if (!fireflies[i].recharging) fireflies[i].neighborFlash = true;
					}
				}

				currentFirefly.neighborFlash = false;
				
			}, 1000, currentFirefly);

			this.recharging = true;

			// console.log("Waiting!");
			// call wait for 12 seconds
			setTimeout(nextFlash, 12000, currentFirefly);

			
		}

		function nextFlash(currentFirefly){
			currentFirefly.recharging = false;

			// choose random time
			let maxTime = 10
			currentFirefly.waitTime = Math.floor(Math.random() * maxTime); 

			// wait for that amount of time
			// call flash again if hasn't been triggered by neighbor
			mainFlash(currentFirefly);
		}

		
	}

}

function move(currentFirefly){
		// check if reached end point
		if(currentFirefly.x == currentFirefly.moveEnd[0] && currentFirefly.y == currentFirefly.moveEnd[1] && currentFirefly.z == currentFirefly.moveEnd[2]){
			//choose end point
			currentFirefly.moveEnd = newLocation();
		}

		//calculate difference between them
		let diffX = currentFirefly.moveEnd[0] - currentFirefly.x;
		let diffY = currentFirefly.moveEnd[1] - currentFirefly.y;
		let diffZ = currentFirefly.moveEnd[2] - currentFirefly.z;

		//update coordinates while moving from point A to point B
		let baseSpeed = 5;
		let finalDiffX = 0;
		if (diffX > 0){ 
			finalDiffX = Math.min(baseSpeed, diffX);
		}
		else{
			finalDiffX = Math.max(-baseSpeed, diffX);
		}

		let finalDiffY = 0;
		if (diffY > 0){
			finalDiffY = Math.min(baseSpeed, diffY);
		}
		else{
			finalDiffY = Math.max(-baseSpeed, diffY);
		}

		let baseChange = 0.5;
		let finalDiffZ = 0;
		if (diffZ > 0){
			finalDiffZ = Math.min(baseChange, diffZ);
			// console.log("basechange: " + baseChange + ", diffz: " + diffZ);
		}
		else{
			finalDiffZ = Math.max(-baseChange, diffZ);
		}


		currentFirefly.x += finalDiffX;
		currentFirefly.y += finalDiffY;
		currentFirefly.z += finalDiffZ;

		currentFirefly.circle.setAttributeNS(null, "cx", currentFirefly.x);
		currentFirefly.circle.setAttributeNS(null, "cy", currentFirefly.y);
		if (!currentFirefly.flashing) {
			currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius/(currentFirefly.z));
			let redBrightness = 60 - 3*currentFirefly.z;
			currentFirefly.circle.setAttributeNS(null, "fill", "hsla(0, 100%, " + redBrightness + "%)");
			currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(0, 100%, " + redBrightness + "%)");
		}
		else{
			console.log("flashing!");
			currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius*2/(currentFirefly.z));
		}
		// console.log("z: " + currentFirefly.z + ", radius: " + currentFirefly.radius/currentFirefly.z + ", " + finalDiffZ);
	}


function movementInterval(currentFirefly){
	interval = setInterval(move, 25, currentFirefly);
}

function mainFlash(currentFirefly){
	currentFirefly.waitInterval = setInterval(checkNeighbors, 1000, currentFirefly);

	setTimeout(function() {
			}, currentFirefly.waitTime);
}

function checkNeighbors(currentFirefly){
	// check if neighbors flash, if they do
	// console.log("waiting.... " + currentFirefly.waitTime);

	if (currentFirefly.waitTime <= 1 || currentFirefly.neighborFlash == true){
		if (currentFirefly.neighborFlash == true) console.log("early flash!!!!");
		clearInterval(currentFirefly.waitInterval);
		currentFirefly.waitInterval = null;
		currentFirefly.flash();
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
	for (let i=0; i<fireflies.length; i++){
		fireflies[i].flash();
	}
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

	for (let i=0; i<1; i++){
		let x = randRange(3, 798);
		let y = randRange(3, 498);
		let z = randRange(1, 20);
		let newFirefly = new Firefly(x, y, z, svg, fireflies.length)
		fireflies.push(newFirefly);
		newFirefly.flash();
		newFirefly.moveEnd = newLocation();
		movementInterval(newFirefly);
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
	for (let i=0; i<fireflies.length; i++){
		fireflies[i].setID(i);
	}
}

function drawFireflies(){
	const svg = document.querySelector("#firefly-visual");
	syncCircle = new SynchronizationCircle(100, 100, svg);
	syncCircle.initialize();
}

function newLocation(){
    
    // Get viewport dimensions
    let rect = svg.getBoundingClientRect();
    
    let newHeight = Math.floor(Math.random() * rect.width);
    let newWidth = Math.floor(Math.random() * rect.height);
    let newZ = Math.floor(Math.random() * 20) + 1;

    
    return [newHeight,newWidth, newZ];    
}

// function animateDiv(myclass){
//     var newq = makeNewPosition();
//     $(myclass).animate({ top: newq[0], left: newq[1] }, 1000,   function(){
//       animateDiv(myclass);        
//     });
    
// };
