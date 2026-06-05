// ==================== CART STATE ====================
let cartItems = [];
let deliveryArea = "inside";
let cartHydrated = false;

function loadCart() {
  try {
    const saved = localStorage.getItem("noble-notes-cart");
    if (saved) cartItems = JSON.parse(saved);
    const area = localStorage.getItem("noble-notes-delivery");
    if (area === "inside" || area === "outside") deliveryArea = area;
  } catch (e) {}
  cartHydrated = true;
  updateCartUI();
}

function saveCart() {
  if (!cartHydrated) return;
  localStorage.setItem("noble-notes-cart", JSON.stringify(cartItems));
  localStorage.setItem("noble-notes-delivery", deliveryArea);
}

function addItem(item) {
  const existing = cartItems.find(i => i.productId === item.productId && i.size === item.size);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cartItems.push({ ...item, id: item.productId + "-" + item.size + "-" + Date.now() });
  }
  saveCart();
  updateCartUI();
}

function removeItem(id) {
  cartItems = cartItems.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  if (document.getElementById("page-cart")?.classList.contains("active")) renderCartPage();
}

function updateQuantity(id, qty) {
  if (qty <= 0) { removeItem(id); return; }
  const item = cartItems.find(i => i.id === id);
  if (item) { item.quantity = qty; }
  saveCart();
  updateCartUI();
  if (document.getElementById("page-cart")?.classList.contains("active")) renderCartPage();
}

function clearCart() {
  cartItems = [];
  saveCart();
  updateCartUI();
}

function getTotalItems() {
  return cartItems.reduce((sum, i) => sum + i.quantity, 0);
}

function getTotalPrice() {
  return cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function getDeliveryCharge() {
  return deliveryArea === "inside" ? 70 : 130;
}

function getGrandTotal() {
  return getTotalPrice() + getDeliveryCharge();
}

function updateCartUI() {
  const badge = document.getElementById("cart-badge");
  const count = getTotalItems();
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 9 ? "9+" : count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }
}

// ==================== UTILITY ====================
function debounce(fn, ms) {
  let timer;
  return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), ms); };
}

// ==================== ROUTING ====================
function navigate(hash) {
  const rawRoute = hash.replace("#", "") || "home";
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  let pageId = rawRoute;
  let productId = null;

  if (rawRoute.startsWith("product-")) {
    pageId = "product";
    productId = rawRoute.replace("product-", "");
  }

  const page = document.getElementById("page-" + pageId);
  if (page) {
    page.classList.add("active");
    document.title = getPageTitle(pageId);
    if (pageId === "cart") renderCartPage();
    else if (pageId === "checkout") renderCheckoutPage();
    else if (pageId === "decants") renderListing("decants");
    else if (pageId === "full-bottles") renderListing("full-bottles");
    else if (pageId === "contact") initContactForm();
    else if (pageId === "home") { initHero(); initBrandRibbon(); renderFeaturedProducts(); renderTestimonialsSection(); }
    else if (pageId === "product" && productId) renderProductDetail(productId);
  }
  window.scrollTo(0, 0);
  closeMobileMenu();
}

function getPageTitle(route) {
  const titles = {
    home: "Noble Notes | Premium Fragrance Decants & Full Bottles",
    decants: "Fragrance Decants | Noble Notes",
    "full-bottles": "Full Bottles | Noble Notes",
    cart: "Shopping Cart | Noble Notes",
    checkout: "Checkout | Noble Notes",
    contact: "Contact Us | Noble Notes",
  };
  return titles[route] || "Noble Notes";
}

// ==================== NAVBAR ====================
function initNavbar() {
  const nav = document.querySelector(".navbar");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle("scrolled", window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  document.getElementById("menu-btn").addEventListener("click", () => {
    const menu = document.getElementById("mobile-menu");
    const hamburger = document.getElementById("menu-icon-hamburger");
    const close = document.getElementById("menu-icon-close");
    menu.classList.toggle("open");
    const isOpen = menu.classList.contains("open");
    if (hamburger) hamburger.style.display = isOpen ? "none" : "block";
    if (close) close.style.display = isOpen ? "block" : "none";
  });

  document.getElementById("search-btn").addEventListener("click", () => {
    document.getElementById("search-overlay").classList.add("open");
    setTimeout(() => document.getElementById("search-input-overlay").focus(), 100);
  });

  document.getElementById("search-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeSearchOverlay();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearchOverlay();
      document.getElementById("mobile-menu").classList.remove("open");
    }
  });
}

function closeMobileMenu() {
  document.getElementById("mobile-menu").classList.remove("open");
}

function closeSearchOverlay() {
  document.getElementById("search-overlay").classList.remove("open");
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".animate-on-scroll").forEach(el => observer.observe(el));
  return observer;
}

// ==================== HERO ====================
function initHero() {
  const hero = document.getElementById("hero-bg");
  if (!hero) return;
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    hero.style.setProperty("--mouse-x", x + "px");
    hero.style.setProperty("--mouse-y", y + "px");
  });
}

// ==================== HOME PAGE ====================
function initHomePage() {
  initHero();
  initBrandRibbon();
  renderFeaturedProducts();
  renderTestimonialsSection();
}

// ==================== BRAND RIBBON ====================
function initBrandRibbon() {
  const container = document.getElementById("brand-scroll");
  if (!container) return;
  const brands = ["Creed","Nishane","Xerjoff","Amouage","Parfums de Marly","Mancera","Montale","Maison Francis Kurkdjian","Roja Parfums","Initio","Louis Vuitton","Tom Ford","Dior","Chanel","Byredo","Kilian"];
  let html = "";
  for (let r = 0; r < 2; r++) {
    brands.forEach((b, i) => {
      html += '<div class="brand-item"><span class="brand-name">' + b + '</span>';
      if (i < brands.length - 1) html += '<span class="brand-sep">&#10022;</span>';
      html += '</div>';
    });
  }
  container.innerHTML = html;
  container.addEventListener("mouseenter", () => container.style.animationPlayState = "paused");
  container.addEventListener("mouseleave", () => container.style.animationPlayState = "running");
}

// ==================== PRODUCT CARD RENDER ====================
function renderProductCard(product, index) {
  const minPrice = Math.min(...product.sizes.filter(s => s.inStock).map(s => s.price));
  const topNotes = product.notes.top.slice(0, 3);
  const sizes = product.sizes.slice(0, 4);
  const firstSize = product.sizes[0];

  return `
    <div class="product-card" style="animation-delay: ${index * 0.1}s">
      <div class="product-card-inner">
        <div class="product-card-glow"></div>
        <div class="product-card-badge">${product.concentration}</div>
        <a href="#/product-${product.id}" class="block">
          <div class="product-card-image">
            <div class="product-card-image-glow"></div>
            <span class="emoji">&#127873;</span>
          </div>
        </a>
        <div class="product-card-body">
          <p class="product-card-brand">${product.brand}</p>
          <a href="#/product-${product.id}"><h3 class="product-card-title">${product.name}</h3></a>
          <div class="product-card-notes">
            ${topNotes.map(n => '<span class="product-card-note">' + n + '</span>').join("")}
          </div>
          <div class="product-card-sizes" data-product-id="${product.id}">
            ${sizes.map(s => '<button class="product-card-size' + (s.ml === firstSize.ml ? ' active' : '') + '" data-ml="' + s.ml + '" data-price="' + s.price + '">' + s.ml + 'ml</button>').join("")}
          </div>
          <div class="product-card-footer">
            <div>
              <p class="product-card-price-label">from</p>
              <p class="product-card-price gold-text">&#2547;${firstSize.price}</p>
            </div>
            <div class="product-card-actions">
              <a href="#/product-${product.id}" class="product-card-btn view">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </a>
              <button class="product-card-btn cart" data-product-id="${product.id}" data-brand="${product.brand}" data-name="${product.name}" data-size="${firstSize.ml}" data-price="${firstSize.price}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="product-card-ring"></div>
      </div>
    </div>
  `;
}

// ==================== REVEAL PRODUCT CARDS ====================
function revealProductCards(container) {
  const cards = container.querySelectorAll(".product-card");
  cards.forEach((card, i) => {
    const delay = parseFloat(card.style.animationDelay) || i * 0.1;
    setTimeout(() => card.classList.add("visible"), delay * 1000);
  });
}

// ==================== FEATURED PRODUCTS ====================
function renderFeaturedProducts() {
  const container = document.getElementById("featured-grid");
  if (!container) return;
  const featured = getFeaturedProducts().filter(p => p.isDecant).slice(0, 6);
  container.innerHTML = featured.map((p, i) => renderProductCard(p, i)).join("");
  initProductCardEvents(container);
  revealProductCards(container);
}

// ==================== PRODUCT CARD EVENTS ====================
function initProductCardEvents(container) {
  container.addEventListener("click", function(e) {
    const sizeBtn = e.target.closest(".product-card-size");
    if (sizeBtn) {
      e.preventDefault();
      const parent = sizeBtn.closest(".product-card-sizes");
      parent.querySelectorAll(".product-card-size").forEach(b => b.classList.remove("active"));
      sizeBtn.classList.add("active");
      const price = parseFloat(sizeBtn.dataset.price);
      const ml = parseFloat(sizeBtn.dataset.ml);
      const card = sizeBtn.closest(".product-card-inner") || sizeBtn.closest(".product-card");
      const priceEl = card.querySelector(".product-card-price");
      if (priceEl) priceEl.textContent = "৳" + price;
      const cartBtn = card.querySelector(".product-card-btn.cart");
      if (cartBtn) {
        cartBtn.dataset.size = ml;
        cartBtn.dataset.price = price;
      }
      return;
    }

    const cartBtn = e.target.closest(".product-card-btn.cart");
    if (cartBtn) {
      e.preventDefault();
      e.stopPropagation();
      addItem({
        productId: cartBtn.dataset.productId,
        brand: cartBtn.dataset.brand,
        name: cartBtn.dataset.name,
        size: parseFloat(cartBtn.dataset.size),
        price: parseFloat(cartBtn.dataset.price),
        quantity: 1,
        image: ""
      });
      cartBtn.classList.add("added");
      cartBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        cartBtn.classList.remove("added");
        cartBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
      }, 1500);
    }
  });
}

// ==================== LISTING PAGES ====================
let listingSearchQuery = "";
let listingFilters = {
  brands: [],
  families: [],
  notes: [],
  priceRange: null,
  availability: "all"
};

function renderListing(type) {
  const productsList = type === "decants" ? getDecants() : getFullBottles();
  const title = type === "decants" ? "Fragrance Decants" : "Full Bottles";
  const tagline = type === "decants" ? "Niche & Designer" : "The Complete Collection";
  const subtitle = type === "decants"
    ? "Explore our curated collection of premium fragrance decants. Discover new scents without the full bottle commitment."
    : "Invest in your signature scent with our collection of full bottles. Authentic fragrances from the world's most prestigious houses.";

  const container = document.getElementById("listing-main-" + type);
  const sidebar = document.getElementById("listing-sidebar-" + type);

  if (!container) return;

  // Cache DOM refs
  const titleEl = document.getElementById("listing-title-" + type);
  const tagEl = document.getElementById("listing-tag-" + type);
  const subEl = document.getElementById("listing-subtitle-" + type);
  if (titleEl) titleEl.textContent = title;
  if (tagEl) tagEl.textContent = tagline;
  if (subEl) subEl.textContent = subtitle;

  // Init search
  const searchInput = document.getElementById("search-input-" + type);
  if (searchInput) {
    searchInput.value = listingSearchQuery;
    searchInput.oninput = debounce(function() {
      listingSearchQuery = this.value;
      applyFilters(productsList, container, type);
    }, 200);
  }

  // Init filters
  renderFiltersSidebar(sidebar, type, productsList);

  // Apply initial filters
  applyFilters(productsList, container, type);
}

function applyFilters(productsList, container, type) {
  let filtered = productsList.filter(product => {
    if (listingSearchQuery) {
      const q = listingSearchQuery.toLowerCase();
      const matches = product.brand.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q) ||
        product.notes.top.some(n => n.toLowerCase().includes(q)) ||
        product.notes.middle.some(n => n.toLowerCase().includes(q)) ||
        product.notes.base.some(n => n.toLowerCase().includes(q));
      if (!matches) return false;
    }
    if (listingFilters.brands.length > 0 && !listingFilters.brands.includes(product.brand)) return false;
    if (listingFilters.families.length > 0 && !listingFilters.families.includes(product.family)) return false;
    if (listingFilters.notes.length > 0) {
      const allNotes = [...product.notes.top, ...product.notes.middle, ...product.notes.base];
      if (!listingFilters.notes.some(n => allNotes.includes(n))) return false;
    }
    if (listingFilters.priceRange) {
      const minPrice = Math.min(...product.sizes.map(s => s.price));
      if (minPrice < listingFilters.priceRange.min || minPrice > listingFilters.priceRange.max) return false;
    }
    if (listingFilters.availability === "inStock") {
      if (!product.sizes.some(s => s.inStock)) return false;
    }
    return true;
  });

  const countEl = document.getElementById("listing-count-" + type);
  if (countEl) countEl.textContent = "Showing " + filtered.length + " of " + productsList.length + " " + (type === "decants" ? "decants" : "bottles");

  if (filtered.length === 0) {
    container.innerHTML = `<div class="no-results"><div class="no-results-icon"><span>&#128270;</span></div><p class="no-results-title">No ${type === "decants" ? "fragrances" : "bottles"} found</p><p class="no-results-text">Try adjusting your search or filters</p></div>`;
  } else {
    container.innerHTML = `<div class="product-grid cols-3">${filtered.map((p, i) => renderProductCard(p, i)).join("")}</div>`;
    initProductCardEvents(container);
    revealProductCards(container);
  }
}

function renderFiltersSidebar(sidebar, type, productsList) {
  if (!sidebar) return;
  const activeCount = Object.values(listingFilters).reduce((sum, val) => {
    if (Array.isArray(val)) return sum + val.length;
    if (val && typeof val === "object") return sum + 1;
    if (val && val !== "all") return sum + 1;
    return sum;
  }, 0);

  sidebar.innerHTML = `
    <div class="filters-header">
      <button class="filters-toggle" id="filters-toggle-${type}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        <span class="text-sm font-medium">Filters</span>
        ${activeCount > 0 ? '<span class="filters-count">' + activeCount + '</span>' : ''}
      </button>
      ${activeCount > 0 ? '<button class="filters-clear" id="filters-clear-' + type + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Clear all</button>' : ''}
    </div>
    <div class="filters-panel glass-card open" id="filters-panel-${type}">
      <div class="filters-inner">
        <!-- Brand Filter -->
        <div class="filter-section">
          <button class="filter-section-header" data-section="brands-${type}">
            <span class="filter-section-label">Brand</span>
            <svg class="filter-chevron open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="filter-options" id="filter-brands-${type}" style="display:block">
            ${brandsList.map(b => '<label class="filter-option"><input type="checkbox" value="' + b + '"' + (listingFilters.brands.includes(b) ? ' checked' : '') + '><span class="filter-option-label">' + b + '</span></label>').join("")}
          </div>
        </div>
        <!-- Price Range -->
        <div class="filter-section">
          <button class="filter-section-header" data-section="price-${type}">
            <span class="filter-section-label">Price Range</span>
            <svg class="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="filter-options" id="filter-price-${type}" style="display:none">
            ${priceRanges.map(r => '<label class="filter-option"><input type="radio" name="price-' + type + '" value=\'' + JSON.stringify({min: r.min, max: r.max}) + '\'' + (listingFilters.priceRange && listingFilters.priceRange.min === r.min ? ' checked' : '') + '><span class="filter-option-label">' + r.label + '</span></label>').join("")}
          </div>
        </div>
        <!-- Fragrance Family -->
        <div class="filter-section">
          <button class="filter-section-header" data-section="families-${type}">
            <span class="filter-section-label">Fragrance Family</span>
            <svg class="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="filter-options" id="filter-families-${type}" style="display:none">
            ${fragranceFamilies.map(f => '<label class="filter-option"><input type="checkbox" value="' + f + '"' + (listingFilters.families.includes(f) ? ' checked' : '') + '><span class="filter-option-label">' + f + '</span></label>').join("")}
          </div>
        </div>
        <!-- Notes -->
        <div class="filter-section">
          <button class="filter-section-header" data-section="notes-${type}">
            <span class="filter-section-label">Notes</span>
            <svg class="filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="filter-options" id="filter-notes-${type}" style="display:none">
            <div class="filter-notes-wrap">
              ${allNotes.slice(0, 20).map(n => '<button class="filter-note-btn' + (listingFilters.notes.includes(n) ? ' active' : '') + '" data-note="' + n + '">' + n + '</button>').join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Filter toggle
  const toggle = document.getElementById("filters-toggle-" + type);
  const panel = document.getElementById("filters-panel-" + type);
  if (toggle && panel) {
    toggle.addEventListener("click", () => panel.classList.toggle("open"));
  }

  // Filter section toggles
  sidebar.querySelectorAll(".filter-section-header").forEach(header => {
    header.addEventListener("click", function() {
      const section = this.dataset.section;
      const content = document.getElementById("filter-" + section);
      const chevron = this.querySelector(".filter-chevron");
      if (content) {
        const isOpen = content.style.display !== "none";
        content.style.display = isOpen ? "none" : "block";
        if (chevron) chevron.classList.toggle("open");
      }
    });
  });

  // Brand checkbox changes
  sidebar.querySelectorAll("#filter-brands-" + type + " input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", function() {
      listingFilters.brands = Array.from(sidebar.querySelectorAll("#filter-brands-" + type + " input[type=checkbox]:checked")).map(c => c.value);
      applyFilters(productsList, document.getElementById("listing-main-" + type), type);
    });
  });

  // Price radio changes
  sidebar.querySelectorAll("#filter-price-" + type + " input[type=radio]").forEach(rb => {
    rb.addEventListener("change", function() {
      const val = JSON.parse(this.value);
      listingFilters.priceRange = val;
      applyFilters(productsList, document.getElementById("listing-main-" + type), type);
    });
  });

  // Family checkbox changes
  sidebar.querySelectorAll("#filter-families-" + type + " input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", function() {
      listingFilters.families = Array.from(sidebar.querySelectorAll("#filter-families-" + type + " input[type=checkbox]:checked")).map(c => c.value);
      applyFilters(productsList, document.getElementById("listing-main-" + type), type);
    });
  });

  // Notes button changes
  sidebar.querySelectorAll(".filter-note-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const note = this.dataset.note;
      this.classList.toggle("active");
      listingFilters.notes = Array.from(sidebar.querySelectorAll(".filter-note-btn.active")).map(b => b.dataset.note);
      applyFilters(productsList, document.getElementById("listing-main-" + type), type);
    });
  });

  // Clear filters
  const clearBtn = document.getElementById("filters-clear-" + type);
  if (clearBtn) {
    const searchInputForClear = document.getElementById("search-input-" + type);
    clearBtn.addEventListener("click", function() {
      listingFilters = { brands: [], families: [], notes: [], priceRange: null, availability: "all" };
      listingSearchQuery = "";
      if (searchInputForClear) searchInputForClear.value = "";
      renderListing(type);
    });
  }
}

// ==================== PRODUCT DETAIL ====================
let prodDetailQty = 1;
let prodDetailSelectedSize = null;

function renderProductDetail(id) {
  const product = getProductById(id);
  const container = document.getElementById("product-detail-content");
  if (!container) return;

  if (!product) {
    container.innerHTML = `
      <div class="cart-empty"><div class="cart-empty-inner">
        <h1 class="cart-empty-title">Product Not Found</h1>
        <p class="cart-empty-text">The fragrance you're looking for doesn't exist.</p>
        <a href="#/decants" class="btn-primary">Browse Decants</a>
      </div></div>`;
    return;
  }

  prodDetailQty = 1;
  prodDetailSelectedSize = product.sizes[0];

  const related = products.filter(p => p.id !== product.id && p.brand === product.brand).slice(0, 3);

  let starsHtml = "";
  for (let i = 0; i < 5; i++) {
    starsHtml += i < Math.floor(product.rating)
      ? '<svg class="text-primary" fill="#D4AF37" width="14" height="14" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
      : '<svg fill="#4b5563" width="14" height="14" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }

  container.innerHTML = `
    <a href="#/decants" class="d-flex align-items-center gap-2" style="display:inline-flex;align-items:center;gap:0.5rem;color:#9ca3af;margin-bottom:2rem;font-size:0.875rem">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Back to ${product.isDecant ? "Decants" : "Full Bottles"}
    </a>

    <div class="product-detail-grid">
      <div>
        <div class="product-gallery-main" id="gallery-main">
          <div class="gallery-main-inner">
            <div class="gallery-main-glow"></div>
            <span class="gallery-main-emoji">&#127873;</span>
          </div>
          <button class="gallery-nav-btn gallery-nav-prev" id="gallery-prev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button class="gallery-nav-btn gallery-nav-next" id="gallery-next"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
          <div class="gallery-dots" id="gallery-dots">
            ${product.images.map((_, i) => '<button class="gallery-dot ' + (i === 0 ? 'active' : 'inactive') + '"></button>').join("")}
          </div>
        </div>
        <div class="gallery-thumbs">
          ${product.images.map((_, i) => '<button class="gallery-thumb ' + (i === 0 ? 'active' : 'inactive') + '"><span>&#127873;</span></button>').join("")}
        </div>
      </div>

      <div>
        <p class="prod-brand">${product.brand}</p>
        <h1 class="prod-name">${product.name}</h1>
        <div class="prod-rating">
          <div class="prod-stars">${starsHtml}</div>
          <span class="prod-rating-text">${product.rating} (${product.reviews} reviews)</span>
          <span class="prod-conc">${product.concentration}</span>
        </div>

        <div class="prod-meta glass-card" style="margin-top:1.5rem">
          <div class="prod-meta-grid">
            <div><p class="prod-meta-label">Release Year</p><p class="prod-meta-value">${product.releaseYear}</p></div>
            <div><p class="prod-meta-label">Perfumer</p><p class="prod-meta-value">${product.perfumer}</p></div>
            <div><p class="prod-meta-label">Family</p><p class="prod-meta-value">${product.family}</p></div>
          </div>
        </div>

        <div class="prod-notes-section">
          <h3>Fragrance Notes</h3>
          ${["Top Notes", "Middle Notes", "Base Notes"].map((label, li) => {
            const key = li === 0 ? "top" : li === 1 ? "middle" : "base";
            return '<div class="prod-notes-layer"><p class="prod-notes-layer-label">' + label + '</p><div class="prod-notes-tags">' + product.notes[key].map(n => '<span class="prod-notes-tag">' + n + '</span>').join("") + '</div></div>';
          }).join("")}
        </div>

        <div class="prod-sizes">
          <h3>Available Sizes</h3>
          <div class="prod-sizes-grid" id="prod-sizes">
            ${product.sizes.map(s => {
              let cls = "prod-size-btn ";
              if (!s.inStock) cls += "out-of-stock";
              else if (s.ml === product.sizes[0].ml) cls += "selected";
              else cls += "available";
              return '<button class="' + cls + '" data-ml="' + s.ml + '" data-price="' + s.price + '" data-stock="' + s.inStock + '"><p class="prod-size-ml">' + s.ml + 'ml</p><p class="prod-size-price gold-text">&#2547;' + s.price + '</p>' + (!s.inStock ? '<p class="prod-size-oos">Out of Stock</p>' : '') + '</button>';
            }).join("")}
          </div>
        </div>

        <div class="prod-qty" id="prod-qty-wrap" style="${!product.sizes[0].inStock ? 'display:none' : ''}">
          <div class="prod-qty-controls">
            <button class="prod-qty-btn" id="qty-minus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            <span class="prod-qty-value" id="qty-value">1</span>
            <button class="prod-qty-btn" id="qty-plus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
        </div>

        <div class="prod-actions">
          <button class="btn-primary prod-add-btn" id="add-to-cart-btn" ${!product.sizes[0].inStock ? 'disabled' : ''}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Add to Cart - &#2547;${product.sizes[0].price}
          </button>
          <button class="prod-wishlist"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>
        </div>

        <p class="prod-note" style="margin-top:0.75rem">Free delivery on orders above 2000 BDT. Secure packaging guaranteed.</p>
      </div>
    </div>

    <div class="prod-description glass-card">
      <h3>Description</h3>
      <p>${product.description}</p>
    </div>

    ${related.length > 0 ? `
    <div>
      <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;font-weight:700;color:white;margin-bottom:2rem">More from ${product.brand}</h3>
      <div class="product-grid cols-3" id="related-grid">
        ${related.map((p, i) => renderProductCard(p, i)).join("")}
      </div>
    </div>` : ""}
  `;

  document.title = product.name + " | Noble Notes";

  // Init gallery
  let galleryIdx = 0;
  const dots = container.querySelectorAll(".gallery-dot");
  const thumbs = container.querySelectorAll(".gallery-thumb");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");

  function updateGallery(i) {
    galleryIdx = i;
    dots.forEach((d, idx) => {
      d.className = "gallery-dot " + (idx === i ? "active" : "inactive");
    });
    thumbs.forEach((t, idx) => {
      t.className = "gallery-thumb " + (idx === i ? "active" : "inactive");
    });
  }

  if (prevBtn) prevBtn.addEventListener("click", () => {
    updateGallery((galleryIdx - 1 + product.images.length) % product.images.length);
  });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    updateGallery((galleryIdx + 1) % product.images.length);
  });
  dots.forEach((d, i) => {
    d.addEventListener("click", () => updateGallery(i));
  });
  thumbs.forEach((t, i) => {
    t.addEventListener("click", () => updateGallery(i));
  });

  // Event delegation for size, qty, and add-to-cart
  const prodActions = container.querySelector(".product-detail-grid");
  if (prodActions) {
    prodActions.addEventListener("click", function(e) {
      const sizeBtn = e.target.closest(".prod-size-btn");
      if (sizeBtn) {
        if (sizeBtn.classList.contains("out-of-stock")) return;
        prodActions.querySelectorAll(".prod-size-btn").forEach(b => { b.classList.remove("selected"); b.classList.add("available"); });
        sizeBtn.classList.remove("available");
        sizeBtn.classList.add("selected");
        prodDetailSelectedSize = { ml: parseFloat(sizeBtn.dataset.ml), price: parseFloat(sizeBtn.dataset.price), inStock: sizeBtn.dataset.stock === "true" };
        const addBtn = document.getElementById("add-to-cart-btn");
        const qtyWrap = document.getElementById("prod-qty-wrap");
        if (addBtn) {
          addBtn.disabled = false;
          addBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add to Cart - ৳' + prodDetailSelectedSize.price;
        }
        if (qtyWrap) qtyWrap.style.display = "flex";
        return;
      }

      const qtyBtn = e.target.closest(".prod-qty-btn");
      if (qtyBtn) {
        const qtyVal = document.getElementById("qty-value");
        if (qtyBtn.id === "qty-minus") {
          prodDetailQty = Math.max(1, prodDetailQty - 1);
        } else if (qtyBtn.id === "qty-plus") {
          prodDetailQty = prodDetailQty + 1;
        }
        if (qtyVal) qtyVal.textContent = prodDetailQty;
        return;
      }
    });
  }

  document.getElementById("add-to-cart-btn")?.addEventListener("click", function() {
    if (this.disabled) return;
    for (let i = 0; i < prodDetailQty; i++) {
      addItem({
        productId: product.id,
        brand: product.brand,
        name: product.name,
        size: prodDetailSelectedSize.ml,
        price: prodDetailSelectedSize.price,
        quantity: 1,
        image: ""
      });
    }
    this.classList.add("added");
    this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Added to Cart';
    setTimeout(() => {
      this.classList.remove("added");
      this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add to Cart - ৳' + (prodDetailSelectedSize ? prodDetailSelectedSize.price * prodDetailQty : 0);
    }, 2000);
  });

  // Init related products
  if (related.length > 0) {
    initProductCardEvents(container);
    const relatedGrid = document.getElementById("related-grid");
    if (relatedGrid) revealProductCards(relatedGrid);
  }
}

// ==================== CART PAGE ====================
function renderCartPage() {
  const container = document.getElementById("cart-page-content");
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="cart-empty"><div class="cart-empty-inner">
        <div class="cart-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        <h1 class="cart-empty-title">Your Cart is Empty</h1>
        <p class="cart-empty-text">Looks like you haven't added any fragrances yet.</p>
        <a href="#/decants" class="btn-primary" style="display:inline-flex;align-items:center;gap:0.5rem">Start Shopping</a>
      </div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="cart-header">
      <div class="cart-header-info">
        <h1>Shopping Cart</h1>
        <p>${cartItems.reduce((s, i) => s + i.quantity, 0)} items in your cart</p>
      </div>
      <a href="#/decants" class="cart-continue"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Continue Shopping</a>
    </div>

    <div class="cart-items">
      ${cartItems.map((item, i) => `
        <div class="cart-item glass-card">
          <div class="cart-item-icon"><span>&#127873;</span></div>
          <div class="cart-item-info">
            <p class="cart-item-brand">${item.brand}</p>
            <h3 class="cart-item-name">${item.name}</h3>
            <p class="cart-item-size">${item.size}ml</p>
          </div>
          <div class="cart-qty">
            <button class="cart-qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            <span class="cart-qty-value">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          <div class="cart-item-price">
            <p class="cart-item-total gold-text">&#2547;${item.price * item.quantity}</p>
            <p class="cart-item-unit">&#2547;${item.price}/pc</p>
          </div>
          <button class="cart-item-remove" onclick="removeItem('${item.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
        </div>
      `).join("")}
    </div>

    <div class="cart-bottom">
      <div class="cart-delivery glass-card">
        <h3>Delivery Location</h3>
        <div class="cart-delivery-btns">
          <button class="cart-delivery-btn${deliveryArea === "inside" ? ' active' : ''}" onclick="setDelivery('inside')">Inside Dhaka<span class="cart-delivery-fee">70 BDT</span></button>
          <button class="cart-delivery-btn${deliveryArea === "outside" ? ' active' : ''}" onclick="setDelivery('outside')">Outside Dhaka<span class="cart-delivery-fee">130 BDT</span></button>
        </div>
      </div>
      <div class="cart-summary glass-card">
        <h3>Order Summary</h3>
        <div class="cart-summary-rows">
          <div class="cart-summary-row"><span>Subtotal (${cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span><span>&#2547;${getTotalPrice()}</span></div>
          <div class="cart-summary-row"><span>Delivery Charge</span><span>&#2547;${getDeliveryCharge()}</span></div>
          <div class="cart-summary-total"><span>Grand Total</span><span class="gold-text">&#2547;${getGrandTotal()}</span></div>
        </div>
        <a href="#/checkout" class="btn-primary cart-checkout-btn">Proceed to Checkout</a>
      </div>
    </div>
  `;
}

function setDelivery(area) {
  deliveryArea = area;
  saveCart();
  renderCartPage();
}

// ==================== CHECKOUT PAGE ====================
let checkoutForm = { name: "", phone: "", address: "" };
let checkoutSubmitted = false;

function renderCheckoutPage() {
  const container = document.getElementById("checkout-page-content");
  if (!container) return;

  if (cartItems.length === 0 && !checkoutSubmitted) {
    container.innerHTML = `
      <div class="cart-empty"><div class="cart-empty-inner">
        <div class="cart-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        <h2 class="cart-empty-title">Your cart is empty</h2>
        <p class="cart-empty-text">Add some fragrances before checking out</p>
        <a href="#/decants" class="btn-primary">Browse Fragrances</a>
      </div></div>`;
    return;
  }

  if (checkoutSubmitted) {
    container.innerHTML = `
      <div class="checkout-success">
        <div class="checkout-success-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
        <h2>Order Initiated!</h2>
        <p>Your order details have been sent via WhatsApp.</p>
        <p style="color:#6b7280;font-size:0.875rem">We will confirm your order shortly.</p>
        <a href="#/decants" class="btn-primary">Continue Shopping</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="checkout-grid">
      <div>
        <div class="glass-card checkout-form-card">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Customer Information</h3>
          <div class="space-y-4">
            <div><label class="text-xs" style="color:#9ca3af;margin-bottom:0.375rem;display:block">Full Name *</label><input type="text" id="checkout-name" class="input-field" placeholder="Your full name" value="${checkoutForm.name}"></div>
            <div><label class="text-xs" style="color:#9ca3af;margin-bottom:0.375rem;display:block">Phone Number *</label><input type="tel" id="checkout-phone" class="input-field" placeholder="01XXXXXXXXX" value="${checkoutForm.phone}"></div>
            <div><label class="text-xs" style="color:#9ca3af;margin-bottom:0.375rem;display:block">Delivery Address *</label><textarea id="checkout-address" class="input-field" rows="3" placeholder="Your full delivery address" style="resize:none">${checkoutForm.address}</textarea></div>
          </div>
        </div>

        <div class="glass-card checkout-form-card" style="margin-top:1.5rem">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> Delivery Location</h3>
          <div class="flex gap-3">
            <button class="cart-delivery-btn${deliveryArea === "inside" ? ' active' : ''}" onclick="setCheckoutDelivery('inside')">Inside Dhaka<span class="cart-delivery-fee">70 BDT</span></button>
            <button class="cart-delivery-btn${deliveryArea === "outside" ? ' active' : ''}" onclick="setCheckoutDelivery('outside')">Outside Dhaka<span class="cart-delivery-fee">130 BDT</span></button>
          </div>
        </div>
      </div>

      <div>
        <div class="glass-card checkout-form-card">
          <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> Order Summary</h3>
          <div>
            ${cartItems.map(item => `
              <div class="order-summary-item">
                <div class="order-summary-item-left">
                  <div class="order-summary-item-icon"><span>&#127873;</span></div>
                  <div><p class="order-summary-item-name">${item.name}</p><p class="order-summary-item-detail">${item.size}ml &times; ${item.quantity}</p></div>
                </div>
                <p style="color:var(--primary);font-weight:600">&#2547;${item.price * item.quantity}</p>
              </div>
            `).join("")}
          </div>
          <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.1)">
            <div class="cart-summary-rows">
              <div class="cart-summary-row"><span>Subtotal</span><span>&#2547;${getTotalPrice()}</span></div>
              <div class="cart-summary-row"><span>Delivery Charge</span><span>&#2547;${getDeliveryCharge()}</span></div>
              <div class="cart-summary-total"><span>Grand Total</span><span class="gold-text">&#2547;${getGrandTotal()}</span></div>
            </div>
          </div>
        </div>

        <button class="btn-primary w-full" id="place-order-btn" style="margin-top:1.5rem;font-size:1.125rem;display:flex;align-items:center;justify-content:center;gap:0.5rem">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Place Order via WhatsApp
        </button>
        <p style="font-size:0.75rem;color:#6b7280;text-align:center;margin-top:0.75rem">By placing this order, you agree to our terms and conditions.</p>
      </div>
    </div>
  `;

  document.getElementById("place-order-btn").addEventListener("click", handlePlaceOrder);
}

function setCheckoutDelivery(area) {
  deliveryArea = area;
  saveCart();
  renderCheckoutPage();
}

function handlePlaceOrder() {
  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const address = document.getElementById("checkout-address").value.trim();
  if (!name || !phone || !address) return;

  checkoutForm = { name, phone, address };

  let msg = "Order from Noble Notes \u{1F3EA}\n\nCustomer:\nName: " + name + "\nPhone: " + phone + "\n\nProducts:\n";
  cartItems.forEach(item => {
    msg += "* " + item.name + " " + item.size + "ml \u00d7 " + item.quantity + "\n";
  });
  msg += "\nDelivery: " + (deliveryArea === "inside" ? "Inside Dhaka" : "Outside Dhaka");
  msg += "\nDelivery Charge: " + getDeliveryCharge() + " BDT";
  msg += "\n\nGrand Total: " + getGrandTotal() + " BDT";
  msg += "\n\nDelivery Address: " + address;

  window.open("https://wa.me/8801616651333?text=" + encodeURIComponent(msg), "_blank");
  clearCart();
  checkoutSubmitted = true;
  renderCheckoutPage();
}

// ==================== CONTACT PAGE ====================
let contactForm = { name: "", phone: "", email: "", message: "" };
let contactSent = false;

function initContactForm() {
  const container = document.getElementById("contact-form-container");
  if (!container) return;

  if (contactSent) {
    container.innerHTML = `
      <div class="glass-card" style="padding:2rem;text-align:center">
        <div style="width:5rem;height:5rem;margin:0 auto 1rem;border-radius:9999px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);display:flex;align-items:center;justify-content:center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </div>
        <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.25rem;font-weight:700;color:white;margin-bottom:0.5rem">Message Sent!</h3>
        <p style="color:#9ca3af;margin-bottom:1.5rem">Your message has been sent via WhatsApp. We'll get back to you shortly.</p>
        <button class="btn-secondary" onclick="contactSent=false;initContactForm()">Send Another Message</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="glass-card" style="padding:2rem">
      <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.25rem;font-weight:700;color:white;margin-bottom:1.5rem">Send us a message</h3>
      <form onsubmit="handleContactSubmit(event)" style="display:flex;flex-direction:column;gap:1.25rem">
        <div><label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.375rem">Name *</label><input type="text" id="contact-name" class="input-field" placeholder="Your name" value="${contactForm.name}" required></div>
        <div><label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.375rem">Phone Number *</label><input type="tel" id="contact-phone" class="input-field" placeholder="01XXXXXXXXX" value="${contactForm.phone}" required></div>
        <div><label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.375rem">Email</label><input type="email" id="contact-email" class="input-field" placeholder="your@email.com" value="${contactForm.email}"></div>
        <div><label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.375rem">Message *</label><textarea id="contact-message" class="input-field" rows="5" placeholder="How can we help you?" required style="resize:none">${contactForm.message}</textarea></div>
        <button type="submit" class="btn-primary" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Send via WhatsApp
        </button>
      </form>
    </div>`;
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  const phone = document.getElementById("contact-phone").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  contactForm = { name, phone, email, message };
  const msg = encodeURIComponent("Hello Noble Notes! I'm " + name + ". " + message + "\n\nPhone: " + phone + "\nEmail: " + email);
  window.open("https://wa.me/8801616651333?text=" + msg, "_blank");
  contactSent = true;
  initContactForm();
}

// ==================== TESTIMONIALS ====================
let testimonialIdx = 0;

function renderTestimonialsSection() {
  const container = document.getElementById("testimonials-container");
  if (!container) return;
  renderTestimonial(container, testimonialIdx);
}

function renderTestimonial(container, idx) {
  const t = testimonials[idx];
  let stars = "";
  for (let i = 0; i < t.rating; i++) {
    stars += '<svg class="testimonial-star" width="16" height="16" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }

  container.innerHTML = `
    <div class="glass-card testimonial-card">
      <svg class="testimonial-quote" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/></svg>
      <div class="testimonial-stars">${stars}</div>
      <p class="testimonial-text">&ldquo;${t.text}&rdquo;</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.name.charAt(0)}</div>
        <div><p class="testimonial-name">${t.name}</p><p class="testimonial-location">${t.location}</p></div>
      </div>
    </div>
    <div class="testimonial-nav">
      <button class="testimonial-nav-btn" onclick="changeTestimonial(-1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <div class="testimonial-dots">
        ${testimonials.map((_, i) => '<button class="testimonial-dot' + (i === idx ? ' active' : '') + '" onclick="goToTestimonial(' + i + ')"></button>').join("")}
      </div>
      <button class="testimonial-nav-btn" onclick="changeTestimonial(1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
  `;
}

function changeTestimonial(dir) {
  testimonialIdx = (testimonialIdx + dir + testimonials.length) % testimonials.length;
  renderTestimonial(document.getElementById("testimonials-container"), testimonialIdx);
}

function goToTestimonial(i) {
  testimonialIdx = i;
  renderTestimonial(document.getElementById("testimonials-container"), testimonialIdx);
}

// ==================== SEARCH OVERLAY ====================
function initSearchOverlay() {
  const input = document.getElementById("search-input-overlay");
  const results = document.getElementById("search-results-overlay");

  if (!input || !results) return;

  input.addEventListener("input", debounce(function() {
    const q = this.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.remove("open"); results.innerHTML = ""; return; }

    const filtered = products.filter(p =>
      p.brand.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.notes.top.some(n => n.toLowerCase().includes(q)) ||
      p.notes.middle.some(n => n.toLowerCase().includes(q)) ||
      p.notes.base.some(n => n.toLowerCase().includes(q)) ||
      p.family.toLowerCase().includes(q)
    );

    if (filtered.length === 0) { results.classList.remove("open"); results.innerHTML = ""; return; }

    results.classList.add("open");
    results.innerHTML = filtered.map(p => {
      const minP = Math.min(...p.sizes.filter(s => s.inStock).map(s => s.price));
      const maxP = Math.max(...p.sizes.filter(s => s.inStock).map(s => s.price));
      return '<a href="#/product-' + p.id + '" class="search-result-item">' +
        '<div class="search-result-icon"><span>&#127873;</span></div>' +
        '<div class="search-result-info">' +
          '<p class="search-result-brand">' + p.brand + '</p>' +
          '<p class="search-result-name">' + p.name + '</p>' +
          '<p class="search-result-price">&#2547;' + minP + ' - &#2547;' + maxP + '</p>' +
        '</div>' +
        '<span class="search-result-tag ' + (p.isDecant ? 'decant' : 'full-bottle') + '">' + (p.isDecant ? 'Decant' : 'Full Bottle') + '</span>' +
      '</a>';
    });
  }, 200));

  results.addEventListener("click", function(e) {
    const link = e.target.closest("a.search-result-item");
    if (link) closeSearchOverlay();
  });
}

// ==================== INIT ====================
function init() {
  loadCart();
  initNavbar();
  initSearchOverlay();
  initScrollAnimations();
  initHomePage();

  // Routing
  function handleRoute() {
    const hash = window.location.hash || "#/home";
    const route = hash.replace("#/", "");
    navigate(route);
  }

  window.addEventListener("hashchange", handleRoute);

  if (!window.location.hash || window.location.hash === "#") {
    window.location.hash = "#/home";
  } else {
    handleRoute();
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("current-year").textContent = new Date().getFullYear();
  init();
});
