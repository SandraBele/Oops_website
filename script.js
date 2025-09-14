// script.js
// Handles interactivity for the Oops landing page: buy button actions,
// contact form submission feedback, and smooth scrolling navigation.

document.addEventListener('DOMContentLoaded', () => {
  // Buy button handler
  const buyBtn = document.getElementById('buyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      // In a real e‑commerce site this would add to cart or begin checkout.
      alert('Thanks for your interest! Your Oops pregnancy test has been added to your cart.');
    });
  }

  // Contact form submission handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      // Collect form data (currently unused but can be sent via AJAX)
      const formData = new FormData(contactForm);
      // Provide feedback to the user
      alert('Thank you for reaching out! We will get back to you shortly.');
      // Reset the form after submission
      contactForm.reset();
    });
  }

  // Smooth scrolling for internal navigation links
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
      // Update active class on click
      navLinks.forEach((lnk) => lnk.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Observer to update active nav link on scroll
  const sections = document.querySelectorAll('section');
  const navMap = {};
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').substring(1);
    navMap[id] = link;
  });
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (navMap[id]) {
            navLinks.forEach((lnk) => lnk.classList.remove('active'));
            navMap[id].classList.add('active');
          }
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  // IntersectionObserver to reveal elements with fade-in effect
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el) => observer.observe(el));

  // FAQ accordion functionality: toggle open class when question clicked
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    }
  });
});