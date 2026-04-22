document.addEventListener('DOMContentLoaded', () => {
    const topLink = document.querySelector('.link.top');
    const animationContainer = document.getElementById('animation-container');

    if (topLink && animationContainer) {
        topLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent immediate navigation

            // Show the animation container
            animationContainer.style.display = 'block';

            let angle = 0;
            const rotationInterval = setInterval(() => {
                angle += 45;
                animationContainer.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

                if (angle >= 360) {
                    clearInterval(rotationInterval);
                }
            }, 100); // Rotate every 100ms

            // Wait for the animation to roughly finish, then navigate
            setTimeout(() => {
                window.location.href = topLink.href;
            }, 1500); // Navigate after 1.5 seconds
        });
    }
});
