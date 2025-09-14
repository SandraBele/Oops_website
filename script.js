// script.js
// Handles interactivity for the Oops landing page: buy button actions,
// contact form submission feedback, and smooth scrolling navigation.

// script.js
// This file handles all interactivity for the Oops website, including
// smooth scrolling, animations, cart functionality, and form handling.

// Key: localStorage key used to persist the shopping cart
const CART_KEY = 'oopsCart';

/**
 * Retrieve the cart from localStorage. If no cart exists, return an empty array.
 * Each cart item has the shape: { id, name, price, quantity }.
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Save the provided cart array back to localStorage.
 * @param {Array} cart
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Update the cart count displayed in the header across all pages.
 */
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countElements = document.querySelectorAll('#cartCount');
  countElements.forEach((el) => {
    el.textContent = count.toString();
  });
}

/**
 * Add a product to the cart. If the item already exists, increment its quantity.
 * @param {{id: string, name: string, price: number}} product
 */
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  // Provide user feedback. Use template literals for clarity.
  alert(`${product.name} has been added to your cart.`);
}

/**
 * Remove an item from the cart completely.
 * @param {string} id
 */
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

/**
 * Change the quantity of a cart item. Quantity cannot fall below 1.
 * @param {string} id
 * @param {number} delta The change in quantity (e.g. +1 or -1)
 */
function changeQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((it) => it.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  updateCartCount();
  renderCart();
}

/**
 * Render the cart items on the cart page. This function will noop on
 * other pages. It rebuilds the DOM inside the element with id "cartContainer".
 */
function renderCart() {
  const container = document.getElementById('cartContainer');
  if (!container) return; // not on cart page
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty. Browse our <a href="products.html">products</a> and add something!</p>';
    return;
  }
  let html = '<table class="cart-table"><thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody>';
  cart.forEach((item) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    html += `
      <tr>
        <td>${item.name}</td>
        <td class="quantity-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}">–</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${itemTotal}</td>
        <td><button class="remove-btn" data-id="${item.id}">Remove</button></td>
      </tr>
    `;
  });
  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  html += '</tbody></table>';
  html += `<div class="cart-summary"><p><strong>Grand Total: </strong>$${grandTotal}</p><a href="checkout.html" class="cta-button">Proceed to Checkout</a></div>`;
  container.innerHTML = html;
}

/**
 * Render the order summary on the checkout page and attach a submit
 * handler to the checkout form. On submit, the cart will be cleared and
 * a confirmation message displayed.
 */
function renderCheckout() {
  const summaryContainer = document.getElementById('orderSummary');
  const form = document.getElementById('checkoutForm');
  if (!summaryContainer || !form) return; // not on checkout page
  const cart = getCart();
  if (cart.length === 0) {
    summaryContainer.innerHTML = '<p>Your cart is empty. Please add items before checking out.</p>';
    form.style.display = 'none';
    return;
  }
  let html = '<ul class="order-list">';
  let total = 0;
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `<li>${item.quantity} × ${item.name} — $${itemTotal.toFixed(2)}</li>`;
  });
  html += '</ul>';
  html += `<p class="order-total"><strong>Order Total: </strong>$${total.toFixed(2)}</p>`;
  summaryContainer.innerHTML = html;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // In a real application, you would send order details to a server here.
    alert('Thank you for your purchase! Your order has been placed.');
    // Clear the cart and redirect the user back to home or products page
    saveCart([]);
    updateCartCount();
    window.location.href = 'index.html';
  });
}

/**
 * Handle global event listeners after DOM content has loaded. This
 * includes setting up smooth scrolling, animations, contact form
 * submission, cart actions, and nav active states.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Contact form submission handler (for index page contact form)
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      // Collect form data (currently unused but could be sent via AJAX)
      const formData = new FormData(contactForm);
      alert('Thank you for reaching out! We will get back to you shortly.');
      contactForm.reset();
    });
  }

  // Smooth scrolling for internal navigation links (# links)
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      // Only handle on-page anchors
      if (href && href.startsWith('#')) {
        event.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        // Update active classes
        navLinks.forEach((lnk) => lnk.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // IntersectionObserver to update active nav link on scroll (only when on index page)
  const sections = document.querySelectorAll('section[id]');
  const navMap = {};
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const id = href.substring(1);
      navMap[id] = link;
    }
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
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el) => revealObserver.observe(el));

  // FAQ accordion toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    }
  });

  // Cart: update cart count on page load
  updateCartCount();

  // Add-to-cart buttons handling (on products page or hero button)
  document.addEventListener('click', (event) => {
    const target = event.target;
    // Add to cart from product buttons
    if (target.classList.contains('add-to-cart')) {
      const id = target.getAttribute('data-id');
      const name = target.getAttribute('data-name');
      const price = parseFloat(target.getAttribute('data-price'));
      if (id && name && !isNaN(price)) {
        addToCart({ id, name, price });
      }
    }
    // Quantity change buttons on cart page
    if (target.classList.contains('qty-btn')) {
      const id = target.getAttribute('data-id');
      const action = target.getAttribute('data-action');
      if (id && action) {
        changeQuantity(id, action === 'increase' ? 1 : -1);
      }
    }
    // Remove item button on cart page
    if (target.classList.contains('remove-btn')) {
      const id = target.getAttribute('data-id');
      if (id) {
        removeFromCart(id);
      }
    }
  });

  // Render cart if on cart page
  renderCart();
  // Render checkout if on checkout page
  renderCheckout();
});