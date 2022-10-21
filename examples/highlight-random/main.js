import {
    Raycaster,
    Vector2,
    Matrix4,
    MeshBasicMaterial, MeshLambertMaterial
} from 'three';
import { Fragment } from "../../library/dist/fragment";
import { ThreeScene } from '../utils/scene';
import { Models } from '../utils/models';

const threeScene = new ThreeScene();
const models = new Models();
let previousSelection;
loadModels();

let fragments;

async function loadModels() {

    // Export
    const selectBtn = document.getElementById('select-random');
    selectBtn.onclick = async () => selectRandom();

    const items = {};

    // Create walls fragment
    const wallsData = await models.getWalls();
    const walls = new Fragment(wallsData.geometry, wallsData.material, 1);
    const transform = new Matrix4();
    transform.setPosition(-1, 0, 2);
    walls.setInstance(0, {ids: [1, 2, 3, 4], transform })
    items[walls.id] = walls;

    // Create chairs fragment
    const chairData = await models.getChair();
    const chairs = new Fragment(chairData.geometry, chairData.material, 1000);
    models.generateInstances(chairs, 1000, 0.5);
    items[chairs.id] = chairs;

    fragments = Object.values(items);

    // Add fragments to scene
    const meshes = fragments.map(item => item.mesh);
    threeScene.scene.add(...meshes);

    // Set up selection
    const selectionMaterial = new MeshBasicMaterial({color: 0xff0000, depthTest: false});
    for(const fragment of fragments) {
        fragment.addFragment('selection', [selectionMaterial]);
    }
    
}

async function selectRandom(){

    // Reset previous selection (if any)
    if(previousSelection) previousSelection.mesh.removeFromParent();

    // Get random fragment
    const fragment = fragments[Math.floor(Math.random()*fragments.length)];

    // Get random item
    const itemId = fragment.items[Math.floor(Math.random()*fragment.items.length)];

    previousSelection = fragment.fragments['selection'];
    threeScene.scene.add(previousSelection.mesh);

    // Get instanceAndBlockId
    const instanceAndBlockId = fragment.getInstanceAndBlockID(itemId);

    // Add blockID (and reset previous)
    previousSelection.blocks.add([instanceAndBlockId.blockID], true);

}