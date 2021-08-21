import { GUI } from "../node_modules/three/examples/jsm/libs/dat.gui.module.js";
jQuery(document).ready(function($) {
    // Code using $ as usual goes here.
    console.log(THREE);
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

    var renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xDDDDDD, 1);
    document.body.appendChild(renderer.domElement);

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,1,5000);
    camera.position.z = 100;
    scene.add(camera);

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.addEventListener('change', renderer);

    //CUSTOM MESH
    const loader = new THREE.GLTFLoader();
    let customModel,pivot;//accessoutside
    loader.load( './model/scene.gltf', function ( gltf ) {
        const root = gltf.scene;
        root.traverse((node) => {
            if (!node.isMesh) return;
            // node.material.wireframe = true;
        });
        scene.add(root);
        /////////console.log(dumpObject(root).join('\n'));
        customModel = root.getObjectByName('');
        customModel.rotation.set(0.2, 0.9, 0);
        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);
        box.getCenter(root.position);
        root.position.multiplyScalar( - 1 );
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = {x:0,y:0,z:0};//box.getCenter(new THREE.Vector3())
        console.log(boxSize,boxCenter);
        pivot = new THREE.Group();
        scene.add( pivot );
        pivot.add( root );
        // set the camera to frame the box
        frameArea(boxSize * 2, boxSize, boxCenter, camera);

        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 3;
        /// console.log(controls.target)
        /// controls.target.copy(boxCenter);
        /// controls.update();
    }, undefined, function ( error ) {
        console.error( error );
    } );


    const loaderTex = new THREE.CubeTextureLoader();
    loaderTex.setPath( './Yoko_hdri/' );
    let textureCube = loaderTex.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
    textureCube.encoding = THREE.sRGBEncoding;

    const textureLoader = new THREE.TextureLoader();

    let textureEquirec = textureLoader.load( './Yoko_hdri/2294472375_24a3b8ef46_o.jpg' );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.encoding = THREE.sRGBEncoding;
    scene.background = textureCube;

    //LIGHT CREATION
    var hlight = new THREE.AmbientLight (0x404040,5);
    scene.add(hlight);

    //**********************************************************NEW LIGHT
    class ColorGUIHelper {
        constructor(object, prop) {
            this.object = object;
            this.prop = prop;
        }
        get value() {
            return `#${this.object[this.prop].getHexString()}`;
        }
        set value(hexString) {
            this.object[this.prop].set(hexString);
        }
    }

    function makeXYZGUI(folder,gui, vector3, name, onChangeFn) {
        const sub_folder = folder.addFolder(name);
        sub_folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
        sub_folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
        sub_folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
        // folder.open();
    }


    const light1_Color = 0xFFFFFF;
    const light1_Intensity = 1;
    const light1 = new THREE.PointLight(light1_Color, light1_Intensity);
    light1.position.set(-10, 12, 0);

    const light2_Color = 0xFAFADA;
    const light2_Intensity = 2;
    const light2 = new THREE.PointLight(light2_Color, light2_Intensity);
    light2.position.set(10, -12, 0);

    scene.add(light1,light2);

    const helper = new THREE.PointLightHelper(light1);
    const helper2 = new THREE.PointLightHelper(light2);
    scene.add(helper,helper2);

    const gui = new GUI();
    const folder1 = gui.addFolder('Light1');
    folder1.addColor(new ColorGUIHelper(light1, 'color'), 'value').name('Color');
    folder1.add(light1, 'intensity', 0, 2, 0.01);


    const folder2 = gui.addFolder('Light2');
    folder2.addColor(new ColorGUIHelper(light2, 'color'), 'value').name('Color');
    folder2.add(light2, 'intensity', 0, 2, 0.01);
    // gui.add(light, 'distance', 0, 40).onChange(updateLight);

    makeXYZGUI(folder1,gui, light1.position, 'Position');
    makeXYZGUI(folder2,gui, light2.position, 'Position');



    //Default Start Background
    scene.background = new THREE.Color( 0xffc725 );
    const params = {
        //Choice one (Cubed Texture)
        Cube: function () {
            scene.background = textureCube;

            sphereMaterial.envMap = textureCube;
            sphereMaterial.needsUpdate = true;
        },
        //Choice one (Equirectangular Texture)
        Equirectangular: function () {
            scene.background = textureEquirec;

            sphereMaterial.envMap = textureEquirec;
            sphereMaterial.needsUpdate = true;
        },
        //Choice one (Sold Color)
        Solid: function () {
            scene.background = new THREE.Color( 0xffc725 );

            sphereMaterial.envMap = new THREE.Color( 0xffc725 );
            sphereMaterial.needsUpdate = true;
        }
    };

    //Create Simple GUI
    const backgroundFolder = gui.addFolder('Background')
    backgroundFolder.add( params,'Cube');
    backgroundFolder.add( params,'Equirectangular');
    backgroundFolder.add( params,'Solid');
    var controls = new function() {
        this.Rotation_Speed = 0.01;
    }
    gui.add(controls, 'Rotation_Speed', 0, 0.1);
    gui.open();




    window.addEventListener( 'resize', onWindowResize );
    var t = 0;
    function render(time) {
        requestAnimationFrame(render);
        time *= 0.001;  // convert to seconds
        if (customModel) {
            pivot.rotation.y += controls.Rotation_Speed;
            // for (const customObject of customModel.children) {
                // customObject.rotation.x = time;
            // }
        }
        // light.position.x=controls.Light1_Position;
        // light.Color=controls.Light1_Color;
        // light2.position.x=controls.Light2_Position;
        // light2.Color=controls.Light2_Color;
        renderer.render(scene, camera);
    }
    render();

    function updateLight() {
        helper.update();
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
            const isLast = ndx === lastNdx;
            dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
    }
    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();

        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }
});