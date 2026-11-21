(function () {
  const SUPABASE_URL = "https://hemvjkcnygxmxeetrwoi.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_gnImXdkgp-uBWMXZYMLvlQ_cu8DMyyW";

  const sb = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  const modal = document.getElementById("purchase-modal");
  const form = document.getElementById("purchase-form");
  const ticketNameEl = document.getElementById("modal-ticket-name");
  const totalEl = document.getElementById("modal-total");
  const statusEl = document.getElementById("purchase-status");
  const cardFields = document.getElementById("card-fields");
  const quantityInput = form ? form.querySelector('input[name="quantity"]') : null;
  const paymentSelect = form ? form.querySelector('select[name="payment"]') : null;

  let currentTicket = null;
  let ticketTypes = {};

  // Load ticket types from Supabase
  async function loadTicketTypes() {
    if (!supabase) return;
    try {
      const { data, error } = await sb.from("ticket_types").select("*");
      if (error) throw error;
      (data || []).forEach((t) => {
        ticketTypes[t.name] = t;
      });
    } catch (e) {
      console.error("Failed to load ticket types:", e);
    }
  }

  function openModal(ticketName) {
    currentTicket = ticketName;
    const t = ticketTypes[ticketName];
    ticketNameEl.textContent = t ? `${t.name} — ₩${Number(t.price).toLocaleString("ko-KR")}/인` : ticketName;
    statusEl.textContent = "";
    form.reset();
    quantityInput.value = 1;
    updateTotal();
    toggleCardFields();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function updateTotal() {
    const t = ticketTypes[currentTicket];
    const q = Math.max(1, parseInt(quantityInput.value || "1", 10));
    const price = t ? Number(t.price) : 0;
    totalEl.textContent = "₩" + (price * q).toLocaleString("ko-KR");
  }

  function toggleCardFields() {
    const method = paymentSelect.value;
    if (method === "card") {
      cardFields.style.display = "block";
      cardFields.querySelectorAll("input").forEach((i) => (i.required = true));
    } else {
      cardFields.style.display = "none";
      cardFields.querySelectorAll("input").forEach((i) => (i.required = false));
    }
  }

  // Event bindings
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-btn");
    if (btn) {
      e.preventDefault();
      openModal(btn.dataset.ticket);
      return;
    }
    if (e.target.hasAttribute("data-close-modal") || e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  if (quantityInput) quantityInput.addEventListener("input", updateTotal);
  if (paymentSelect) paymentSelect.addEventListener("change", toggleCardFields);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!sb) {
        statusEl.textContent = "Supabase 클라이언트를 불러오지 못했습니다.";
        statusEl.style.color = "#c64545";
        return;
      }
      const t = ticketTypes[currentTicket];
      if (!t) {
        statusEl.textContent = "티켓 정보를 찾을 수 없습니다.";
        statusEl.style.color = "#c64545";
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "처리 중...";
      statusEl.textContent = "결제 처리 중입니다...";
      statusEl.style.color = "#6c6a64";

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const address = form.address.value.trim();
      const email = form.email.value.trim();
      const quantity = Math.max(1, parseInt(form.quantity.value, 10));
      const payment = form.payment.value;
      const unitPrice = Number(t.price);
      const total = unitPrice * quantity;

      // Simulate payment processing delay
      await new Promise((r) => setTimeout(r, 900));

      try {
        const { data, error } = await sb.from("ticket_orders").insert({
          ticket_type_id: t.id,
          buyer_name: name,
          buyer_email: email,
          buyer_phone: phone,
          buyer_address: address,
          quantity: quantity,
          unit_price: unitPrice,
          total_amount: total,
          status: "paid",
          payment_method: payment,
        }).select();

        if (error) throw error;

        statusEl.textContent = "결제가 완료되었습니다! 주문번호: " + (data && data[0] ? data[0].id.slice(0, 8) : "");
        statusEl.style.color = "#5db872";
        submitBtn.textContent = "완료";
        setTimeout(() => {
          closeModal();
          submitBtn.disabled = false;
          submitBtn.textContent = "결제하기";
        }, 1800);
      } catch (err) {
        console.error(err);
        statusEl.textContent = "결제 실패: " + (err.message || "알 수 없는 오류");
        statusEl.style.color = "#c64545";
        submitBtn.disabled = false;
        submitBtn.textContent = "결제하기";
      }
    });
  }

  loadTicketTypes();
})();
