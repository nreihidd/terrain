var canvas = <HTMLCanvasElement>document.querySelector("#game");
canvas.focus();


let noise = () => 1;

//=== Height formula
declare var getHeight;
function setTerrainFormula(s: string) {
    getHeight = eval("(function(x, y) { return " + s + "; })");
}
let terrainFormula = "Math.cos(x / 100) * Math.cos(y / 100) * 50 + Math.sin(x / 10) * Math.sin(y / 20) * 3 - Math.cos(x / 1000) * Math.cos(y / 1200) * 500";
setTerrainFormula(terrainFormula);

function trySetFormula(s: string) {
    try { 
        setTerrainFormula(s);
        terrainFormula = s;
        terrainLODs.forEach(lod => lod.dispose());
        initLODs();
    } catch (e) {
        alert("Invalid formula: " + e);
    }
}

{
let presets = `
Ye olde default
Math.cos(x / 4) / 2 + Math.sin(y / 2) * 2 + Math.cos((x + y) / 20) * 20
Ye olde default2
Math.cos(x / 4) / 4 * Math.sin(y / 2) * 2 + Math.cos((x + y) / 30) * 20 + Math.sin((x - y) / 20) * 5 + x / 10 + Math.cos(x / 3) * 3
Hill + plains:
(Math.cos(x / 4) / 4 * Math.sin(y / 2) * 2 + Math.cos((x + y) / 30) * 20 + Math.sin((x - y) / 20) * 5 + x / 10 + Math.cos(x / 3) * 3 + x * 0.05) / (1 + Math.abs(x) / 100)
Creepy valley:
(Math.cos(x / 4) / 4 * Math.sin(y / 2) * 2 + Math.cos((x + y) / 30) * 20 + Math.sin((x - y) / 20) * 5 + x / 10 + Math.cos(x / 3) * 3 + x * 0.05) * x / 50
Valley (parabola)
x * x / 500
Saddle
x * y / 500
holy bowly
x * x / 500 + y * y / 500
hilly
Math.cos(x / 100) * Math.cos(y / 100) * 50 + Math.sin(x / 10) * Math.sin(y / 20) * 3 - Math.cos(x / 1000) * Math.cos(y / 1200) * 500
A NEW LAP RECORD
x = x + Math.sin(y / 300) * 500, (Math.cos(x / 4) / 4 * Math.sin(y / 2) * 2 + Math.cos((x + y) / 30) * 20 + Math.sin((x - y) / 20) * 5 + Math.cos(x / 3) * 3 + x * 0.15) * x / 60
Plant hell
x = x + Math.sin(y / 100) * 200, y = y + Math.cos(x / 200) * 200, x * x / 400 + y * y / 400
Waves
x = x + Math.sin(y / 100) * 200, y = y + Math.cos(x / 200) * 200, Math.cos(x / 40) * Math.sin(y / 60) * 30
Deeeuuune
Math.sin((x + Math.cos(y / 51) * 15) / 4.2) * Math.sin((x + Math.cos(y / 37) * 17) / 5.5) * 1.1 - Math.cos(x / 603) * Math.cos(y / 717) * Math.sin((x + y) / 1000) * 300 + 1300
Children of Deeeuuune
x = x + Math.sin(y / 100) * 200, y = y + Math.cos(x / 200) * 200, Math.cos(x / 600) * Math.sin(y / 730) * (Math.cos(x / 5000) * Math.sin(y / 5000) + 1) * 200 + Math.pow(Math.sin((x + Math.cos(y / 51) * 15) / 2.8), 1) * 0.22 + 1500
Children of Noise
1000 * noise(x / 10000, y / 10000, 0) + 250 * noise(x / 500, y / 500, 1) * noise(x / 1000, y / 1000, 4) + noise(x / 10000, y / 10000, 2) * (x = x + Math.sin(y / 100) * 200, y = y + Math.cos(x / 200) * 200, Math.cos(x / 600) * Math.sin(y / 730) * (Math.cos(x / 5000) * Math.sin(y / 5000) + 1) * 200) + 1500 + Math.pow(Math.sin((x + Math.cos(y / 51) * 15) / 2.8), 1) * 0.22
Hmm
t = (1000 * noise(x / 10000, y / 10000, 0) + 250 * noise(x / 500, y / 500, 1) * noise(x / 1000, y / 1000, 4) + noise(x / 10000, y / 10000, 2) * (x = x + Math.sin(y / 100) * 200, y = y + Math.cos(x / 200) * 200, Math.cos(x / 600) * Math.sin(y / 730) * (Math.cos(x / 5000) * Math.sin(y / 5000) + 1) * 200)) * 5, (t > 1000 ? t : 1000 + (t - 1000) / 10) + 1500 + Math.pow(Math.sin((x + Math.cos(y / 51) * 15) / 2.8), 1) * 0.22
Roscoe's
Math.abs(Math.sin(x / 30) * Math.sin(y / 30)) * -15
Big
x = x + Math.sin(y / 100) * 200, y = y + Math.cos(x / 200) * 200, Math.cos(x / 600) * Math.sin(y / 730) * (Math.cos(x / 5000) * Math.sin(y / 5000) + 1) * 200 + Math.pow(Math.sin((x + Math.cos(y / 51) * 15) / 2.8), 1) * 0.22 + (x = x + Math.sin(y / 10000) * 5000, y = y + Math.cos(x / 13000) * 10000, Math.cos(x / 9000) * Math.sin(y / 11000) * 3000) + 1500
`;
    presets = presets.trim();
    let lines = presets.split("\n");
    while (lines.length > 0) {
        let label = lines.shift();
        let formula = lines.shift();
        let option = document.createElement("option");
        option.innerText = label;
        option.value = formula;
        (<any>document.querySelector("#formula-presets")).appendChild(option);
    }
}

function updateFromGUI() {
    let defines = {};
    let RADIUS_OF_EARTH = (<any>document.querySelector("#RADIUS_OF_EARTH")).value;
    try {
        defines["RADIUS_OF_EARTH"] = parseFloat(RADIUS_OF_EARTH).toExponential();
    } catch (e) {}
    if ((<any>document.querySelector("#XY_OFFSET")).checked) {
        defines["XY_OFFSET"] = true;
    }
    terrainMat = makeTerrainMaterial(defines);
    trySetFormula((<any>document.querySelector("#formula")).value);
}

(<any>document.querySelector("#formula-update")).onclick = evt => updateFromGUI();
(<any>document.querySelector("#formula-presets")).onchange = evt => (<any>document.querySelector("#formula")).value = (<any>document.querySelector("#formula-presets")).value;
document.exitPointerLock = document.exitPointerLock || document['mozExitPointerLock'] || document['webkitExitPointerLock'] || (() => {});
function showFormulaGUI() {
    document.exitPointerLock();
    let gui: any = document.querySelector("#formulaGUI");
    gui.style.display = "block";
    let textarea = <any>document.querySelector("#formula");
    textarea.value = terrainFormula;
    textarea.focus();
    textarea.selectionStart = textarea.value.length;
}
function hideFormulaGUI() {
    (<any>document.querySelector("#formulaGUI")).style.display = "none"
}

function promptFormula() {
    let s = prompt("Enter terrain formula", terrainFormula);
    if (s != null) {
        trySetFormula(s);
    }
}
canvas.addEventListener("keydown", evt => {
    if (evt.which === VK.G) {
        evt.preventDefault();
        showFormulaGUI();
    }
})
//=== End of height stuff

const TERRAIN_LOD_GRID_SIZE = 1 << 20;
var dbgNumTris = 0;

var scene = new THREE.Scene();
function calcFovY(fovXInDegrees, aspect) {
    let fovXInRadians = fovXInDegrees * Math.PI / 180;
    // https://www.opengl.org/discussion_boards/showthread.php/159471-Horizontal-Vertical-angle-conversion
    // Easily solved for
    let fovYInRadians = 2 * Math.atan(Math.tan(fovXInRadians / 2) / aspect);
    return fovYInRadians * 180 / Math.PI;
}
var camera = new THREE.PerspectiveCamera(calcFovY(90, window.innerWidth / window.innerHeight), window.innerWidth / window.innerHeight, 0.1, 1000000);
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
const SKY_COLOR = new THREE.Color(0.4, 0.6, 1.0);
renderer.setClearColor(SKY_COLOR);

function updateRendererSize() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    // Uncomment this line to use the full resolution of a phone screen instead of scaling the canvas
    // renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = calcFovY(90, camera.aspect);
    camera.updateProjectionMatrix();
}
updateRendererSize();

canvas.requestPointerLock = canvas.requestPointerLock || (<any>canvas).mozRequestPointerLock;
canvas.onclick = () => {
    hideFormulaGUI();
    canvas.requestPointerLock();
    canvas.focus();
};

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

let dbgWireframe = false;
function makeTerrainMaterial(defines: any) {
    return new THREE.ShaderMaterial({
        wireframe: dbgWireframe,
        uniforms: {
            lodTilePos: new THREE.Vector2(),
            lodSize: 0,
            lodEdges: new THREE.Vector4(),
        },
        defines,
        vertexShader: `
            uniform float lodSize;
            uniform vec2 lodTilePos;
            uniform vec4 lodEdges;
            attribute float lowerResTarget;
            attribute float lowerResTarget2;
            varying vec3 vNormal;
            varying float vDbgD;

            varying float vBoundary;
            varying float vHeight;

            varying float vDistance;

            float mix2(float x, float y, float z, float a) {
                if (a < 1.0) { return mix(x, y, a); }
                return mix(y, z, a - 1.0);
            }

            float edgeInterp(float right, float bottom, float left, float top, vec2 pos) {
                pos = pos - vec2(0.5);

                if (-pos.x >= abs(pos.y)) return left;
                if (pos.x >= abs(pos.y)) return right;
                if (-pos.y >= abs(pos.x)) return bottom;
                return top;
            }

            #ifndef RADIUS_OF_EARTH
            #define RADIUS_OF_EARTH 6.0e6
            #endif

            vec3 sphereBend(vec3 p, float radius) {
                float d = length(p.xy);
                
                float theta = d / radius;

                // Assuming small theta
                vec3 r = p - vec3(0.0, 0.0, radius * (theta * theta) / 2.0);

                #ifdef XY_OFFSET
                    r = r + normalize(vec3(p.xy, 0.0)) * theta * p.z;
                #endif

                return r;
            }

            void main() {
                vNormal = normal;

                float right = lodEdges.x;
                float bottom = lodEdges.y;
                float left = lodEdges.z;
                float top = lodEdges.w;

                vec2 posInTile = position.xy / lodSize - lodTilePos;
                float df = edgeInterp(right, bottom, left, top, posInTile);

                vDbgD = df;

                vec2 topright = 1.0 - posInTile;
                vBoundary = min(min(topright.x, topright.y), min(posInTile.x, posInTile.y)) < 0.1 ? 1.0 : 0.0;
                float z = mix2(position.z, lowerResTarget, lowerResTarget2, df);
                vHeight = z;

                vec3 vertexPosition = vec3( position.xy, z );
                vertexPosition = sphereBend(vertexPosition - vec3(cameraPosition.xy, 0.0), RADIUS_OF_EARTH) + vec3(cameraPosition.xy, 0.0);

                gl_Position =  projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);
                vDistance = length(gl_Position.xyz);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying float vDbgD;
            varying float vBoundary;
            varying float vHeight;
            varying float vDistance;

            #define ATMOSPHERE_HEIGHT 25000.0
            #define FOG_PER_METER 1e-5

            float fogWithHeight(float z0, float z1, float d) {
                z0 = max(z0, 0.0);
                z1 = max(z1, 0.0);
                if (z0 > ATMOSPHERE_HEIGHT && z1 > ATMOSPHERE_HEIGHT) {
                    return 0.0;
                }
                if (z0 > ATMOSPHERE_HEIGHT) {
                    d = d - d * (ATMOSPHERE_HEIGHT - z0) / (z1 - z0);
                    z0 = ATMOSPHERE_HEIGHT;
                }
                if (z1 > ATMOSPHERE_HEIGHT) {
                    d = d * (ATMOSPHERE_HEIGHT - z0) / (z1 - z0);
                    z1 = ATMOSPHERE_HEIGHT;
                }
                return (1.0 - (z0 + 0.5 * (z1 - z0)) / ATMOSPHERE_HEIGHT) * FOG_PER_METER * d;
            }

            void main() {
                vec3 light = vec3( 0.5, 0.2, 1.0 );
                light = normalize( light );
                float dProd = dot( normalize(vNormal), light ) * 0.5 + 0.5;
                vec3 ambient = vec3(0.4, 0.6, 1.0); // SKY_COLOR
                // max(dProd, 0.1)
                // gl_FragColor = vec4(clamp(vDbgD, 0.0, 1.0), max(dProd, 0.1) * 0.9 + vBoundary * 0.1, clamp(vDbgD, 1.0, 2.0) - 1.0, 1.0);
                vec3 lowColor = vec3(0.3, 1.0, 0.2);
                vec3 highColor = vec3(1.0, 0.7, 0.1);
                vec3 diffuseColor = mix(lowColor, highColor, clamp(vHeight / 1000.0, 0.0, 1.0));

                float fogFactor = clamp(fogWithHeight(cameraPosition.z, vHeight, vDistance), 0.0, 0.8); // smoothstep(1000.0, 80000.0, vDistance) * 0.8;
                gl_FragColor = vec4(mix(mix(diffuseColor * dProd, diffuseColor * ambient, 0.2), ambient, fogFactor), 1.0);
            }
        `
    });
}

// var terrainMat = new THREE.MeshPhongMaterial({ color: 0x33ff00, wireframe: true });
var terrainMat = makeTerrainMaterial({});

var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(0, 0, 1);
scene.add(dirLight);

camera.position.z = 5;
camera.up = new THREE.Vector3(0, 0, 1);
camera.position.y = -10;
camera.lookAt(new THREE.Vector3());

window.onresize = () => {
    updateRendererSize();
}

var VK = <any> "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").reduce((o, c) => {
    o[c] = o[c.toLowerCase()] = c.charCodeAt(0); 
    return o;
}, {});

var hFacing = Math.PI / 2;
var vFacing = 0;

let player = {
    position: new THREE.Vector3(0, 0, getHeight(0, 0)),
    velocity: new THREE.Vector3(0, 0, 0),
    gravity: new THREE.Vector3(0, 0, -0.01),
};

function tryJump() {
    let localHeight = getHeight(player.position.x, player.position.y);
    if (player.position.z <= localHeight + 0.05) {
        player.velocity.z += 0.25;
    }
}

canvas.addEventListener("actualkeydown", evt => {
    if (evt['which'] === " ".charCodeAt(0)) {
        tryJump();
    }
});

function tickPlayer(deltaTime: number) {
    let velocity = new THREE.Vector2(0, 0);
    velocity.x += touchVelocity;
    if (heldKeys.has(VK.W)) velocity.x += 1;
    if (heldKeys.has(VK.S)) velocity.x -= 1;
    if (heldKeys.has(VK.A)) velocity.y += 1;
    if (heldKeys.has(VK.D)) velocity.y -= 1;
    velocity = velocity.rotateAround(new THREE.Vector2(), hFacing).normalize().multiplyScalar(0.01);

    player.velocity.x += velocity.x * deltaTime;
    player.velocity.y += velocity.y * deltaTime;
    player.velocity.add(player.gravity.clone().multiplyScalar(deltaTime));

    player.position.add(player.velocity.clone().multiplyScalar(deltaTime));
    let localHeight = getHeight(player.position.x, player.position.y);
    if (player.position.z < localHeight) {
        let vx = new THREE.Vector3(0.01, 0, (getHeight(player.position.x + 0.01, player.position.y) - localHeight)).normalize();
        let vy = new THREE.Vector3(0, 0.01, (getHeight(player.position.x, player.position.y + 0.01) - localHeight)).normalize();
        let norm = vx.clone().cross(vy).normalize();
        player.position.z = localHeight;
        let bounceFactor = heldKeys.has(0x20) ? 2 : 1;
        player.velocity.sub(norm.clone().multiplyScalar(player.velocity.dot(norm) * bounceFactor));
        player.velocity.sub(player.velocity.clone().multiplyScalar(0.02 * deltaTime));
        // player.velocity.multiplyScalar(0.98); // Ground Friction
    } else {
        player.velocity.sub(player.velocity.clone().multiplyScalar(0.001 * deltaTime));
        // player.velocity.multiplyScalar(0.999); // Air Drag
    }
}

let nodesToRender: LODTerrain[] = [];
let ttlFree = 0;
let dbgNumFreed = 0;
let lastFrameTime = window.performance.now();
function tick() {
    let now = window.performance.now();
    let deltaTime = Math.min(now - lastFrameTime, 50) * 60 / 1000;
    lastFrameTime = now;
    tickPlayer(deltaTime);
    camera.position.copy(player.position);
    camera.position.z += 1.8;
    cube.rotation.z += 0.01;
    renderedCells.clear();
    terrainLODs.forEach(lod => lod.render(player.position, nodesToRender));
    nodesToRender.forEach(node => {
        node.mesh.visible = true;
        node.setupUniforms();
    });
    renderer.setClearColor(SKY_COLOR.clone().lerp(new THREE.Color(0, 0, 0), camera.position.z / 100000));
    renderer.render(scene, camera);
    // console.log("rendering " + nodesToRender.length + " meshes");
    while (nodesToRender.length > 0) {
        nodesToRender.pop().mesh.visible = false;
    }

    let px = player.position.x / TERRAIN_LOD_GRID_SIZE - 0.5;
    let py = player.position.y / TERRAIN_LOD_GRID_SIZE - 0.5;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let tx = Math.floor(px) + i;
            let ty = Math.floor(py) + j;
            if (Math.abs(tx - px) < 1.0 && Math.abs(ty - py) < 1.0) {
                if (!terrainLODs.some(lod => lod.tilePos[0] === tx && lod.tilePos[1] === ty)) {
                    terrainLODs.push(new LODTerrain(tx, ty, TERRAIN_LOD_GRID_SIZE));
                }
            }
        }
    }

    if (ttlFree-- <= 0) {
        dbgNumFreed = 0;
        terrainLODs.forEach(lod => lod.freeUnused(player.position));
        terrainLODs = terrainLODs.filter(lod => {
            let [x, y] = lod.tilePos;
            if (Math.abs(x - px) > 1.25 || Math.abs(y - py) > 1.25) {
                lod.dispose();
                return false;
            } 
            return true;
        })
        // console.log("Freed " + dbgNumFreed + " nodes");
        ttlFree = 300;
    }
    window.requestAnimationFrame(tick);
}

// declare var Map;
// declare var Set;

function rotateView(angleH, angleV) {
    hFacing += angleH;
    vFacing += angleV;
    vFacing = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, vFacing));

    camera.rotation.set(0, 0, 0);
    camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), hFacing - Math.PI / 2);
    camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), vFacing);
}

let touchDetected = false;

function addTouchGUI() {
    (<any>document.querySelector("#touchGUI")).style.display = "block";
    (<any>document.querySelector("#formula-button")).onclick = () => {
        showFormulaGUI();
    };
}

let touchX = null;
let touchY = null;
let touchVelocity = 0;
let touchMovementId = null;
canvas.addEventListener("touchstart", (evt: any) => {
    evt.preventDefault();
    hideFormulaGUI();
    for (let i = 0; i < evt.changedTouches.length; i++) {
        let touch = evt.changedTouches.item(i);
        if (touchMovementId == null) {
            touchMovementId = touch.identifier;
            touchX = touch.screenX;
            touchY = touch.screenY;
            touchVelocity = 1;
        } else {
            tryJump();
        }
    }
});
let touchendHandler = (evt: any) => {
    evt.preventDefault();
    for (let i = 0; i < evt.changedTouches.length; i++) {
        let touch = evt.changedTouches.item(i);
        if (touch.identifier === touchMovementId) {
            touchX = null;
            touchY = null;
            touchVelocity = 0;
            touchMovementId = null;
        }
    }
};
canvas.addEventListener("touchend", touchendHandler);
canvas.addEventListener("touchcancel", touchendHandler);
canvas.addEventListener("touchmove", (evt: any) => {
    evt.preventDefault();
    if (!touchDetected) {
        addTouchGUI();
        touchDetected = true;
    }
    for (let i = 0; i < evt.changedTouches.length; i++) {
        let touch = evt.changedTouches.item(i);
        if (touch.identifier === touchMovementId) {
            if (touchX != null && touchY != null) {
                let dx = touch.screenX - touchX;
                let dy = touch.screenY - touchY;
                rotateView(-dx / 250, -dy / 250);
            }
            touchX = touch.screenX;
            touchY = touch.screenY;
        }
    }
});

canvas.onmousemove = evt => {
    if (document.activeElement === canvas) {
        rotateView(-evt.movementX / 500, -evt.movementY / 500);
    }
}

var heldKeys = new Set();
canvas.addEventListener("keydown", evt => {
    if (!heldKeys.has(evt.which)) {
        heldKeys.add(evt.which);
        var e = new Event('actualkeydown');
        e['which'] = evt.which;
        canvas.dispatchEvent(e);
    }
});
canvas.addEventListener("keyup", evt => {
    if (heldKeys.delete(evt.which)) {
        var e = new Event('actualkeyup');
        e['which'] = evt.which;
        canvas.dispatchEvent(e);
    }
});

window.requestAnimationFrame(tick);

//========= Height

let renderedCells = new Set<string>(); // Cells stored as strings in the format x,y:size
function cellKey(x,y,size) { return x + "," + y + ":" + size; }

class LODTerrain {

    // It is entirely coincidental that both these values happen to be 32 at the moment, both may be changed freely for quality/performance
    // For a long time these were 16, 16.  The resolution determines how much work is needed to generate a cell, so if you're okay with farther
    // cells looking worse, you can adjust both MIN_SIZE and RESOLUTION by the same factor to keep the closest cells the same density (eg 1 quad per m^2)
    // while changing the quality of distant cells.

    /// Can be anything > 0, this is the size that under which a cell may have no children
    /// Lowering this raises the quality of the nearest meshes at the expense of generating far more of them.
    static MIN_SIZE = 32;
    /// This is the resolution of each cell's mesh, must be a multiple of 4 to correctly map down to lower resolutions
    /// Raising this raises the quality of all meshes, but makes generating them more costly
    static RESOLUTION = 32;

    mesh: THREE.Mesh;
    children: LODTerrain[];
    tilePos: [number, number];
    size: number;
    constructor(x: number, y: number, size: number) {
        this.tilePos = [x, y];
        this.size = size;
    }
    makeChildren() {
        if (this.size <= LODTerrain.MIN_SIZE) return false;
        if (this.children == null) {
            this.children = [];
            let childSize = this.size / 2;
            let addChild = (x, y) => {
                this.children.push(new LODTerrain(x, y, childSize));
            };
            let [x, y] = [this.tilePos[0] * 2, this.tilePos[1] * 2];
            addChild(x, y);
            addChild(x + 1, y);
            addChild(x + 1, y + 1);
            addChild(x, y + 1);
            return true;
        }
        return true;
    }
    makeMesh() {
        if (this.mesh != null) return;
        let resolution = LODTerrain.RESOLUTION;
        let terrainGeo = makeTerrainGeometry(this.tilePos[0] * this.size, this.tilePos[1] * this.size, this.size, this.size, resolution, resolution);
        let terrainLocalMat = terrainMat.clone();
        terrainLocalMat.uniforms.lodSize.value = this.size;
        terrainLocalMat.uniforms.lodTilePos.value = new THREE.Vector2(this.tilePos[0], this.tilePos[1]);
        this.mesh = new THREE.Mesh(terrainGeo, terrainLocalMat);
        this.mesh.visible = false;
        scene.add(this.mesh);
    }
    shouldRender(focus: THREE.Vector3) {
        return Math.abs(this.tilePos[0] - Math.floor(focus.x / this.size)) <= 1 &&
               Math.abs(this.tilePos[1] - Math.floor(focus.y / this.size)) <= 1;
    }
    render(focus: THREE.Vector3, toRender: LODTerrain[]) {
        let shouldRenderSelf = true;
        if (this.makeChildren()) {
            shouldRenderSelf = !this.children.some(child => child.shouldRender(focus));
            if (!shouldRenderSelf) {
                for (var i = 0; i < this.children.length; i++) { this.children[i].render(focus, toRender); }
            }
        }
        if (shouldRenderSelf) {
            this.makeMesh();
            renderedCells.add(cellKey(this.tilePos[0], this.tilePos[1], this.size));
            toRender.push(this);
        }
    }
    setupUniforms() {
        // Need to find the resolution of each neighbor
        let getRelativeResolution = (x, y) => {
            if (renderedCells.has(cellKey(Math.floor(x / 4), Math.floor(y / 4), this.size * 4))) return 2;
            if (renderedCells.has(cellKey(Math.floor(x / 2), Math.floor(y / 2), this.size * 2))) return 1;
            return 0;
        }
        // Store them in the vector4 as [right, bottom, left, top]
        (<THREE.ShaderMaterial>this.mesh.material).uniforms.lodEdges.value = new THREE.Vector4(
            getRelativeResolution(this.tilePos[0] + 1, this.tilePos[1]),
            getRelativeResolution(this.tilePos[0], this.tilePos[1] - 1),
            getRelativeResolution(this.tilePos[0] - 1, this.tilePos[1]),
            getRelativeResolution(this.tilePos[0], this.tilePos[1] + 1)
        );
    }
    shouldFree(focus: THREE.Vector3) {
        return Math.abs(this.tilePos[0] - Math.floor(focus.x / this.size)) > 5 ||
               Math.abs(this.tilePos[1] - Math.floor(focus.y / this.size)) > 5;
    }
    freeUnused(focus: THREE.Vector3) {
        if (this.children != null) {
            this.children.forEach(child => child.freeUnused(focus));
        }
        if (this.shouldFree(focus)) {
            delete this.children;
            if (this.mesh != null) {
                scene.remove(this.mesh);
                this.mesh.geometry.dispose();
                delete this.mesh;
                dbgNumFreed += 1;
            }
        }
    }
    dispose() {
        if (this.children != null) {
            this.children.forEach(child => child.dispose());
        }
        if (this.mesh != null) {
            scene.remove(this.mesh);
            this.mesh.geometry.dispose();
        }
    }
}

function mix(x, y, a) {
    return x + (y - x) * a;
}
function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}
class Patch {
    samples: Float32Array;
    constructor(private x: number, private y: number, private w: number, private h: number, private xRes: number, private yRes: number) {
        
    }
    static fromSource(x: number, y: number, w: number, h: number, xRes: number, yRes: number) {
        let patch = new Patch(x, y, w, h, xRes, yRes);
        patch.samples = new Float32Array((xRes + 1) * (yRes + 1));
        let index = 0;
        let xScale = w / xRes;
        let yScale = h / yRes;
        for (let j = 0; j <= yRes; j++) {
            for (let i = 0; i <= xRes; i++) {
                let xSample = x + i * xScale;
                let ySample = y + j * yScale;
                patch.samples[index++] = getHeight(xSample, ySample);
            }
        }
        return patch;
    }
    public lower() {
        let patch = new Patch(this.x, this.y, this.w, this.h, this.xRes / 2, this.yRes / 2);
        patch.samples = new Float32Array((patch.xRes + 1) * (patch.yRes + 1));
        let index = 0;
        for (let j = 0; j <= this.yRes; j += 2) {
            for (let i = 0; i <= this.xRes; i += 2) {
                patch.samples[index++] = this.get(i, j);
            }
        }
        return patch;
    }
    public get(x: number, y: number) {
        return this.samples[y * (this.xRes + 1) + x];
    }
    public sample(x: number, y: number) {
        let fx = (x - this.x) / this.w * this.xRes;
        let fy = (y - this.y) / this.h * this.yRes;
        let ix = Math.floor(fx);
        let iy = Math.floor(fy);
        let tx = fx - ix;
        let ty = fy - iy;

        let stride = this.xRes + 1;
        let ixp1 = Math.min(ix + 1, this.xRes);
        let iyp1 = Math.min(iy + 1, this.yRes);

        let bl = this.samples[iy * stride + ix];
        let br = this.samples[iy * stride + ixp1];
        let tl = this.samples[iyp1 * stride + ix];
        let tr = this.samples[iyp1 * stride + ixp1];

        let b = mix(bl, br, tx);
        let t = mix(tl, tr, tx);
        return mix(b, t, ty);
    }
}

function makeTerrainGeometry(startX: number, startY: number, w: number, h: number, xRes: number, yRes: number) {
    let geo = new THREE.BufferGeometry();

    let numVertices = (xRes + 1) * (yRes + 1);

    let position = new Float32Array(numVertices * 3);
    let positionIndex = 0;
    let patch = Patch.fromSource(startX, startY, w, h, xRes, yRes);
    let patchL1 = patch.lower();
    let patchL2 = patchL1.lower();
    let normals = new Float32Array(numVertices * 3);
    let normalIndex = 0;
    
    let lowerResTarget = new Float32Array(numVertices);
    let lowerResTarget2 = new Float32Array(numVertices);
    let lrtIndex = 0;

    for (let j = 0; j <= yRes; j++) {
        for (let i = 0; i <= xRes; i++) {
            let x = startX + i / xRes * w;
            let y = startY + j / yRes * h;
            let z = patch.get(i, j);

            // Compute normal
            let dzdx;
            {
                let dx = w / xRes;
                let leftz = i === 0 ? getHeight(x - dx, y) : patch.get(i - 1, j);
                let rightz = i === xRes ? getHeight(x + dx, y) : patch.get(i + 1, j);
                dzdx = (rightz - leftz) / (dx * 2);
            }
            let dzdy;
            {
                let dy = h / yRes;
                let bottomz = j === 0 ? getHeight(x, y - dy) : patch.get(i, j - 1);
                let topz = j === yRes ? getHeight(x, y + dy) : patch.get(i, j + 1);
                dzdy = (topz - bottomz) / (dy * 2);
            }
            let normal = new THREE.Vector3(1.0, 0.0, dzdx).cross(new THREE.Vector3(0.0, 1.0, dzdy)).normalize();
            normals[normalIndex++] = normal.x;
            normals[normalIndex++] = normal.y;
            normals[normalIndex++] = normal.z;

            // let z = patch.sample(x, y);
            position[positionIndex++] = x;
            position[positionIndex++] = y;
            position[positionIndex++] = z;
            lowerResTarget2[lrtIndex] = patchL2.sample(x, y);
            lowerResTarget[lrtIndex++] = patchL1.sample(x, y);
        }
    }

    let indices = new Uint16Array(xRes * yRes * 6);
    let indicesIndex = 0;
    for (let i = 0; i < xRes; i++) {
        for (let j = 0; j < yRes; j++) {
            let bl = j * (xRes + 1) + i;
            let br = bl + 1;
            let tl = (j + 1) * (xRes + 1) + i;
            let tr = tl + 1;
            indices[indicesIndex++] = bl;
            indices[indicesIndex++] = br;
            indices[indicesIndex++] = tr;
            indices[indicesIndex++] = bl;
            indices[indicesIndex++] = tr;
            indices[indicesIndex++] = tl;
            dbgNumTris += 2;
        }
    }

    // geo.computeFaceNormals();
    // geo.computeVertexNormals();
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.addAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geo.addAttribute("lowerResTarget", new THREE.BufferAttribute(lowerResTarget, 1));
    geo.addAttribute("lowerResTarget2", new THREE.BufferAttribute(lowerResTarget2, 1));
    geo.computeBoundingSphere();
    // geo.computeVertexNormals();

    // let bufferGeo = new THREE.BufferGeometry();;
    // bufferGeo.fromGeometry(geo);
    // geo.dispose();

    return geo;
}

function initLODs() {
    terrainLODs = [[-1, -1], [-1, 0], [0, -1], [0, 0]].map(([x, y]) => new LODTerrain(x, y, TERRAIN_LOD_GRID_SIZE));
}
let terrainLODs: LODTerrain[];
initLODs();
