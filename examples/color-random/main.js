import {
    Color,
    Matrix4,
    MeshBasicMaterial
} from 'three';
import { Fragment } from "../../library/dist/fragment";
import { ThreeScene } from '../utils/scene';
import { Models } from '../utils/models';

const threeScene = new ThreeScene();
const models = new Models();
loadModels();

let fragments;

async function loadModels() {

    // Export
    const selectBtn = document.getElementById('select-random');
    selectBtn.onclick = () => selectRandom();

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

function selectRandom(){

    // Set fragment
    const wallsFragment = fragments[0];
    const chairsFragment = fragments[1];
    const fragment = chairsFragment;  // Only works with chairs for some reason!

    // Get random item
    const shuffled = fragment.items.sort(() => 0.5 - Math.random());
    const itemIds = shuffled.slice(0, 5);

    const randomColor = new Color("#" + ((1<<24)*Math.random() | 0).toString(16));

    colorItems(fragment, itemIds, randomColor);

}

function colorItems(fragment, itemIds, color){

    const colorMaterial = new MeshBasicMaterial({color: color, depthTest: false});

    if(fragment.fragments['coloring'] != undefined){
        fragment.fragments['coloring'].mesh.removeFromParent();
        fragment.removeFragment("coloring");
    }

    fragment.addFragment('coloring', [colorMaterial]);

    const selection = fragment.fragments['coloring'];
    threeScene.scene.add(selection.mesh);

    // Get instanceAndBlockId
    const instanceAndBlockIds = itemIds.map(itemId => fragment.getInstanceAndBlockID(itemId));
    const blockIds = instanceAndBlockIds.map(item => item.blockID);
    const instanceIds = instanceAndBlockIds.map(item => item.instanceID);

    // Select instances
    itemIds.forEach((itemId, i) => {
        const tempMatrix = new Matrix4();
        fragment.getInstance(itemId, tempMatrix);
        selection.setInstance(instanceIds[i], {transform: tempMatrix});
        selection.mesh.instanceMatrix.needsUpdate = true;
    })

    // Add blockID (and reset previous)
    selection.blocks.add(blockIds, true);

}