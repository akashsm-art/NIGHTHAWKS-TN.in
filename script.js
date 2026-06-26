'use strict';

/*************************************************
 * 1. CONSTANTS & CONFIGURATION
 *************************************************/
const MAX_TEAMS_PER_BATCH = 12;

const BATCHES = [
  { name: "Batch 1", time: "5:00 PM - 6:00 PM" },
  { name: "Batch 2", time: "6:00 PM - 7:00 PM" },
  { name: "Batch 3", time: "7:00 PM - 9:00 PM" }
];

const ADMIN_CREDS = { mobile: "9113277013", password: "Akash007" };

/*************************************************
 * 2. WEB AUDIO API - FUTURISTIC SFX SYNTHESIZER
 *************************************************/
class CyberSynth {
  static init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  static isEnabled() {
    return localStorage.getItem("sfxEnabled") !== "false";
  }

  static playHover() {
    if (!this.isEnabled()) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  static playClick() {
    if (!this.isEnabled()) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = "square";
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.setValueAtTime(250, this.ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  static playSuccess() {
    if (!this.isEnabled()) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const playTone = (freq, start, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    playTone(523.25, now, 0.12);
    playTone(659.25, now + 0.08, 0.12);
    playTone(783.99, now + 0.16, 0.15);
    playTone(1046.5, now + 0.24, 0.3);
  }

  static playWarning() {
    if (!this.isEnabled()) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }
}

function bindInteractiveSFX() {
  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("button, a, select, input, .theme-dot, .guild-btn, [onclick]");
    if (target) {
      CyberSynth.playHover();
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, a, select, input, .theme-dot, .guild-btn, [onclick]");
    if (target) {
      CyberSynth.playClick();
    }
  });
}

/*************************************************
 * 3. INTERACTIVE CANVAS PARTICLE ENGINE
 *************************************************/
function initCanvasParticles() {
  const canvas = document.getElementById("canvas-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: 110 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.8;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.color = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#00e5ff';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 20000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#00e5ff';
    
    particles.forEach((p, idx) => {
      p.color = primaryColor;
      p.update();
      p.draw();

      for (let j = idx + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.strokeStyle = primaryColor;
          ctx.globalAlpha = 0.12 * (1 - dist / 120);
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/*************************************************
 * 4. PURE JS 3D CARD TILT & SHINE EFFECT
 *************************************************/
function init3DTilt() {
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest("[data-tilt]");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const tiltX = -(y - yc) / 12;
    const tiltY = (x - xc) / 12;
    
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    
    let shine = card.querySelector(".shine-overlay");
    if (!shine) {
      shine = document.createElement("div");
      shine.className = "shine-overlay";
      card.appendChild(shine);
    }
    
    shine.style.opacity = "1";
    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.08), transparent 60%)`;
  });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest("[data-tilt]");
    if (!card) return;
    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    const shine = card.querySelector(".shine-overlay");
    if (shine) shine.style.opacity = "0";
  });
}

/*************************************************
 * 5. HUD THEME SWITCHER & SFX SYSTEM
 *************************************************/
function initThemeSwitcher() {
  const savedTheme = localStorage.getItem("nighthawksTheme") || "cyan";
  setTheme(savedTheme);

  const container = document.getElementById("hudThemeContainer");
  if (container) {
    container.innerHTML = `
      <div class="hud-label">HUD Theme Preset</div>
      <div class="theme-selector">
        <div class="theme-dot cyan ${savedTheme === 'cyan' ? 'active' : ''}" onclick="setTheme('cyan')" title="Neon Cyan"></div>
        <div class="theme-dot red ${savedTheme === 'red' ? 'active' : ''}" onclick="setTheme('red')" title="Overclock Red"></div>
        <div class="theme-dot green ${savedTheme === 'green' ? 'active' : ''}" onclick="setTheme('green')" title="Matrix Green"></div>
        <div class="theme-dot gold ${savedTheme === 'gold' ? 'active' : ''}" onclick="setTheme('gold')" title="Legendary Gold"></div>
      </div>
    `;
  }
}

function setTheme(themeName) {
  document.body.classList.remove("theme-cyan", "theme-red", "theme-green", "theme-gold");
  if (themeName !== 'cyan') {
    document.body.classList.add(`theme-${themeName}`);
  }
  localStorage.setItem("nighthawksTheme", themeName);
  
  document.querySelectorAll(".theme-dot").forEach(dot => {
    dot.classList.remove("active");
    if (dot.classList.contains(themeName)) {
      dot.classList.add("active");
    }
  });
}

function initSFXSwitcher() {
  const container = document.getElementById("hudSFXContainer");
  if (container) {
    const isEnabled = localStorage.getItem("sfxEnabled") !== "false";
    container.innerHTML = `
      <button class="sfx-toggle-btn" onclick="toggleSFX()">
        <span>Auditory Feedback (SFX)</span>
        <span id="sfxStatusVal" class="sfx-status">${isEnabled ? 'ON' : 'OFF'}</span>
      </button>
    `;
  }
}

function toggleSFX() {
  const isEnabled = localStorage.getItem("sfxEnabled") !== "false";
  const nextVal = !isEnabled;
  localStorage.setItem("sfxEnabled", nextVal ? "true" : "false");
  
  const statusVal = document.getElementById("sfxStatusVal");
  if (statusVal) {
    statusVal.textContent = nextVal ? 'ON' : 'OFF';
  }
  
  if (nextVal) {
    CyberSynth.playSuccess();
  }
}

/*************************************************
 * 6. STORAGE HELPERS
 *************************************************/
function getData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function setData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function getUsers() { return getData("users"); }
function getMatches() { return getData("matches"); }
function getRegistrations() { return getData("registrations"); }

/*************************************************
 * 7. TOAST NOTIFICATION SYSTEM
 *************************************************/
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    return;
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/*************************************************
 * 8. AUTHENTICATION (User & Admin)
 *************************************************/
function hideForms() {
  document.getElementById("registerForm")?.classList.add("hidden");
  document.getElementById("loginForm")?.classList.add("hidden");
}

function showForm(formId) {
  hideForms();
  const form = document.getElementById(formId);
  form?.classList.remove("hidden");
}

function checkMobileStatus() {
  const mobile = document.getElementById("mobile")?.value.trim();
  const msg = document.getElementById("msg");

  hideForms();
  if (msg) msg.innerText = "";

  if (!/^\d{10}$/.test(mobile)) return;

  try {
    const users = getUsers();
    const existingUser = users.find(u => u.mobile === mobile);

    if (existingUser) {
      showForm("loginForm");
      document.getElementById("loginTeam").value = existingUser.team;
      if (msg) {
        msg.innerText = "Account found — verify credentials and login";
        msg.style.color = "var(--primary)";
      }
    } else {
      showForm("registerForm");
      if (msg) {
        msg.innerText = "New squad detected — create your account";
        msg.style.color = "var(--primary)";
      }
    }
  } catch (error) {
    console.error("Error checking mobile:", error);
  }
}

function register() {
  const team = document.getElementById("team")?.value.trim();
  const mobile = document.getElementById("mobile")?.value.trim();
  const password = document.getElementById("newPassword")?.value.trim();
  
  if (!team || !mobile || !password) {
    showToast("All fields are required", "error");
    CyberSynth.playWarning();
    return;
  }

  if (password.length < 4) {
    showToast("Password must be at least 4 characters", "error");
    CyberSynth.playWarning();
    return;
  }
  
  let users = getUsers();
  if (users.find(u => u.mobile === mobile)) {
    showToast("This mobile number is already registered", "error");
    CyberSynth.playWarning();
    return;
  }
  
  const newUser = { team, mobile, password, createdAt: new Date().toLocaleString() };
  users.push(newUser);
  setData("users", users);
  
  localStorage.setItem('loggedInUser', JSON.stringify(newUser));
  CyberSynth.playSuccess();
  showToast("Account created successfully! Welcome, " + team, "success");
  
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
}

function login() {
  const mobile = document.getElementById("mobile")?.value.trim();
  const team = document.getElementById("loginTeam")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  
  if (!mobile || !team || !password) {
    showToast("All fields are required", "error");
    CyberSynth.playWarning();
    return;
  }
  
  const users = getUsers();
  const user = users.find(u => 
    u.mobile === mobile && 
    u.team === team && 
    u.password === password
  );
  
  if (user) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    CyberSynth.playSuccess();
    showToast("Welcome back, " + user.team + "! 🎮", "success");
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  } else {
    showToast("Invalid credentials — check team name and password", "error");
    CyberSynth.playWarning();
    const card = document.querySelector('.auth-card');
    if (card) {
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'scaleIn 0.3s var(--spring)';
    }
  }
}

function logout() {
  localStorage.removeItem('loggedInUser');
  showToast("Logged out successfully", "info");
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

function requireLogin() {
  if (!localStorage.getItem('loggedInUser')) {
    window.location.href = "index.html";
  }
}

function adminLogin() {
  const mobile = document.getElementById("adminMobile")?.value;
  const password = document.getElementById("adminPassword")?.value;
  const msg = document.getElementById("msg");

  if (mobile === ADMIN_CREDS.mobile && password === ADMIN_CREDS.password) {
    localStorage.setItem("admin", "true");
    CyberSynth.playSuccess();
    showToast("Admin login successful!", "success");
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 800);
  } else {
    showToast("Invalid admin credentials", "error");
    CyberSynth.playWarning();
    if (msg) {
      msg.innerText = "Invalid credentials";
      msg.style.color = "var(--red)";
    }
  }
}

function adminLogout() {
  localStorage.removeItem("admin");
  showToast("Admin logged out", "info");
  setTimeout(() => {
    window.location.href = "admin-login.html";
  }, 500);
}

function requireAdmin() {
  if (localStorage.getItem("admin") !== "true") {
    window.location.href = "admin-login.html";
  }
}

function openForgotPassword() {
  const mobile = prompt("Enter your registered mobile number:");
  if (!mobile) return;

  const users = getUsers();
  const user = users.find(u => u.mobile === mobile);
  if (!user) { showToast("Mobile number not registered", "error"); CyberSynth.playWarning(); return; }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem("resetOTP", otp);
  localStorage.setItem("resetMobile", mobile);
  
  showToast("Your OTP is: " + otp, "info", 8000);
  setTimeout(() => verifyOTP(), 500);
}

function verifyOTP() {
  const enteredOTP = prompt("Enter OTP:");
  if (enteredOTP !== localStorage.getItem("resetOTP")) {
    showToast("Invalid OTP", "error");
    CyberSynth.playWarning();
    return;
  }
  resetPassword();
}

function resetPassword() {
  const newPass = prompt("Enter new password (min 4 characters):");
  const confirmPass = prompt("Confirm new password:");
  
  if (!newPass || newPass !== confirmPass) { 
    showToast("Passwords don't match", "error"); 
    CyberSynth.playWarning();
    return; 
  }
  if (newPass.length < 4) {
    showToast("Password too short (min 4 characters)", "error"); 
    CyberSynth.playWarning();
    return;
  }

  const users = getUsers();
  const mobile = localStorage.getItem("resetMobile");
  const user = users.find(u => u.mobile === mobile);
  
  user.password = newPass;
  setData("users", users);
  
  localStorage.removeItem("resetOTP");
  localStorage.removeItem("resetMobile");
  CyberSynth.playSuccess();
  showToast("Password reset successful! Login now.", "success");
}

/*************************************************
 * 9. DASHBOARD LOGIC (Matches & Registration)
 *************************************************/
function loadDashboardStats() {
  const matches = getMatches();
  const regs = getRegistrations();
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const kills = getData('kills');

  const el = (id) => document.getElementById(id);
  
  const activeMatches = matches.filter(m => m.status !== 'Completed').length;
  if (el('statMatches')) el('statMatches').textContent = activeMatches;
  
  const myRegs = regs.filter(r => r.team === user.team).length;
  if (el('statRegistrations')) el('statRegistrations').textContent = myRegs;
  
  const myKills = kills.find(k => k.team === user.team);
  if (el('statKills')) el('statKills').textContent = myKills ? myKills.kills : 0;
}

function loadMatches() {
  const container = document.getElementById("matches");
  if (!container) return;

  const matches = getMatches();
  container.innerHTML = "";

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-box">
        <div class="empty-icon">🎮</div>
        <p>No upcoming matches scheduled</p>
        <p style="font-size:13px; color:var(--text-muted); margin-top:8px;">Check back later for new tournaments</p>
      </div>`;
    return;
  }

  matches.forEach(match => {
    const card = document.createElement("div");
    card.className = `match-card tilt-card${match.status === 'Live' ? ' live' : ''}`;
    card.setAttribute("data-tilt", "");
    
    const statusClass = match.status === 'Live' ? 'status-live' : match.status === 'Completed' ? 'status-completed' : 'status-upcoming';
    
    const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const regs = getRegistrations();
    const isRegistered = regs.some(r => r.matchId === match.id && r.team === user.team);
    const totalRegs = regs.filter(r => r.matchId === match.id).length;
    const totalSlots = MAX_TEAMS_PER_BATCH * BATCHES.length;

    const rooms = getData("rooms") || {};
    const room = rooms[match.id];
    
    card.innerHTML = `
      <div class="tilt-card-inner">
        ${isRegistered ? '<div class="registered-badge">✓ REGISTERED</div>' : ''}
        <div class="flex-between mb-sm fw-wrap gap-sm">
          <div>
            <h3 style="margin-bottom:4px;">${match.title}</h3>
            <p>🗺️ ${match.map} &nbsp;·&nbsp; ⏰ ${match.time}</p>
            ${match.link ? `<p><a href="${match.link}" target="_blank" style="font-size:13px;">📺 Watch Stream</a></p>` : ''}
          </div>
          <span class="status-badge ${statusClass}">${match.status}</span>
        </div>
        
        <div class="slot-row">
          <span class="slot-count">${totalRegs}</span>
          <span class="slot-total">/ ${totalSlots} teams registered</span>
        </div>

        ${room ? `
          <div class="room-box mt-sm">
            <p style="color:var(--primary); font-weight:700; margin-bottom:4px;">🔑 Room Credentials</p>
            <p>Room ID: <strong>${room.id}</strong> &nbsp;|&nbsp; Password: <strong>${room.pass}</strong></p>
          </div>
        ` : ''}
        
        <div id="action-area-${match.id}">
          ${match.status === "Completed" 
            ? `<button class="ghost-btn w-full" disabled>Match Ended</button>` 
            : isRegistered 
              ? `<button class="registered-btn w-full" disabled>✓ Already Registered</button>`
              : `<button onclick="initiateRegistration(${match.id})" class="glow-btn w-full">Register Team</button>`
          }
        </div>
        <div id="register-form-${match.id}"></div>
        <div id="batch-teams-${match.id}" style="margin-top:10px;"></div>
      </div>
    `;
    
    container.appendChild(card);
    renderBatchTeams(match.id);
  });
}

function initiateRegistration(matchId) {
  if (localStorage.getItem("registrationOpen") === "false") {
    showToast("⛔ Registration is currently CLOSED by Admin", "warning");
    CyberSynth.playWarning();
    return;
  }

  const box = document.getElementById(`register-form-${matchId}`);
  if(box) {
    box.innerHTML = `
      <div class="register-box">
        <h4 style="font-family:'Orbitron',sans-serif; color:var(--primary); margin-bottom:14px; text-transform:uppercase;">Squad Registration</h4>
        
        <div class="roster-grid-form">
          <div class="roster-form-card">
            <h5>Player 1 (IGL)</h5>
            <input id="p1-${matchId}" placeholder="IGL Name" style="padding:8px 12px; margin:4px 0;">
            <input id="p1-uid-${matchId}" placeholder="Free Fire UID" style="padding:8px 12px; margin:4px 0;" type="tel" inputmode="numeric">
            <select id="p1-role-${matchId}" style="padding:8px 12px; margin:4px 0;">
              <option value="IGL">IGL (Captain)</option>
            </select>
          </div>
          
          <div class="roster-form-card">
            <h5>Player 2</h5>
            <input id="p2-${matchId}" placeholder="Player 2 Name" style="padding:8px 12px; margin:4px 0;">
            <input id="p2-uid-${matchId}" placeholder="Free Fire UID" style="padding:8px 12px; margin:4px 0;" type="tel" inputmode="numeric">
            <select id="p2-role-${matchId}" style="padding:8px 12px; margin:4px 0;">
              <option value="Assaulter">Assaulter</option>
              <option value="Sniper">Sniper</option>
              <option value="Support">Support</option>
              <option value="IGL">IGL</option>
            </select>
          </div>

          <div class="roster-form-card">
            <h5>Player 3</h5>
            <input id="p3-${matchId}" placeholder="Player 3 Name" style="padding:8px 12px; margin:4px 0;">
            <input id="p3-uid-${matchId}" placeholder="Free Fire UID" style="padding:8px 12px; margin:4px 0;" type="tel" inputmode="numeric">
            <select id="p3-role-${matchId}" style="padding:8px 12px; margin:4px 0;">
              <option value="Sniper">Sniper</option>
              <option value="Assaulter">Assaulter</option>
              <option value="Support">Support</option>
              <option value="IGL">IGL</option>
            </select>
          </div>

          <div class="roster-form-card">
            <h5>Player 4</h5>
            <input id="p4-${matchId}" placeholder="Player 4 Name" style="padding:8px 12px; margin:4px 0;">
            <input id="p4-uid-${matchId}" placeholder="Free Fire UID" style="padding:8px 12px; margin:4px 0;" type="tel" inputmode="numeric">
            <select id="p4-role-${matchId}" style="padding:8px 12px; margin:4px 0;">
              <option value="Support">Support</option>
              <option value="Assaulter">Assaulter</option>
              <option value="Sniper">Sniper</option>
              <option value="IGL">IGL</option>
            </select>
          </div>
        </div>

        <button onclick="checkPaymentAndSubmit(${matchId})" class="glow-btn w-full mt-md">Submit Team</button>
      </div>
    `;
  }
}

function checkPaymentAndSubmit(matchId) {
  const paymentMode = localStorage.getItem("paymentMode") || "free";
  const p1 = document.getElementById(`p1-${matchId}`).value.trim();
  if (!p1) { showToast("Please enter at least the IGL name", "error"); CyberSynth.playWarning(); return; }

  if (paymentMode === "paid") {
    const qrUrl = localStorage.getItem("qrCodeUrl") || "";
    const qrImg = document.getElementById("userQRDisplay");
    if (qrImg) qrImg.src = qrUrl;
    
    const modal = document.getElementById("paymentModal");
    if (modal) {
      modal.style.display = "flex";
      modal.dataset.matchId = matchId;
    }
  } else {
    submitMatch(matchId);
  }
}

function closePaymentModal() {
  const modal = document.getElementById("paymentModal");
  if (modal) modal.style.display = "none";
}

function confirmPaymentAndRegister() {
  const modal = document.getElementById("paymentModal");
  const matchId = parseInt(modal?.dataset.matchId);
  closePaymentModal();
  if (matchId) submitMatch(matchId);
}

function submitMatch(matchId) {
  const loggedInString = localStorage.getItem("loggedInUser");
  if (!loggedInString) { showToast("Please login first", "error"); CyberSynth.playWarning(); return; }
  
  let user = JSON.parse(loggedInString);
  const users = getUsers();
  
  const p1 = document.getElementById(`p1-${matchId}`).value.trim();
  const p2 = document.getElementById(`p2-${matchId}`).value.trim();
  const p3 = document.getElementById(`p3-${matchId}`).value.trim();
  const p4 = document.getElementById(`p4-${matchId}`).value.trim();

  const p1Uid = document.getElementById(`p1-uid-${matchId}`).value.trim();
  const p2Uid = document.getElementById(`p2-uid-${matchId}`).value.trim();
  const p3Uid = document.getElementById(`p3-uid-${matchId}`).value.trim();
  const p4Uid = document.getElementById(`p4-uid-${matchId}`).value.trim();

  const p1Role = document.getElementById(`p1-role-${matchId}`).value;
  const p2Role = document.getElementById(`p2-role-${matchId}`).value;
  const p3Role = document.getElementById(`p3-role-${matchId}`).value;
  const p4Role = document.getElementById(`p4-role-${matchId}`).value;

  if (!p1 || !p2 || !p3 || !p4) {
    showToast("Please enter all 4 player names", "error");
    CyberSynth.playWarning();
    return;
  }

  const uidRegex = /^\d+$/;
  if (!uidRegex.test(p1Uid) || !uidRegex.test(p2Uid) || !uidRegex.test(p3Uid) || !uidRegex.test(p4Uid)) {
    showToast("Free Fire UIDs must be valid numeric IDs", "error");
    CyberSynth.playWarning();
    return;
  }

  user.players = [p1, p2, p3, p4];
  user.playersDetail = [
    { name: p1, uid: p1Uid, role: p1Role },
    { name: p2, uid: p2Uid, role: p2Role },
    { name: p3, uid: p3Uid, role: p3Role },
    { name: p4, uid: p4Uid, role: p4Role }
  ];
  localStorage.setItem("loggedInUser", JSON.stringify(user));

  const userIndex = users.findIndex(u => u.mobile === user.mobile);
  if(userIndex > -1) {
    users[userIndex].players = user.players;
    users[userIndex].playersDetail = user.playersDetail;
    setData("users", users);
  }

  let regs = getRegistrations();
  if (regs.some(r => r.matchId === matchId && r.team === user.team)) {
    showToast("You're already registered for this match", "warning");
    CyberSynth.playWarning();
    return;
  }

  let selectedBatch = null;
  for (let batch of BATCHES) {
    const count = regs.filter(r => r.matchId === matchId && r.batch === batch.name).length;
    if (count < MAX_TEAMS_PER_BATCH) {
      selectedBatch = batch;
      break;
    }
  }

  if(!selectedBatch) { showToast("All batches are full! 😔", "warning"); CyberSynth.playWarning(); return; }

  regs.push({
    matchId, 
    team: user.team, 
    batch: selectedBatch.name, 
    time: selectedBatch.time,
    players: [p1,p2,p3,p4], 
    rosterDetail: [
      { name: p1, uid: p1Uid, role: p1Role },
      { name: p2, uid: p2Uid, role: p2Role },
      { name: p3, uid: p3Uid, role: p3Role },
      { name: p4, uid: p4Uid, role: p4Role }
    ],
    paid: (localStorage.getItem("paymentMode")==="paid"),
    registeredAt: new Date().toLocaleString()
  });
  
  setData("registrations", regs);
  
  CyberSynth.playSuccess();
  showToast(`🎉 Registered for ${selectedBatch.name} (${selectedBatch.time})`, "success");
  loadMatches();
  loadDashboardStats();
}

function renderBatchTeams(matchId) {
  const box = document.getElementById(`batch-teams-${matchId}`);
  if (!box) return;

  const registrations = getRegistrations();
  let html = "";

  BATCHES.forEach(batch => {
    const teams = registrations.filter(r => r.matchId === matchId && r.batch === batch.name);
    html += `
      <div class="batch-box">
        <h4 style="font-family:'Orbitron',sans-serif; text-transform:uppercase;">${batch.name} <span style="color:var(--text-muted); font-weight:400;">(${teams.length}/${MAX_TEAMS_PER_BATCH})</span></h4>
        ${ teams.length === 0
            ? `<p style="font-size:12px; color:var(--text-muted); padding:4px 0;">No squads registered yet</p>`
            : `<div class="batch-team-list" style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                ${teams.map((t, i) => {
                  const details = Array.isArray(t.rosterDetail) ? t.rosterDetail : [
                    { name: t.players[0] || 'Player 1', role: 'IGL', uid: 'N/A' },
                    { name: t.players[1] || 'Player 2', role: 'Assaulter', uid: 'N/A' },
                    { name: t.players[2] || 'Player 3', role: 'Sniper', uid: 'N/A' },
                    { name: t.players[3] || 'Player 4', role: 'Support', uid: 'N/A' }
                  ];
                  const detailHtml = details.map(d => {
                    const roleClass = d.role === 'IGL' ? 'role-igl' : d.role === 'Sniper' ? 'role-sniper' : d.role === 'Assaulter' ? 'role-assaulter' : 'role-support';
                    return `
                      <div class="roster-list-item" style="padding:6px 10px; margin-top:4px;">
                        <span class="roster-list-player">${d.name} <span class="role-badge ${roleClass}" style="margin-left:6px; font-size:8px; padding:2px 6px;">${d.role}</span></span>
                        <span class="roster-list-uid">UID: ${d.uid}</span>
                      </div>
                    `;
                  }).join('');

                  const uniqueId = `roster-${matchId}-${batch.name.replace(/\s+/g, '')}-${i}`;
                  return `
                    <div style="background:rgba(255,255,255,0.01); border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden;">
                      <div onclick="toggleRosterCollapse('${uniqueId}')" style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; cursor:pointer; background:rgba(255,255,255,0.02); transition:background 0.2s;">
                        <span style="font-size:13px; font-weight:600; color:var(--text-secondary);">${i+1}. ${t.team}</span>
                        <span style="font-size:11px; color:var(--primary); font-family:'Orbitron',sans-serif; text-transform:uppercase;">Roster ▾</span>
                      </div>
                      <div id="${uniqueId}" style="max-height:0; overflow:hidden; transition:max-height 0.3s var(--ease); padding:0 14px;">
                        <div style="padding-bottom:12px; margin-top:6px;">
                          ${detailHtml}
                        </div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>`
        }
      </div>
    `;
  });
  box.innerHTML = html;
}

function toggleRosterCollapse(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (el.style.maxHeight === "0px" || !el.style.maxHeight) {
    el.style.maxHeight = "350px";
  } else {
    el.style.maxHeight = "0px";
  }
}

function loadMyMatches() {
  const box = document.getElementById("myMatches");
  if (!box) return;

  const loggedInUserStr = localStorage.getItem("loggedInUser");
  if (!loggedInUserStr) {
    box.innerHTML = `<div class="empty-box"><div class="empty-icon">🔒</div><p>Please login to view matches</p></div>`;
    return;
  }
  
  const user = JSON.parse(loggedInUserStr);
  const regs = getRegistrations().filter(r => r.team === user.team);

  if (regs.length === 0) {
    box.innerHTML = `
      <div class="empty-box">
        <div class="empty-icon">🎮</div>
        <p>No matches registered yet</p>
        <p style="font-size:13px; color:var(--text-muted); margin-top:8px;">Register for matches from the Dashboard</p>
      </div>`;
    return;
  }

  box.innerHTML = "";
  regs.forEach(r => {
    const div = document.createElement("div");
    div.className = "my-match-card tilt-card";
    div.setAttribute("data-tilt", "");
    
    const details = Array.isArray(r.rosterDetail) ? r.rosterDetail : [
      { name: r.players[0] || 'Player 1', role: 'IGL', uid: 'N/A' },
      { name: r.players[1] || 'Player 2', role: 'Assaulter', uid: 'N/A' },
      { name: r.players[2] || 'Player 3', role: 'Sniper', uid: 'N/A' },
      { name: r.players[3] || 'Player 4', role: 'Support', uid: 'N/A' }
    ];

    const detailHtml = details.map(d => {
      const roleClass = d.role === 'IGL' ? 'role-igl' : d.role === 'Sniper' ? 'role-sniper' : d.role === 'Assaulter' ? 'role-assaulter' : 'role-support';
      return `
        <div class="roster-list-item" style="padding:6px 12px; margin-top:6px;">
          <span class="roster-list-player">${d.name} <span class="role-badge ${roleClass}" style="margin-left:6px; font-size:8px; padding:2px 6px;">${d.role}</span></span>
          <span class="roster-list-uid">UID: ${d.uid}</span>
        </div>
      `;
    }).join('');

    div.innerHTML = `
      <div class="tilt-card-inner">
        <div class="flex-between mb-sm">
          <h3 style="margin:0; font-family:'Orbitron',sans-serif;">${r.team}</h3>
          <span class="status-badge status-upcoming">Confirmed</span>
        </div>
        <p>🕐 ${r.batch} · ${r.time}</p>
        <div style="margin-top:12px;">
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Roster Details</span>
          ${detailHtml}
        </div>
        <p style="font-size:11px; color:var(--text-muted); margin-top:12px;">Registered: ${r.registeredAt || 'N/A'}</p>
      </div>
    `;
    box.appendChild(div);
  });
}

/*************************************************
 * 10. ADMIN PANEL FEATURES
 *************************************************/
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(d => {
    d.style.display = 'none';
    d.classList.remove('active');
  });

  document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));

  const activeContent = document.getElementById(`tab-${tabName}`);
  if(activeContent) {
    activeContent.style.display = 'block';
    activeContent.classList.add('active');
  }

  const navLink = document.getElementById(`nav-${tabName}`);
  if (navLink) navLink.classList.add('active');

  document.querySelectorAll('.admin-tabs button').forEach(btn => {
    if(btn.textContent.toLowerCase().includes(tabName.substring(0,4))) {
       btn.classList.add('active');
    }
  });

  loadAdminTabs(tabName);
}

function loadAdminTabs(tabName) {
  if (tabName === 'overview') loadAdminOverview();
  if (tabName === 'matches') renderAdminMatches();
  if (tabName === 'users') renderAdminUsers();
  if (tabName === 'teams') renderAdminTeams();
  if (tabName === 'feedbacks') loadFeedbacks();
  if (tabName === 'settings') loadPaymentSettings();
}

function loadAdminOverview() {
  const users = getUsers();
  const matches = getMatches();
  const regs = getRegistrations();
  const feedbacks = getData('feedbacks');

  const el = (id) => document.getElementById(id);
  if (el('totalUsers')) el('totalUsers').textContent = users.length;
  if (el('totalMatches')) el('totalMatches').textContent = matches.length;
  if (el('totalRegistrations')) el('totalRegistrations').textContent = regs.length;
  if (el('totalFeedbacks')) el('totalFeedbacks').textContent = feedbacks.length;

  if (matches.length > 0) {
    const latestMatch = matches[matches.length - 1];
    BATCHES.forEach((batch, i) => {
      const count = regs.filter(r => r.matchId === latestMatch.id && r.batch === batch.name).length;
      const pct = (count / MAX_TEAMS_PER_BATCH) * 100;
      const fillEl = el(`batch${i+1}Fill`);
      const valEl = el(`batch${i+1}Val`);
      if (fillEl) fillEl.style.height = Math.max(4, pct) + '%';
      if (valEl) valEl.textContent = `${count}/${MAX_TEAMS_PER_BATCH}`;
    });
  }

  const recentBox = el('recentActivity');
  if (recentBox) {
    const recent = [...regs].reverse().slice(0, 8);
    if (recent.length === 0) {
      recentBox.innerHTML = '<p class="text-muted">No recent registrations.</p>';
    } else {
      recentBox.innerHTML = recent.map(r => `
        <div style="padding:10px; margin-bottom:8px; background:var(--bg-secondary); border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:var(--primary); font-weight:600;">${r.team}</span>
            <span class="text-muted" style="font-size:12px;"> · ${r.batch}</span>
          </div>
          <span style="font-size:11px; color:var(--text-muted);">${r.registeredAt || ''}</span>
        </div>
      `).join('');
    }
  }
}

function saveMatch() {
  const title = document.getElementById("m-title")?.value.trim();
  const map = document.getElementById("m-map")?.value.trim();
  const time = document.getElementById("m-time")?.value.trim();
  const link = document.getElementById("m-link")?.value.trim();

  if (!title || !map || !time) { showToast("Please fill Title, Map, and Time", "error"); CyberSynth.playWarning(); return; }

  let matches = getMatches();
  matches.push({
    id: Date.now(),
    title, map, time, link: link || "",
    status: "Upcoming",
    winner: "",
    resultNote: ""
  });
  setData("matches", matches);
  
  CyberSynth.playSuccess();
  showToast("Match created: " + title, "success");
  renderAdminMatches();
  
  document.getElementById("m-title").value = "";
  document.getElementById("m-map").value = "";
  document.getElementById("m-time").value = "";
  document.getElementById("m-link").value = "";
}

function renderAdminMatches() {
  const list = document.getElementById("adminMatchList");
  if(!list) return;
  const matches = getMatches();
  list.innerHTML = "";

  if (matches.length === 0) {
    list.innerHTML = `<div class="empty-box"><div class="empty-icon">🎮</div><p>No matches created yet</p></div>`;
    return;
  }

  matches.forEach((m, index) => {
    const statusClass = m.status === 'Live' ? 'status-live' : m.status === 'Completed' ? 'status-completed' : 'status-upcoming';
    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
      <div class="flex-between mb-sm">
        <h3 style="margin:0; font-family:'Orbitron',sans-serif;">${m.title}</h3>
        <span class="status-badge ${statusClass}">${m.status}</span>
      </div>
      <p>🗺️ ${m.map} &nbsp;·&nbsp; ⏰ ${m.time}</p>
      
      <div style="margin-top:12px;">
        <label style="font-size:12px; color:var(--text-muted); font-weight:600;">STATUS</label>
        <select onchange="updateMatchData(${index}, 'status', this.value)" style="margin-top:4px;">
          <option ${m.status==="Upcoming"?"selected":""}>Upcoming</option>
          <option ${m.status==="Live"?"selected":""}>Live</option>
          <option ${m.status==="Completed"?"selected":""}>Completed</option>
        </select>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
        <div>
          <label style="font-size:12px; color:var(--text-muted); font-weight:600;">WINNER</label>
          <input placeholder="Winner team" value="${m.winner||""}" 
                 onchange="updateMatchData(${index}, 'winner', this.value)" style="margin-top:4px;">
        </div>
        <div>
          <label style="font-size:12px; color:var(--text-muted); font-weight:600;">RESULT</label>
          <input placeholder="Result note" value="${m.resultNote||""}" 
                 onchange="updateMatchData(${index}, 'resultNote', this.value)" style="margin-top:4px;">
        </div>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button onclick="saveRoom(${m.id})" class="glow-btn" style="flex:1; font-size:13px;">🔑 Set Room</button>
        <button onclick="deleteMatch(${index})" class="red-glow-btn" style="flex:1; font-size:13px;">🗑️ Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function updateMatchData(index, field, value) {
  const matches = getMatches();
  matches[index][field] = value;
  setData("matches", matches);
  showToast(`Match ${field} updated`, "info", 2000);
}

function deleteMatch(index) {
  if (confirm("Delete this match? This cannot be undone.")) {
    const matches = getMatches();
    matches.splice(index, 1);
    setData("matches", matches);
    showToast("Match deleted", "warning");
    CyberSynth.playWarning();
    renderAdminMatches();
  }
}

function renderAdminUsers(filter = '') {
  const list = document.getElementById("adminUserList");
  if(!list) return;
  let users = getUsers();
  
  if (filter) {
    users = users.filter(u => 
      u.team.toLowerCase().includes(filter.toLowerCase()) || 
      u.mobile.includes(filter)
    );
  }

  list.innerHTML = "";

  if (users.length === 0) {
    list.innerHTML = `<div class="empty-box"><div class="empty-icon">👥</div><p>${filter ? 'No users match your search' : 'No registered users'}</p></div>`;
    return;
  }

  const table = document.createElement('div');
  table.style.overflowX = 'auto';
  table.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Mobile</th>
          <th>Joined</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map((u, i) => `
          <tr>
            <td>${i + 1}</td>
            <td style="color:var(--primary); font-weight:600;">${u.team}</td>
            <td>${u.mobile}</td>
            <td style="font-size:12px;">${u.createdAt || 'N/A'}</td>
            <td class="action-btns">
              <button onclick="editUser(${getUsers().indexOf(u)})" class="ghost-btn" style="font-size:11px; padding:4px 10px;">Edit</button>
              <button onclick="deleteUser(${getUsers().indexOf(u)})" class="red-glow-btn" style="font-size:11px; padding:4px 10px;">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p class="text-muted mt-sm" style="font-size:12px;">${users.length} user${users.length !== 1 ? 's' : ''} total</p>
  `;
  list.appendChild(table);
}

function searchUsers() {
  const query = document.getElementById('userSearchInput')?.value || '';
  renderAdminUsers(query);
}

function editUser(index) {
  const users = getUsers();
  const newPass = prompt("Enter new password for " + users[index].team);
  if(newPass) {
    users[index].password = newPass;
    setData("users", users);
    CyberSynth.playSuccess();
    showToast("Password updated for " + users[index].team, "success");
    renderAdminUsers();
  }
}

function deleteUser(index) {
  if(confirm("Delete this user? This cannot be undone.")) {
    const users = getUsers();
    const name = users[index].team;
    users.splice(index, 1);
    setData("users", users);
    CyberSynth.playWarning();
    showToast("User " + name + " deleted", "warning");
    renderAdminUsers();
  }
}

function renderAdminTeams(filter = '') {
  const list = document.getElementById("adminTeamList");
  if(!list) return;
  let regs = getRegistrations();
  
  if (filter) {
    regs = regs.filter(r => 
      r.team.toLowerCase().includes(filter.toLowerCase()) ||
      r.batch.toLowerCase().includes(filter.toLowerCase())
    );
  }

  list.innerHTML = "";

  if (regs.length === 0) {
    list.innerHTML = `<div class="empty-box"><div class="empty-icon">🛡️</div><p>${filter ? 'No teams match your search' : 'No teams registered yet'}</p></div>`;
    return;
  }

  regs.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "match-card";
    
    const details = Array.isArray(r.rosterDetail) ? r.rosterDetail : [
      { name: r.players[0] || 'Player 1', role: 'IGL', uid: 'N/A' },
      { name: r.players[1] || 'Player 2', role: 'Assaulter', uid: 'N/A' },
      { name: r.players[2] || 'Player 3', role: 'Sniper', uid: 'N/A' },
      { name: r.players[3] || 'Player 4', role: 'Support', uid: 'N/A' }
    ];

    const detailHtml = details.map(d => {
      const roleClass = d.role === 'IGL' ? 'role-igl' : d.role === 'Sniper' ? 'role-sniper' : d.role === 'Assaulter' ? 'role-assaulter' : 'role-support';
      return `
        <div class="roster-list-item" style="padding:6px 12px; margin-top:6px;">
          <span class="roster-list-player">${d.name} <span class="role-badge ${roleClass}" style="margin-left:6px; font-size:8px; padding:2px 6px;">${d.role}</span></span>
          <span class="roster-list-uid">UID: ${d.uid}</span>
        </div>
      `;
    }).join('');

    div.innerHTML = `
      <div class="flex-between mb-sm">
        <div>
          <h4 style="color:var(--primary); margin:0; font-family:'Orbitron',sans-serif;">${r.team}</h4>
          <span style="font-size:12px; color:var(--text-muted);">${r.batch} · ${r.time}</span>
        </div>
        <span class="status-badge ${r.paid ? 'status-completed' : 'status-upcoming'}" style="font-size:11px;">
          ${r.paid ? '💰 PAID' : 'FREE'}
        </span>
      </div>
      <div style="margin-top:10px;">
        ${detailHtml}
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin-top:10px;">Registered: ${r.registeredAt || 'N/A'}</p>
      <button onclick="deleteTeam(${index})" class="red-glow-btn mt-sm" style="font-size:12px; padding:6px 16px;">Remove Team</button>
    `;
    list.appendChild(div);
  });

  list.insertAdjacentHTML('beforeend', `<p class="text-muted mt-sm" style="font-size:12px;">${regs.length} team${regs.length !== 1 ? 's' : ''} registered</p>`);
}

function searchTeams() {
  const query = document.getElementById('teamSearchInput')?.value || '';
  renderAdminTeams(query);
}

function deleteTeam(index) {
  if(confirm("Remove this team from tournament?")) {
    const regs = getRegistrations();
    const name = regs[index].team;
    regs.splice(index, 1);
    setData("registrations", regs);
    CyberSynth.playWarning();
    showToast(name + " removed from tournament", "warning");
    renderAdminTeams();
  }
}

function downloadAdminPDF() {
  if (!window.jspdf) { showToast("PDF library not loaded", "error"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const registrations = getRegistrations();
  let y = 10;
  doc.setFontSize(18);
  doc.text("Nighthawks FF - Teams Report", 10, y); y += 12;
  doc.setFontSize(10);
  doc.text("Generated: " + new Date().toLocaleString(), 10, y); y += 10;
  doc.setFontSize(12);
  
  registrations.forEach((r, i) => {
    doc.text(`${i + 1}. ${r.team} | ${r.batch} | ${r.paid ? 'PAID':'FREE'}`, 10, y); y += 6;
    doc.setFontSize(10);
    doc.text(`   Players: ${r.players.join(", ")}`, 10, y); y += 4;
    doc.text(`   Time: ${r.time} | Registered: ${r.registeredAt || 'N/A'}`, 10, y); y += 8;
    doc.setFontSize(12);
    if (y > 280) { doc.addPage(); y = 10; }
  });
  doc.save("nighthawks-teams.pdf");
  CyberSynth.playSuccess();
  showToast("Teams PDF downloaded", "success");
}

function downloadUsersPDF() {
  if (!window.jspdf) { showToast("PDF library not loaded", "error"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const users = getUsers();
  let y = 10;
  doc.setFontSize(18);
  doc.text("Nighthawks FF - Users Report", 10, y); y += 12;
  doc.setFontSize(10);
  doc.text("Generated: " + new Date().toLocaleString(), 10, y); y += 10;
  doc.setFontSize(12);
  
  users.forEach((u, i) => {
    doc.text(`${i+1}. ${u.team} | ${u.mobile}`, 10, y); y += 7;
    if (y > 280) { doc.addPage(); y = 10; }
  });
  doc.save("nighthawks-users.pdf");
  CyberSynth.playSuccess();
  showToast("Users PDF downloaded", "success");
}

function exportCSV() {
  const regs = getRegistrations();
  if (regs.length === 0) { showToast("No data to export", "warning"); CyberSynth.playWarning(); return; }

  let csv = "Team,Batch,Time,Player1,Player2,Player3,Player4,Paid,RegisteredAt\n";
  regs.forEach(r => {
    const players = Array.isArray(r.players) ? r.players : ['','','',''];
    csv += `"${r.team}","${r.batch}","${r.time}","${players[0] || ''}","${players[1] || ''}","${players[2] || ''}","${players[3] || ''}","${r.paid ? 'Yes' : 'No'}","${r.registeredAt || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nighthawks-teams.csv';
  a.click();
  URL.revokeObjectURL(url);
  CyberSynth.playSuccess();
  showToast("CSV exported successfully", "success");
}

/*************************************************
 * 11. FEEDBACK & SETTINGS
 *************************************************/
function toggleCareModal() {
  const modal = document.getElementById("careModal");
  if(modal) modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

function sendFeedback() {
  const text = document.getElementById("feedbackText")?.value?.trim();
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  
  if (!text) { showToast("Please type a message", "warning"); CyberSynth.playWarning(); return; }

  let feedbacks = getData("feedbacks");
  feedbacks.push({
    team: user.team || "Guest",
    mobile: user.mobile || "N/A",
    message: text,
    date: new Date().toLocaleString()
  });

  setData("feedbacks", feedbacks);
  CyberSynth.playSuccess();
  showToast("Message sent! We'll get back to you soon 💬", "success");
  document.getElementById("feedbackText").value = "";
  toggleCareModal();
}

function loadFeedbacks() {
  const list = document.getElementById("adminFeedbackList");
  if (!list) return;
  const feedbacks = getData("feedbacks").reverse();
  list.innerHTML = "";
  
  if (feedbacks.length === 0) { 
    list.innerHTML = `<div class="empty-box"><div class="empty-icon">💬</div><p>No messages yet</p></div>`; 
    return; 
  }

  feedbacks.forEach(f => {
    const div = document.createElement("div");
    div.className = "match-card";
    div.style.borderLeft = "3px solid var(--pink)";
    div.innerHTML = `
      <div class="flex-between mb-sm">
        <span style="color:var(--primary); font-weight:600;">${f.team}</span>
        <span style="font-size:11px; color:var(--text-muted);">${f.date}</span>
      </div>
      <p style="font-size:12px; color:var(--text-muted);">📱 ${f.mobile}</p>
      <p style="background:var(--bg-secondary); padding:10px; border-radius:8px; margin-top:8px; font-size:14px; color:var(--text-secondary);">${f.message}</p>
    `;
    list.appendChild(div);
  });
}

function clearFeedbacks() {
  if (confirm("Delete ALL messages? This cannot be undone.")) {
    localStorage.removeItem("feedbacks");
    CyberSynth.playWarning();
    showToast("All messages cleared", "warning");
    loadFeedbacks();
  }
}

function saveAnnouncement() {
  const text = document.getElementById("announcementText")?.value;
  if (!text || !text.trim()) { showToast("Enter an announcement message", "warning"); CyberSynth.playWarning(); return; }
  localStorage.setItem("announcement", text);
  CyberSynth.playSuccess();
  showToast("📢 Announcement saved!", "success");
}

function clearAnnouncement() {
  localStorage.removeItem("announcement");
  showToast("Announcement cleared", "info");
  const el = document.getElementById("announcementText");
  if (el) el.value = "";
}

function saveStandingsImage() {
  const url = document.getElementById("standingsInput")?.value?.trim();
  if (!url) { showToast("Please paste an image URL", "warning"); CyberSynth.playWarning(); return; }
  localStorage.setItem("standingsImage", url);
  CyberSynth.playSuccess();
  showToast("Standings image updated!", "success");
}

function loadPaymentSettings() {
  const mode = localStorage.getItem("paymentMode") || "free";
  const qr = localStorage.getItem("qrCodeUrl") || "";
  const select = document.getElementById("paymentMode");
  const qrSec = document.getElementById("qrSection");
  const qrInput = document.getElementById("qrCodeUrl");
  const img = document.getElementById("previewQR");

  if(select) select.value = mode;
  if(qrInput) qrInput.value = qr;
  
  if(mode === "paid") {
    if(qrSec) qrSec.style.display = "block";
    if(qr && img) img.src = qr;
  } else {
    if(qrSec) qrSec.style.display = "none";
  }

  const ann = localStorage.getItem("announcement");
  const annInput = document.getElementById("announcementText");
  if (ann && annInput) annInput.value = ann;
}

function savePaymentSettings() {
  const mode = document.getElementById("paymentMode").value;
  localStorage.setItem("paymentMode", mode);
  
  const qrSec = document.getElementById("qrSection");
  if(mode === "paid") {
    if(qrSec) qrSec.style.display = "block";
    const qrUrl = document.getElementById("qrCodeUrl").value;
    localStorage.setItem("qrCodeUrl", qrUrl);
    const img = document.getElementById("previewQR");
    if(img) img.src = qrUrl;
  } else {
    if(qrSec) qrSec.style.display = "none";
  }
  CyberSynth.playSuccess();
  showToast("Payment settings updated", "success");
}

function toggleReg(status) {
  localStorage.setItem("registrationOpen", status ? "true" : "false");
  const statusDisplay = document.getElementById("regStatusDisplay");
  if (statusDisplay) {
    statusDisplay.innerText = status ? "✅ REGISTRATION OPEN" : "⛔ REGISTRATION CLOSED";
    statusDisplay.style.color = status ? "var(--green)" : "var(--red)";
  }
  CyberSynth.playSuccess();
  showToast(status ? "Registration opened" : "Registration closed", status ? "success" : "warning");
}

function clearAllRegistrations() {
  if (confirm("⚠️ Clear ALL team registrations? This cannot be undone!")) {
    localStorage.removeItem("registrations");
    CyberSynth.playWarning();
    showToast("All registrations cleared", "warning");
    renderAdminTeams();
    loadAdminOverview();
  }
}

function clearAllData() {
  if (confirm("⚠️ RESET EVERYTHING? All users, matches, teams, and settings will be deleted!")) {
    if (confirm("Are you SURE? This is irreversible!")) {
      localStorage.removeItem("users");
      localStorage.removeItem("matches");
      localStorage.removeItem("registrations");
      localStorage.removeItem("feedbacks");
      localStorage.removeItem("kills");
      localStorage.removeItem("rooms");
      CyberSynth.playWarning();
      showToast("All data has been reset", "warning");
      loadAdminOverview();
    }
  }
}

/*************************************************
 * 12. UTILITIES (WA, Room, Kills, AutoClear)
 *************************************************/
function sendWA() {
  const msg = `📢 Nighthawks FF Update\n\n🎮 Match Status: LIVE 🔴\n⚡ Join Fast!\n\n🌐 Register Now!`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

function saveRoom(matchId) {
  const id = prompt("Enter Room ID:");
  const pass = prompt("Enter Password:");
  if(!id || !pass) return;

  let rooms = {};
  try { rooms = JSON.parse(localStorage.getItem("rooms")) || {}; } catch { rooms = {}; }
  rooms[matchId] = { id, pass };
  localStorage.setItem("rooms", JSON.stringify(rooms));
  CyberSynth.playSuccess();
  showToast("🔑 Room details saved!", "success");
  renderAdminMatches();
}

function saveKills() {
  const team = document.getElementById("killTeam")?.value?.trim();
  const kills = parseInt(document.getElementById("killCount")?.value);
  if (!team || isNaN(kills)) { showToast("Enter valid team name and kill count", "error"); CyberSynth.playWarning(); return; }

  let board = getData("kills") || [];
  const existing = board.find(t => t.team === team);

  if (existing) { existing.kills += kills; } 
  else { board.push({team, kills}); }

  setData("kills", board);
  CyberSynth.playSuccess();
  showToast(`💀 ${kills} kills added for ${team}`, "success");
  
  document.getElementById("killTeam").value = "";
  document.getElementById("killCount").value = "";
}

function loadKillBoard() {
  const box = document.getElementById("killBoard");
  if (!box) return;
  
  let board = getData("kills").sort((a,b) => b.kills - a.kills);
  
  if (board.length === 0) {
    box.innerHTML = `
      <h3 style="color:var(--red); margin-bottom:8px;">💀 Kill Leaderboard</h3>
      <p class="text-muted">No kill data yet</p>
    `;
    return;
  }

  box.innerHTML = `
    <h3 style="color:var(--red); margin-bottom:12px;">💀 Kill Leaderboard</h3>
    ${board.slice(0, 10).map((t, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; ${i < board.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}">
        <span>
          <span style="color:${i < 3 ? 'var(--gold)' : 'var(--text-muted)'}; font-weight:700; margin-right:8px;">#${i+1}</span>
          <span style="color:var(--text-primary); font-weight:600;">${t.team}</span>
        </span>
        <span style="color:var(--red); font-weight:800;">${t.kills} kills</span>
      </div>
    `).join('')}
  `;
}

function autoClearAt9PM() {
  const now = new Date();
  if (now.getHours() >= 21) {
    if (!localStorage.getItem("clearedToday")) {
       localStorage.removeItem("registrations");
       localStorage.setItem("clearedToday", "true");
    }
  }
  if (now.getHours() < 21) {
    localStorage.removeItem("clearedToday");
  }
}

function startCountdown() {
  const timer = document.getElementById("countdownTimer");
  if (!timer) return;

  function update() {
    const now = new Date();
    const target = new Date();
    target.setHours(21, 0, 0, 0);

    const diff = target - now;

    if (diff <= 0) {
      timer.textContent = "00:00:00";
    } else {
      const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      timer.textContent = `${h}:${m}:${s}`;
    }
  }

  update();
  setInterval(update, 1000);
}

/*************************************************
 * 13. INITIALIZATION
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  autoClearAt9PM();

  // Next-Gen Interactive Hooks
  initCanvasParticles();
  init3DTilt();
  bindInteractiveSFX();
  initThemeSwitcher();
  initSFXSwitcher();

  const ann = localStorage.getItem("announcement");
  const box = document.getElementById("announcementBox");
  if(ann && box){
    box.innerText = "📢 " + ann;
    box.style.display = "block";
  }

  if (document.getElementById("matches")) {
    requireLogin();
    loadMatches();
    loadKillBoard();
    loadDashboardStats();
    startCountdown();
  }

  if (document.getElementById("myMatches")) {
    requireLogin();
    loadMyMatches();
  }

  if (document.getElementById("adminMatchList")) {
    requireAdmin();
    showTab('overview');
    
    if (document.getElementById("regStatusDisplay")) {
      const isOpen = localStorage.getItem("registrationOpen") !== "false";
      toggleReg(isOpen);
    }
  }
});