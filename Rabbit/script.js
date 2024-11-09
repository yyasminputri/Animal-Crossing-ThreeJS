const counterDOM = document.getElementById('counter');  
const endDOM = document.getElementById('end');  

const scene = new THREE.Scene();

const distance = 500;
const camera = new THREE.OrthographicCamera( window.innerWidth/-2, window.innerWidth/2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 10000 );

camera.rotation.x = 50*Math.PI/180;
camera.rotation.y = 20*Math.PI/180;
camera.rotation.z = 10*Math.PI/180;

const initialCameraPositionY = -Math.tan(camera.rotation.x)*distance;
const initialCameraPositionX = Math.tan(camera.rotation.y)*Math.sqrt(distance**2 + initialCameraPositionY**2);
camera.position.y = initialCameraPositionY;
camera.position.x = initialCameraPositionX;
camera.position.z = distance;

const zoom = 2;

const chickenSize = 15;

const positionWidth = 42;
const columns = 17;
const boardWidth = positionWidth*columns;

const stepTime = 200; 

let lanes;
let currentLane;
let currentColumn;

let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;

let gameOver = false; 

const carFrontTexture = new Texture(40,80,[{x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = new Texture(40,80,[{x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = new Texture(110,40,[{x: 10, y: 0, w: 50, h: 30 }, {x: 70, y: 0, w: 30, h: 30 }]);
const carLeftSideTexture = new Texture(110,40,[{x: 10, y: 10, w: 50, h: 30 }, {x: 70, y: 10, w: 30, h: 30 }]);

const truckFrontTexture = new Texture(30,30,[{x: 15, y: 0, w: 10, h: 30 }]);
const truckRightSideTexture = new Texture(25,30,[{x: 0, y: 15, w: 10, h: 10 }]);
const truckLeftSideTexture = new Texture(25,30,[{x: 0, y: 5, w: 10, h: 10 }]);

const generateLanes = () => [-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9].map((index) => {
  const lane = new Lane(index);
  lane.mesh.position.y = index*positionWidth*zoom;
  scene.add( lane.mesh );
  return lane;
}).filter((lane) => lane.index >= 0);

const addLane = () => {
  const index = lanes.length;
  const lane = new Lane(index);
  lane.mesh.position.y = index*positionWidth*zoom;
  scene.add(lane.mesh);
  lanes.push(lane);
}

const chicken = new Chicken();
scene.add( chicken );

hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
scene.add(hemiLight)

const initialDirLightPositionX = -100;
const initialDirLightPositionY = -100;
dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(initialDirLightPositionX, initialDirLightPositionY, 200);
dirLight.castShadow = true;
dirLight.target = chicken;
scene.add(dirLight);

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
var d = 500;
dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

backLight = new THREE.DirectionalLight(0x000000, .4);
backLight.position.set(200, 200, 50);
backLight.castShadow = true;
scene.add(backLight)

const laneTypes = ['car','truck', 'forest'];
const laneSpeeds = [2, 2.5, 3];
const vechicleColors = [0x428eff, 0xffef42, 0xff7b42, 0xff426b];
const threeHeights = [20,45,60];

const initaliseValues = () => {
  lanes = generateLanes()

  currentLane = 0;
  currentColumn = Math.floor(columns/2);

  previousTimestamp = null;

  gameOver = false;

  startMoving = false;
  moves = [];
  stepStartTimestamp;

  chicken.position.x = 0;
  chicken.position.y = 0;

  camera.position.y = initialCameraPositionY;
  camera.position.x = initialCameraPositionX;

  dirLight.position.x = initialDirLightPositionX;
  dirLight.position.y = initialDirLightPositionY;
}

initaliseValues();

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function Texture(width, height, rects) {
  const canvas = document.createElement( "canvas" );
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext( "2d" );
  context.fillStyle = "#ffffff";
  context.fillRect( 0, 0, width, height );
  context.fillStyle = "rgba(0,0,0,0.6)";  
  rects.forEach(rect => {
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return new THREE.CanvasTexture(canvas);
}

function Wheel() {
    // Create a texture loader
    const textureLoader = new THREE.TextureLoader();
  
    // Load the wheel texture
    const wheelTexture = textureLoader.load('assets/wheel.jpg'); // Update with the correct path to wheel.jpg
  
    // Create the wheel mesh with the texture
    const wheel = new THREE.Mesh(
      new THREE.BoxBufferGeometry(12 * zoom, 33 * zoom, 12 * zoom),
      new THREE.MeshLambertMaterial({ map: wheelTexture, flatShading: true })
    );
  
    // Set the position of the wheel
    wheel.position.z = 6 * zoom;
  
    return wheel;
  }
  

function getNeonPastelColor() {
    const neonPastelColors = [
        0xff6f91, // Neon pink
        0xffb7b2, // Neon peach
        0xffffa5, // Neon yellow
        0xc4f1be, // Neon mint green
        0x9ad7ff, // Neon sky blue
        0xd9b3ff  // Neon lavender
    ];
    // Select a random neon pastel color from the array
    const randomColor = neonPastelColors[Math.floor(Math.random() * neonPastelColors.length)];
    return new THREE.Color(randomColor); // Convert to THREE.Color
}

function Car() {
    const car = new THREE.Group();
    const color = getNeonPastelColor(); // Use neon pastel color for the main body
    
    const main = new THREE.Mesh(
        new THREE.BoxBufferGeometry(60 * zoom, 30 * zoom, 15 * zoom),
        new THREE.MeshPhongMaterial({ color, flatShading: true })
    );
    main.position.z = 12 * zoom;
    main.castShadow = true;
    main.receiveShadow = true;
    car.add(main);

    const cabinColor = getNeonPastelColor(); // Use neon pastel color for the cabin
    
    const cabin = new THREE.Mesh(
        new THREE.BoxBufferGeometry(33 * zoom, 24 * zoom, 12 * zoom),
        [
            new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: carBackTexture }),
            new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: carFrontTexture }),
            new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: carRightSideTexture }),
            new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: carLeftSideTexture }),
            new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true }), // top
            new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }) // bottom
        ]
    );
    cabin.position.x = 6 * zoom;
    cabin.position.z = 25.5 * zoom;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    car.add(cabin);

    const frontWheel = new Wheel();
    frontWheel.position.x = -18 * zoom;
    car.add(frontWheel);

    const backWheel = new Wheel();
    backWheel.position.x = 18 * zoom;
    car.add(backWheel);

    car.castShadow = true;
    car.receiveShadow = false;

    return car;
}

function Truck() {
  const truck = new THREE.Group();
  
  // Assign different neon pastel colors to each truck part
  const baseColor = getNeonPastelColor();
  const cargoColor = getNeonPastelColor();
  const cabinColor = getNeonPastelColor();

  const base = new THREE.Mesh(
    new THREE.BoxBufferGeometry(100 * zoom, 25 * zoom, 5 * zoom), 
    new THREE.MeshLambertMaterial({ color: baseColor, flatShading: true })
  );
  base.position.z = 10 * zoom;
  truck.add(base);

  const cargo = new THREE.Mesh(
    new THREE.BoxBufferGeometry(75 * zoom, 35 * zoom, 40 * zoom), 
    new THREE.MeshPhongMaterial({ color: cargoColor, flatShading: true })
  );
  cargo.position.x = 15 * zoom;
  cargo.position.z = 30 * zoom;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(
    new THREE.BoxBufferGeometry(25 * zoom, 30 * zoom, 30 * zoom), 
    [
      new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true }), // back
      new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: truckFrontTexture }),
      new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: truckRightSideTexture }),
      new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true, map: truckLeftSideTexture }),
      new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true }), // top
      new THREE.MeshPhongMaterial({ color: cabinColor, flatShading: true }) // bottom
    ]
  );
  cabin.position.x = -40 * zoom;
  cabin.position.z = 20 * zoom;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  const frontWheel = new Wheel();
  frontWheel.position.x = -38 * zoom;
  truck.add(frontWheel);

  const middleWheel = new Wheel();
  middleWheel.position.x = -10 * zoom;
  truck.add(middleWheel);

  const backWheel = new Wheel();
  backWheel.position.x = 30 * zoom;
  truck.add(backWheel);

  return truck;
}

function Three() {
  const three = new THREE.Group();

  // Load textures
  const textureLoader = new THREE.TextureLoader();
  const trunkTexture = textureLoader.load('assets/trunk.jpg');
  const leavesTexture = textureLoader.load('assets/leaves.avif');

  // Create trunk with texture
  const trunk = new THREE.Mesh(
    new THREE.BoxBufferGeometry(15 * zoom, 15 * zoom, 20 * zoom),
    new THREE.MeshPhongMaterial({ map: trunkTexture, flatShading: true })
  );
  trunk.position.z = 10 * zoom;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  three.add(trunk);

  // Set a random height for the crown
  height = threeHeights[Math.floor(Math.random() * threeHeights.length)];

  // Create crown with texture
  const crown = new THREE.Mesh(
    new THREE.BoxBufferGeometry(30 * zoom, 30 * zoom, height * zoom),
    new THREE.MeshLambertMaterial({ map: leavesTexture, flatShading: true })
  );
  crown.position.z = (height / 2 + 20) * zoom;
  crown.castShadow = true;
  crown.receiveShadow = false;
  three.add(crown);

  return three;
}


function Chicken() {
  const rabbit = new THREE.Group();

  // Define the base size for the rabbit
  const baseSize = chickenSize * zoom; // Base size for width and depth
  const heightFactor = 1.2; // Factor to increase the height

  // Create the body of the rabbit with the rabbit texture
  const bodyMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('assets/rabbit.jpg'), // Rabbit texture
      flatShading: true
  });
  const body = new THREE.Mesh(
      new THREE.BoxBufferGeometry(baseSize, baseSize, 20 * heightFactor * zoom), // Adjusted body size for a rounder shape
      bodyMaterial
  );
  body.position.z = (10 * heightFactor) * zoom;
  body.castShadow = true;
  body.receiveShadow = true;
  rabbit.add(body);

  // Create the rabbit ears
  const earMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff, // White color for ears
      flatShading: true
  });

  const earHeight = 15 * zoom;
  const earWidth = 5 * zoom;
  const earDepth = 2 * zoom;

  // Left ear (Adjusted position and rotation for visibility)
  const leftEar = new THREE.Mesh(
      new THREE.ConeBufferGeometry(earWidth, earHeight, 4), // Cone shape for the ear (consistent size)
      earMaterial
  );
  leftEar.position.set(-baseSize / 2, baseSize / 1, 18 * heightFactor * zoom); // Position left ear more outward
  leftEar.rotation.x = Math.PI / 3; // Tilt ear slightly
  leftEar.rotation.z = Math.PI / 6; // Additional rotation to improve visibility
  rabbit.add(leftEar);

  // Right ear (Adjusted to match left ear's size and position)
  const rightEar = new THREE.Mesh(
      new THREE.ConeBufferGeometry(earWidth, earHeight, 4), // Cone shape for the ear (consistent size)
      earMaterial
  );
  rightEar.position.set(baseSize / 2, baseSize / 1.5, 16 * heightFactor * zoom); // Position right ear
  rightEar.rotation.x = -Math.PI / 3; // Tilt ear slightly
  rightEar.rotation.z = -Math.PI / 6; // Adjust rotation for symmetry
  rabbit.add(rightEar);

  // Create the rabbit tail
  const tailMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff, // White color for tail
      flatShading: true
  });
  const tail = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5 * zoom, 16, 16), // Sphere shape for the tail
      tailMaterial
  );
  tail.position.set(0, -baseSize / 2, -10 * heightFactor * zoom); // Position tail at the back
  rabbit.add(tail);

  // Create the rabbit legs (using simple cylinders)
  const legMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888, // Gray color for legs
      flatShading: true
  });

  // Increased leg size
  const legHeight = 10 * zoom; // Increased leg height
  const legRadius = 4 * zoom; // Increased leg radius

  // Front left leg
  const frontLeftLeg = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(legRadius, legRadius, legHeight, 8),
      legMaterial
  );
  frontLeftLeg.position.set(-baseSize / 4, -baseSize / 2, 0);
  frontLeftLeg.rotation.x = Math.PI / 2;
  rabbit.add(frontLeftLeg);

  // Front right leg
  const frontRightLeg = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(legRadius, legRadius, legHeight, 8),
      legMaterial
  );
  frontRightLeg.position.set(baseSize / 4, -baseSize / 2, 0);
  frontRightLeg.rotation.x = Math.PI / 2;
  rabbit.add(frontRightLeg);

  // Back left leg
  const backLeftLeg = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(legRadius, legRadius, legHeight, 8),
      legMaterial
  );
  backLeftLeg.position.set(-baseSize / 4, -baseSize, -10 * heightFactor * zoom);
  backLeftLeg.rotation.x = Math.PI / 2;
  rabbit.add(backLeftLeg);

  // Back right leg
  const backRightLeg = new THREE.Mesh(
      new THREE.CylinderBufferGeometry(legRadius, legRadius, legHeight, 8),
      legMaterial
  );
  backRightLeg.position.set(baseSize / 4, -baseSize, -10 * heightFactor * zoom);
  backRightLeg.rotation.x = Math.PI / 2;
  rabbit.add(backRightLeg);

  return rabbit;
}


function Road() {
    const road = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
  
    // Load the road texture
    const roadTexture = textureLoader.load('assets/road.avif'); // Adjust the path as necessary
  
    const createSection = texture => new THREE.Mesh(
      new THREE.PlaneBufferGeometry(boardWidth * zoom, positionWidth * zoom),
      new THREE.MeshPhongMaterial({ map: texture }) // Use the texture map
    );
  
    const middle = createSection(roadTexture);
    middle.receiveShadow = true;
    road.add(middle);
  
    const left = createSection(roadTexture); // Using the same texture for the left section
    left.position.x = -boardWidth * zoom;
    road.add(left);
  
    const right = createSection(roadTexture); // Using the same texture for the right section
    right.position.x = boardWidth * zoom;
    road.add(right);
  
    return road;
  }

  

  function Grass() {
    const grass = new THREE.Group();
    
    // Load the grass texture
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('assets/grass.avif'); // Update with the correct path to your texture file
  
    // Create a section with texture
    const createSection = texture => new THREE.Mesh(
      new THREE.BoxBufferGeometry(boardWidth * zoom, positionWidth * zoom, 3 * zoom),
      new THREE.MeshPhongMaterial({ map: texture }) // Use the texture for the material
    );
  
    const middle = createSection(grassTexture);
    middle.receiveShadow = true;
    grass.add(middle);
  
    const left = createSection(grassTexture);
    left.position.x = -boardWidth * zoom;
    grass.add(left);
  
    const right = createSection(grassTexture);
    right.position.x = boardWidth * zoom;
    grass.add(right);
  
    grass.position.z = 1.5 * zoom;
    return grass;
  }
  
  function Lane(index) {
    this.index = index;
    this.type = index <= 0 ? 'field' : laneTypes[Math.floor(Math.random()*laneTypes.length)];
  
    switch(this.type) {
      case 'field': {
        this.type = 'field';
        this.mesh = new Grass();
        break;
      }
      case 'forest': {
        this.mesh = new Grass();
  
        this.occupiedPositions = new Set();
        this.threes = [1,2,3,4].map(() => {
          const three = new Three();
          let position;
          do {
            position = Math.floor(Math.random()*columns);
          }while(this.occupiedPositions.has(position))
            this.occupiedPositions.add(position);
          three.position.x = (position*positionWidth+positionWidth/2)*zoom-boardWidth*zoom/2;
          this.mesh.add( three );
          return three;
        })
        break;
      }
      case 'car' : {
        this.mesh = new Road();
        this.direction = Math.random() >= 0.5;
  
        const occupiedPositions = new Set();
        this.vechicles = [1,2,3].map(() => {
          const vechicle = new Car();
          let position;
          do {
            position = Math.floor(Math.random()*columns/2);
          }while(occupiedPositions.has(position))
            occupiedPositions.add(position);
          vechicle.position.x = (position*positionWidth*2+positionWidth/2)*zoom-boardWidth*zoom/2;
          if(!this.direction) vechicle.rotation.z = Math.PI;
          this.mesh.add( vechicle );
          return vechicle;
        })
  
        this.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)];
        break;
      }
      case 'truck' : {
        this.mesh = new Road();
        this.direction = Math.random() >= 0.5;
  
        const occupiedPositions = new Set();
        this.vechicles = [1,2].map(() => {
          const vechicle = new Truck();
          let position;
          do {
            position = Math.floor(Math.random()*columns/3);
          }while(occupiedPositions.has(position))
            occupiedPositions.add(position);
          vechicle.position.x = (position*positionWidth*3+positionWidth/2)*zoom-boardWidth*zoom/2;
          if(!this.direction) vechicle.rotation.z = Math.PI;
          this.mesh.add( vechicle );
          return vechicle;
        })
  
        this.speed = laneSpeeds[Math.floor(Math.random()*laneSpeeds.length)];
        break;
      }
    }
  }
  
  document.querySelector("#retry").addEventListener("click", () => {
    lanes.forEach(lane => scene.remove( lane.mesh ));
    initaliseValues();
    endDOM.style.visibility = 'hidden';
  });
  
  document.getElementById('forward').addEventListener("click", () => move('forward'));
  
  document.getElementById('backward').addEventListener("click", () => move('backward'));
  
  document.getElementById('left').addEventListener("click", () => move('left'));
  
  document.getElementById('right').addEventListener("click", () => move('right'));
  
  window.addEventListener("keydown", event => {
    if ((event.keyCode == '38') && (!gameOver)) {
      // up arrow
      move('forward');
    }
    else if ((event.keyCode == '40') && (!gameOver)) {
      // down arrow
      move('backward');
    }
    else if ((event.keyCode == '37') && (!gameOver)) {
      // left arrow
      move('left');
    }
    else if ((event.keyCode == '39') && (!gameOver)) {
      // right arrow
      move('right');
    }
  });
  
  function move(direction) {
    const finalPositions = moves.reduce((position,move) => {
      if(move === 'forward') return {lane: position.lane+1, column: position.column};
      if(move === 'backward') return {lane: position.lane-1, column: position.column};
      if(move === 'left') return {lane: position.lane, column: position.column-1};
      if(move === 'right') return {lane: position.lane, column: position.column+1};
    }, {lane: currentLane, column: currentColumn})
  
    if (direction === 'forward') {
      if(lanes[finalPositions.lane+1].type === 'forest' && lanes[finalPositions.lane+1].occupiedPositions.has(finalPositions.column)) return;
      if(!stepStartTimestamp) startMoving = true;
      addLane();
    }
    else if (direction === 'backward') {
      if(finalPositions.lane === 0) return;
      if(lanes[finalPositions.lane-1].type === 'forest' && lanes[finalPositions.lane-1].occupiedPositions.has(finalPositions.column)) return;
      if(!stepStartTimestamp) startMoving = true;
    }
    else if (direction === 'left') {
      if(finalPositions.column === 0) return;
      if(lanes[finalPositions.lane].type === 'forest' && lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column-1)) return;
      if(!stepStartTimestamp) startMoving = true;
    }
    else if (direction === 'right') {
      if(finalPositions.column === columns - 1 ) return;
      if(lanes[finalPositions.lane].type === 'forest' && lanes[finalPositions.lane].occupiedPositions.has(finalPositions.column+1)) return;
      if(!stepStartTimestamp) startMoving = true;
    }
    moves.push(direction);
  }
  
  function animate(timestamp) {
    requestAnimationFrame( animate );
  
    if(!previousTimestamp) previousTimestamp = timestamp;
    const delta = timestamp - previousTimestamp;
    previousTimestamp = timestamp;
  
    // Animate cars and trucks moving on the lane
    lanes.forEach(lane => {
      if(lane.type === 'car' || lane.type === 'truck') {
        const aBitBeforeTheBeginingOfLane = -boardWidth*zoom/2 - positionWidth*2*zoom;
        const aBitAfterTheEndOFLane = boardWidth*zoom/2 + positionWidth*2*zoom;
        lane.vechicles.forEach(vechicle => {
          if(lane.direction) {
            vechicle.position.x = vechicle.position.x < aBitBeforeTheBeginingOfLane ? aBitAfterTheEndOFLane : vechicle.position.x -= lane.speed/16*delta;
          }else{
            vechicle.position.x = vechicle.position.x > aBitAfterTheEndOFLane ? aBitBeforeTheBeginingOfLane : vechicle.position.x += lane.speed/16*delta;
          }
        });
      }
    });
  
    if(startMoving) {
      stepStartTimestamp = timestamp;
      startMoving = false;
    }
  
    if(stepStartTimestamp) {
      const moveDeltaTime = timestamp - stepStartTimestamp;
      const moveDeltaDistance = Math.min(moveDeltaTime/stepTime,1)*positionWidth*zoom;
      const jumpDeltaDistance = Math.sin(Math.min(moveDeltaTime/stepTime,1)*Math.PI)*8*zoom;
      switch(moves[0]) {
        case 'forward': {
          const positionY = currentLane*positionWidth*zoom + moveDeltaDistance;
          camera.position.y = initialCameraPositionY + positionY; 
          dirLight.position.y = initialDirLightPositionY + positionY; 
          chicken.position.y = positionY; // initial chicken position is 0
  
          chicken.position.z = jumpDeltaDistance;
          break;
        }
        case 'backward': {
          positionY = currentLane*positionWidth*zoom - moveDeltaDistance
          camera.position.y = initialCameraPositionY + positionY;
          dirLight.position.y = initialDirLightPositionY + positionY; 
          chicken.position.y = positionY;
  
          chicken.position.z = jumpDeltaDistance;
          break;
        }
        case 'left': {
          const positionX = (currentColumn*positionWidth+positionWidth/2)*zoom -boardWidth*zoom/2 - moveDeltaDistance;
          camera.position.x = initialCameraPositionX + positionX;     
          dirLight.position.x = initialDirLightPositionX + positionX; 
          chicken.position.x = positionX; // initial chicken position is 0
          chicken.position.z = jumpDeltaDistance;
          break;
        }
        case 'right': {
          const positionX = (currentColumn*positionWidth+positionWidth/2)*zoom -boardWidth*zoom/2 + moveDeltaDistance;
          camera.position.x = initialCameraPositionX + positionX;       
          dirLight.position.x = initialDirLightPositionX + positionX;
          chicken.position.x = positionX; 
  
          chicken.position.z = jumpDeltaDistance;
          break;
        }
      }
      // Once a step has ended
      if(moveDeltaTime > stepTime) {
        switch(moves[0]) {
          case 'forward': {
            currentLane++;
            counterDOM.innerHTML = currentLane;    
            break;
          }
          case 'backward': {
            currentLane--;
            counterDOM.innerHTML = currentLane;    
            break;
          }
          case 'left': {
            currentColumn--;
            break;
          }
          case 'right': {
            currentColumn++;
            break;
          }
        }
        moves.shift();
        // If more steps are to be taken then restart counter otherwise stop stepping
        stepStartTimestamp = moves.length === 0 ? null : timestamp;
      }
    }
  
    // Hit test
    if(lanes[currentLane].type === 'car' || lanes[currentLane].type === 'truck') {
      const chickenMinX = chicken.position.x - chickenSize*zoom/2;
      const chickenMaxX = chicken.position.x + chickenSize*zoom/2;
      const vechicleLength = { car: 60, truck: 105}[lanes[currentLane].type]; 
      lanes[currentLane].vechicles.forEach(vechicle => {
        const carMinX = vechicle.position.x - vechicleLength*zoom/2;
        const carMaxX = vechicle.position.x + vechicleLength*zoom/2;
        if(chickenMaxX > carMinX && chickenMinX < carMaxX) {
          gameOver = true;
          endDOM.style.visibility = 'visible';
        }
      });
  
    }
    renderer.render( scene, camera );	
  }
  
  requestAnimationFrame( animate );