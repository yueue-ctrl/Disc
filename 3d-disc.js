document.addEventListener('DOMContentLoaded', () => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('3d-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create the disc
        // Create a smoother, thinner disc shape
    const outerRadius = 2;
    const innerRadius = 0.2; // Made the inner circle smaller

    // High segments for a smooth circle
    const shape = new THREE.Shape().absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const holePath = new THREE.Path().absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
        steps: 1,
        depth: 0.05, // Make the disc thinner
        bevelEnabled: false,
        curveSegments: 128 // Increase segments for a rounder shape
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); // Center the geometry

    // Manual UV mapping to fit the texture to the disc face
    const uvs = geometry.attributes.uv;
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        // Map coordinates from [-outerRadius, outerRadius] to [0, 1]
        uvs.setXY(i, (x / (outerRadius * 2)) + 0.5, (y / (outerRadius * 2)) + 0.5);
    }
    uvs.needsUpdate = true;
            // Load the texture for the disc faces
    const textureLoader = new THREE.TextureLoader();
    const coverTexture = textureLoader.load('cover.png');
    coverTexture.wrapS = THREE.ClampToEdgeWrapping;
    coverTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Create an array of materials
    const materials = [
        new THREE.MeshPhongMaterial({ // Material for front and back faces
            map: coverTexture,
            transparent: true,
            opacity: 0.7, // Make it more visible but still transparent
            shininess: 150, // Increase shininess for better highlights
            side: THREE.DoubleSide
        }),
        new THREE.MeshPhongMaterial({ // Material for the edge
            color: 0xffffff,
            transparent: true,
            opacity: 0.7, // Match the face opacity
            shininess: 150
        })
    ];
    const disc = new THREE.Mesh(geometry, materials);
    scene.add(disc);

    // Add some light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);



    camera.position.z = 5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        disc.rotation.x += 0.005;
        disc.rotation.y += 0.005;

        renderer.render(scene, camera);
    }

    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
    });

    renderer.domElement.addEventListener('mouseup', (e) => {
        isDragging = false;
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
        };

        if (isDragging) {
            const deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                    toRadians(deltaMove.y * 1),
                    toRadians(deltaMove.x * 1),
                    0,
                    'XYZ'
                ));
            
            disc.quaternion.multiplyQuaternions(deltaRotationQuaternion, disc.quaternion);
        }
        
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    animate();
});
