// script.js
// Handles interactivity for the Oops landing page: buy button actions,
// contact form submission feedback, and smooth scrolling navigation.

// script.js
// This file handles all interactivity for the Oops website, including
// smooth scrolling, animations, cart functionality, and form handling.

// Keys used to persist data in localStorage
const CART_KEY = 'oopsCart';
const USER_KEY = 'oopsUsers';
const SESSION_KEY = 'oopsSession';

/**
 * Retrieve the currently logged in session. Returns null if no user is logged in.
 */
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

/**
 * Persist the current session to localStorage. If session is null, remove it.
 * @param {Object|null} session
 */
function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Determine if a user is currently logged in.
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getSession();
}

/**
 * Retrieve the list of registered users from localStorage.
 * @returns {Array}
 */
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Persist the provided users array back to localStorage.
 * @param {Array} users
 */
function saveUsers(users) {
  localStorage.setItem(USER_KEY, JSON.stringify(users));
}

/**
 * Register a new wholesaler. Performs simple validation and checks for duplicate emails.
 * @param {Object} details
 * @param {string} details.email
 * @param {string} details.phone
 * @param {string} details.company
 * @param {string} details.password
 * @returns {Object|false} Returns the registered user object on success, false on failure.
 */
function registerUser({ email, phone, company, password }) {
  const users = getUsers();
  if (!email || !phone || !company || !password) return false;
  // Prevent duplicate registrations
  const exists = users.find((u) => u.email === email);
  if (exists) return false;
  const newUser = { email, phone, company, password };
  users.push(newUser);
  saveUsers(users);
  // create session after registration
  saveSession({ email });
  return newUser;
}

/**
 * Attempt to log in with the provided credentials. If successful, stores a session and returns true.
 * @param {string} email
 * @param {string} password
 */
function loginUser(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    saveSession({ email });
    return true;
  }
  return false;
}

/**
 * Log out the current user.
 */
function logoutUser() {
  saveSession(null);
}

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
  // Only allow adding items for logged-in wholesale customers
  if (!isLoggedIn()) {
    alert('Please log in or register as a wholesaler to see pricing and place orders.');
    window.location.href = 'login.html';
    return;
  }
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
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
  // Require login before viewing cart contents
  if (!isLoggedIn()) {
    container.innerHTML = '<p>You must <a href="login.html">log in</a> or <a href="signup.html">register</a> as a wholesaler to view your cart.</p>';
    return;
  }
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty. Browse our <a href="products.html">products</a> and add something!</p>';
    return;
  }
  // Calculate total quantity to apply bulk discounts
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  let discountRate = 0;
  if (totalQty >= 500) {
    discountRate = 0.2;
  } else if (totalQty >= 300) {
    discountRate = 0.15;
  } else if (totalQty >= 200) {
    discountRate = 0.1;
  } else if (totalQty >= 100) {
    discountRate = 0.05;
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
  let grandTotalRaw = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discountAmount = grandTotalRaw * discountRate;
  let grandTotal = (grandTotalRaw - discountAmount).toFixed(2);
  html += '</tbody></table>';
  html += '<div class="cart-summary">';
  // Show discount breakdown if applicable
  html += `<p><strong>Items: </strong>${totalQty}</p>`;
  if (discountRate > 0) {
    html += `<p><strong>Subtotal:</strong> $${grandTotalRaw.toFixed(2)}</p>`;
    html += `<p><strong>Bulk Discount (${(discountRate * 100).toFixed(0)}%):</strong> -$${discountAmount.toFixed(2)}</p>`;
  }
  html += `<p><strong>Grand Total:</strong> $${grandTotal}</p>`;
  // Enforce minimum order quantity of 50 before checkout
  if (totalQty < 50) {
    html += '<p class="min-warning">Minimum wholesale order is 50 units. Please increase quantities to proceed.</p>';
    html += '<a href="#" class="cta-button disabled" onclick="return false;">Proceed to Checkout</a>';
  } else {
    html += '<a href="checkout.html" class="cta-button">Proceed to Checkout</a>';
  }
  html += '</div>';
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
  // Require login
  if (!isLoggedIn()) {
    summaryContainer.innerHTML = '<p>You must <a href="login.html">log in</a> as a wholesaler before checking out.</p>';
    form.style.display = 'none';
    return;
  }
  const cart = getCart();
  if (cart.length === 0) {
    summaryContainer.innerHTML = '<p>Your cart is empty. Please add items before checking out.</p>';
    form.style.display = 'none';
    return;
  }
  // Enforce minimum order quantity
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQty < 50) {
    summaryContainer.innerHTML = '<p>Your order does not meet the minimum wholesale quantity of 50 units. Please adjust your cart.</p>';
    form.style.display = 'none';
    return;
  }
  // Determine discount
  let discountRate = 0;
  if (totalQty >= 500) {
    discountRate = 0.2;
  } else if (totalQty >= 300) {
    discountRate = 0.15;
  } else if (totalQty >= 200) {
    discountRate = 0.1;
  } else if (totalQty >= 100) {
    discountRate = 0.05;
  }
  let html = '<ul class="order-list">';
  let subtotal = 0;
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    html += `<li>${item.quantity} × ${item.name} — $${itemTotal.toFixed(2)}</li>`;
  });
  html += '</ul>';
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;
  if (discountRate > 0) {
    html += `<p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>`;
    html += `<p><strong>Bulk Discount (${(discountRate * 100).toFixed(0)}%):</strong> -$${discountAmount.toFixed(2)}</p>`;
  }
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
  updatePricingVisibility();

  // Update login/logout link based on authentication state
  const authLink = document.getElementById('authLink');
  if (authLink && authLink.hasAttribute('data-auth-link')) {
    if (isLoggedIn()) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
        // clear cart and counts when logging out
        saveCart([]);
        updateCartCount();
        updatePricingVisibility();
        window.location.href = 'index.html';
      });
    } else {
      authLink.textContent = 'Login';
      authLink.href = 'login.html';
    }
  }

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

/**
 * Update pricing visibility based on authentication state
 */
function updatePricingVisibility() {
  const priceDisplays = document.querySelectorAll('.price-display');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const loginRequiredButtons = document.querySelectorAll('.login-required');
  
  if (isLoggedIn()) {
    priceDisplays.forEach(el => el.style.display = 'inline');
    addToCartButtons.forEach(el => el.style.display = 'inline-block');
    loginRequiredButtons.forEach(el => el.style.display = 'none');
  } else {
    priceDisplays.forEach(el => el.style.display = 'none');
    addToCartButtons.forEach(el => el.style.display = 'none');
    loginRequiredButtons.forEach(el => el.style.display = 'inline-block');
  }
}
