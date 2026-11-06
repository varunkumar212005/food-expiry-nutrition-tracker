const foodList = document.getElementById("foodList");
const form = document.getElementById("foodForm");
const message = document.getElementById("formMessage");

function getStatus(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.ceil((expiry - today) / 86400000);
  if (days < 0) return { label: "Expired", className: "expired" };
  if (days <= 3) return { label: "Expiring soon", className: "soon" };
  return { label: "Safe", className: "" };
}

async function loadFoods() {
  try {
    const [foodResponse, summaryResponse] = await Promise.all([
      fetch("/api/foods"),
      fetch("/api/summary")
    ]);
    if (!foodResponse.ok || !summaryResponse.ok) throw new Error("API request failed");
    const foods = await foodResponse.json();
    const summary = await summaryResponse.json();

    document.getElementById("totalItems").textContent = summary.totalItems;
    document.getElementById("expiringSoon").textContent = summary.expiringSoon;
    document.getElementById("expired").textContent = summary.expired;
    document.getElementById("safe").textContent = summary.safe;

    if (!foods.length) {
      foodList.innerHTML = '<p class="muted">No food items yet. Add your first item using the form.</p>';
      return;
    }

    foodList.innerHTML = foods.map(food => {
      const status = getStatus(food.expiryDate);
      return `<article class="food-item">
        <div><strong>${escapeHtml(food.name)}</strong>
        <small>${escapeHtml(food.category)} · Qty: ${food.quantity} · ${food.calories} cal/serving</small></div>
        <div><span class="badge ${status.className}">${status.label}</span>
        <button class="delete" data-id="${food._id}" aria-label="Delete ${escapeHtml(food.name)}">Delete</button></div>
      </article>`;
    }).join("");
  } catch (error) {
    foodList.innerHTML = '<p class="muted">Could not load items. Check that the server and MongoDB are running.</p>';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const item = {
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value,
    expiryDate: document.getElementById("expiryDate").value,
    quantity: Number(document.getElementById("quantity").value),
    calories: Number(document.getElementById("calories").value),
    notes: document.getElementById("notes").value.trim()
  };
  try {
    const response = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not save item");
    form.reset();
    message.textContent = "Food item added successfully.";
    loadFoods();
  } catch (error) {
    message.textContent = error.message + ". Make sure the server and database are connected.";
  }
});

foodList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  try {
    const response = await fetch(`/api/foods/${button.dataset.id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Could not delete item");
    loadFoods();
  } catch (error) {
    message.textContent = error.message;
  }
});

loadFoods();
