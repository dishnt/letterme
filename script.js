document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const senderNameInput = document.getElementById('senderName');
  const letterTextInput = document.getElementById('letterText');
  const letterTextGroup = document.getElementById('letterTextGroup');
  const fontSelect = document.getElementById('fontSelect');
  const paperSelect = document.getElementById('paperSelect');
  const waxSealCheckbox = document.getElementById('waxSeal');
  const scentedCheckbox = document.getElementById('scented');
  const letterForm = document.getElementById('letterForm');

  // File Upload Elements
  const docTypeRadios = document.querySelectorAll('input[name="docType"]');
  const uploadGroup = document.getElementById('uploadGroup');
  const documentFileInput = document.getElementById('documentFile');

  // Spacing Elements
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  const lineHeightSelect = document.getElementById('lineHeightSelect');

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

  // Web Audio API: Typewriter Sound
  let audioCtx = null;
  function playTypewriterClick() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const bufferSize = audioCtx.sampleRate * 0.015;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000 + Math.random() * 400;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.015);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  }

  // 1. Set Today's Date
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  previewDate.textContent = `Date: ${today.toLocaleDateString('en-IN', options)}`;

  // 2. Real-time Letter Text Update
  letterTextInput.addEventListener('input', (e) => {
    const text = e.target.value;
    previewBody.textContent = text.trim().length > 0 
      ? text 
      : 'Start typing on the left to see your letter come to life...';
    playTypewriterClick();
    checkPageOverflow();
  });

  // 3. Sender Signature Update
  senderNameInput.addEventListener('input', (e) => {
    const name = e.target.value;
    previewSignature.textContent = name.trim().length > 0 ? `— ${name}` : '';
  });

  // 4. Font & Paper Selectors
  fontSelect.addEventListener('change', (e) => {
    previewBody.style.fontFamily = e.target.value;
    previewSignature.style.fontFamily = e.target.value;
  });

  paperSelect.addEventListener('change', (e) => {
    paperPreview.classList.remove(
      'official-a4', 'executive-cream', 'parchment', 
      'kraft', 'rose', 'midnight', 'classic', 'pure-white'
    );
    paperPreview.classList.add(e.target.value);
  });

  // 5. Radio Toggle (Type vs Upload File)
  docTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'upload') {
        uploadGroup.classList.remove('hidden');
        letterTextGroup.classList.add('hidden');
        previewBody.innerHTML = '<em>📄 Custom file upload mode selected. Choose a file on the left!</em>';
      } else {
        uploadGroup.classList.add('hidden');
        letterTextGroup.classList.remove('hidden');
        previewBody.textContent = letterTextInput.value.trim().length > 0 
          ? letterTextInput.value 
          : 'Start typing on the left to see your letter come to life...';
      }
    });
  });

  // 6. Handle File Chooser Selection
  documentFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      previewBody.innerHTML = `
        <div style="text-align: center; padding: 2rem; border: 2px dashed #8b5a2b; border-radius: 8px; background: rgba(255,255,255,0.7);">
          <p style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">📎 File Selected</p>
          <p><strong>Name:</strong> ${file.name}</p>
          <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p style="margin-top: 1rem; color: #2e7d32; font-weight: bold;">✓ Ready to print in original quality</p>
        </div>
      `;
    }
  });

  // 7. Dynamic Spacing & Page Overflow Badge
  const pageBadge = document.createElement('div');
  pageBadge.className = 'page-count-badge';
  pageBadge.textContent = 'Page 1 of 1';
  paperPreview.appendChild(pageBadge);

  fontSizeSelect.addEventListener('change', (e) => {
    previewBody.style.fontSize = e.target.value;
    checkPageOverflow();
  });

  lineHeightSelect.addEventListener('change', (e) => {
    previewBody.style.lineHeight = e.target.value;
    checkPageOverflow();
  });

  function checkPageOverflow() {
    const isOverflowing = paperPreview.scrollHeight > paperPreview.clientHeight;
    if (isOverflowing) {
      const estimatedPages = Math.ceil(paperPreview.scrollHeight / paperPreview.clientHeight);
      pageBadge.textContent = `Page 1 of ${estimatedPages} (Multi-Page)`;
      pageBadge.style.background = '#c62828';
    } else {
      pageBadge.textContent = 'Fits on 1 Page';
      pageBadge.style.background = 'rgba(0, 0, 0, 0.6)';
    }
  }

  // 8. Addons & Pricing
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

  // 9. Submit Order
  letterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderSummary = {
      sender: senderNameInput.value,
      recipient: document.getElementById('recipientDetails').value,
      docType: document.querySelector('input[name="docType"]:checked').value,
      message: letterTextInput.value,
      file: documentFileInput.files[0] ? documentFileInput.files[0].name : 'None',
      paper: paperSelect.value,
      totalAmount: totalPriceEl.textContent
    };
    alert(`Order Created for ₹${orderSummary.totalAmount}!\nDocument Type: ${orderSummary.docType}`);
  });
});
