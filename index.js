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
