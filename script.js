document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.link');
    const animationContainer = document.getElementById('animation-container');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent immediate navigation

            const linkId = link.getAttribute('data-link-id');
            const targetText = document.querySelector(`.left-text span[data-link-id="${linkId}"]`);

            // --- Start Animations ---

            // 1. Flash the corresponding text
            if (targetText) {
                targetText.classList.add('flashing');
            }

            // 2. Play the rotating '—' animation
            animationContainer.style.display = 'block';
            let angle = 0;
            const rotationInterval = setInterval(() => {
                angle += 45;
                animationContainer.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
                if (angle >= 360) {
                    clearInterval(rotationInterval);
                }
            }, 100);

            // --- Navigate after animations ---
            setTimeout(() => {
                // Clean up animations
                if (targetText) {
                    targetText.classList.remove('flashing');
                }
                animationContainer.style.display = 'none';

                // Handle navigation: open in new tab if target="_blank"
                if (link.target === '_blank') {
                    window.open(link.href, '_blank');
                } else {
                    // Go to the new page
                    window.location.href = link.href;
                }
            }, 1500); // Wait 1.5 seconds for animations to complete
        });
    });
});
