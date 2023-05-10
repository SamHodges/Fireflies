/*
TODO:
- let users add/remove objects -- Laura
so they would place a plant, and that would affect whether fireflies can see each other + flash

- talk more about real life data + add more description of what the visual means for the user
maybe include videos? -- Laura
"Written content clearly and concisely describes the purpose of the site, what it demonstrates and why. 
The user should learn something technical through a combination reading the text and interacting with visual elements. 
Examples/interactive demonstrations clearly illustrate concepts." -- rubric @Laura

- make sure all debugging messages are deleted -- only in Laura's code now

-----------------------------------------

- make sidebar better at screen size changes (changing layout for when loaded on phone?)

- maybe have movement as a rand num choice between 0 and current movement?

*/
//--------------------------------------------------Initialize--------------------------------------------------
// initialize firefly array
let fireflies = [];

// svg
const svg = document.querySelector("#firefly-visual");
const SVG_NS = "http://www.w3.org/2000/svg";

// initialize HTML elements
const speedInput = document.getElementById("speed"); // speed for fireflies
const radiusInput = document.getElementById("radius"); // radius of neighbor sync
const spawnCheck = document.getElementById("placement"); // whether there's a spawn circle
const explainObst = document.getElementById("obstacle-explain"); // explanation for obstacles
const explainSpawn = document.getElementById("placement-explain") // explanation for spawn circle
const userTime = document.getElementById("current-time"); // current day time
const morningButton = document.getElementById("morning"); // button for morning
const middayButton = document.getElementById("midday"); // button for midday
const nightButton = document.getElementById("night"); // button for night
const clockArrow = document.getElementsByClassName("arrow")[0]; // arrow on clock
let spawnCircle = document.createElementNS(SVG_NS, "circle"); // spawn circle circle
let text = document.createElementNS(SVG_NS, "text"); // spawn circle text
let updates = document.getElementById("updates"); // example firefly updates

// initialize user interactions
let isObst = false; // whether user is placing an obstacle
let isPlacement = false; // whether user is placing spawn circle
let synchronizationRadius = document.getElementById("radius").value; // radius fireflies affect neighbors
let baseSpeed = document.getElementById("speed").value; // firefly speed

// other vars
let obstCounter = 0; // number of obstacles
let firefliesFlash = false; // whether fireflies flash
let time = 0; // time tracker for counter

// set initial text for example firefly 
updates.innerHTML = "Daytime, no flashing";

//--------------------------------------------------Fireflies--------------------------------------------------
// counter for firefly movements
function counter(){
	// go through all the fireflies
	for (let i=0; i<fireflies.length; i++){

		// update firefly movement
		let currentFirefly = fireflies[i];
		move(currentFirefly);

		// update firefly flashing
		if (time % 1 < 0.025 && currentFirefly.waiting && firefliesFlash){
			checkNeighbors(currentFirefly);
		}
	}

	// time increases
	time+=0.025;
}


// firefly object- represents a single firefly
function Firefly(startX, startY, startZ, svg, id){

	// set necessary vars
	this.radius = 20; // radius of circle at z=1
	this.fireflyID = id; // unique id to keep track of fireflies
	this.x = startX; // x position
	this.y = startY; // y position
	this.z = startZ; // z position
	this.moveEnd = null; // location firefly is moving towards ([x,y,z])
	this.neighborFlash = false; // whether neighbor fireflies have flashed
	this.waitTime; // how long left for random wait period
	this.recharging = false; // whether in recharging stage
	this.flashing = false; // whether in flashing stage
	this.remove = false; // whether they need to be deleted (stops the redraw during size changes)
	this.waiting = false; // whether we're in waiting stage

	// set firefly ID
	this.setID = function(id){
		this.fireflyID = id;
	}

	// create circle to represent firefly
	this.circle = document.createElementNS(SVG_NS, "circle");
	
	// set center
	this.circle.setAttributeNS(null, "cx", startX);
	this.circle.setAttributeNS(null, "cy", startY);
	this.circle.setAttributeNS(null, "r", this.radius/startZ);
	
	// change color
	this.circle.setAttributeNS(null, "fill", "hsla(0, 100%, 50%)");
	this.circle.setAttributeNS(null, "stroke", "hsla(0, 100%, 50%)")
	this.circle.setAttributeNS(null, "stroke-width", "2");

	// different color for example firefly
	if (this.fireflyID == 0) {
		this.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
		this.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
		this.circle.setAttributeNS(null, "stroke-width", "10");
	}
	
	// add to relevant group for z-indexing
	svg.getElementById("group-" + this.z).append(this.circle);
	
	// controls firefly flashing + waiting
	this.flash = function(){
		// no longer waiting, instead flash stage
		this.waiting = false;

		// check if right time of day
		if (firefliesFlash) {
			// set current firefly so we can use intervals
			let currentFirefly = fireflies[this.fireflyID];
			
			// updates for example firefly
			if (this.fireflyID == 0) {
				if (this.neighborFlash == true){
					updates.innerHTML = "Early flash called!";
				}
				else{
					updates.innerHTML = "Currently Flashing";
				}
			}

			// flash
			this.flashing = true;
			this.circle.setAttributeNS(null, "r", (this.radius*2)/startZ);
			this.circle.setAttributeNS(null, "fill", "#FFFF00");
			this.circle.setAttributeNS(null, "stroke", "#FFFF00");

			// different flash colors for example firefly
			if (this.fireflyID == 0) {
				this.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
				this.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
			}

			// stop flashing after 1 second
			setTimeout(function(currentFirefly) {
				// change colors back
				currentFirefly.circle.setAttributeNS(null, "fill", "hsla(0, 100%, 50%)");
				currentFirefly.circle.setAttributeNS(null, "stroke", "#FF0000");

				// different colors for example firefly
				if (currentFirefly.fireflyID == 0) {
					currentFirefly.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
					currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
				}
				
				// change radius back
				currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius/startZ);
				
				// no longer flashing
				currentFirefly.flashing = false;

				// go through fireflies and make them flash if within distance
				for (let i=0; i<fireflies.length; i++){
					// check distance for fireflies
					let distance = Math.sqrt((currentFirefly.x - fireflies[i].x)**2 + (currentFirefly.y - fireflies[i].y)**2);

					// if within flashing distance + >15 fireflies, make them flash early
					if (distance < synchronizationRadius){
						if (!fireflies[i].recharging && fireflies.length > 15) fireflies[i].neighborFlash = true;
					}
				}

				// just flashed, so wipe personal neighbor flashing
				currentFirefly.neighborFlash = false;

				// update for example firefly
				if (currentFirefly.fireflyID == 0 && firefliesFlash) updates.innerHTML = "Recharging!";
			}, 1000, currentFirefly);

			// switch to recharging stage
			this.recharging = true;

			// recharge for 12 seconds, then figure out next flash
			setTimeout(nextFlash, 12000, currentFirefly);
		}

		// TODO: delete this line @Laura?
		// line between fireflies n determine if line is atop the object, 
	}
}

// figures out when to flash and then calls flash again
function nextFlash(currentFirefly){
	// no longer recharging
	currentFirefly.recharging = false;

	// choose random time to wait (currently 10 seconds)
	let maxTime = 10
	currentFirefly.waitTime = Math.floor(Math.random() * maxTime); 

	// switch to waiting stage
	currentFirefly.waiting = true;
}


// checks if neighbors have flashes and keeps track of wait
function checkNeighbors(currentFirefly){
	// update for example firefly
	if (currentFirefly.fireflyID == 0) updates.innerHTML = "Waiting: " + currentFirefly.waitTime + " seconds remaining";

	// if neighbors flash or they're done waiting, flash!
	if (currentFirefly.waitTime <= 1 || currentFirefly.neighborFlash == true){
		// call flash again
		currentFirefly.flash();
	}

	// keep track of wait countdown
	currentFirefly.waitTime -= 1;
}


// controls firefly movement
function move(currentFirefly){
	// check if reached end point
	if(currentFirefly.x == currentFirefly.moveEnd[0] && currentFirefly.y == currentFirefly.moveEnd[1] && currentFirefly.z == currentFirefly.moveEnd[2]){
		// choose new end point
		currentFirefly.moveEnd = newLocation();
	}

	//calculate difference between currentpoint and end point
	let diffX = currentFirefly.moveEnd[0] - currentFirefly.x;
	let diffY = currentFirefly.moveEnd[1] - currentFirefly.y;
	let diffZ = currentFirefly.moveEnd[2] - currentFirefly.z;

	// limit difference by basespeed
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

	// different speeds for z since it's smaller
	let baseChange = baseSpeed/10;
	let finalDiffZ = 0;
	if (diffZ > 0){
		finalDiffZ = Math.min(baseChange, diffZ);
	}
	else{
		finalDiffZ = Math.max(-baseChange, diffZ);
	}

	// remove from current group (for z-index)
	currentFirefly.circle.remove();

	// moves coordinates toward end point
	currentFirefly.x += finalDiffX;
	currentFirefly.y += finalDiffY;
	currentFirefly.z += finalDiffZ;

	// double check no deletion, or we'll add it back in below here
	if (currentFirefly.remove == true) return;

	// add firefly into new z-index group
	let groupZ = Math.floor(currentFirefly.z);
	svg.getElementById("group-" + groupZ).append(currentFirefly.circle);

	// set new x,y coordinates
	currentFirefly.circle.setAttributeNS(null, "cx", currentFirefly.x);
	currentFirefly.circle.setAttributeNS(null, "cy", currentFirefly.y);

	// set new colors/radius for non-flashing
	if (!currentFirefly.flashing) {
		// radius according to z-index
		currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius/(currentFirefly.z));

		// brightness according to z-index (further back is darker)
		let redBrightness = 60 - 3*currentFirefly.z;
		currentFirefly.circle.setAttributeNS(null, "fill", "hsla(0, 100%, " + redBrightness + "%)");
		currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(0, 100%, " + redBrightness + "%)");

		// different colors for example firefly
		if (currentFirefly.fireflyID == 0) {
			currentFirefly.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
			currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
		}
	}
	// if flashing, use different radius and don't mess with the yellow
	else{
		currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius*2/(currentFirefly.z));
	}
}

function isBlocked(f1, x, y){
	f1X = f1.cx;
	f1Y = f1.cy;
	f2X = f1.x + document.getElementsByTagName(circle).getAttributeNS("SVG_NS", "r");
	f2Y = f1.y + document.getElementsByTagName(circle).getAttributeNS("SVG_NS", "r");
}
// find new location for firefly
function newLocation(){
    // Get viewport dimensions
    let rect = svg.getBoundingClientRect();

    // choose random numbers out of everything
    let newHeight = Math.floor(Math.random() * rect.width);
    let newWidth = Math.floor(Math.random() * rect.height);
    let newZ = Math.floor(Math.random() * 20) + 1;

    // return as [x,y,z]
    return [newHeight,newWidth, newZ];    
}


// TODO: comment this when finished @Laura
// checks if obstacle is blocking flash
function isBlocked(f1, f2, x, y){
	// set relevant variables
	let f1X = f1.x;
	let f1Y = f1.y;
	let f2X = f2.x;
	let f2Y = f2.y;
	x = document.getElementById("obstacle").x;
	y = document.getElementById("obstacle").y;
	let line = document.createElementNS(SVG_NS, 'line');
	line.createAttributeNS("x1", f1X);
	line.createAttributeNS("y1", f1Y);
	line.createAttributeNS("x2", f2X);
	line.createAttributeNS("y2", f2Y);

	if( line.x1 <= x <= line.x2 && line.y1 <= y <= line.y2){
		f1.neighborFlash == false;
		//f2.neighborFlash == false;
	}
	return f1.neighborFlash;
}

function checkNeighbors(currentFirefly){
	// check if neighbors flash, if they do
	if (currentFirefly.fireflyID == 0) updates.innerHTML = "Waiting: " + currentFirefly.waitTime + " seconds remaining";
	
	if(isBlocked(currentFirefly.fireflyID, document.getElementById("obstacle").getAttributeNS("SVG_NS", "x"), document.getElementById("obstacle").getAttributeNS("SVG_NS", "y"))){
		currentFirefly.neighborFlash == false;
	}
	
	if (currentFirefly.waitTime <= 1 || currentFirefly.neighborFlash == true){
		clearInterval(currentFirefly.waitInterval);
		currentFirefly.waitInterval = null;
		currentFirefly.flash();
	}
}

//returns random int in the interval [start, end)
function randRange(start, end){
	return Math.floor(Math.random() * (end - start)) + start;
}

// add fireflies
function addFireflies(){
	// amount of fireflies to add
	let fireflyAmount = document.getElementById("amount").value;
	
	// get space fireflies can exist in
	let rect = svg.getBoundingClientRect();
	const width = rect.width;
	const height = rect.height;

	// go through and add fireflies into random places or spawning circle
	for (let i=0; i<fireflyAmount; i++){
		// initialize x,y
		let x = 0;
		let y = 0;

		// if spawning circle, start at middle of circle
		if (isPlacement){
			x = Math.floor(spawnCircle.getAttributeNS(null, "cx"));
			y = Math.floor(spawnCircle.getAttributeNS(null, "cy"));
		}

		// otherwise, choose random location
		else{
			x = randRange(3, width);
			y = randRange(3, height);
		}

		// choose random z
		let z = randRange(1, 20);

		// create new firefly
		let newFirefly = new Firefly(x, y, z, svg, fireflies.length)

		// add to fireflies array
		fireflies.push(newFirefly);

		// make it start flashing and moving
		newFirefly.flash();
		newFirefly.moveEnd = newLocation();
	}
}

// remove fireflies
function removeFireflies(){
	// amount to remove (if user amount is greater than amount of fireflies, just remove them all)
	let fireflyAmount = document.getElementById("amount").value;
	fireflyAmount = Math.min(fireflies.length, fireflyAmount);

	// go through and remove them
	for (let i=0; i<fireflyAmount; i++){
		// pick out last added firefly
		let toDelete = fireflies[fireflies.length-1];

		// stop it from redrawing
		toDelete.remove = true;

		// delete it from everything
		toDelete.circle.remove();
		fireflies.pop();

		// stop deleting if no more fireflies
		if (fireflies.length == 0) return;
	}
}

//--------------------------------------------------Event Listeners/User Interactions--------------------------------------------------
// sets obstacle placement to true
function obstBool(){
	// main var setting
	isObst = true;

	// add clarification for user usage
	explainObst.innerHTML = "Now click where you want the obstacle to be!";
}

// event listener for user clicking-- add objects and spawn circle
document.getElementById("firefly-visual").addEventListener("click", (event)=>{
	// get where the user clicked in the svg
	const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
	
	// TODO: delete this when done @Laura
	console.log("click! click! click!");

	// if placing obstacle, place it
	if(isObst == true){
		// create rectangle obstacle
		obst = document.createElementNS(SVG_NS, 'rect');
		obst.setAttribute("width", "10");
		obst.setAttribute("height", "800");
		obst.setAttribute("y", y);
		obst.setAttribute("x", "" + x);
		obst.style.fill = "green";
		svg.appendChild(obst);
		obst.setAttribute("id", "obstacle");

		// TODO: delete log when done @Laura
		console.log("appending!");
		console.log(obstCounter);

		// placement finished
		isObst = false;

		// keep track of amount of placements
		obstCounter++;

		// remove explanation
		explainObst.innerHTML = "";
		
		// TODO: @Laura delete this when done
		//ID top of barrier obj - dstinguish case where barrier is btwn them from when it isn't
		//isBlocked(ff coords, barrier top coords) - to tell if distance btwn fireflies is disrupted by object)
		
		//addeventlistener 2 fv - always on, but only 
		//does something when btn clicked - var isobstclicked 
		//true WHEN clicked and set to false once rect drawn

		//IN ADDITION: STORE BARRIER OBJ? when computing the upd8s for each firefly need to upd8 that to CHECK if barrier exists btwn fireflies.
		//internal rep of barrier, external function- change upd8 function so it incorps barrier 
		
		// if(obst != null){
		// 	obstCounter++;
		// } <- ARREGLA ESTO PARA Q FUNCIONE ISBLOCKED
	}

	// place a spawn circle (prioritizes obstacle placement)
	else if(isPlacement){
		// make spawn circle visible
		spawnCircle.setAttributeNS(null, "cx", x);
		spawnCircle.setAttributeNS(null, "cy", y);
		text.setAttributeNS(null, "x", x-47);
		text.setAttributeNS(null, "y", y);
	}
});

// set morning environment
function setMorning(){
	// change background color
	svg.style.backgroundColor = "aliceblue";

	// fireflies don't flash in the morning
	firefliesFlash = false;

	// update user time
	userTime.innerHTML = "Current Time: Morning";

	// update example firefly
	updates.innerHTML = "Daytime, no flashing";

	// update time buttons and arrow
	morningButton.setAttribute("style", "border:5px solid #fca4e1");
	middayButton.setAttribute("style", "border:0px");
	nightButton.setAttribute("style", "border:0px");
	clockArrow.setAttribute("id", "arrow-morning");

}

// set time to midday
function setMidday(){
	// change background color
	svg.style.backgroundColor = "#87ceeb";

	// fireflies don't flash during the day
	firefliesFlash = false;

	// update user time
	userTime.innerHTML = "Current Time: Midday";

	// update example firefly
	updates.innerHTML = "Daytime, no flashing";	

	// update time buttons and arrow
	middayButton.setAttribute("style", "border:5px solid #fca4e1");
	morningButton.setAttribute("style", "border:0px");
	nightButton.setAttribute("style", "border:0px");
	clockArrow.setAttribute("id", "arrow-midday");
}

// set time to night
function setNight(){
	// set background color
	svg.style.backgroundColor = "#00008b";

	// update user time
	userTime.innerHTML = "Current Time: Night";

	// make fireflies stat flashing
	firefliesFlash = true;
	for (let i=0; i<fireflies.length; i++){
		nextFlash(fireflies[i]);
	}

	// update example firefly (will be immediately updated by waiting/flashing if there are fireflies)
	updates.innerHTML = "No fireflies yet";

	// update time buttons and arrow
	nightButton.setAttribute("style", "border:5px solid #fca4e1");
	middayButton.setAttribute("style", "border:0px");
	morningButton.setAttribute("style", "border:0px");
	clockArrow.setAttribute("id", "arrow-night");

}

// event listener- changes speed of fireflies
speedInput.addEventListener('input', function (evt) {
    baseSpeed = this.value;
});

// event listener- changes radius of neighbor flash effects
radiusInput.addEventListener('input', function (evt) {
    synchronizationRadius = this.value;
});

// initialize spawn circle
function createSpawnCircle(svg){
	spawnCircle.setAttributeNS(null, "fill", "#000");
	svg.append(spawnCircle);
	svg.append(text);
}

// check if user wants to add spawn location
spawnCheck.addEventListener("input", function(e){
	// check if it's checked
	isPlacement = spawnCheck.checked;

	// if unchecked, make it invisible
	if (!isPlacement){
		spawnCircle.setAttributeNS(null, "fill-opacity", 0);
		explainSpawn.innerHTML = "";
		text.innerHTML = "";
	}

	// if checked, visible time!
	else{
		// get center of svg
		const rect = svg.getBoundingClientRect();
		const x = rect.width/2;
		const y = rect.height/2;
	    
		// make the circle
		spawnCircle.setAttributeNS(null, "cx", x);
		spawnCircle.setAttributeNS(null, "cy", y);
		spawnCircle.setAttributeNS(null, "r", 50);
		spawnCircle.setAttributeNS(null, "fill-opacity", 100);

		// make the corresponding text
		text.setAttributeNS(null, "x", x-47);
		text.setAttributeNS(null, "y", y);
		text.setAttributeNS(null,"font-size","14");
		text.setAttributeNS(null, "fill", "#FFFFFF");
		text.innerHTML = "Spawn Circle";

		// little extra info for user
		explainSpawn.innerHTML = "Click where you want the fireflies to spawn!";
	}
});

//--------------------------------------------------Starting Function!--------------------------------------------------
// starting function
function drawFireflies(){
	// add groups to svg for z-index
	for (let i=21; i>0; i--){
		let curGroup = document.createElementNS(SVG_NS, "g");
		curGroup.setAttributeNS(null, "id", "group-" + i);
		svg.appendChild(curGroup);
	}

	// create hidden spawn circle
	createSpawnCircle(svg);

	// set spawning placement to false to start
	document.getElementById("placement").checked = false;

	// start firefly counter for movement
	setInterval(counter, 25);
}