// ===== SCROLL-BASED NAV HIGHLIGHTING =====
document.addEventListener('DOMContentLoaded', () => {
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

    // Globally accessible state for the YouTube API
    window.ytPlayer = null;
    window.ytReady = false;
    window.musicPlaying = false;
    window.pendingPlay = false;
    window.loopInterval = null;

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            window.musicPlaying = !window.musicPlaying;
            musicToggle.classList.toggle('on', window.musicPlaying);
            musicState.textContent = window.musicPlaying ? 'ON' : 'OFF';

            if (window.musicPlaying) {
                if (window.ytReady && window.ytPlayer) {
                    window.ytPlayer.playVideo();
                    startLoopCheck();
                } else {
                    // Player not ready yet — queue it up
                    window.pendingPlay = true;
                }
            } else {
                window.pendingPlay = false;
                stopLoopCheck();
                if (window.ytReady && window.ytPlayer) {
                    window.ytPlayer.pauseVideo();
                }
            }
        });
    }

    // Load YouTube IFrame API
    const ytScript = document.createElement('script');
    ytScript.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(ytScript);

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

    // ===== ABOUT FRAME ANIMATION =====
    (function () {
        const totalFrames = 40;
        const fps = 18;
        const interval = 1000 / fps;
        const img = document.getElementById('aboutAnimFrame');
        if (!img) return;

        const frames = Array.from({ length: totalFrames }, (_, i) => {
            const n = String(i).padStart(3, '0');
            return `ABOUT_000/about_f_${n}.jpg`;
        });

        let currentFrame = 0;
        setInterval(() => {
            currentFrame = (currentFrame + 1) % totalFrames;
            img.src = frames[currentFrame];
        }, interval);
    })();

    // ===== CONTACT FRAME ANIMATION =====
    (function () {
        const totalFrames = 45;
        const fps = 12;
        const interval = 1000 / fps;
        const img = document.getElementById('contactAnimFrame');
        if (!img) return;

        const frames = Array.from({ length: totalFrames }, (_, i) => {
            const n = String(i).padStart(3, '0');
            return `hi_000/hi_${n}.jpg`;
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

        function update() {
            const rect = section.getBoundingClientRect();
            const scrolled = -rect.top;
            const totalScroll = rect.height - window.innerHeight;

            const settleOffset = totalScroll * 0.20;
            const peelScroll = totalScroll - settleOffset;
            const peelProgress = Math.max(0, scrolled - settleOffset);

            cards.forEach((card, i) => {
                if (i === N - 1) {
                    const peekY = i * 6;
                    const peekScale = 1 - i * 0.018;
                    card.style.transform = `translateY(${peekY}px) scale(${peekScale})`;
                    card.style.opacity = '1';
                    return;
                }

                const segStart = (i / (N - 1)) * peelScroll;
                const segEnd = ((i + 1) / (N - 1)) * peelScroll;
                const p = Math.min(1, Math.max(0, (peelProgress - segStart) / (segEnd - segStart)));

                const peekY = i * 6;
                const peekScale = 1 - i * 0.018;

                if (p <= 0) {
                    card.style.transform = `translateY(${peekY}px) scale(${peekScale})`;
                    card.style.opacity = '1';
                } else {
                    const flyY = p * -110;
                    const tilt = p * -5;
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

        update();
    })();

}); // End DOMContentLoaded

// ===== GLOBAL YOUTUBE API HANDLERS =====
// These must be outside DOMContentLoaded so the YouTube API frame can call them globally
window.onYouTubeIframeAPIReady = () => {
    window.ytPlayer = new YT.Player('youtubePlayer', {
        videoId: 'bAzo9EKkHEQ',
        playerVars: {
            autoplay: 0,
            controls: 0,
            start: 23,
            enablejsapi: 1,
        },
        events: {
            onReady: () => {
                window.ytReady = true;
                if (window.pendingPlay) {
                    window.pendingPlay = false;
                    window.ytPlayer.playVideo();
                    startLoopCheck();
                }
            }
        }
    });
};

function startLoopCheck() {
    if (window.loopInterval) clearInterval(window.loopInterval);
    window.loopInterval = setInterval(() => {
        if (window.ytReady && window.ytPlayer && window.musicPlaying) {
            if (window.ytPlayer.getCurrentTime() >= 57) {
                window.ytPlayer.seekTo(23);
            }
        }
    }, 300);
}

function stopLoopCheck() {
    if (window.loopInterval) {
        clearInterval(window.loopInterval);
        window.loopInterval = null;
    }
}
