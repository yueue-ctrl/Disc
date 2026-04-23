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
    let previousPointerPosition = { x: 0, y: 0 };

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    function handlePointerDown(x, y) {
        isDragging = true;
        previousPointerPosition = { x, y };
    }

    function handlePointerUp() {
        isDragging = false;
    }

    function handlePointerMove(x, y) {
        if (!isDragging) return;

        const deltaMove = {
            x: x - previousPointerPosition.x,
            y: y - previousPointerPosition.y
        };

        // Apply rotation based on pointer movement
        const deltaRotationX = toRadians(deltaMove.y * 0.5); // y-movement rotates around x-axis
        const deltaRotationY = toRadians(deltaMove.x * 0.5); // x-movement rotates around y-axis

        disc.rotation.x += deltaRotationX;
        disc.rotation.y += deltaRotationY;
        
        previousPointerPosition = { x, y };
    }

    // Mouse Events
    renderer.domElement.addEventListener('mousedown', (e) => handlePointerDown(e.clientX, e.clientY));
    renderer.domElement.addEventListener('mouseup', handlePointerUp);
    renderer.domElement.addEventListener('mouseleave', handlePointerUp);
    renderer.domElement.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));

    // Touch Events
    renderer.domElement.addEventListener('touchstart', (e) => {
        // Prevent mouse events from firing
        e.preventDefault();
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    renderer.domElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        handlePointerUp();
    }, { passive: false });
    renderer.domElement.addEventListener('touchmove', (e) => {
        // Prevent page scrolling
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    animate();
});
