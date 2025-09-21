// app.js - MetaMask connect only, mock TipJar functionality (no blockchain calls)

// Mock state
let connectedAccount = null;
let balance = 0;
let tipHistory = [];

// Utility: shorten address for UI
function shortAddress(addr) {
  if (!addr) return "Guest";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ----------------------------
// Connect Wallet (metaMask only)
// ----------------------------
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found. Please install MetaMask first.");
    return;
  }

  try {
    // Check if already connected (avoid forcing popup when already connected)
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      connectedAccount = accounts[0];
    } else {
      // Request connection (popup)
      const requested = await window.ethereum.request({ method: "eth_requestAccounts" });
      connectedAccount = requested[0];
    }

    // Update connect button text (show short address)
    const btn = document.getElementById("connectBtn");
    if (btn) btn.innerText = `Connected: ${shortAddress(connectedAccount)}`;

    // Update UI (balance & history)
    updateBalance();
    renderTipHistory();

    console.log("Connected account:", connectedAccount);
  } catch (err) {
    console.error("Connection rejected or error:", err);
    alert("Connection rejected! Make sure MetaMask is unlocked and you approve the connection.");
  }
}

// Optional: handle account changes in MetaMask
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (!accounts || accounts.length === 0) {
      // user disconnected
      connectedAccount = null;
      const btn = document.getElementById("connectBtn");
      if (btn) btn.innerText = "Connect Wallet";
      alert("MetaMask disconnected in the extension. Click Connect Wallet to reconnect.");
    } else {
      connectedAccount = accounts[0];
      const btn = document.getElementById("connectBtn");
      if (btn) btn.innerText = `Connected: ${shortAddress(connectedAccount)}`;
      updateBalance();
      renderTipHistory();
    }
  });
}

// ----------------------------
// Mock: Send Tip (local only)
// ----------------------------
function sendTip() {
  const amountInput = document.getElementById("tipAmount");
  const raw = amountInput ? amountInput.value : "";
  const amount = parseFloat(raw);

  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid tip amount (greater than 0).");
    return;
  }

  // Add to mock balance
  balance += amount;

  // Add to mock tip history (use connected account if available)
  tipHistory.unshift({
    from: connectedAccount ? connectedAccount : "Guest",
    amount: amount,
    when: new Date().toISOString()
  });

  // Update UI
  updateBalance();
  renderTipHistory();

  // Clear input and notify user
  if (amountInput) amountInput.value = "";
  alert(`(Mock) Tip of ${amount.toFixed(2)} SHM recorded${connectedAccount ? " from " + shortAddress(connectedAccount) : ""}.`);
}

// ----------------------------
// Mock: Withdraw (local only)
// ----------------------------
function withdraw() {
  if (balance <= 0) {
    alert("No tips to withdraw (mock).");
    return;
  }

  // For prototype simplicity we allow withdraw regardless of account
  const withdrawn = balance;
  balance = 0;
  updateBalance();

  alert(`(Mock) Withdrawn ${withdrawn.toFixed(2)} SHM to ${connectedAccount ? shortAddress(connectedAccount) : "your (mock) account"}.`);
}

// ----------------------------
// Mock: Update balance display
// ----------------------------
function updateBalance() {
  const status = document.getElementById("status");
  if (status) status.innerText = `Balance: ${balance.toFixed(2)} SHM`;
}

// ----------------------------
// Mock: Render tip history
// ----------------------------
function renderTipHistory() {
  const historyDiv = document.getElementById("tipHistory");
  if (!historyDiv) return;

  if (tipHistory.length === 0) {
    historyDiv.innerHTML = "<p>No tips yet.</p>";
    return;
  }

  // Build history HTML
  historyDiv.innerHTML = "";
  tipHistory.forEach((t, i) => {
    const p = document.createElement("p");
    // friendly timestamp
    const time = new Date(t.when).toLocaleString();
    const who = t.from === "Guest" ? "Guest" : shortAddress(t.from);
    p.innerText = `#${tipHistory.length - i}: ${t.amount.toFixed(2)} SHM — from ${who} at ${time}`;
    historyDiv.appendChild(p);
  });
}

// ----------------------------
// Expose functions to global scope (so HTML buttons can call them)
// ----------------------------
window.connectWallet = connectWallet;
window.sendTip = sendTip;
window.withdraw = withdraw;
window.updateBalance = updateBalance;
window.renderTipHistory = renderTipHistory;

// Initialize UI on page load
window.addEventListener("DOMContentLoaded", () => {
  // ensure initial UI state
  const btn = document.getElementById("connectBtn");
  if (btn) btn.innerText = "Connect Wallet";

  updateBalance();
  renderTipHistory();
});
