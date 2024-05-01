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
	const far = 5000;

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
		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 500;
		scene.add(light);
		scene.add(light.target);
	}

	// sun
	{
		const geometry = new THREE.SphereGeometry(100, 16, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
		const sun = new THREE.Mesh(geometry, material);
		sun.position.set(0, 0, 4000);
		scene.add(sun);
		// add cones
		var numCones = 316;

		// Add cones
		for (var i = 0; i < numCones; i++) {
			// Create cone geometry
			var coneGeometry = new THREE.ConeGeometry(10, 50, 8);
			var coneMaterial = new THREE.MeshBasicMaterial({ color: 0xFFBB00 });
			var cone = new THREE.Mesh(coneGeometry, coneMaterial);
			
			// Calculate position using spherical coordinates
			var phi = Math.acos(-1 + (2 * i) / numCones);
			var theta = Math.sqrt(numCones * Math.PI) * phi;
			
			// Convert spherical coordinates to Cartesian coordinates
			var x = Math.cos(theta) * Math.sin(phi) * (sun.geometry.parameters.radius + 1);
			var y = Math.sin(theta) * Math.sin(phi) * (sun.geometry.parameters.radius + 1);
			var z = Math.cos(phi) * (sun.geometry.parameters.radius + 1);
			
			// Position the cone
			cone.position.set(x, y, z+4000);

			// face sun
			cone.geometry.rotateX(-Math.PI / 2 );
			cone.lookAt(0, 0, 4000);
			
			// Add cone to the scene
			scene.add(cone);
		}
	}

	{
		// ambient light
		const color = 0xFFFFFF;
		const intensity = 0.01;
		const light = new THREE.AmbientLight(color, intensity);
		scene.add(light);
	}

	let moon2_light;
	{
		// spot light
		const color = 0x9977FF;
		const intensity = 300;
		const light = new THREE.SpotLight(color, intensity, 0, Math.PI/2, 1);
		light.position.set(-60, 0, 0);
		light.castShadow = true;
		scene.add(light);
		light.target.position.set(0, 0, 100);
		moon2_light = light;
	}

	let moon1_light;
	{
		// spot light
		const color = 0xFF6030;
		const intensity = 200;
		const light = new THREE.SpotLight(color, intensity, 0, Math.PI/2, 1);
		light.position.set(0, -30, 0);
		light.castShadow = true;
		scene.add(light);
		light.target.position.set(0, 0, 100);
		moon1_light = light;
	}

	let planet_light;
	{
		// spot light
		const color = 0x0060FF;
		const intensity = 300;
		const light = new THREE.SpotLight(color, intensity, 0, Math.PI/2, 1);
		light.position.set(15, 0, 0);
		light.castShadow = true;
		scene.add(light);
		light.target.position.set(0, 0, 100);
		planet_light = light;
	}

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
				root.castShadow = true;
				scene.add(root);
				planet = root;
			});
		});
	}

	let orbital_rings = [];

	// planet orbit ring
	{
		const geometry = new THREE.TorusGeometry(15, 0.1, 16, 128);
		const material = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
		const ring = new THREE.Mesh(geometry, material);
		ring.rotation.set(Math.PI/2, 0, 0);
		orbital_rings.push(ring);
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
				root.castShadow = true;
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
		orbital_rings.push(ring);
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
		orbital_rings.push(ring);
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
				root.castShadow = true;
				root.receiveShadow = true;
				ship_group.add(root);
				// ship = root;
			});
		});
	}

	// add ship to scene
	scene.add(ship_group);
	ship_group.rotation.set(0, 0, 0);

	let view = document.getElementById('view').value;

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
		let prev_view = view;
		let rotation_multiplier = document.getElementById('time-multiplier').value;
		view = document.getElementById('view').value;
		time *= 0.001;
		if (resizeRendererToDisplaySize(renderer)) {
			console.log('resize');
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		if (document.getElementById('rings').checked) {
			for (let ring of orbital_rings) {
				scene.add(ring);
			}
		} else {
			for (let ring of orbital_rings) {
				scene.remove(ring);
			}
		}
		// calculate planet position, rotates around 0,0,0. 1 minute to rotate around the sun.
		let radians_time = rotation_multiplier*time*Math.PI/1200;
		if (planet) {
			// revolve around 0,0,0 at an angle of 0.7 radians from the xz plane
			planet.position.x = Math.cos(radians_time) * 15;
			planet.position.z = Math.sin(radians_time) * 15;
			planet.rotation.y = -radians_time;
			// tidally lock camera to planet, rotate with planet
			if (planet_light) {
				planet_light.position.x = planet.position.x;
				planet_light.position.z = planet.position.z;
			}
		}
		if (moon1) {
			moon1.position.x = Math.sin(radians_time) * -30;
			moon1.position.y = Math.cos(radians_time) * -30;
			moon1.rotation.y = -radians_time;
			if (moon1_light) {
				moon1_light.position.x = moon1.position.x;
				moon1_light.position.y = moon1.position.y;
				moon1_light.position.z = 0;
			}
		}
		if (moon2) {
			moon2.position.x = Math.cos(radians_time) * -60;
			moon2.position.z = Math.sin(radians_time) * -60;
			moon2.rotation.y = -radians_time
			if (moon2_light) {
				moon2_light.position.x = moon2.position.x;
				moon2_light.position.z = moon2.position.z;
			}
		}
		if (moon2 && planet && moon1 && camera) {
			if (view === "planet") {
				camera.position.x = planet.position.x*0.31;
				camera.position.y = 0;
				camera.position.z = planet.position.z*0.31;

				let a = planet.position.x*0.001;
				let b = moon1.position.x;
				let c = planet.position.z*0.001;
				let t = (a*a + c*c - a*b)/(a*a + c*c);

				camera.lookAt(b + a*t, moon1.position.y, c*t);
				camera.up.set(-a, 0, -c);
			} else if (view === "ship") {
				if (prev_view === "planet") {
					camera.up.set(0, 1, 0);
				}
				camera.position.x = planet.position.x*1.75;
				camera.position.y = 0;
				camera.position.z = planet.position.z*1.75;
				camera.lookAt(planet.position.x-planet.position.z/2.2, 15, planet.position.z+planet.position.x/2.2);
				
				ship_group.position.x = planet.position.x*1.749;
				ship_group.position.y = 0.017;
				ship_group.position.z = planet.position.z*1.749;
				ship_group.rotation.x = camera.rotation.x;
				ship_group.rotation.y = camera.rotation.y;
				ship_group.rotation.z = camera.rotation.z;
			} else if (view === "system") {
				// camera.position.y += 1;
				if (prev_view !== "system") {
					camera.position.set(-60, 10, 60);
					camera.up.set(0, 1, 0);
					controls.target.set(0, 0, 0);
					controls.update();
				}
			}
		}
		
		
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

}

main();