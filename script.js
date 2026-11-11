document.addEventListener('DOMContentLoaded', function() {
    (function initProjectCarousels() {
        function advanceCarousel(carousel, nextIndex) {
            var slides = carousel.querySelectorAll('.project-carousel-slide');
            if (!slides.length) return 0;
            var current = 0;
            for (var i = 0; i < slides.length; i++) {
                if (slides[i].classList.contains('is-active')) {
                    current = i;
                    break;
                }
            }
            var index = typeof nextIndex === 'number'
                ? ((nextIndex % slides.length) + slides.length) % slides.length
                : (current + 1) % slides.length;
            slides[current].classList.remove('is-active');
            slides[index].classList.add('is-active');
            return index;
        }

        document.querySelectorAll('[data-synced-carousels]').forEach(function(group) {
            var carousels = group.querySelectorAll('.project-carousel');
            if (carousels.length < 2) return;
            var intervalMs = parseInt(group.getAttribute('data-interval'), 10) || 5000;
            setInterval(function() {
                var nextIndex = null;
                carousels.forEach(function(carousel, i) {
                    if (i === 0) {
                        nextIndex = advanceCarousel(carousel);
                    } else {
                        advanceCarousel(carousel, nextIndex);
                    }
                });
            }, intervalMs);
        });

        document.querySelectorAll('.project-carousel').forEach(function(carousel) {
            if (carousel.closest('[data-synced-carousels]')) return;
            var slides = carousel.querySelectorAll('.project-carousel-slide');
            if (slides.length < 2) return;
            var intervalMs = parseInt(carousel.getAttribute('data-interval'), 10) || 5000;
            setInterval(function() {
                advanceCarousel(carousel);
            }, intervalMs);
        });
    })();

    (function initProjectsPanel() {
        var panel = document.getElementById('projects-panel');
        var closeBtn = document.getElementById('projects-panel-close');
        var reopenBtn = document.getElementById('projects-panel-reopen');
        if (!panel || !closeBtn || !reopenBtn) return;

        closeBtn.addEventListener('click', function() {
            panel.classList.add('is-closed');
            reopenBtn.hidden = false;
        });

        reopenBtn.addEventListener('click', function() {
            panel.classList.remove('is-closed');
            reopenBtn.hidden = true;
        });
    })();

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