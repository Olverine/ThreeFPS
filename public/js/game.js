var socket = io();

// Set the scene size.
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Set some camera attributes.
const VIEW_ANGLE = 70;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 256;

console.log(WIDTH);
console.log(HEIGHT);

var players = [];
var myID;

// Get the DOM element to attach to
const container = document.getElementById('container');

// Create a WebGL renderer, camera
// and a scene
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x87CEFA);
/*
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

renderer.shadowCameraNear = 3;
renderer.shadowCameraFar = 128;
renderer.shadowCameraFov = 50;

renderer.shadowMapBias = 0.0039;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;*/
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );
var lookX = 0;
var lookY = 0;
var walkSpeed = 0.15;
var verticalVelocity = 0;
var grounded = true;

var keydown = [];

const scene = new THREE.Scene();
camera.position.y = 1.5;

// Add the camera to the scene.
scene.add(camera);

var objLoader = new THREE.OBJLoader();

// load a resource
objLoader.load(
	// resource URL
	'http://localhost:8080/asset/model?id=gun.obj',
	// Function when resource is loaded
	function ( object ) {
		camera.add( object );
    object.position.set(0.1, -0.1, -0.2);
    object.scale.set(0.01, 0.01, 0.01);
	}
);

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

createMap();

function update () {
  camera.rotation.x = 0;
  camera.rotation.y = 0;
  camera.rotation.z = 0;
  camera.rotateY(lookY);
  camera.rotateX(lookX);

  var forward = new THREE.Vector3(Math.sin(lookY), 0, Math.cos(lookY));
  var right = new THREE.Vector3(Math.cos(lookY), 0, Math.sin(lookY));
  var velocity = new THREE.Vector3(0,0,0);

  if(keydown[87]){
    velocity.x -= forward.x * walkSpeed;
    velocity.z -= forward.z * walkSpeed;
  }else if(keydown[83]){
    velocity.x += forward.x * walkSpeed;
    velocity.z += forward.z * walkSpeed;
  }
  if(keydown[68]){
    velocity.x += right.x * walkSpeed;
    velocity.z -= right.z * walkSpeed;
  }else if(keydown[65]){
    velocity.x -= right.x * walkSpeed;
    velocity.z += right.z * walkSpeed;
  }

  camera.position.x += velocity.x;
  camera.position.y += velocity.y;
  camera.position.z += velocity.z;

  var playerBoundingBox = new THREE.Box3(new THREE.Vector3(camera.position.x - 0.5, 0, camera.position.z -0.5), new THREE.Vector3(camera.position.x + 0.5, 2, camera.position.z +0.5))
  for(var i = 0; i < boundingBoxes.length; i++){
    if(boundingBoxes[i].intersectsBox(playerBoundingBox)){
      if(Math.abs(camera.position.x - boundingBoxes[i].getCenter.x) > Math.abs(camera.position.z - boundingBoxes[i].getCenter.z)){
        if(camera.position.x < boundingBoxes[i].getCenter().x){
          camera.position.x = boundingBoxes[i].getCenter().x - 2.5;
        }else if(camera.position.x > boundingBoxes[i].getCenter().x){
          camera.position.x = boundingBoxes[i].getCenter().x + 2.5;
        }
      }else{
        if(camera.position.z < boundingBoxes[i].getCenter().z){
          camera.position.z = boundingBoxes[i].getCenter().z - 2.5;
        }else if(camera.position.z > boundingBoxes[i].getCenter().z){
          camera.position.z = boundingBoxes[i].getCenter().z + 2.5;
        }
      }
    }
  }

  if(camera.position.x > 63.5){
    camera.position.x = 63.5;
  }else if(camera.position.x < -63.5){
    camera.position.x = -63.5;
  }if(camera.position.z > 63.5){
    camera.position.z = 63.5;
  }else if(camera.position.z < -63.5){
    camera.position.z = -63.5;
  }

  if(grounded && keydown[32]){
    verticalVelocity = 0.2;
    grounded = false;
  }

  verticalVelocity -= 0.01;
  camera.position.y += verticalVelocity;
  if(camera.position.y < 1.5){
    camera.position.y = 1.5;
    verticalVelocity = 0;
    grounded = true;
  }

  socket.emit("update", camera.position, lookX, lookY);

  // Draw!
  renderer.render(scene, camera);

  // Schedule the next frame.
  requestAnimationFrame(update);
}

update();

canvas = document.getElementsByTagName('canvas')[0];

onmousedown = function(e){
  canvas.requestPointerLock();
}

document.addEventListener('keydown', function(event) {
    keydown[event.keyCode] = true;
});

document.addEventListener('keyup', function(event) {
    keydown[event.keyCode] = false;
});

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", updatePosition, false);
  } else {
    console.log('The pointer lock status is now unlocked');
    document.removeEventListener("mousemove", updatePosition, false);
  }
}

function updatePosition(e) {
  lookX -= e.movementY / 200;
  lookY -= e.movementX / 200;

  if(lookX < -90 * (Math.PI / 180)){
    lookX = -90 * (Math.PI / 180);
  }else if(lookX > 90 * (Math.PI / 180)){
    lookX = 90 * (Math.PI / 180);
  }
}

socket.on("update", function(data){
  if(data.id == myID)
    return;

  var foundPlayer = false;
  players.forEach(function(player){
    if(player.id == data.id){
      player.mesh.position.x = data.position.x;
      player.mesh.position.y = data.position.y-0.5;
      player.mesh.position.z = data.position.z;
      player.mesh.rotation.x = 0;
      player.mesh.rotation.y = 0;
      player.mesh.rotation.z = 0;
      player.mesh.rotateY(data.lookY);
      foundPlayer = true;
    }
  });

  if(!foundPlayer){
    var geometry = new THREE.CylinderGeometry( 0.5, 0.5, 2, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var cylinder = new THREE.Mesh( geometry, material );
    scene.add( cylinder );
    objLoader.load(
    	// resource URL
    	'http://localhost:8080/asset/model?id=gun.obj',
    	// Function when resource is loaded
    	function ( object ) {
    		cylinder.add( object );
        object.position.set(0.5, 0, -1);
        object.scale.set(0.05, 0.05, 0.05);
    	}
    );
    var player = {
      id: data.id,
      mesh: cylinder
    }
    players.push(player);
    console.log("Adding new player");
  }
});

socket.on('disconnection', function(id){
  for(var i = 0; i < players.length; i++){
    if(players[i].id == id){
      console.log("removing: " + players[i].mesh);
        scene.remove(players[i].mesh);
        players.splice(i, 1);
        break;
    }
  }
});

socket.on('id', function(id){
  myID = id;
  for(var i = 0; i < players.length; i++){
    if(players[i].id == id){
      console.log("removing: " + players[i].mesh);
        scene.remove(players[i].mesh);
        players.splice(i, 1);
        break;
    }
  }
});
