import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

function main() {
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
		alpha: true,
	});

	const fov = 60;
	const aspect = 2; // the canvas default
	const near = 0.015;
	const far = 500;

	let planet_lock = false;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(-60, 10, 60);

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 0, 0);
	controls.update();

	const scene = new THREE.Scene();

	{
		// load skybox texture from 1 image
		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			'../resources/milkyway.png', () => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			texture.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture;
		});
	}

	{
		// directional light
		const color = 0xFFFFFF;
		const intensity = 5;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(0, 0, 100);
		scene.add(light);
		scene.add(light.target);
	}

	{
		// ambient light
		const color = 0xFFFFFF;
		const intensity = 0.02;
		const light = new THREE.AmbientLight(color, intensity);
		scene.add(light);
	}

	// {
	// 	// point light
	// 	const color = 0xFFFFFF;
	// 	const intensity = 50000;
	// 	const light = new THREE.PointLight(color, intensity);
	// 	light.position.set(0, 0, 100);
	// 	scene.add(light);
	// }

	let planet;
	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load('../resources/4546B/4546B.mtl', (mtl) => {
			mtl.preload();
			let objLoader = new OBJLoader();
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/4546B/4546B.obj', (root) => {
				root.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// Create a basic material with the existing texture
						const basicMaterial = new THREE.MeshPhongMaterial({ map: child.material.map });
						child.material = basicMaterial;
					}
				});
				// add root to planet object
				root.position.set(15, 0, 0);
				root.scale.set(10, 10, 10);
				scene.add(root);
				planet = root;
			});
		});
	}

	// planet orbit ring
	{
		const geometry = new THREE.TorusGeometry(15, 0.1, 16, 128);
		const material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
		const ring = new THREE.Mesh(geometry, material);
		ring.rotation.set(Math.PI/2, 0, 0);
		scene.add(ring);
	}

	let moon1;
	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load('../resources/4546BI/4546BI.mtl', (mtl) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/4546BI/4546BI.obj', (root) => {
				root.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// Create a basic material with the existing texture
						const basicMaterial = new THREE.MeshPhongMaterial({ map: child.material.map });
						child.material = basicMaterial;
					}
				});
				root.position.set(0, -30, 0);
				root.scale.set(8, 8, 8);
				scene.add(root);
				moon1 = root;
			});
		});
	}

	// moon1 orbit ring
	{
		const geometry = new THREE.TorusGeometry(30, 0.1, 16, 128);
		const material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
		const ring = new THREE.Mesh(geometry, material);
		ring.rotation.set(0, 0, 0);
		scene.add(ring);
	}

	let moon2;
	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load('../resources/4546BII/4546BII.mtl', (mtl) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/4546BII/4546BII.obj', (root) => {
				root.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// Create a basic material with the existing texture
						const basicMaterial = new THREE.MeshPhongMaterial({ map: child.material.map });
						child.material = basicMaterial;
					}
				});
				root.position.set(-60, 0, 0);
				root.scale.set(5, 5, 5);
				scene.add(root);
				moon2 = root;
			});
		});
	}

	// moon2 orbit ring
	{
		const geometry = new THREE.TorusGeometry(60, 0.05, 16, 128);
		const material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
		const ring = new THREE.Mesh(geometry, material);
		ring.rotation.set(Math.PI/2, 0, 0);
		scene.add(ring);
	}

	// let ship;
	let ship_group = new THREE.Group();
	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load('../resources/ship/ship.mtl', (mtl) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials(mtl);
			objLoader.load('../resources/ship/ship.obj', (root) => {
				root.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						// Create a basic material with the existing texture
						const basicMaterial = new THREE.MeshPhongMaterial({ map: child.material.map });
						child.material = basicMaterial;
					}
				});
				root.position.set(0, 0, 0);
				root.scale.set(0.0009, 0.0009, 0.0009);
				root.rotation.set(1.0, 1.3,  -0.7);
				ship_group.add(root);
				// ship = root;
			});
		});
	}

	// add ship to scene
	scene.add(ship_group);
	ship_group.rotation.set(0, 0, 0);

	planet_lock = document.getElementById('lock').checked;

	function resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	function render(time) {
		let prev_lock = planet_lock;
		let rotation_multiplier = document.getElementById('time-multiplier').value;
		planet_lock = document.getElementById('lock').checked;
		time *= 0.001;
		if (resizeRendererToDisplaySize(renderer)) {
			console.log('resize');
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}
		// calculate planet position, rotates around 0,0,0. 1 minute to rotate around the sun.
		let radians_time = rotation_multiplier*time*Math.PI/1200;
		if (planet) {
			// revolve around 0,0,0 at an angle of 0.7 radians from the xz plane
			planet.position.x = Math.cos(radians_time) * 15;
			planet.position.z = Math.sin(radians_time) * 15;
			planet.rotation.y = -radians_time;
			// tidally lock camera to planet, rotate with planet
		}
		if (moon1) {
			moon1.position.x = Math.sin(radians_time) * -30;
			moon1.position.y = Math.cos(radians_time) * -30;
			moon1.rotation.y = -radians_time;
		}
		if (moon2) {
			moon2.position.x = Math.cos(radians_time) * -60;
			moon2.position.z = Math.sin(radians_time) * -60;
			moon2.rotation.y = -radians_time
		}
		if (planet_lock && planet) {
			camera.position.x = planet.position.x*1.75;
			camera.position.y = 0;
			camera.position.z = planet.position.z*1.75;
			// define planet edge position
			camera.lookAt(planet.position.x-planet.position.z/2.2, 15, planet.position.z+planet.position.x/2.2);
		} else if (prev_lock) {
			camera.position.set(-60, 10, 60);
			controls.target.set(0, 0, 0);
			controls.update();
			ship_group.position.set(0, 0, 0);
			ship_group.rotation.set(0, 0, 0);
			prev_lock = false;
		}
		if (planet_lock && ship_group && planet && camera) {
			ship_group.position.x = planet.position.x*1.749;
			ship_group.position.y = 0.017;
			ship_group.position.z = planet.position.z*1.749;
			ship_group.rotation.x = camera.rotation.x;
			ship_group.rotation.y = camera.rotation.y;
			ship_group.rotation.z = camera.rotation.z;
			// console.log(camera.position.x-ship.position.x, camera.position.y-ship.position.y, camera.position.z-ship.position.z);
		}
		
		
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

}

main();