document.addEventListener('DOMContentLoaded', function() {
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