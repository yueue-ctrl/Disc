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
            opacity: 0.85,
            shininess: 10, // Lower shininess for a more frosted/matte look
            specular: 0xffffff, // Add a strong white specular highlight
            side: THREE.DoubleSide
        }),
        new THREE.MeshPhongMaterial({ // Material for the edge
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.85,
            shininess: 10, // Lower shininess
            specular: 0xffffff // Add a strong white specular highlight
        })
    ];
    const disc = new THREE.Mesh(geometry, materials);
    scene.add(disc);

    // Add some light
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);



    camera.position.z = 5;

    // --- Interaction & Animation ---

    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const damping = 0.95; // Closer to 1 = less friction, longer spin

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Apply constant auto-rotation (slowed down to see inertia better)
        if (!isDragging) {
            disc.rotation.x += 0.001;
            disc.rotation.y += 0.001;
        }

        // If not dragging, apply inertia and damping
        if (!isDragging && (Math.abs(rotationVelocity.x) > 0.0001 || Math.abs(rotationVelocity.y) > 0.0001)) {
            disc.rotation.x += rotationVelocity.x;
            disc.rotation.y += rotationVelocity.y;

            // Apply damping (friction)
            rotationVelocity.x *= damping;
            rotationVelocity.y *= damping;
        } else if (!isDragging) {
            // Stop tiny movements to prevent infinite spinning
            rotationVelocity.x = 0;
            rotationVelocity.y = 0;
        }

        renderer.render(scene, camera);
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    function handlePointerDown(x, y) {
        isDragging = true;
        // Stop any ongoing inertia
        rotationVelocity = { x: 0, y: 0 };
        previousPointerPosition = { x, y };
    }

    function handlePointerUp() {
        isDragging = false;
        // The `rotationVelocity` now holds the last movement's speed for the animate loop to use
    }

    function handlePointerMove(x, y) {
        if (!isDragging) return;

        const deltaMove = {
            x: x - previousPointerPosition.x,
            y: y - previousPointerPosition.y
        };

        // Calculate the rotation for this frame
        const deltaRotationX = toRadians(deltaMove.y * 0.5); // y-movement rotates around x-axis
        const deltaRotationY = toRadians(deltaMove.x * 0.5); // x-movement rotates around y-axis

        // Apply rotation directly for immediate feedback
        disc.rotation.x += deltaRotationX;
        disc.rotation.y += deltaRotationY;
        
        // Update velocity for the inertia effect when released
        rotationVelocity.x = deltaRotationX;
        rotationVelocity.y = deltaRotationY;
        
        previousPointerPosition = { x, y };
    }

    // Mouse Events
    renderer.domElement.addEventListener('mousedown', (e) => handlePointerDown(e.clientX, e.clientY));
    renderer.domElement.addEventListener('mouseup', handlePointerUp);
    renderer.domElement.addEventListener('mouseleave', handlePointerUp);
    renderer.domElement.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));

    // Touch Events
    renderer.domElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    renderer.domElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        handlePointerUp();
    }, { passive: false });
    renderer.domElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    // Handle window resizing
    window.addEventListener('resize', () => {
        // Update camera aspect ratio
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update renderer size
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
