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

  // -------------------------------------------------------------
  // Web Audio API: Synthetic Typewriter Click Sound
  // -------------------------------------------------------------
  let audioCtx = null;

  function playTypewriterClick() {
    // Lazy initialize AudioContext on user interaction
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create a burst of white noise for the tactile key impact
    const bufferSize = audioCtx.sampleRate * 0.015; // 15ms sound
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Highpass filter to mimic metallic/mechanical snap
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000 + Math.random() * 400; // Slight pitch variation per keypress

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.015);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
  }

  // -------------------------------------------------------------
  // App Logic & State
  // -------------------------------------------------------------

  // 1. Set Today's Date automatically in the preview
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  previewDate.textContent = `Date: ${today.toLocaleDateString('en-IN', options)}`;

  // 2. Real-time Letter Text Update + Audio Trigger
  letterTextInput.addEventListener('input', (e) => {
    const text = e.target.value;
    previewBody.textContent = text.trim().length > 0 
      ? text 
      : 'Start typing on the left to see your letter come to life...';

    // Play click audio effect
    playTypewriterClick();
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
    // Remove all previous paper theme classes
    paperPreview.classList.remove(
      'parchment', 
      'kraft', 
      'rose', 
      'midnight', 
      'classic', 
      'pure-white'
    );
    // Apply selected theme class
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

  // 7. Handle Form Submission
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
