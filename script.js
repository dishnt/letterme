document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const senderNameInput = document.getElementById('senderName');
  const letterTextInput = document.getElementById('letterText');
  const fontSelect = document.getElementById('fontSelect');
  const paperSelect = document.getElementById('paperSelect');
  const waxSealCheckbox = document.getElementById('waxSeal');
  const scentedCheckbox = document.getElementById('scented');
  const letterForm = document.getElementById('letterForm');

  // DOM Elements - Preview
  const paperPreview = document.getElementById('paperPreview');
  const previewDate = document.getElementById('previewDate');
  const previewBody = document.getElementById('previewBody');
  const previewSignature = document.getElementById('previewSignature');
  const previewWaxSeal = document.getElementById('previewWaxSeal');
  const totalPriceEl = document.getElementById('totalPrice');

  // Base Pricing Configuration (INR)
  const BASE_PRICE = 49;
  const WAX_SEAL_PRICE = 29;
  const SCENTED_PRICE = 19;

  // 1. Set Today's Date automatically in the preview
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  previewDate.textContent = `Date: ${today.toLocaleDateString('en-IN', options)}`;

  // 2. Real-time Letter Text Update
  letterTextInput.addEventListener('input', (e) => {
    const text = e.target.value;
    previewBody.textContent = text.trim().length > 0 
      ? text 
      : 'Start typing on the left to see your letter come to life...';
  });

  // 3. Real-time Sender Name / Signature Update
  senderNameInput.addEventListener('input', (e) => {
    const name = e.target.value;
    previewSignature.textContent = name.trim().length > 0 ? `— ${name}` : '';
  });

  // 4. Change Font Dynamically
  fontSelect.addEventListener('change', (e) => {
    previewBody.style.fontFamily = e.target.value;
    previewSignature.style.fontFamily = e.target.value;
  });

  // Set initial default font
  previewBody.style.fontFamily = fontSelect.value;
  previewSignature.style.fontFamily = fontSelect.value;

  // 5. Change Paper Style Dynamically
  paperSelect.addEventListener('change', (e) => {
    // Remove previous paper classes
    paperPreview.classList.remove('parchment', 'classic', 'pure-white');
    // Add selected class
    paperPreview.classList.add(e.target.value);
  });

  // 6. Calculate Price and Toggle Wax Seal Preview
  function updatePriceAndAddons() {
    let total = BASE_PRICE;

    if (waxSealCheckbox.checked) {
      total += WAX_SEAL_PRICE;
      previewWaxSeal.classList.remove('hidden');
    } else {
      previewWaxSeal.classList.add('hidden');
    }

    if (scentedCheckbox.checked) {
      total += SCENTED_PRICE;
    }

    totalPriceEl.textContent = total;
  }

  waxSealCheckbox.addEventListener('change', updatePriceAndAddons);
  scentedCheckbox.addEventListener('change', updatePriceAndAddons);

  // 7. Handle Form Submission (Checkout Mock)
  letterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const orderSummary = {
      sender: senderNameInput.value,
      recipient: document.getElementById('recipientDetails').value,
      message: letterTextInput.value,
      font: fontSelect.value,
      paper: paperSelect.value,
      waxSeal: waxSealCheckbox.checked,
      fragrance: scentedCheckbox.checked,
      totalAmount: totalPriceEl.textContent
    };

    console.log('Order Submitted:', orderSummary);
    alert(`Order Created! Total payable: ₹${orderSummary.totalAmount}\n\nNext step: Connecting to Razorpay Payment Gateway!`);
  });
});
