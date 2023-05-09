const SVG_NS = "http://www.w3.org/2000/svg";
let syncCircle = null;
let firefliesFlash = false;

let updates = document.getElementById("updates");
updates.innerHTML = "Daytime, no flashing";

/*
TODO:
- let users add objects -- Laura
so they would place a plant, and that would affect whether fireflies can see each other + flash

- talk more about real life data + add more description of what the visual means for the user
maybe include videos? -- Laura

- user choosing where to spawn fireflies

- remove obstacle

- merge some intervals so it's a bit more optimized lololol

- add z coordinates so "in front" fireflies are actually in front
cant use z-index-- make them invisible?

- add clock arrow + highlighting to day tracker

*/

/*IT IS TIME TO GET ENVIRONMENTALLY FUNKY*/



let fireflies = [];
let synchronizationRadius = document.getElementById("radius").value;

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
	if (this.fireflyID == 0) {
		this.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
		this.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
		this.circle.setAttributeNS(null, "stroke-width", "10");
	}
	
	// svg.append(this.circle);
	svg.getElementById("group-" + this.z).append(this.circle);

	this.neighborFlash = false;
	this.waitTime;
	this.recharging = false;
	this.flashing = false;

	this.flash = function(){
		// check if right time of day
		if (firefliesFlash) {
			// if (this.neighborFlash == true) console.log("early flash called!!!!");

			let currentFirefly = fireflies[this.fireflyID];
			// flash
			if (this.fireflyID == 0) {
				if (this.neighborFlash == true){
					updates.innerHTML = "Early flash called!";
				}
				else{
					updates.innerHTML = "Currently Flashing";
				}
				
			}
			this.flashing = true;
			this.circle.setAttributeNS(null, "r", (this.radius*2)/startZ);
			this.circle.setAttributeNS(null, "fill", "#FFFF00");
			this.circle.setAttributeNS(null, "stroke", "#FFFF00");
			if (this.fireflyID == 0) {
				this.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
				this.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
			}

			setTimeout(function(currentFirefly) {
			    // console.log("flashing!");

				currentFirefly.circle.setAttributeNS(null, "fill", "hsla(0, 100%, 50%)");
				currentFirefly.circle.setAttributeNS(null, "stroke", "#FF0000");
				if (currentFirefly.fireflyID == 0) {
					currentFirefly.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
					currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
				}
				currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius/startZ);
				currentFirefly.flashing = false;

				// go through fireflies and set off neighbors
				for (let i=0; i<fireflies.length; i++){
					let distance = Math.sqrt((currentFirefly.x - fireflies[i].x)**2 + (currentFirefly.y - fireflies[i].y)**2);
					if (distance < synchronizationRadius){
						if (!fireflies[i].recharging && fireflies.length > 15) fireflies[i].neighborFlash = true;
					}
				}

				currentFirefly.neighborFlash = false;
				if (currentFirefly.fireflyID == 0) updates.innerHTML = "Recharging!";
				
			}, 1000, currentFirefly);

			this.recharging = true;

			// console.log("Waiting!");
			// call wait for 12 seconds

			setTimeout(nextFlash, 12000, currentFirefly);
			
		}

		//line between fireflies n determine if line is atop the object, 



		
	}

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

let baseSpeed = document.getElementById("speed").value;

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

		let baseChange = baseSpeed/10;
		let finalDiffZ = 0;
		if (diffZ > 0){
			finalDiffZ = Math.min(baseChange, diffZ);
			// console.log("basechange: " + baseChange + ", diffz: " + diffZ);
		}
		else{
			finalDiffZ = Math.max(-baseChange, diffZ);
		}

		currentFirefly.circle.remove();

		currentFirefly.x += finalDiffX;
		currentFirefly.y += finalDiffY;
		currentFirefly.z += finalDiffZ;

		let groupZ = Math.floor(currentFirefly.z);
		svg.getElementById("group-" + groupZ).append(currentFirefly.circle);

		currentFirefly.circle.setAttributeNS(null, "cx", currentFirefly.x);
		currentFirefly.circle.setAttributeNS(null, "cy", currentFirefly.y);
		if (!currentFirefly.flashing) {
			currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius/(currentFirefly.z));
			let redBrightness = 60 - 3*currentFirefly.z;
			currentFirefly.circle.setAttributeNS(null, "fill", "hsla(0, 100%, " + redBrightness + "%)");
			currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(0, 100%, " + redBrightness + "%)");
			if (currentFirefly.fireflyID == 0) {
				currentFirefly.circle.setAttributeNS(null, "fill", "hsla(183, 100%, 50%)");
				currentFirefly.circle.setAttributeNS(null, "stroke", "hsla(183, 100%, 50%)");
			}
		}
		else{
			currentFirefly.circle.setAttributeNS(null, "r", currentFirefly.radius*2/(currentFirefly.z));
		}
		currentFirefly.circle.setAttributeNS(null, "z-index", 20-currentFirefly.z);
		// console.log("z: " + currentFirefly.z + ", radius: " + currentFirefly.radius/currentFirefly.z + ", " + finalDiffZ);
	}


function movementInterval(currentFirefly){
	interval = setInterval(move, 25, currentFirefly);
}

function mainFlash(currentFirefly){
	currentFirefly.waitInterval = setInterval(checkNeighbors, 1000, currentFirefly);
}

function checkNeighbors(currentFirefly){
	// check if neighbors flash, if they do
	// console.log("waiting.... " + currentFirefly.waitTime);
	if (currentFirefly.fireflyID == 0) updates.innerHTML = "Waiting: " + currentFirefly.waitTime + " seconds remaining";
	console.log("Waiting: " + currentFirefly.waitTime + " seconds remaining");
	if (currentFirefly.waitTime <= 1 || currentFirefly.neighborFlash == true){
		if (currentFirefly.neighborFlash == true) console.log("early flash!!!!");
		clearInterval(currentFirefly.waitInterval);
		currentFirefly.waitInterval = null;
		console.log("go flash!");
		currentFirefly.flash();
	}
	currentFirefly.waitTime -= 1;
}

let isObst = false;

function obstBool(){
	isObst = true;
	console.log("boolean!!!!!");
}

document.getElementById("firefly-visual").addEventListener("click", (event)=>{
	const svg = document.querySelector("#firefly-visual");
	const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
	
	console.log("click! click! click!");

	if(isObst == true){
		obst = document.createElementNS(SVG_NS, 'rect');
		obst.setAttribute("width", "10");
		obst.setAttribute("height", "500");
		obst.setAttribute("y", y);
		obst.setAttribute("x", "" + x);
		obst.style.fill = "green";
		svg.appendChild(obst);
		console.log("appending!");
		isObst = false;
		//ID top of barrier obj - dstinguish case where barrier is btwn them from when it isn't
		//isBlocked(ff coords, barrier top coords) - to tell if distance btwn fireflies is disrupted by object)
		
		//addeventlistener 2 fv - always on, but only 
		//does something when btn clicked - var isobstclicked 
		//true WHEN clicked and set to false once rect drawn

		//IN ADDITION: STORE BARRIER OBJ? when computing the upd8s for each firefly need to upd8 that to CHECK if barrier exists btwn fireflies.
		//internal rep of barrier, external function- change upd8 function so it incorps barrier 
	}
});

function setMorning(){
	document.getElementById("firefly-visual").style.backgroundColor = "aliceblue";
	firefliesFlash = false;
	document.getElementById("current-time").innerHTML = "Current Time: Morning";
}

function setMidday(){
	document.getElementById("firefly-visual").style.backgroundColor = "#87ceeb";
	firefliesFlash = false;
	document.getElementById("current-time").innerHTML = "Current Time: Midday";
}

function setNight(){
	document.getElementById("firefly-visual").style.backgroundColor = "#00008b";
	document.getElementById("current-time").innerHTML = "Current Time: Night";
	firefliesFlash = true;
	for (let i=0; i<fireflies.length; i++){
		nextFlash(fireflies[i]);
	}
}

//returns random int in the interval [start, end)
function randRange(start, end){
	return Math.floor(Math.random() * (end - start)) + start;
}

function addFireflies(){
	svg = document.querySelector("#firefly-visual");

	let fireflyAmount = document.getElementById("amount").value;
	
	let rect = svg.getBoundingClientRect();

	const width = rect.width;
	const height = rect.height;

	for (let i=0; i<fireflyAmount; i++){
		let x = randRange(3, width);
		let y = randRange(3, height);
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

	let fireflyAmount = document.getElementById("amount").value;

	for (let i=0; i<fireflyAmount; i++){
		let pos = randRange(0, fireflies.length);
		let toDelete = fireflies.splice(pos, 1);
		toDelete[0].circle.remove();
		if (fireflies.length == 0) return;
	}

	setFireflyID(fireflies);
}

function setFireflyID(firflies){
	for (let i=0; i<fireflies.length; i++){
		fireflies[i].setID(i);
	}
}

function drawFireflies(){
	const svg = document.querySelector("#firefly-visual");

	for (let i=21; i>0; i--){
		let curGroup = document.createElementNS(SVG_NS, "g");
		curGroup.setAttributeNS(null, "id", "group-" + i);
		svg.appendChild(curGroup);
	}

	// svg.getElementById("group-5").remove();
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

document.getElementById("speed").addEventListener('input', function (evt) {
    baseSpeed = this.value;
});

document.getElementById("radius").addEventListener('input', function (evt) {
    synchronizationRadius = this.value;
});
