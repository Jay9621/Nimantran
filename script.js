// Cart functionality
class ShoppingCart {
  constructor() {
    this.items = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCartBadge();
  }

  bindEvents() {
    // Cart toggle
    document.getElementById("cartBtn").addEventListener("click", () => this.toggleCart());
    document.getElementById("cartClose").addEventListener("click", () => this.closeCart());
    document.getElementById("cartOverlay").addEventListener("click", () => this.closeCart());

    // Clear cart
    document.getElementById("clearCartBtn").addEventListener("click", () => this.clearCart());

    // Checkout
    document.getElementById("checkoutBtn").addEventListener("click", () => this.checkout());
  }

  addItem(productId) {
    let product;

    // If it's already a product object, use it directly
    if (typeof productId === "object") {
      product = productId;
    } else {
      // Otherwise, find the product by ID
      product = this.findProductById(productId);
    }

    if (!product) return;

    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: 1,
        minQuantity: 1,
      });
    }

    this.updateCart();
    this.openCart();
  }

  removeItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.updateCart();
  }

  updateQuantity(id, quantity) {
    const item = this.items.find((item) => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.updateCart();
    }
  }

  clearCart() {
    this.items = [];
    this.updateCart();
  }

  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  openCart() {
    this.isOpen = true;
    document.getElementById("cartSidebar").classList.add("open");
    document.getElementById("cartOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeCart() {
    this.isOpen = false;
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleCart() {
    if (this.isOpen) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  updateCart() {
    this.updateCartBadge();
    this.renderCartItems();
    this.updateCartFooter();
  }

  updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    const count = this.getItemCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  renderCartItems() {
    const cartContent = document.getElementById("cartContent");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartItems = document.getElementById("cartItems");

    if (this.items.length === 0) {
      cartEmpty.style.display = "flex";
      cartItems.style.display = "none";
    } else {
      cartEmpty.style.display = "none";
      cartItems.style.display = "block";
      cartItems.setAttribute("role", "list");
      cartItems.setAttribute("aria-label", "Shopping cart items");

      cartItems.innerHTML = this.items
        .map(
          (item) => `
              <div class="cart-item" role="listitem">
                  <div class="cart-item-image">
                      ${
                        item.image
                          ? `<img src="${item.image}" alt="${item.name}">`
                          : '<div class="no-image">No image</div>'
                      }
                  </div>
                  <div class="cart-item-details">
                      <div class="cart-item-header">
                          <div class="cart-item-info">
                              <h4>${item.name}</h4>
                              <p>Personalized Name Title: Yes</p>
                          </div>
                          <button class="cart-item-remove" data-item-id="${item.id}" aria-label="Remove ${item.name} from cart">
                              <i class="fas fa-times"></i>
                          </button>
                      </div>
                      <div class="cart-item-controls">
                          <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                          <div class="quantity-controls" role="group" aria-label="Quantity controls for ${item.name}">
                              <button class="quantity-btn quantity-decrease" data-item-id="${item.id}" ${item.quantity <= 1 ? "disabled" : ""} aria-label="Decrease quantity">
                                  <i class="fas fa-minus"></i>
                              </button>
                              <span class="quantity-display" aria-label="Quantity">${item.quantity}</span>
                              <button class="quantity-btn quantity-increase" data-item-id="${item.id}" aria-label="Increase quantity">
                                  <i class="fas fa-plus"></i>
                              </button>
                          </div>
                          <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <button class="remove-link" data-item-id="${item.id}" aria-label="Remove ${item.name} from cart">Remove</button>
                  </div>
              </div>
          `,
        )
        .join("");

      // Add event listeners to the newly created buttons
      this.bindCartItemEvents();
    }
  }

  bindCartItemEvents() {
    // Remove item buttons
    document.querySelectorAll(".cart-item-remove, .remove-link").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        this.removeItem(itemId);
      });
    });

    // Quantity buttons
    document.querySelectorAll(".quantity-decrease").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        const item = this.items.find((item) => item.id === itemId);
        if (item) {
          this.updateQuantity(itemId, item.quantity - 1);
        }
      });
    });

    document.querySelectorAll(".quantity-increase").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        const item = this.items.find((item) => item.id === itemId);
        if (item) {
          this.updateQuantity(itemId, item.quantity + 1);
        }
      });
    });
  }

  updateCartFooter() {
    const cartFooter = document.getElementById("cartFooter");
    const cartSubtotal = document.getElementById("cartSubtotal");
    const minimumWarning = document.getElementById("minimumWarning");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (this.items.length === 0) {
      cartFooter.style.display = "none";
    } else {
      cartFooter.style.display = "block";
      cartSubtotal.textContent = `₹${this.getTotal().toFixed(2)}`;

      // Check if any items are below minimum quantity
      const hasMinimumIssue = this.items.some((item) => item.quantity < item.minQuantity);
      minimumWarning.style.display = hasMinimumIssue ? "block" : "none";
      checkoutBtn.disabled = hasMinimumIssue;
    }
  }

  checkout() {
    if (this.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Show the customer details modal instead of prompt
    this.showCustomerModal();
  }

  showCustomerModal() {
    console.log("showCustomerModal called");
    const overlay = document.getElementById("customerModalOverlay");
    const modal = document.getElementById("customerModal");
    const closeBtn = document.getElementById("customerModalClose");
    const form = document.getElementById("customerForm");
    const nameInput = document.getElementById("customerName");
    const emailInput = document.getElementById("customerEmail");
    const phoneInput = document.getElementById("customerPhone");
    const commentsInput = document.getElementById("customerComments");
    const customerComments = commentsInput.value.trim();

    // Debugging: Verify DOM elements exist
    if (!overlay || !modal || !closeBtn || !form || !nameInput || !emailInput || !phoneInput) {
      console.error("One or more DOM elements not found:", {
        overlay, modal, closeBtn, form, nameInput, emailInput, phoneInput
      });
      alert("Error: Unable to load customer form. Please try again.");
      return;
    }

    // Show modal
    overlay.classList.add("active");
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
    nameInput.focus();

    // Close modal handler
    function closeModal() {
      overlay.classList.remove("active");
      form.removeEventListener("submit", onSubmit);
      closeBtn.removeEventListener("click", closeModal);
    }

    // Form submit handler
const onSubmit = (e) => {
  e.preventDefault();
  const customerName = nameInput.value.trim();
  const customerEmail = emailInput.value.trim();
  const customerPhone = phoneInput.value.trim();
  const customerComments = commentsInput.value.trim(); // ✅ moved here

  // Debugging: Log input values
  console.log("Form submitted with:", { customerName, customerEmail, customerPhone, customerComments });

  if (!customerName) {
    alert("Please enter your name.");
    nameInput.focus();
    return;
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    alert("Please enter a valid email address.");
    emailInput.focus();
    return;
  }
  if (!customerPhone || !/^\d{10}$/.test(customerPhone)) {
    alert("Please enter a valid 10-digit phone number.");
    phoneInput.focus();
    return;
  }

  closeModal();

  const enquiryData = {
    customer: { 
      name: customerName, 
      email: customerEmail, 
      phone: customerPhone 
    },
    items: this.items,
    total: this.getTotal(),
    enquiryDate: new Date().toISOString(),
    comments: customerComments || "No additional comments"  // ✅ now works correctly
  };



      // Debugging: Log enquiryData
      console.log("Enquiry data:", enquiryData);

      // Show loading message
      const originalCheckoutBtn = document.getElementById("checkoutBtn");
      const originalText = originalCheckoutBtn.innerHTML;
      originalCheckoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      originalCheckoutBtn.disabled = true;

      setTimeout(() => {
        this.sendEnquiryEmail(enquiryData);
        originalCheckoutBtn.innerHTML = originalText;
        originalCheckoutBtn.disabled = false;
        alert(
          `Thank you ${enquiryData.customer.name}! Your enquiry has been sent. We'll contact you at ${enquiryData.customer.phone} within 24 hours.`
        );
        this.clearCart();
        this.closeCart();
      }, 1000);
    };

    form.addEventListener("submit", onSubmit);
    closeBtn.addEventListener("click", closeModal);
  }

  sendEnquiryEmail(enquiryData) {
    console.log("Full enquiryData:", enquiryData);
    console.log("Items array:", enquiryData.items);

const templateParams = {
  customer_name: enquiryData.customer.name,
  customer_email: enquiryData.customer.email,
  customer_phone: enquiryData.customer.phone,
  cart_details: enquiryData.items.length > 0 
    ? enquiryData.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('<br>')
    : "No items found in cart",
  total: enquiryData.total,
  date: enquiryData.enquiryDate,
  time: new Date(enquiryData.enquiryDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  comments: enquiryData.comments
};


    console.log("Final templateParams before send:", templateParams);

    emailjs.send('service_gck0dih', 'template_lk0plwf', templateParams)
      .then(function(response) {
        console.log("Email sent successfully:", response);
        alert('Enquiry sent successfully!');
      }, function(error) {
        console.error("Email sending failed:", error);
        alert('Failed to send enquiry. Please try again.');
      });
  }

  findProductById(id) {
    // Search in best sellers
    let product = productData.bestSellers.find((p) => p.id === id);
    if (product) return product;

    // Search in categories
    for (const category of Object.values(productData.categories)) {
      product = category.find((p) => p.id === id);
      if (product) return product;
    }

    return null;
  }
}

// Product data
const productData = {
  bestSellers: [
    {
      id: "1",
      name: "Royal Marathi Wedding Card",
      price: 399,
      originalPrice: 499,
      rating: 4.9,
      reviews: 234,
      image: "Sample/Aadhya.jpg"
    },
    {
      id: "2",
      name: "Elegant Punjabi Invitation",
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 189,
      image: "Sample/gruhpravesh_tejas.jpg",
      badge: "NEW",
    },
    {
      id: "3",
      name: "Traditional South Indian Card",
      price: 349,
      originalPrice: 449,
      rating: 4.9,
      reviews: 156,
      image: "Sample/pooja_printready_file_maroon_ol.jpg",
      badge: "POPULAR",
    },
    {
      id: "4",
      name: "Modern Gujarati Design",
      price: 279,
      originalPrice: 359,
      rating: 4.7,
      reviews: 98,
      image: "Sample/mehandi.jpg",
      badge: "SALE",
    },
  ],
  categories: {
    wedding: [
      {
        id: "w1",
        name: "Royal Marathi Wedding",
        price: 399,
        image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=400&fit=crop",
        rating: 4.9,
      },
      {
        id: "w2",
        name: "Elegant Punjabi Card",
        price: 299,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.8,
      },
      {
        id: "w3",
        name: "Traditional South Indian",
        price: 349,
        image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop",
        rating: 4.9,
      },
      {
        id: "w4",
        name: "Modern Gujarati Design",
        price: 279,
        image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=400&fit=crop",
        rating: 4.7,
      },
    ],
    engagement: [
      {
        id: "e1",
        name: "Rose Gold Engagement",
        price: 249,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.8,
      },
      {
        id: "e2",
        name: "Classic Ring Design",
        price: 199,
        image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop",
        rating: 4.6,
      },
      {
        id: "e3",
        name: "Floral Engagement Card",
        price: 229,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.7,
      },
      {
        id: "e4",
        name: "Modern Minimalist",
        price: 189,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.5,
      },
    ],
    "baby-shower": [
      {
        id: "b1",
        name: "Cute Baby Elephant",
        price: 179,
        image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=400&fit=crop",
        rating: 4.9,
      },
      {
        id: "b2",
        name: "Pink Princess Theme",
        price: 159,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.8,
      },
      {
        id: "b3",
        name: "Blue Safari Adventure",
        price: 169,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.7,
      },
      {
        id: "b4",
        name: "Gender Neutral Stars",
        price: 149,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.6,
      },
    ],
    festival: [
      {
        id: "f1",
        name: "Diwali Celebration",
        price: 129,
        image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=400&fit=crop",
        rating: 4.8,
      },
      {
        id: "f2",
        name: "Raksha Bandhan Special",
        price: 99,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.7,
      },
      {
        id: "f3",
        name: "Holi Colors",
        price: 109,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
        rating: 4.6,
      },
      {
        id: "f4",
        name: "Ganesh Chaturthi",
        price: 139,
        image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=400&fit=crop",
        rating: 4.9,
      },
    ],
  },
};

// Product rendering functions
function renderStars(rating) {
  return Array(5)
    .fill(0)
    .map((_, i) => `<i class="fas fa-star star"></i>`)
    .join("");
}

function renderProductCard(product) {
  const badgeClass = {
    BESTSELLER: "badge-bestseller",
    NEW: "badge-new",
    POPULAR: "badge-popular",
    SALE: "badge-sale",
  };

  return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<div class="product-badge ${badgeClass[product.badge]}">${product.badge}</div>` : ""}
                <button class="product-favorite">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="product-overlay">
                    <button class="preview-btn" onclick="window.productPreview.open('${product.id}')">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h4 class="product-name">${product.name}</h4>
                <div class="product-rating">
                    <div class="stars">${renderStars(product.rating)}</div>
                    <span class="rating-count">(${product.reviews || Math.floor(product.rating * 50)})</span>
                </div>
                <div class="product-pricing">
                    <div class="price-section">
                        <span class="current-price">₹${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ""}
                    </div>
                    <button class="add-to-cart-btn" onclick="window.cart.addItem('${product.id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

// Category functionality
class CategoryManager {
  constructor() {
    this.selectedCategory = null;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Category buttons
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.target.dataset.category;
        this.toggleCategory(category);
      });
    });

    // Close expanded category
    document.getElementById("closeExpanded").addEventListener("click", () => {
      this.closeCategory();
    });
  }

  toggleCategory(category) {
    if (this.selectedCategory === category) {
      this.closeCategory();
    } else {
      this.openCategory(category);
    }
  }

  openCategory(category) {
    this.selectedCategory = category;
    const expandedCategory = document.getElementById("expandedCategory");
    const expandedTitle = document.getElementById("expandedTitle");
    const expandedGrid = document.getElementById("expandedGrid");

    const categoryNames = {
      wedding: "Wedding Invitations",
      engagement: "Engagement Cards",
      "baby-shower": "Baby Shower",
      festival: "Festival Cards",
    };

    expandedTitle.textContent = categoryNames[category];
    expandedGrid.innerHTML = productData.categories[category].map((product) => renderProductCard(product)).join("");

    expandedCategory.style.display = "block";

    // Update button text
    document.querySelectorAll(".category-btn").forEach((btn) => {
      if (btn.dataset.category === category) {
        btn.textContent = "Hide Cards";
      } else {
        btn.textContent = "View Cards";
      }
    });
  }

  closeCategory() {
    this.selectedCategory = null;
    document.getElementById("expandedCategory").style.display = "none";

    // Reset button text
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.textContent = "View Cards";
    });
  }
}

// Product preview modal
class ProductPreview {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById("modalClose").addEventListener("click", () => this.close());
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target === document.getElementById("modalOverlay")) {
        this.close();
      }
    });
  }

  open(productId) {
    const product = this.findProduct(productId);
    if (!product) return;

    const modalContent = document.getElementById("modalContent");
    modalContent.innerHTML = this.renderModalContent(product);

    document.getElementById("modalOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    document.getElementById("modalOverlay").classList.remove("active");
    document.body.style.overflow = "";
  }

  findProduct(id) {
    // Search in best sellers
    let product = productData.bestSellers.find((p) => p.id === id);
    if (product) return product;

    // Search in categories
    for (const category of Object.values(productData.categories)) {
      product = category.find((p) => p.id === id);
      if (product) return product;
    }

    return null;
  }

  renderModalContent(product) {
    const badgeClass = {
      BESTSELLER: "badge-bestseller",
      NEW: "badge-new",
      POPULAR: "badge-popular",
      SALE: "badge-sale",
    };

    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    return `
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.badge ? `<div class="modal-badge ${badgeClass[product.badge]}">${product.badge}</div>` : ""}
                    <button class="modal-favorite">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="modal-details">
                    <div class="modal-product-info">
                        <h2>${product.name}</h2>
                        <div class="modal-rating">
                            <div class="stars">${renderStars(product.rating)}</div>
                            <span class="rating-count">(${product.reviews || Math.floor(product.rating * 50)} reviews)</span>
                        </div>
                        <div class="modal-pricing">
                            <span class="modal-current-price">₹${product.price}</span>
                            ${product.originalPrice ? `<span class="modal-original-price">₹${product.originalPrice}</span>` : ""}
                            ${discount > 0 ? `<span class="modal-discount">${discount}% OFF</span>` : ""}
                        </div>
                    </div>
                    <div class="modal-description">
                        <p>Exquisite traditional wedding invitation featuring intricate design work and premium cardstock. Perfect for celebrating your special day with elegance and cultural authenticity.</p>
                    </div>
                    <div class="modal-features">
                        <h4>Key Features:</h4>
                        <ul>
                            <li>• Premium 300gsm cardstock</li>
                            <li>• Gold foil embossing</li>
                            <li>• Traditional design elements</li>
                            <li>• Customizable text and colors</li>
                            <li>• Matching envelope included</li>
                            <li>• Minimum order: 50 pieces</li>
                        </ul>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-add-to-cart" onclick="window.cart.addItem('${product.id}'); window.productPreview.close();">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="modal-customize">Customize This Design</button>
                    </div>
                    <div class="modal-info">
                        <p>• Free shipping on orders above ₹500</p>
                        <p>• 7-10 business days delivery</p>
                        <p>• Quality guarantee with premium materials</p>
                    </div>
                </div>
            </div>
        `;
  }
}

// Global functions
let cart;
let productPreview;

function addToCart(productId) {
  const product = findProductById(productId);
  if (product) {
    cart.addItem(product);
  }
}

function findProductById(id) {
  // Search in best sellers
  let product = productData.bestSellers.find((p) => p.id === id);
  if (product) return product;

  // Search in categories
  for (const category of Object.values(productData.categories)) {
    product = category.find((p) => p.id === id);
    if (product) return product;
  }

  return null;
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize cart
  cart = new ShoppingCart();
  window.cart = cart;

  // Initialize category manager
  window.categoryManager = new CategoryManager();

  // Initialize product preview
  productPreview = new ProductPreview();
  window.productPreview = productPreview;

  // Render best sellers
  const bestSellersGrid = document.getElementById("bestSellersGrid");
  bestSellersGrid.innerHTML = productData.bestSellers.map((product) => renderProductCard(product)).join("");

  // // Add event listeners to best sellers add to cart buttons
  // document.addEventListener("click", (e) => {
  //   if (e.target.classList.contains("add-to-cart-btn")) {
  //     e.preventDefault();
  //     const productCard = e.target.closest(".product-card");
  //     const productName = productCard.querySelector(".product-name").textContent;

  //     // Find product in all data
  //     let product = productData.bestSellers.find((p) => p.name === productName);
  //     if (!product) {
  //       // Search in categories
  //       for (const category of Object.values(productData.categories)) {
  //         product = category.find((p) => p.name === productName);
  //         if (product) break;
  //       }
  //     }

  //     if (product) {
  //       cart.addItem(product);
  //     }
  //   }
  // });

  // Add event listeners to preview buttons
  document.querySelectorAll(".preview-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productCard = e.target.closest(".product-card");
      const productName = productCard.querySelector(".product-name").textContent;
      const product = productData.bestSellers.find((p) => p.name === productName);
      if (product) {
        productPreview.open(product.id);
      }
    });
  });

  // Newsletter form
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = this.querySelector(".newsletter-input").value;
      if (email) {
        alert("Thank you for subscribing!");
        this.querySelector(".newsletter-input").value = "";
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      alert("Mobile menu clicked");
    });
  }

  // Search functionality
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      alert("Search clicked");
    });
  }

  // User account
  const userBtn = document.getElementById("userBtn");
  if (userBtn) {
    userBtn.addEventListener("click", () => {
      alert("User account clicked");
    });
  }

  // Test checkout functionality
  window.testCheckout = () => {
    console.log("Testing checkout...");
    console.log("Cart items:", cart.items);
    console.log("Cart total:", cart.getTotal());

    if (cart.items.length === 0) {
      // Add a test item
      cart.addItem(productData.bestSellers[0]);
      console.log("Added test item, cart now has:", cart.items);
    }

    cart.checkout();
  };

  emailjs.init('IuRMnWOWyQKDfBQIy'); // Your EmailJS public key

  const contactNavBtn = document.getElementById("contactNavBtn");
  if (contactNavBtn) {
    contactNavBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const contactSection = document.getElementById("contactSection");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});