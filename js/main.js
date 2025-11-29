/**
 * Main JavaScript
 * Handles navigation, scroll effects, form submission, and animations
 */

(function() {
  'use strict';

  // ========================================
  // DOM Elements
  // ========================================
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('.nav__link');
  const bookingForm = document.getElementById('booking-form');
  const faqItems = document.querySelectorAll('.faq-item');

  // ========================================
  // Header Scroll Effect
  // ========================================
  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  // Throttle scroll handler
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function() {
        handleHeaderScroll();
        scrollTimeout = null;
      }, 10);
    }
  }, { passive: true });

  // Initial check
  handleHeaderScroll();

  // ========================================
  // Mobile Navigation
  // ========================================
  function openNav() {
    nav.classList.add('nav--open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('nav--open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleNav() {
    const isOpen = nav.classList.contains('nav--open');
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  }

  navToggle.addEventListener('click', toggleNav);

  // Close nav when clicking a link
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (nav.classList.contains('nav--open')) {
        closeNav();
      }
    });
  });

  // Close nav on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      closeNav();
      navToggle.focus();
    }
  });

  // ========================================
  // Smooth Scroll with Offset
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without triggering scroll
        history.pushState(null, null, href);
      }
    });
  });

  // ========================================
  // Form Submission
  // ========================================
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalContent = submitBtn.innerHTML;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="40" stroke-dashoffset="10">
            <animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        Sending...
      `;

      // Collect form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      // Simulate form submission (replace with actual API call)
      setTimeout(function() {
        // Success state
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 10l3.5 3.5 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Request Sent!
        `;
        submitBtn.style.background = 'var(--color-success)';


        // Reset form after delay
        setTimeout(function() {
          bookingForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
          submitBtn.style.background = '';
        }, 3000);

      }, 1500);
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
          if (value.length <= 3) {
            value = '(' + value;
          } else if (value.length <= 6) {
            value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
          } else {
            value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
          }
        }
        e.target.value = value;
      });
    }
  }

  // ========================================
  // FAQ Accordion Enhancement
  // ========================================
  faqItems.forEach(function(item) {
    const summary = item.querySelector('summary');
    const content = item.querySelector('.faq-answer');

    summary.addEventListener('click', function(e) {
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

      // Close all other items
      faqItems.forEach(function(otherItem) {
        if (otherItem !== item && otherItem.hasAttribute('open')) {
          otherItem.removeAttribute('open');
        }
      });

      // Toggle current item
      if (isOpen) {
        item.removeAttribute('open');
      } else {
        item.setAttribute('open', '');
      }
    });
  });

  // ========================================
  // Scroll Reveal Animations
  // ========================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.service-card, .process-step, .credential-card, .comparison__side, .guarantee-box');

    if (!revealElements.length) return;

    // Add reveal class
    revealElements.forEach(function(el) {
      el.classList.add('reveal');
    });

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Add staggered delay for grid items
          const parent = entry.target.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter(function(child) {
              return child.classList.contains('reveal');
            });
            const index = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = (index * 75) + 'ms';
          }

          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // Check for reduced motion preference
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initScrollReveal();
  }

  // ========================================
  // Active Navigation Link
  // ========================================
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + header.offsetHeight + 100;

    sections.forEach(function(section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(function(link) {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', function() {
    if (!scrollTimeout) {
      updateActiveNavLink();
    }
  }, { passive: true });

  // ========================================
  // Accessibility: Focus Management
  // ========================================
  // Trap focus within mobile nav when open
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  }

  // ========================================
  // Performance: Lazy load images
  // ========================================
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(function(img) {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }

})();

