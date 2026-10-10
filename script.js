// MAYREL - Interaksi katalog dan keranjang belanja
// Ganti nomor di bawah dengan nomor WhatsApp toko, gunakan kode negara tanpa tanda +.
// Contoh Indonesia: 6281234567890
const NOMOR_WHATSAPP_TOKO = "6281234567890";

const cart = [];
const rupiah = (amount) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(amount);

const cartPanel = document.getElementById("cartPanel");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function openCart() {
  cartPanel.classList.add("open");
  cartBackdrop.classList.add("open");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartBackdrop.classList.remove("open");
  document.body.classList.remove("cart-open");
}

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

function addToCart(productCard) {
  const id = productCard.dataset.id;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id,
      name: productCard.dataset.name,
      price: Number(productCard.dataset.price),
      quantity: 1
    });
  }
  renderCart();
  showToast(productCard.dataset.name + " ditambahkan ke keranjang.");
}

document.querySelectorAll(".add-button").forEach(button => {
  button.addEventListener("click", () => {
    addToCart(button.closest(".product-card"));
  });
});

function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) {
    const index = cart.findIndex(product => product.id === id);
    cart.splice(index, 1);
  }
  renderCart();
}

function removeItem(id) {
  const index = cart.findIndex(product => product.id === id);
  if (index !== -1) cart.splice(index, 1);
  renderCart();
  showToast("Produk dihapus dari keranjang.");
}

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = totalQuantity;
  cartTotal.textContent = rupiah(totalPrice);

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Keranjang kamu masih kosong.</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <h3>${escapeHTML(item.name)}</h3>
        <p>${rupiah(item.price)} × ${item.quantity}</p>
        <div class="cart-controls">
          <button type="button" aria-label="Kurangi jumlah" data-action="minus" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button type="button" aria-label="Tambah jumlah" data-action="plus" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-action="remove" data-id="${item.id}">Hapus</button>
    </div>
  `).join("");
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "plus") changeQuantity(id, 1);
  if (action === "minus") changeQuantity(id, -1);
  if (action === "remove") removeItem(id);
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Keranjang masih kosong. Pilih produk terlebih dahulu.");
    return;
  }

  if (NOMOR_WHATSAPP_TOKO === "6281234567890") {
    showToast("Atur nomor WhatsApp toko di file script.js terlebih dahulu.");
    return;
  }

  const lines = cart.map(item =>
    `- ${item.name} (${item.quantity} x ${rupiah(item.price)}) = ${rupiah(item.quantity * item.price)}`
  );
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = [
    "Halo MAYREL, saya ingin memesan:",
    "",
    ...lines,
    "",
    `Total sementara: ${rupiah(total)}`,
    "Mohon info ketersediaan dan ongkir. Terima kasih."
  ].join("\n");
  const url = `https://wa.me/${NOMOR_WHATSAPP_TOKO}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

// Filter kategori
function filterProducts(category) {
  let visible = 0;
  document.querySelectorAll(".product-card").forEach(card => {
    const show = category === "semua" || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible++;
  });
  document.getElementById("noResults").hidden = visible > 0;
  document.getElementById("produk").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => filterProducts(button.dataset.filter));
});
document.getElementById("showAll").addEventListener("click", () => filterProducts("semua"));

// Menu navigasi untuk layar HP
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => mainNav.classList.remove("open"));
});
