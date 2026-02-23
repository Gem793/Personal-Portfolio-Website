// ===== SCROLL-BASED NAV HIGHLIGHTING =====
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.section === sectionId);
            });
        }
    });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// ===== FADE-IN ON SCROLL =====
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, {
    root: null,
    threshold: 0.15
});

fadeElements.forEach(el => fadeObserver.observe(el));

// ===== SCROLL TO EXPLORE =====
const scrollDown = document.getElementById('scrollDown');
if (scrollDown) {
    scrollDown.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
}

// ===== MUSIC TOGGLE (YOUTUBE IFRAME API) =====
const musicToggle = document.getElementById('musicToggle');
const musicState = document.getElementById('musicState');
let ytPlayer = null;
let ytReady = false;
let musicPlaying = false;
let pendingPlay = false;

// Load YouTube IFrame API
const ytScript = document.createElement('script');
ytScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(ytScript);

// Called automatically by YouTube IFrame API when ready
window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player('youtubePlayer', {
        videoId: 'bAzo9EKkHEQ',
        playerVars: {
            autoplay: 0,
            controls: 0,
            start: 23,
            enablejsapi: 1,
        },
        events: {
            onReady: () => {
                ytReady = true;
                // If user clicked toggle before player was ready, play now
                if (pendingPlay) {
                    pendingPlay = false;
                    ytPlayer.playVideo();
                    startLoopCheck();
                }
            }
        }
    });
};

// Poll every 300ms — when time hits 46s, seek back to 23s
let loopInterval = null;
function startLoopCheck() {
    if (loopInterval) clearInterval(loopInterval);
    loopInterval = setInterval(() => {
        if (ytReady && ytPlayer && musicPlaying) {
            if (ytPlayer.getCurrentTime() >= 57) {
                ytPlayer.seekTo(23);
            }
        }
    }, 300);
}
function stopLoopCheck() {
    if (loopInterval) { clearInterval(loopInterval); loopInterval = null; }
}

if (musicToggle) {
    musicToggle.addEventListener('click', () => {
        musicPlaying = !musicPlaying;
        musicToggle.classList.toggle('on', musicPlaying);
        musicState.textContent = musicPlaying ? 'ON' : 'OFF';

        if (musicPlaying) {
            if (ytReady && ytPlayer) {
                ytPlayer.playVideo();
                startLoopCheck();
            } else {
                // Player not ready yet — queue it up
                pendingPlay = true;
            }
        } else {
            pendingPlay = false;
            stopLoopCheck();
            if (ytReady && ytPlayer) {
                ytPlayer.pauseVideo();
            }
        }
    });
}


// ===== HERO FRAME ANIMATION =====
(function () {
    const totalFrames = 154;
    const fps = 12;           // frames per second
    const interval = 1000 / fps;
    const img = document.getElementById('heroAnimFrame');
    if (!img) return;

    // Pre-build the list of frame paths
    const frames = Array.from({ length: totalFrames }, (_, i) => {
        const n = String(i).padStart(3, '0');
        return `hero_imgs/sr_2 2_${n}.jpg`;
    });

    let currentFrame = 0;
    setInterval(() => {
        currentFrame = (currentFrame + 1) % totalFrames;
        img.src = frames[currentFrame];
    }, interval);
})();

// ===== SMOOTH SCROLL FOR NAV LINKS =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.dataset.section);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// ===== STACKED CARD PEEL ANIMATION =====
(function () {
    const section = document.getElementById('projects');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    if (!section || cards.length === 0) return;

    const N = cards.length;

    // CSS base transforms (the "stacked deck" peek) are applied at progress = 0
    // At progress = 1 the card flies off upward
    function update() {
        const rect = section.getBoundingClientRect();
        // scrolled = how many px we've moved into the section (0 at section top, positive going down)
        const scrolled = -rect.top;
        // totalScroll = how many px the section scrolls while sticky (400vh - 100vh = 300vh)
        const totalScroll = rect.height - window.innerHeight;

        cards.forEach((card, i) => {
            // Last card stays fixed — never peels away
            if (i === N - 1) {
                const peekY = i * 6;
                const peekScale = 1 - i * 0.018;
                card.style.transform = `translateY(${peekY}px) scale(${peekScale})`;
                card.style.opacity = '1';
                return;
            }

            // Each card occupies an equal share of the scroll range
            const segStart = (i / (N - 1)) * totalScroll;
            const segEnd = ((i + 1) / (N - 1)) * totalScroll;
            const p = Math.min(1, Math.max(0, (scrolled - segStart) / (segEnd - segStart)));

            // Base peek offset (from CSS --card-i, mirrored here for accuracy)
            const peekY = i * 6;
            const peekScale = 1 - i * 0.018;

            if (p <= 0) {
                // Card hasn't started peeling yet — restore stacked deck position
                card.style.transform = `translateY(${peekY}px) scale(${peekScale})`;
                card.style.opacity = '1';
            } else {
                // Peel upward: slides off the top of the screen
                const flyY = p * -110;          // vh units mapped as % of card height
                const tilt = p * -5;            // slight CCW rotation as it peels
                const shrink = peekScale - p * 0.05;
                card.style.transform = `translateY(calc(${peekY}px + ${flyY}vh)) rotate(${tilt}deg) scale(${shrink})`;
                card.style.opacity = String(Math.max(0, 1 - p * 0.6));
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => { update(); ticking = false; });
            ticking = true;
        }
    }, { passive: true });

    // Run once on load to set initial state
    update();
})();
