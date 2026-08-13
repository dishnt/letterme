document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const senderNameInput = document.getElementById('senderName');
  const letterTextInput = document.getElementById('letterText');
  const letterTextGroup = document.getElementById('letterTextGroup');
  const fontSelect = document.getElementById('fontSelect');
  const paperSelect = document.getElementById('paperSelect');
  const emotionSelect = document.getElementById('emotionSelect');
  const waxSealCheckbox = document.getElementById('waxSeal');
  const scentedCheckbox = document.getElementById('scented');
  const letterForm = document.getElementById('letterForm');

  // Image & File Upload Elements
  const headerImageFileInput = document.getElementById('headerImageFile');
  const logoContainer = document.querySelector('.preview-logo-container');
  const docTypeRadios = document.querySelectorAll('input[name="docType"]');
  const uploadGroup = document.getElementById('uploadGroup');
  const documentFileInput = document.getElementById('documentFile');

  // Spacing Controls
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

  // Emotion & Corporate Preset Templates Map
  const emotionTemplates = {
    love: {
      font: "'Marck Script', cursive",
      paper: "rose",
      text: "My Dearest,\n\nI wanted to send you something physical—something you can hold in your hands—just to remind you how much you mean to me...\n\nForever yours,"
    },
    apology: {
      font: "'Homemade Apple', cursive",
      paper: "kraft",
      text: "Dear,\n\nI’m writing this because sometimes spoken words aren't enough. I am truly sorry for what happened, and I genuinely want to make things right...\n\nWith love,"
    },
    birthday: {
      font: "'Caveat', cursive",
      paper: "classic",
      text: "Happy Birthday!\n\nWishing you a fantastic year ahead filled with laughter, great memories, and endless happiness!\n\nCheers,"
    },
    vintage: {
      font: "'Special Elite', monospace",
      paper: "parchment",
      text: "Dearest Friend,\n\nI am sending this letter across the miles to let you know you've been on my mind lately...\n\nWarm regards,"
    },
    official: {
      font: "'Playfair Display', serif",
      paper: "corp-letterhead",
      text: "To Whom It May Concern,\n\nI am writing to formally present this document regarding...\n\nSincerely,\n"
    }
  };

  // Web Audio Typewriter Click
  let audioCtx = null;
  function playTypewriterClick() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.015, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
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
  previewDate.textContent = `Date: ${today.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`;

  // 2. Real-time Letter Text
  letterTextInput.addEventListener('input', (e) => {
    previewBody.textContent = e.target.value.trim().length > 0 ? e.target.value : 'Start typing on the left to see your letter come to life...';
    playTypewriterClick();
    checkPageOverflow();
  });

  // 3. Sender Signature
  senderNameInput.addEventListener('input', (e) => {
    previewSignature.textContent = e.target.value.trim().length > 0 ? `— ${e.target.value}` : '';
  });

  // 4. Emotion Presets Switcher
  emotionSelect.addEventListener('change', (e) => {
    const preset = emotionTemplates[e.target.value];
    if (preset) {
      fontSelect.value = preset.font;
      paperSelect.value = preset.paper;
      previewBody.style.fontFamily = preset.font;
      previewSignature.style.fontFamily = preset.font;
      
      resetPaperClasses();
      paperPreview.classList.add(preset.paper);

      if (letterTextInput.value.trim() === '' || confirm("Load preset starter text? (Will overwrite current text)")) {
        letterTextInput.value = preset.text;
        previewBody.textContent = preset.text;
      }
      checkPageOverflow();
    }
  });

  // 5. Font & Paper Selectors
  fontSelect.addEventListener('change', (e) => {
    previewBody.style.fontFamily = e.target.value;
    previewSignature.style.fontFamily = e.target.value;
  });

  paperSelect.addEventListener('change', (e) => {
    resetPaperClasses();
    paperPreview.classList.add(e.target.value);
  });

  function resetPaperClasses() {
    paperPreview.classList.remove(
      'corp-letterhead', 'exec-minimal', 'modern-sidebar', 'cert-formal',
      'official-a4', 'executive-cream', 'parchment', 'kraft', 
      'rose', 'midnight', 'classic', 'pure-white'
    );
  }

  // 6. Header Logo / Image Handler
  if (headerImageFileInput) {
    headerImageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          logoContainer.innerHTML = `<img src="${event.target.result}" alt="Letterhead Logo" />`;
        };
        reader.readAsDataURL(file);
      } else {
        logoContainer.innerHTML = '';
      }
    });
  }

  // 7. Radio Toggle (Type vs Upload)
  docTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'upload') {
        uploadGroup.classList.remove('hidden');
        letterTextGroup.classList.add('hidden');
        previewBody.innerHTML = '<em>📄 File upload mode selected. Choose a file on the left!</em>';
      } else {
        uploadGroup.classList.add('hidden');
        letterTextGroup.classList.remove('hidden');
        previewBody.textContent = letterTextInput.value.trim().length > 0 ? letterTextInput.value : 'Start typing on the left to see your letter come to life...';
      }
    });
  });

  // 8. Custom Document Chooser Preview
  documentFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      previewBody.innerHTML = `
        <div style="text-align: center; padding: 2rem; border: 2px dashed #8b5a2b; border-radius: 8px; background: rgba(255,255,255,0.7);">
          <p style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">📎 File Selected</p>
          <p><strong>Name:</strong> ${file.name}</p>
          <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p style="margin-top: 1rem; color: #2e7d32; font-weight: bold;">✓ Ready to print in high resolution</p>
        </div>
      `;
    }
  });

  // 9. Spacing & Multi-Page Badge
  const pageBadge = document.createElement('div');
  pageBadge.className = 'page-count-badge';
  pageBadge.textContent = 'Fits on 1 Page';
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

  // 10. Addons & Pricing
  function updatePriceAndAddons() {
    let total = BASE_PRICE;
    if (waxSealCheckbox.checked) {
      total += WAX_SEAL_PRICE;
      previewWaxSeal.classList.remove('hidden');
    } else {
      previewWaxSeal.classList.add('hidden');
    }
    if (scentedCheckbox.checked) total += SCENTED_PRICE;
    totalPriceEl.textContent = total;
  }

  waxSealCheckbox.addEventListener('change', updatePriceAndAddons);
  scentedCheckbox.addEventListener('change', updatePriceAndAddons);

  // 11. Razorpay Form Submission
  letterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const totalAmountInINR = parseInt(totalPriceEl.textContent, 10);

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID",
      amount: totalAmountInINR * 100,
      currency: "INR",
      name: "SOULPOST",
      description: "Physical Letter Printing & Postage",
      handler: function (response) {
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour SOULPOST letter is queued for physical delivery!`);
        letterForm.reset();
        logoContainer.innerHTML = '';
        previewBody.textContent = 'Start typing on the left to see your letter come to life...';
        previewSignature.textContent = '';
        updatePriceAndAddons();
      },
      prefill: {
        name: senderNameInput.value
      },
      theme: {
        color: "#8b5a2b"
      }
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  });
});
// Premium Template Pricing Constant
const PREMIUM_TEMPLATE_PRICE = 20;

// Expanded Preset Templates (Free & Premium)
const emotionTemplates = {
  // --- FREE TEMPLATES ---
  love: {
    font: "'Marck Script', cursive",
    paper: "rose",
    isPremium: false,
    text: "My Dearest,\n\nI wanted to send you something physical—something you can hold in your hands—just to remind you how much you mean to me...\n\nForever yours,"
  },
  apology: {
    font: "'Homemade Apple', cursive",
    paper: "kraft",
    isPremium: false,
    text: "Dear,\n\nI’m writing this because sometimes spoken words aren't enough. I am truly sorry for what happened, and I genuinely want to make things right...\n\nWith love,"
  },
  birthday: {
    font: "'Caveat', cursive",
    paper: "classic",
    isPremium: false,
    text: "Happy Birthday!\n\nWishing you a fantastic year ahead filled with laughter, great memories, and endless happiness!\n\nCheers,"
  },
  vintage: {
    font: "'Special Elite', monospace",
    paper: "parchment",
    isPremium: false,
    text: "Dearest Friend,\n\nI am sending this letter across the miles to let you know you've been on my mind lately...\n\nWarm regards,"
  },
  official: {
    font: "'Playfair Display', serif",
    paper: "official-a4",
    isPremium: false,
    text: "To Whom It May Concern,\n\nI am writing to formally present...\n\nSincerely,\n"
  },

  // --- PREMIUM TEMPLATES (+₹20) ---
  grief: {
    font: "'Playfair Display', serif",
    paper: "sympathy-silver",
    isPremium: true,
    text: "Dearest [Name],\n\nWords fall short during times like these. I was deeply saddened to hear about your loss. Please know that my thoughts and deepest sympathies are with you and your family.\n\nMay you find strength and peace in the memories you shared.\n\nWith heartfelt condolences,"
  },
  farewell: {
    font: "'Alex Brush', cursive",
    paper: "velvet-rose",
    isPremium: true,
    text: "My Dear Friend,\n\nAs you embark on this exciting new journey across the miles, I wanted to send you off with something timeless. Though distance may separate us, true friendship knows no boundaries.\n\nWishing you all the success in the world!\n\nAlways here for you,"
  },
  milestone: {
    font: "'Cinzel', serif",
    paper: "gold-royal-crest",
    isPremium: true,
    text: "Dear [Name],\n\nCongratulations on this extraordinary milestone! Your dedication, persistence, and passion have truly paid off. This achievement is just the beginning of great things to come.\n\nWith immense pride and warmest wishes,"
  },
  confession: {
    font: "'Great Vibes', cursive",
    paper: "minimalist-black-label",
    isPremium: true,
    text: "To Someone Very Special,\n\nI have carried these thoughts for a long time, and I felt it was finally time to put them into ink. Some feelings are too meaningful to stay unsaid...\n\nYours truly,"
  },
  poetry: {
    font: "'Special Elite', monospace",
    paper: "vintage-aged",
    isPremium: true,
    text: "Upon a quiet evening hour,\nWhen memory soft softly gleams,\nI send this letter through the night,\nTo meet you in your dreams...\n\nDedicated to you,"
  },
  executive_gold: {
    font: "'Cinzel', serif",
    paper: "gold-royal-crest",
    isPremium: true,
    text: "CONFIDENTIAL / EXECUTIVE COMMUNIQUE\n\nDear [Title / Name],\n\nIt is my distinct honor to extend this invitation on behalf of the board...\n\nBest Regards,\n"
  }
};

// Premium Paper List for Standalone Paper Selector
const premiumPapers = [
  'sympathy-silver',
  'gold-royal-crest',
  'vintage-aged',
  'velvet-rose',
  'minimalist-black-label',
  'celebration-confetti'
];

// Dynamic Price Calculation
function updatePriceAndAddons() {
  let total = BASE_PRICE;

  // Add Wax Seal
  if (waxSealCheckbox.checked) {
    total += WAX_SEAL_PRICE;
    previewWaxSeal.classList.remove('hidden');
  } else {
    previewWaxSeal.classList.add('hidden');
  }

  // Add Fragrance
  if (scentedCheckbox.checked) total += SCENTED_PRICE;

  // Check if current paper or emotion is Premium
  const isPremiumPaper = premiumPapers.includes(paperSelect.value);
  const selectedEmotion = emotionTemplates[emotionSelect.value];
  const isPremiumEmotion = selectedEmotion && selectedEmotion.isPremium;

  if (isPremiumPaper || isPremiumEmotion) {
    total += PREMIUM_TEMPLATE_PRICE;
    showPremiumBadge(true);
  } else {
    showPremiumBadge(false);
  }

  totalPriceEl.textContent = total;
}

// Show/Hide Premium Gold Badge on Letter Preview
function showPremiumBadge(show) {
  let badge = document.querySelector('.premium-badge');
  if (!badge && show) {
    badge = document.createElement('div');
    badge.className = 'premium-badge';
    badge.textContent = '⭐ Premium Letterhead';
    paperPreview.appendChild(badge);
  } else if (badge && !show) {
    badge.remove();
  }
}

// Ensure paper/emotion change triggers price check
paperSelect.addEventListener('change', updatePriceAndAddons);
emotionSelect.addEventListener('change', updatePriceAndAddons);
// DOM Elements for Attachment
const attachmentFileInput = document.getElementById('attachmentFileInput');
const attachmentStatus = document.getElementById('attachmentStatus');
const attachmentFileName = document.getElementById('attachmentFileName');
const removeAttachmentBtn = document.getElementById('removeAttachmentBtn');

// Handle Attachment Selection
attachmentFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    // Check file size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit!');
      attachmentFileInput.value = '';
      attachmentStatus.classList.add('hidden');
      return;
    }
    attachmentFileName.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    attachmentStatus.classList.remove('hidden');
  }
});

// Remove Attachment
removeAttachmentBtn.addEventListener('click', () => {
  attachmentFileInput.value = '';
  attachmentStatus.classList.add('hidden');
});
