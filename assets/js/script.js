/**
 * Projeto YouTube Turbo - Main Interaction & Tracking Logic
 * Pure Static JavaScript (No external framework dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  initUtmPropagation();
  initScrollButtons();
  initModulesCarousel();
  initTestimonialsCarousel();
  initFaqAccordion();
});

/**
 * 1. UTM & Query Parameters Preservation
 * Reads URL parameters and appends them to all Cakto checkout links
 */
function initUtmPropagation() {
  const currentParams = new URLSearchParams(window.location.search);
  if (!currentParams.toString()) return;

  const checkoutLinks = document.querySelectorAll('a[href*="pay.cakto.com.br"]');
  checkoutLinks.forEach(link => {
    try {
      const url = new URL(link.href);
      currentParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
      link.href = url.toString();
    } catch (e) {
      console.warn('Could not update checkout link with UTMs:', e);
    }
  });
}

/**
 * 2. Smooth Scroll to Offer Section (#venda)
 */
function initScrollButtons() {
  const scrollButtons = document.querySelectorAll('[data-scroll-to="venda"]');
  const target = document.getElementById('venda');

  if (!target) return;

  scrollButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPos = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * 3. Modules Carousel
 */
function initModulesCarousel() {
  const container = document.getElementById('modules-carousel');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const prevBtn = document.getElementById('modules-prev');
  const nextBtn = document.getElementById('modules-next');
  if (!track) return;

  let currentOffset = 0;

  function getMaxOffset() {
    const containerWidth = container.offsetWidth;
    const trackWidth = track.scrollWidth;
    return Math.min(0, containerWidth - trackWidth);
  }

  function getStep() {
    const firstItem = track.querySelector('.carousel-item');
    if (!firstItem) return 320;
    const gap = 20; // 1.25rem gap-5
    return firstItem.offsetWidth + gap;
  }

  function applyOffset(offset) {
    const min = getMaxOffset();
    currentOffset = Math.max(min, Math.min(0, offset));
    track.style.transform = `translate3d(${currentOffset}px, 0px, 0px)`;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      applyOffset(currentOffset + getStep());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      applyOffset(currentOffset - getStep());
    });
  }

  // Touch & Drag Support
  let isDragging = false;
  let startX = 0;
  let startOffset = 0;

  function onPointerDown(e) {
    isDragging = true;
    startX = e.pageX || (e.touches && e.touches[0].pageX) || 0;
    startOffset = currentOffset;
    track.classList.add('no-transition');
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.pageX || (e.touches && e.touches[0].pageX) || 0;
    const diff = x - startX;
    applyOffset(startOffset + diff);
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('no-transition');
  }

  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  window.addEventListener('resize', () => {
    applyOffset(currentOffset);
  });
}

/**
 * 4. Testimonials Carousel
 */
function initTestimonialsCarousel() {
  const container = document.getElementById('testimonials-carousel');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const items = container.querySelectorAll('.carousel-item');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (!track || items.length === 0) return;

  let currentIndex = 0;

  function updateCarousel(index) {
    if (index < 0) index = 0;
    if (index >= items.length) index = items.length - 1;
    currentIndex = index;

    const targetItem = items[currentIndex];
    const containerWidth = container.offsetWidth;
    const itemOffset = targetItem.offsetLeft;
    const itemWidth = targetItem.offsetWidth;

    // Center the item
    let offset = -(itemOffset - (containerWidth - itemWidth) / 2);
    
    // Bounds
    const maxOffset = -(track.scrollWidth - containerWidth);
    if (offset > 0) offset = 0;
    if (offset < maxOffset) offset = maxOffset;

    track.style.transform = `translate3d(${offset}px, 0px, 0px)`;

    // Update dots
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.className = 'testimonial-dot h-2 rounded-full transition-all w-6 bg-[#2563EB]';
      } else {
        dot.className = 'testimonial-dot h-2 rounded-full transition-all w-2 bg-white/20';
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentIndex + 1);
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateCarousel(idx);
    });
  });

  // Touch Swipe Support
  let startX = 0;
  let startY = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          updateCarousel(currentIndex + 1);
        } else {
          updateCarousel(currentIndex - 1);
        }
      }
    }
  });

  window.addEventListener('resize', () => {
    updateCarousel(currentIndex);
  });

  // Initialize first position
  setTimeout(() => updateCarousel(0), 100);
}

/**
 * 5. FAQ Accordion (Collapsible)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    const content = item.querySelector('.faq-content');

    if (!btn || !content) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close other items (Radix single collapsible behavior)
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          const otherContent = otherItem.querySelector('.faq-content');
          const otherBtn = otherItem.querySelector('.faq-btn');
          if (otherContent) otherContent.classList.remove('open');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        content.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        content.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
