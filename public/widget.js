/**
 * Favorite Restaurant — Embeddable AI Chat Widget
 */
(function () {
  'use strict';

  var currentScript = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  var BASE_URL = '';
  try {
    BASE_URL = new URL(currentScript.src).origin;
  } catch (e) {
    BASE_URL = window.location.origin;
  }

  function getSessionId() {
    var key = 'fav_chat_session';
    var id = sessionStorage.getItem(key);
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  var SESSION_ID = getSessionId();
  var isOpen = false;
  var isTyping = false;
  var welcomeShown = false;

  var style = document.createElement('style');
  style.textContent = [
    '.fav-widget-btn{position:fixed;bottom:24px;right:24px;width:62px;height:62px;border-radius:50%;background:#e65100;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(230,81,0,.45);display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform .2s,box-shadow .2s;outline:none;}',
    '.fav-widget-btn:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(230,81,0,.55);}',
    '.fav-widget-btn svg{width:30px;height:30px;fill:#fff;transition:opacity .2s;}',
    '.fav-widget-btn .fav-icon-chat{opacity:1;}',
    '.fav-widget-btn .fav-icon-close{opacity:0;position:absolute;}',
    '.fav-widget-btn.fav-open .fav-icon-chat{opacity:0;}',
    '.fav-widget-btn.fav-open .fav-icon-close{opacity:1;}',
    '.fav-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:#f44336;border-radius:50%;border:2px solid #fff;display:none;}',
    '.fav-badge.fav-show{display:block;}',
    '.fav-window{position:fixed;bottom:98px;right:24px;width:380px;height:520px;background:#fff8f0;border-radius:18px;box-shadow:0 12px 50px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;z-index:2147483645;transform:scale(.85) translateY(20px);opacity:0;pointer-events:none;transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;transform-origin:bottom right;}',
    '.fav-window.fav-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}',
    '.fav-header{background:linear-gradient(135deg,#e65100 0%,#bf360c 100%);padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;}',
    '.fav-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.fav-avatar svg{width:22px;height:22px;fill:#fff;}',
    '.fav-header-info{flex:1;min-width:0;}',
    '.fav-header-name{color:#fff;font-weight:700;font-size:15px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.2;}',
    '.fav-header-sub{color:rgba(255,255,255,.8);font-size:11px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin-top:1px;}',
    '.fav-status-dot{width:8px;height:8px;border-radius:50%;background:#69f0ae;margin-right:4px;display:inline-block;animation:fav-pulse 2s infinite;}',
    '@keyframes fav-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '.fav-close-btn{background:rgba(255,255,255,.15);border:none;cursor:pointer;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s;}',
    '.fav-close-btn:hover{background:rgba(255,255,255,.25);}',
    '.fav-close-btn svg{width:16px;height:16px;fill:#fff;}',
    '.fav-messages{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}',
    '.fav-messages::-webkit-scrollbar{width:5px;}',
    '.fav-messages::-webkit-scrollbar-track{background:transparent;}',
    '.fav-messages::-webkit-scrollbar-thumb{background:#d7ccc8;border-radius:10px;}',
    '.fav-msg{display:flex;flex-direction:column;max-width:82%;animation:fav-fadein .3s ease;}',
    '@keyframes fav-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    '.fav-msg.fav-user{align-self:flex-end;align-items:flex-end;}',
    '.fav-msg.fav-bot{align-self:flex-start;align-items:flex-start;}',
    '.fav-bubble{padding:10px 13px;border-radius:16px;font-size:13.5px;line-height:1.55;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;word-break:break-word;}',
    '.fav-msg.fav-user .fav-bubble{background:#fff3e0;color:#3e2723;border-bottom-right-radius:4px;border:1px solid #ffe0b2;}',
    '.fav-msg.fav-bot .fav-bubble{background:#fff;color:#3e2723;border-bottom-left-radius:4px;border-left:3px solid #e65100;box-shadow:0 1px 4px rgba(0,0,0,.07);}',
    '.fav-bubble strong{color:#bf360c;}',
    '.fav-bubble ul{margin:6px 0 6px 16px;padding:0;}',
    '.fav-bubble li{margin-bottom:3px;}',
    '.fav-bubble a{color:#e65100;font-weight:600;text-decoration:underline;word-break:break-all;}',
    '.fav-bubble a:hover{color:#bf360c;}',
    '.fav-ts{font-size:10px;color:#a1887f;margin-top:3px;padding:0 3px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
    '.fav-typing{display:flex;align-items:center;gap:5px;padding:10px 13px;background:#fff;border-radius:16px;border-bottom-left-radius:4px;border-left:3px solid #e65100;width:fit-content;box-shadow:0 1px 4px rgba(0,0,0,.07);}',
    '.fav-dot{width:7px;height:7px;border-radius:50%;background:#e65100;animation:fav-bounce .9s infinite;}',
    '.fav-dot:nth-child(2){animation-delay:.15s;}',
    '.fav-dot:nth-child(3){animation-delay:.3s;}',
    '@keyframes fav-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}',
    '.fav-quick-replies{display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 2px;}',
    '.fav-qr-btn{background:#fff;border:1.5px solid #e65100;color:#e65100;border-radius:20px;padding:6px 13px;font-size:12px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;transition:all .2s;white-space:nowrap;}',
    '.fav-qr-btn:hover{background:#e65100;color:#fff;}',
    '.fav-input-area{padding:12px;border-top:1px solid #ffe0b2;background:#fff;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}',
    '.fav-input{flex:1;border:1.5px solid #ffe0b2;border-radius:22px;padding:10px 16px;font-size:13.5px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;outline:none;resize:none;max-height:80px;overflow-y:auto;line-height:1.4;background:#fff8f0;color:#3e2723;transition:border .2s;}',
    '.fav-input:focus{border-color:#e65100;}',
    '.fav-input::placeholder{color:#bcaaa4;}',
    '.fav-send-btn{width:42px;height:42px;border-radius:50%;background:#e65100;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s,transform .1s;outline:none;}',
    '.fav-send-btn:hover{background:#bf360c;}',
    '.fav-send-btn:active{transform:scale(.93);}',
    '.fav-send-btn:disabled{background:#d7ccc8;cursor:not-allowed;}',
    '.fav-send-btn svg{width:19px;height:19px;fill:#fff;}',
    '.fav-powered{text-align:center;font-size:10px;color:#bcaaa4;padding:0 12px 8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',
    '.fav-whatsapp-btn{display:inline-block;background:#25D366;color:#fff !important;padding:11px 20px;border-radius:25px;text-decoration:none !important;font-weight:700;font-size:13px;margin-top:8px;box-shadow:0 2px 8px rgba(37,211,102,.4);}',
    '.fav-whatsapp-btn:hover{background:#20ba58 !important;}',
    /* ── MOBILE FIX: hide floating button when chat is open ── */
    '@media(max-width:480px){',
    '.fav-window{bottom:0;right:0;left:0;width:100%;height:90vh;border-radius:18px 18px 0 0;}',
    '.fav-widget-btn{bottom:16px;right:16px;}',
    '.fav-widget-btn.fav-open{display:none !important;}',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.id = 'fav-chat-root';
  container.innerHTML = [
    '<div class="fav-window" id="fav-window" role="dialog" aria-label="Favorite Restaurant chat">',
      '<div class="fav-header">',
        '<div class="fav-avatar">',
          '<svg viewBox="0 0 24 24"><path d="M11 2a9 9 0 0 0-9 9c0 1.6.42 3.1 1.15 4.4L2 20l4.6-1.15A8.96 8.96 0 0 0 11 20a9 9 0 0 0 0-18zm0 16a7 7 0 0 1-3.6-1l-.26-.15-2.73.72.73-2.67-.17-.27A7 7 0 1 1 11 18z"/></svg>',
        '</div>',
        '<div class="fav-header-info">',
          '<div class="fav-header-name">Favorite Restaurant</div>',
          '<div class="fav-header-sub"><span class="fav-status-dot"></span>Your Virtual Assistant</div>',
        '</div>',
        '<button class="fav-close-btn" id="fav-close-btn" aria-label="Close chat">',
          '<svg viewBox="0 0 24 24"><path d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>',
        '</button>',
      '</div>',
      '<div class="fav-messages" id="fav-messages"></div>',
      '<div class="fav-input-area">',
        '<textarea class="fav-input" id="fav-input" placeholder="Type your message..." rows="1" aria-label="Chat message"></textarea>',
        '<button class="fav-send-btn" id="fav-send-btn" aria-label="Send message">',
          '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
        '</button>',
      '</div>',
      '<div class="fav-powered">Powered by AI · Favorite Restaurant</div>',
    '</div>',
    '<button class="fav-widget-btn" id="fav-widget-btn" aria-label="Open chat">',
      '<span class="fav-badge" id="fav-badge"></span>',
      '<svg class="fav-icon-chat" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>',
      '<svg class="fav-icon-close" viewBox="0 0 24 24"><path d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>',
    '</button>'
  ].join('');
  document.body.appendChild(container);

  var win      = document.getElementById('fav-window');
  var btn      = document.getElementById('fav-widget-btn');
  var closeBtn = document.getElementById('fav-close-btn');
  var messages = document.getElementById('fav-messages');
  var input    = document.getElementById('fav-input');
  var sendBtn  = document.getElementById('fav-send-btn');
  var badge    = document.getElementById('fav-badge');

  function formatTime(d) {
    d = d || new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  function formatMessage(text) {
    // Convert **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert *italic*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // ── FIX: Convert markdown links [text](url) to real clickable links ──
    text = text.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
    // Convert plain https:// URLs that are NOT already inside href=""
    text = text.replace(
      /(?<!['"=])(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
    // Convert bullet lists
    text = text.replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>');
    if (text.includes('<li>')) {
      text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function appendMessage(role, text, extras) {
    var div = document.createElement('div');
    div.className = 'fav-msg fav-' + (role === 'user' ? 'user' : 'bot');
    var bubble = document.createElement('div');
    bubble.className = 'fav-bubble';
    bubble.innerHTML = formatMessage(text);
    div.appendChild(bubble);
    var ts = document.createElement('div');
    ts.className = 'fav-ts';
    ts.textContent = formatTime();
    div.appendChild(ts);
    if (extras && extras.quickReplies && extras.quickReplies.length) {
      var qr = document.createElement('div');
      qr.className = 'fav-quick-replies';
      extras.quickReplies.forEach(function (label) {
        var qBtn = document.createElement('button');
        qBtn.className = 'fav-qr-btn';
        qBtn.textContent = label;
        qBtn.onclick = function () {
          var allQR = messages.querySelectorAll('.fav-quick-replies');
          allQR.forEach(function (el) { el.remove(); });
          sendMessage(label);
        };
        qr.appendChild(qBtn);
      });
      div.appendChild(qr);
    }
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  // ── Handoff UI — shows WhatsApp connect button ──────────────────────────────
  function showHandoff() {
    // Step 1: connecting message
    setTimeout(function () {
      appendMessage('bot', '⏳ Please hold on, connecting you to our team...');
    }, 800);

    // Step 2: show WhatsApp button
    setTimeout(function () {
      var div = document.createElement('div');
      div.className = 'fav-msg fav-bot';
      div.innerHTML =
        '<div class="fav-bubble" style="border-left:3px solid #25D366;">' +
          '<div style="margin-bottom:10px;">✅ <strong>Our team is ready to help you!</strong><br>Connect with us instantly on WhatsApp:</div>' +
          '<a class="fav-whatsapp-btn" href="https://wa.me/254716649619?text=Hello!%20I%20need%20help%20from%20Favorite%20Restaurant%20team" target="_blank" rel="noopener">' +
            '💬 Open WhatsApp Now' +
          '</a>' +
          '<div style="margin-top:10px;font-size:12px;color:#888;">Or call us: <strong style="color:#e65100;">+254716649619</strong></div>' +
        '</div>' +
        '<div class="fav-ts">' + formatTime() + '</div>';
      messages.appendChild(div);
      scrollToBottom();
    }, 3000);
  }

  var typingEl = null;
  function showTyping() {
    if (typingEl) return;
    var wrap = document.createElement('div');
    wrap.className = 'fav-msg fav-bot';
    typingEl = document.createElement('div');
    typingEl.className = 'fav-typing';
    typingEl.innerHTML = '<div class="fav-dot"></div><div class="fav-dot"></div><div class="fav-dot"></div>';
    wrap.appendChild(typingEl);
    messages.appendChild(wrap);
    scrollToBottom();
    typingEl._wrapper = wrap;
  }
  function hideTyping() {
    if (typingEl && typingEl._wrapper) {
      typingEl._wrapper.remove();
      typingEl = null;
    }
  }

  function sendMessage(text) {
    text = (text || '').trim();
    if (!text || isTyping) return;
    appendMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    fetch(BASE_URL + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: SESSION_ID })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      hideTyping();
      if (data.error) {
        appendMessage('bot', '⚠️ ' + data.error);
      } else if (data.response && data.response.includes('<<<HANDOFF_NEEDED>>>')) {
        // ── Handoff detected ──
        var cleanMsg = data.response.replace('<<<HANDOFF_NEEDED>>>', '').trim();
        if (cleanMsg) appendMessage('bot', cleanMsg);
        showHandoff();
      } else {
        appendMessage('bot', data.response);
      }
    })
    .catch(function () {
      hideTyping();
      appendMessage('bot', '⚠️ Connection issue. Please check your internet and try again.');
    })
    .finally(function () {
      isTyping = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }

  function showWelcome() {
    if (welcomeShown) return;
    welcomeShown = true;
    setTimeout(function () {
      appendMessage(
        'bot',
        'Hello! 👋 Welcome to **Favorite Restaurant**. I\'m your virtual assistant — here to help you 24/7.\n\nI can help you with our menu, make a reservation, arrange delivery, or answer any questions. How can I assist you today?',
        { quickReplies: ['📋 View Menu', '📅 Make Reservation', '🛵 Delivery Info', '📍 Our Location'] }
      );
    }, 400);
  }

  function openChat() {
    isOpen = true;
    win.classList.add('fav-open');
    btn.classList.add('fav-open');
    btn.setAttribute('aria-expanded', 'true');
    badge.classList.remove('fav-show');
    showWelcome();
    setTimeout(function () { input.focus(); }, 300);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('fav-open');
    btn.classList.remove('fav-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    isOpen ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', function () {
    sendMessage(input.value);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });
  setTimeout(function () {
    if (!isOpen && !welcomeShown) {
      badge.classList.add('fav-show');
    }
  }, 3000);

})();
