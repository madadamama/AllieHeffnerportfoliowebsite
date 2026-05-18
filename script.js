document.addEventListener('DOMContentLoaded', function() {
    (function initVariableName() {
        var nameEl = document.querySelector('.info-name');
        if (!nameEl) return;

        var text = nameEl.textContent.trim();
        var maxTilt = 12; /* degrees */

        nameEl.textContent = '';
        nameEl.setAttribute('aria-label', text);

        for (var i = 0; i < text.length; i++) {
            var ch = text.charAt(i);
            var span = document.createElement('span');
            span.className = 'info-name-letter';
            span.setAttribute('aria-hidden', 'true');

            if (ch === ' ') {
                span.classList.add('info-name-space');
                span.textContent = '\u00a0';
            } else {
                span.textContent = ch;
                if (ch === 'A' || ch === 'H') {
                    var tilt = (Math.random() * 2 - 1) * maxTilt;
                    span.style.transform = 'rotate(' + tilt.toFixed(2) + 'deg)';
                }
            }

            nameEl.appendChild(span);
        }
    })();

    (function initNewMusicVoicemail() {
        var trigger = document.querySelector('.info-music-hover');
        var drawer = document.getElementById('info-drawer');
        if (!trigger || !drawer) return;

        var desktopMq = window.matchMedia('(min-width: 769px)');
        var voicemailSrc = 'Voicemail May 2.m4a';
        var hideTimer = null;

        var dock = document.createElement('div');
        dock.className = 'sidebar-voicemail-dock';
        dock.id = 'sidebar-voicemail-dock';
        dock.setAttribute('aria-hidden', 'true');
        dock.innerHTML =
            '<p class="sidebar-voicemail-label">Spoiled By Your Love by Anita Ward</p>' +
            '<div class="sidebar-voicemail-progress" aria-hidden="true"></div>' +
            '<audio id="sidebar-voicemail-player" preload="metadata"></audio>';

        drawer.appendChild(dock);

        var player = dock.querySelector('#sidebar-voicemail-player');
        var audioUrl = new URL(voicemailSrc, window.location.href).href;

        function showDock() {
            if (!desktopMq.matches) return;
            clearTimeout(hideTimer);
            dock.classList.add('is-visible');
            dock.setAttribute('aria-hidden', 'false');
        }

        function hideDock() {
            hideTimer = setTimeout(function() {
                dock.classList.remove('is-visible', 'is-playing');
                trigger.classList.remove('is-active');
                dock.setAttribute('aria-hidden', 'true');
                player.pause();
                player.currentTime = 0;
            }, 180);
        }

        function startPlayback() {
            if (!desktopMq.matches) return;
            trigger.classList.add('is-active');
            showDock();
            if (player.src !== audioUrl) {
                player.src = audioUrl;
            }
            dock.classList.add('is-playing');
            player.play().catch(function() {
                dock.classList.remove('is-playing');
            });
        }

        trigger.addEventListener('mouseenter', startPlayback);
        trigger.addEventListener('mouseleave', hideDock);
        trigger.addEventListener('focus', startPlayback);
        trigger.addEventListener('blur', hideDock);

        dock.addEventListener('mouseenter', function() {
            clearTimeout(hideTimer);
        });
        dock.addEventListener('mouseleave', hideDock);

        player.addEventListener('ended', function() {
            dock.classList.remove('is-playing');
        });

        player.addEventListener('pause', function() {
            if (player.currentTime === 0 || player.ended) {
                dock.classList.remove('is-playing');
            }
        });
    })();

    // Your existing thumbnail code stays exactly the same
    document.querySelectorAll('.project-thumb').forEach(thumb => {
        const mainImage = thumb.getAttribute('data-main');
        const gallery = JSON.parse(thumb.getAttribute('data-gallery') || '[]');
        
        // Check if it has a video
        const video = thumb.querySelector('video');
        
        // Set background image for non-video projects
        if (mainImage && !video) {
            thumb.style.backgroundImage = `url('${mainImage}')`;
        }
        
        // Add slideshow for projects with gallery images
        const preview = thumb.querySelector('.gallery-preview');
        if (preview && gallery.length > 0) {
            const slideshow = document.createElement('div');
            slideshow.className = 'slideshow';
            
            gallery.forEach((imgSrc, index) => {
                const slide = document.createElement('div');
                slide.className = `slide ${index === 0 ? 'active' : ''}`;
                slide.style.backgroundImage = `url('${imgSrc}')`;
                slide.dataset.index = index;
                slideshow.appendChild(slide);
            });
            
            preview.appendChild(slideshow);
            
            let slideInterval;
            let currentSlide = 0;
            
            thumb.addEventListener('mouseenter', function() {
                if (gallery.length > 1) {
                    startSlideshow();
                } else if (gallery.length === 1) {
                    const slides = thumb.querySelectorAll('.slide');
                    if (slides.length > 0) {
                        slides[0].classList.add('active');
                    }
                }
            });
            
            thumb.addEventListener('mouseleave', function() {
                stopSlideshow();
                showSlide(0);
            });
            
            function startSlideshow() {
                if (gallery.length <= 1) return;
                slideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % gallery.length;
                    showSlide(currentSlide);
                }, 5000);
            }
            
            function stopSlideshow() {
                if (slideInterval) clearInterval(slideInterval);
            }
            
            function showSlide(index) {
                const slides = thumb.querySelectorAll('.slide');
                slides.forEach(slide => slide.classList.remove('active'));
                if (slides[index]) slides[index].classList.add('active');
                currentSlide = index;
            }
        }
        
        // Add click to pause/play for videos
        if (video) {
            thumb.addEventListener('click', function(e) {
                e.preventDefault();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }
    });

    // SIMPLE GALLERY WITH JUST ARROWS
    const simpleGalleries = document.querySelectorAll('.simple-gallery');
    
    simpleGalleries.forEach(gallery => {
        const track = gallery.querySelector('.gallery-track');
        const items = gallery.querySelectorAll('.gallery-item');
        const prevBtn = gallery.querySelector('.prev');
        const nextBtn = gallery.querySelector('.next');
        
        if (!track || !items.length || !prevBtn || !nextBtn) return;
        
        let currentIndex = 0;
        
        // Update gallery position
        function updateGallery() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
        
        // Next button
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            updateGallery();
        });
        
        // Previous button
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateGallery();
        });
    });
});