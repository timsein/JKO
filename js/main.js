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
      .catch(function(error) {
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
    // Joliet area
    '60431', '60432', '60433', '60434', '60435', '60436',
    // Naperville
    '60540', '60563', '60564', '60565',
    // Plainfield
    '60544', '60585', '60586',
    // Bolingbrook
    '60440', '60490',
    // Romeoville
    '60446',
    // Lockport
    '60441',
    // Shorewood
    '60404',
    // Channahon
    '60410',
    // Minooka
    '60447',
    // Morris
    '60450',
    // Oswego
    '60543',
    // Yorkville
    '60560',
    // Aurora area
    '60502', '60503', '60504', '60505', '60506', '60507', '60538',
    // Lemont
    '60439',
    // Woodridge
    '60517',
    // Downers Grove
    '60515', '60516',
    // Lisle
    '60532',
    // Warrenville
    '60555',
    // Crest Hill
    '60403',
    // New Lenox
    '60451',
    // Mokena
    '60448',
    // Frankfort
    '60423',
    // Manhattan
    '60442',
    // Elgin
    '60120', '60121', '60123', '60124',
    // Schaumburg
    '60173', '60193', '60194', '60195', '60196',
    // DeKalb
    '60115',
    // St. Charles
    '60174', '60175',
    // Batavia
    '60510',
    // Sandwich
    '60548',
    // Orland Park
    '60462', '60467',
    // Chicago Heights
    '60411',
    // Bourbonnais
    '60914',
    // Kankakee
    '60901',
    // Sycamore
    '60178',
    // Gardner
    '60424',
    // Braceville
    '60915',
    // Streator
    '61364',
    // Ottawa
    '61350',
    // Wheaton
    '60187', '60189',
    // Glen Ellyn
    '60137',
    // Lombard
    '60148',
    // Villa Park
    '60181',
    // Elmhurst
    '60126',
    // Westmont
    '60559',
    // Darien
    '60561',
    // Burr Ridge
    '60527',
    // Tinley Park
    '60477', '60487',
    // Homer Glen
    '60491',
    // Geneva
    '60134',
    // Carol Stream
    '60188'
  ];

  // Extended area (might service, call to confirm - areas just outside main coverage)
  const extendedZips = [
    // Areas just outside the main service zone
    '60007', '60008', '60010', '60018', '60067', '60068', '60069', '60070', '60090', '60091', '60092', '60093', '60094', '60095', '60096', '60097', '60098', '60099',
    // Far west suburbs
    '60112', '60113', '60119', '60139', '60145', '60146', '60147', '60151', '60152', '60153', '60154', '60155', '60156', '60157', '60159', '60160', '60161', '60162', '60163', '60164', '60165', '60171', '60172', '60176', '60177', '60179', '60180', '60182', '60183', '60184', '60185', '60186', '60190', '60191', '60192', '60199',
    // Far south suburbs
    '60402', '60406', '60407', '60408', '60409', '60412', '60413', '60414', '60415', '60416', '60417', '60418', '60419', '60420', '60421', '60422', '60424', '60425', '60426', '60428', '60429', '60430', '60437', '60438', '60443', '60444', '60445', '60449', '60452', '60453', '60454', '60455', '60456', '60457', '60458', '60459', '60460', '60461', '60463', '60464', '60465', '60466', '60468', '60469', '60470', '60471', '60472', '60473', '60474', '60475', '60476', '60478', '60479', '60480', '60481', '60482', '60499',
    // Far west/southwest
    '60501', '60508', '60509', '60511', '60512', '60513', '60514', '60518', '60519', '60520', '60521', '60522', '60523', '60524', '60525', '60526', '60528', '60529', '60530', '60531', '60533', '60534', '60535', '60536', '60537', '60539', '60541', '60542', '60545', '60546', '60547', '60548', '60549', '60550', '60551', '60552', '60553', '60554', '60556', '60557', '60558', '60562', '60566', '60567', '60568', '60569', '60570', '60572', '60597', '60598', '60599',
    // Kankakee area
    '60910', '60911', '60912', '60913', '60915', '60916', '60917', '60918', '60919', '60920', '60921', '60922', '60924', '60926', '60927', '60928', '60929', '60930', '60931', '60932', '60933', '60934', '60935', '60936', '60938', '60939', '60940', '60941', '60942', '60943', '60944', '60945', '60946', '60948', '60949', '60950', '60951', '60952', '60953', '60954', '60955', '60956', '60957', '60958', '60959', '60960', '60961', '60962', '60963', '60964', '60966', '60967', '60968', '60969', '60970', '60973', '60974'
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

