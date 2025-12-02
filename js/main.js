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

  // Close nav when clicking outside (on backdrop)
  nav.addEventListener('click', function(e) {
    // If clicking directly on the nav element (backdrop), close it
    if (e.target === nav) {
      closeNav();
    }
  });

  // Prevent nav list clicks from closing (they should navigate)
  const navList = nav.querySelector('.nav__list');
  if (navList) {
    navList.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

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
  // Form Submission (Netlify Forms)
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

      // Submit to Netlify
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(function(response) {
        if (response.ok) {
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
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(function() {
        // Error state
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Error - Try Again
        `;
        submitBtn.style.background = 'var(--color-error)';
        
        setTimeout(function() {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalContent;
          submitBtn.style.background = '';
        }, 3000);
      });
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
  // Zip Code Service Area Checker
  // ========================================
  const zipInput = document.getElementById('zip-input');
  const zipCheckBtn = document.getElementById('zip-check-btn');
  const zipResult = document.getElementById('zip-result');

  // Service area zip codes (Full coverage area from map)
  const serviceZips = [
    // Denver Metro
    '80201', '80202', '80203', '80204', '80205', '80206', '80207', '80208', '80209', '80210',
    '80211', '80212', '80214', '80215', '80216', '80218', '80219', '80220', '80221', '80222',
    '80223', '80224', '80225', '80226', '80227', '80228', '80229', '80230', '80231', '80232',
    '80233', '80234', '80235', '80236', '80237', '80238', '80239', '80246', '80247', '80249',
    '80260', '80261', '80262', '80263', '80264', '80265', '80266', '80271', '80273', '80274',
    '80281', '80290', '80293', '80294', '80299',
    // Aurora
    '80010', '80011', '80012', '80013', '80014', '80015', '80016', '80017', '80018', '80019',
    '80040', '80041', '80042', '80044', '80045', '80046', '80047',
    // Lakewood
    '80214', '80215', '80226', '80227', '80228', '80232',
    // Arvada
    '80001', '80002', '80003', '80004', '80005', '80006', '80007',
    // Westminster
    '80020', '80021', '80030', '80031',
    // Thornton
    '80229', '80233', '80241', '80260',
    // Centennial
    '80015', '80016', '80111', '80112', '80121', '80122', '80123', '80124',
    // Broomfield
    '80020', '80023',
    // Englewood
    '80110', '80111', '80112', '80113',
    // Littleton
    '80120', '80121', '80122', '80123', '80124', '80125', '80126', '80127', '80128', '80129', '80130',
    // Golden
    '80401', '80402', '80403',
    // Boulder
    '80301', '80302', '80303', '80304', '80305', '80306', '80307', '80308', '80309', '80310',
    // Wheat Ridge
    '80033', '80034',
    // Commerce City
    '80022', '80037',
    // Parker
    '80134', '80138',
    // Highlands Ranch
    '80124', '80126', '80129', '80130',
    // Castle Rock
    '80104', '80108', '80109',
    // Brighton
    '80601', '80602', '80603',
    // Northglenn
    '80233', '80234', '80260',
    // Federal Heights
    '80260',
    // Sheridan
    '80110',
    // Lone Tree
    '80124',
    // Greenwood Village
    '80111', '80112', '80121',
    // Cherry Hills Village
    '80110', '80111', '80113',
    // Geneva
    '60134',
    // Carol Stream
    '60188'
  ];

  // Extended area (might service, call to confirm - areas just outside main coverage)
  const extendedZips = [
    // Areas just outside the main service zone
    '80008', '80009', '80024', '80025', '80026', '80027', '80028', '80029', '80032', '80035', '80036', '80038', '80039',
    // Far north metro
    '80501', '80502', '80503', '80504', '80510', '80511', '80512', '80513', '80514', '80515', '80516', '80517', '80520', '80521', '80524', '80525', '80526', '80528', '80530', '80532', '80533', '80534', '80535', '80536', '80537', '80538', '80540', '80542', '80543', '80544', '80545', '80546', '80547', '80549', '80550', '80551', '80553',
    // Far south metro
    '80101', '80102', '80103', '80105', '80106', '80107', '80110', '80113', '80116', '80117', '80118', '80125', '80127', '80131', '80132', '80133', '80135', '80136', '80137', '80150', '80151', '80154', '80155', '80160', '80161', '80162', '80163', '80165', '80166',
    // Far east metro
    '80610', '80611', '80612', '80614', '80615', '80620', '80621', '80622', '80623', '80624', '80631', '80632', '80633', '80634', '80640', '80642', '80643', '80644', '80645', '80646', '80648', '80649', '80650', '80651', '80652', '80653', '80654',
    // Mountain areas
    '80420', '80421', '80422', '80423', '80424', '80425', '80426', '80427', '80428', '80429', '80430', '80432', '80433', '80434', '80435', '80436', '80437', '80438', '80439', '80440', '80442', '80443', '80444', '80446', '80447', '80448', '80449', '80451', '80452', '80453', '80454', '80455', '80456', '80457', '80459', '80461', '80463', '80465', '80466', '80467', '80468', '80469', '80470', '80471', '80473', '80474', '80475', '80476', '80477', '80478', '80479', '80480', '80481', '80482', '80483', '80487', '80488', '80497', '80498'
  ];

  function checkZipCode(zip) {
    zip = zip.trim();
    
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      return { status: 'invalid', message: 'Please enter a valid 5-digit zip code.' };
    }
    
    if (serviceZips.includes(zip)) {
      return { 
        status: 'success', 
        message: 'Yes! We service your area. Call or text us anytime.' 
      };
    }
    
    if (extendedZips.includes(zip)) {
      return { 
        status: 'maybe', 
        message: 'We may be able to reach you. Give us a call to confirm!' 
      };
    }
    
    return { 
      status: 'error', 
      message: 'We don\'t typically service that area, but call us anyway—we might be able to help.' 
    };
  }

  function displayResult(result) {
    zipResult.textContent = result.message;
    zipResult.className = 'zip-checker__result show ' + result.status;
  }

  if (zipInput && zipCheckBtn && zipResult) {
    // Only allow numbers
    zipInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
    });

    // Check on button click
    zipCheckBtn.addEventListener('click', function() {
      const result = checkZipCode(zipInput.value);
      displayResult(result);
    });

    // Check on Enter key
    zipInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const result = checkZipCode(zipInput.value);
        displayResult(result);
      }
    });
  }

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

})();
