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
 * 2. STORAGE HELPERS
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
 * 3. AUTHENTICATION (User & Admin)
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
      if (msg) msg.innerText = "Account found. Please verify team name and login.";
    } else {
      showForm("registerForm");
      if (msg) msg.innerText = "New user? Register now.";
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
    showToast("All fields required");
    return;
  }
  
  let users = getUsers();
  if (users.find(u => u.mobile === mobile)) {
    showToast("User already exists");
    return;
  }
  
  const newUser = { team, mobile, password };
  users.push(newUser);
  setData("users", users);
  
  // Save object for session
  localStorage.setItem('loggedInUser', JSON.stringify(newUser));
  showToast("Registered successfully! Redirecting...");
  localStorage.setItem("openProfileAfterLogin", "true");
  window.location.href = 'dashboard.html';
}

function login() {
  const mobile = document.getElementById("mobile")?.value.trim();
  const team = document.getElementById("loginTeam")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  
  if (!mobile || !team || !password) {
    showToast("All fields required");
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
    showToast("Login successful! Welcome back, " + user.team);
    window.location.href = 'dashboard.html';
  } else {
    showToast("Invalid credentials");
  }
}

function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
}

function requireLogin() {
  if (!localStorage.getItem('loggedInUser')) {
    window.location.href = "index.html";
  }
}

// Admin Auth
function adminLogin() {
  const mobile = document.getElementById("adminMobile")?.value.trim();
  const password = document.getElementById("adminPassword")?.value.trim();

  const msg = document.getElementById("msg");

  if (mobile === ADMIN_CREDS.mobile && password === ADMIN_CREDS.password) {
    localStorage.setItem("admin", "true");
    window.location.href = "admin.html";
  } else {
    if (msg) msg.innerText = "Invalid credentials";
  }
}

function adminLogout() {
  localStorage.removeItem("admin");
  window.location.href = "admin-login.html";
}

function requireAdmin() {
  if (localStorage.getItem("admin") !== "true") {
    window.location.href = "admin-login.html";
  }
}

// Password Recovery
function openForgotPassword() {
  const mobile = prompt("Enter your registered mobile number");
  if (!mobile) return;

  const users = getUsers();
  const user = users.find(u => u.mobile === mobile);

  if (!user) {
    showToast("Mobile not registered");
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem("resetOTP", otp);
  localStorage.setItem("resetMobile", mobile);

  showToast("Your OTP is: " + otp);
  verifyOTP();
}


function verifyOTP() {
  const enteredOTP = prompt("Enter OTP");
  if (enteredOTP !== localStorage.getItem("resetOTP")) {
    showToast("Invalid OTP"); return;
  }
  resetPassword();
}

function resetPassword() {
  const newPass = prompt("Enter new password (8+ chars, letters & numbers)");
  const confirmPass = prompt("Confirm new password");
  
  if (!newPass || newPass !== confirmPass) { showToast("Passwords don't match"); return; }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(newPass)) {
    showToast("Password too weak"); return;
  }

  const users = getUsers();
  const mobile = localStorage.getItem("resetMobile");
  const user = users.find(u => u.mobile === mobile);
  
  user.password = newPass;
  setData("users", users);
  
  localStorage.removeItem("resetOTP");
  localStorage.removeItem("resetMobile");
  showToast("Password reset successful. Login now.");
}

/*************************************************
 * 4. DASHBOARD LOGIC (Matches & Registration)
 *************************************************/
function loadMatches() {

  const loggedUserStr = localStorage.getItem("loggedInUser");
let loggedUser = loggedUserStr ? JSON.parse(loggedUserStr) : null;

  const container = document.getElementById("matches");
  if (!container) return;

  const matches = getMatches();
  container.innerHTML = "";

  if (matches.length === 0) {
    container.innerHTML = '<p class="notice">No upcoming matches scheduled.</p>';
    return;
  }

  matches.forEach(match => {
    const card = document.createElement("div");
    card.className = "notice";
    card.style.borderLeft = "5px solid #00e5ff";
    
    card.innerHTML = `
    <img src="${loggedUser?.logo || 'nighthawks-logo3.png'}"
     style="width:40px;height:40px;border-radius:50%;margin-bottom:5px;">

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="color:#00e5ff; margin-bottom:5px;">${match.title}</h3>
          <p style="font-size:14px; color:#ddd;">
            <i class="fa-solid fa-map"></i> ${match.map} &nbsp;|&nbsp; 
            <i class="fa-solid fa-clock"></i> ${match.time}
          </p>
         ${match.link ? `
  <div style="margin-top:6px;">
    <a href="${match.link}" target="_blank" class="yt-link">
      Watch Stream
    </a>
  </div>
` : ''}

<div style="margin-top:6px;">
  <button onclick="showRegisteredTeams(${match.id})"
    style="background:#00e5ff;color:#000;
           border:none;padding:5px 10px;border-radius:6px;
           font-size:12px;cursor:pointer;">
    View Registered Teams
  </button>
</div>




  <span class="status-badge ${
  match.status === "Live" ? "status-live" :
  match.status === "Completed" ? "status-completed" :
  "status-upcoming"
}">
  ${match.status.toUpperCase()}
</span>

        </div>
        
        <div id="action-area-${match.id}">
           ${match.status === "Completed" 
             ? `<span style="color:#aaa;">Ended</span>` 
             : `<button onclick="initiateRegistration(${match.id})" class="neon-btn" style="font-size:14px; padding:8px 20px;">Register</button>`
           }
        </div>
      </div>
       ${document.getElementById("adminMatchList") 
   ? `<div id="batch-teams-${match.id}" style="margin-top:15px;"></div>` 
   : ""}
      <div id="register-form-${match.id}" style="margin-top:10px;"></div>
    `;
    
    container.appendChild(card);
   if (document.getElementById("adminMatchList")) {
  renderBatchTeams(match.id);
}


  });
}

function initiateRegistration(matchId) {
  if (localStorage.getItem("registrationOpen") === "false") {
    showToast("⛔ Registration is currently CLOSED by Admin.");
    return;
  }

  const box = document.getElementById(`register-form-${matchId}`);
  if(box) {
   box.innerHTML = `
<div class="register-box">

  <label>Player 1 (IGL)</label>
  <input id="p1-${matchId}" placeholder="Enter IGL Name">

  <label>Player 2</label>
  <input id="p2-${matchId}" placeholder="Enter Player 2">

  <label>Player 3</label>
  <input id="p3-${matchId}" placeholder="Enter Player 3">

  <label>Player 4</label>
  <input id="p4-${matchId}" placeholder="Enter Player 4">

  <button class="submit-btn" onclick="checkPaymentAndSubmit(${matchId})">
    Submit Team
  </button>

</div>
`;



  }
}

function nextStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step" + step).classList.remove("hidden");
}


function checkPaymentAndSubmit(matchId) {
  const paymentMode = localStorage.getItem("paymentMode") || "free";
  const p1 = document.getElementById(`p1-${matchId}`).value;
  if (!p1) { showToast("Please fill player details"); return; }

  if (paymentMode === "paid") {
    if(confirm("This is a PAID match. Did you scan the QR code?")) {
        submitMatch(matchId);
    }
  } else {
    submitMatch(matchId);
  }
}

function submitMatch(matchId) {
  console.log("SUBMIT CLICKED");
  const loggedInString = localStorage.getItem("loggedInUser");
  if (!loggedInString) { showToast("Please login first"); return; }
  
  // Get user info
  let user = JSON.parse(loggedInString);
  const users = getUsers();
  
  const p1 = document.getElementById(`p1-${matchId}`).value;
  const p2 = document.getElementById(`p2-${matchId}`).value;
  const p3 = document.getElementById(`p3-${matchId}`).value;
  const p4 = document.getElementById(`p4-${matchId}`).value;

  // Update user profile with player names
  user.players = [p1, p2, p3, p4];
  localStorage.setItem("loggedInUser", JSON.stringify(user));

  const userIndex = users.findIndex(u => u.mobile === user.mobile);
  if(userIndex > -1) {
      users[userIndex].players = [p1, p2, p3, p4];
      setData("users", users);
  }

  // Check Registration
  let regs = getRegistrations();
  if (regs.some(r => r.matchId === matchId && r.team === user.team)) {
    showToast("Already registered for this match"); return;
  }

  // Assign Batch
  let selectedBatch = null;
  for (let batch of BATCHES) {
    const count = regs.filter(r => r.matchId === matchId && r.batch === batch.name).length;
    if (count < MAX_TEAMS_PER_BATCH) {
      selectedBatch = batch;
      break;
    }
  }

  if(!selectedBatch) { showToast("All batches full"); return; }

  regs.push({
    matchId, 
    team: user.team, 
    batch: selectedBatch.name, 
    time: selectedBatch.time,
    players: [p1,p2,p3,p4], 
    paid: (localStorage.getItem("paymentMode")==="paid"),
    registeredAt: new Date().toLocaleString()
  });
  
  setData("registrations", regs);
  showToast("Registration Successful!");
  loadMatches();
}

function renderBatchTeams(matchId) {
  const box = document.getElementById(`batch-teams-${matchId}`);
  if (!box) return;

  const registrations = getRegistrations();
  let html = "";

  BATCHES.forEach(batch => {
    const teams = registrations.filter(r => r.matchId === matchId && r.batch === batch.name);
    html += `
      <div class="batch-box" style="margin-top:10px;">
        <h4 style="color:#00e5ff; font-size:14px;">${batch.name} (${teams.length}/12)</h4>
        ${ teams.length === 0
            ? `<p style="font-size:12px; color:#aaa;">No teams yet</p>`
            : `<ul style="list-style:none; padding-left:5px;">${teams.map((t,i)=>`<li style="font-size:12px; color:#ddd;">${i+1}. ${t.team}</li>`).join("")}</ul>`
        }
      </div>
    `;
  });
  box.innerHTML = html;
}

function loadMyMatches() {
  const box = document.getElementById("myMatches");
  if (!box) return;

  const loggedInUserStr = localStorage.getItem("loggedInUser");
  if (!loggedInUserStr) {
    box.innerHTML = `<div class="empty-box">Please login to view matches.</div>`;
    return;
  }
  
  const user = JSON.parse(loggedInUserStr);
  const regs = getRegistrations().filter(r => r.team === user.team);

  if (regs.length === 0) {
    box.innerHTML = `<div class="empty-box">No matches registered yet.</div>`;
    return;
  }

  box.innerHTML = "";
  regs.forEach(r => {
    const div = document.createElement("div");
    div.className = "my-match-card";
    div.innerHTML = `
      <h3>${r.team}</h3>
      <p>Batch: ${r.batch} | Time: ${r.time}</p>
      <p>Players: ${Array.isArray(r.players) ? r.players.join(", ") : 'N/A'}</p>
    `;
    box.appendChild(div);
  });
}

/*************************************************
 * 5. ADMIN PANEL FEATURES
 *************************************************/
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(d => {
    d.style.display = 'none';
    d.classList.remove('active');
  });
  document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));

  const activeContent = document.getElementById(`tab-${tabName}`);
  if(activeContent) {
      activeContent.style.display = 'block';
      activeContent.classList.add('active');
  }

  // Highlight button
  const buttons = document.querySelectorAll('.admin-tabs button');
  buttons.forEach(btn => {
    if(btn.innerText.toLowerCase().includes(tabName.substring(0,4))) {
       btn.classList.add('active');
    }
  });

  loadAdminTabs(tabName);
}

function loadAdminTabs(tabName) {
  if (tabName === 'matches' || !tabName) renderAdminMatches();
  if (tabName === 'users') renderAdminUsers();
  if (tabName === 'teams') renderAdminTeams();
  if (tabName === 'feedbacks') loadFeedbacks();
  if (tabName === 'settings') loadPaymentSettings();
}

// Matches Tab
function saveMatch() {
  const title = document.getElementById("m-title")?.value.trim();
  const map = document.getElementById("m-map")?.value.trim();
  const time = document.getElementById("m-time")?.value.trim();
  const link = document.getElementById("m-link")?.value.trim();

  if (!title || !map || !time) { showToast("Please fill Title, Map, Time"); return; }

  let matches = getMatches();
  matches.push({
  id: Date.now(),
  title, map, time, link: link || "",
  status: "Upcoming",
  winner: "",
  resultNote: "",
  viewers: Math.floor(Math.random() * 900) + 100
});

  setData("matches", matches);
  
  showToast("Match Created!");
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
    list.innerHTML = `<p style="color:#666; text-align:center;">No matches created yet.</p>`;
    return;
  }

  matches.forEach((m, index) => {
    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
      <h3>${m.title}</h3>
      <p>Map: ${m.map}</p>
      <p>IDP Time: ${m.time}</p>
      
      <label style="color:#aaa; font-size:12px;">Status:</label>
      <select onchange="updateMatchData(${index}, 'status', this.value)" style="margin-bottom:10px;">
          <option ${m.status==="Upcoming"?"selected":""}>Upcoming</option>
          <option ${m.status==="Live"?"selected":""}>Live</option>
          <option ${m.status==="Completed"?"selected":""}>Completed</option>
      </select>

      <input placeholder="Winner Team" value="${m.winner||""}" 
             onchange="updateMatchData(${index}, 'winner', this.value)">

      <input placeholder="Result Note" value="${m.resultNote||""}" 
             onchange="updateMatchData(${index}, 'resultNote', this.value)">

    <div style="display:flex; gap:5px; margin-top:5px;">
  <button onclick="saveRoom(${m.id})" style="background:#00e5ff;color:#000;flex:1;">
    Set Room
  </button>

  <button onclick="setResultImage(${m.id})" style="background:gold;color:black;flex:1;">
    Upload Result
  </button>

  <button onclick="deleteMatch(${index})" style="background:red;color:white;flex:1;">
    Delete
  </button>
</div>


    `;
    list.appendChild(div);
  });
}


function updateMatchData(index, field, value) {
  const matches = getMatches();
  matches[index][field] = value;

  if(field === "status" && value === "Live"){
    matches[index].viewers += Math.floor(Math.random()*50);
  }

  setData("matches", matches);
}




function deleteMatch(index) {
  if (confirm("Delete this match?")) {
    const matches = getMatches();
    matches.splice(index, 1);
    setData("matches", matches);
    renderAdminMatches();
  }
}

// Users Tab
function renderAdminUsers() {
  const list = document.getElementById("adminUserList");
  if(!list) return;
  const users = getUsers();
  list.innerHTML = "";

  users.forEach((u, index) => {
    const div = document.createElement("div");
    div.className = "match-card";
    div.innerHTML = `
      <h4 style="color:#3fb8ff">${u.team}</h4>
      <p>Mobile: ${u.mobile} | Pass: ******</p>
      <button onclick="editUser(${index})" style="padding:5px 10px; margin-right:5px;">Edit Pass</button>
      <button onclick="deleteUser(${index})" style="background:#ff3333; color:white; padding:5px 10px;">Remove</button>
    `;
    list.appendChild(div);
  });
}

function editUser(index) {
  const users = getUsers();
  const newPass = prompt("Enter new password for " + users[index].team);
  if(newPass) {
    users[index].password = newPass;
    setData("users", users);
    renderAdminUsers();
  }
}

function deleteUser(index) {
  if(confirm("Delete user?")) {
    const users = getUsers();
    users.splice(index, 1);
    setData("users", users);
    renderAdminUsers();
  }
}

// Teams Tab
function renderAdminTeams() {
  const list = document.getElementById("adminTeamList");
  if(!list) return;
  const regs = getRegistrations();
  list.innerHTML = "";

 regs.forEach((r, index) => {
  const div = document.createElement("div");
  div.className = "match-card";

  // 🔥 FIND MATCH USING matchId
  const m = getMatches().find(x => x.id === r.matchId);

  div.innerHTML = `
    <h4 style="color:#00e5ff">
      ${r.team}
      <span style="font-size:12px;color:#aaa;">(${r.batch})</span>
    </h4>

    ${m && m.status === "Live" ? `
      <span style="background:red;color:white;padding:2px 8px;border-radius:6px;font-size:12px;">
        🔴 LIVE
      </span>
      <span style="margin-left:10px;color:#00e5ff;font-size:12px;">
        👀 ${m.viewers || 0} watching
      </span>
    ` : `
      <span style="color:#aaa;">
        Status: ${m ? m.status : "Unknown"}
      </span>
    `}

    <p>Status: ${r.paid 
      ? '<span style="color:gold">PAID</span>' 
      : '<span style="color:#2ecc71">FREE</span>'}
    </p>

    <button onclick="deleteTeam(${index})"
      style="background:#ff4d4d;padding:5px;font-size:12px;margin-top:5px;">
      Remove
    </button>
  `;

  list.appendChild(div);
});

}

function deleteTeam(index) {
  if(confirm("Remove this team from tournament?")) {
    const regs = getRegistrations();
    regs.splice(index, 1);
    setData("registrations", regs);
    renderAdminTeams();
  }
}

// PDF Features
function downloadAdminPDF() {
  if (!window.jspdf) { showToast("PDF library not loaded"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const registrations = getRegistrations();
  let y = 10;
  doc.text("Nighthawks FF - Teams Report", 10, y); y += 10;
  registrations.forEach((r, i) => {
    doc.text(`${i + 1}. ${r.team} | ${r.batch} | ${r.paid ? 'PAID':'FREE'}`, 10, y); y += 6;
    doc.setFontSize(10);
    doc.text(`   Players: ${r.players.join(", ")}`, 10, y); y += 8;
    doc.setFontSize(16);
    if (y > 280) { doc.addPage(); y = 10; }
  });
  doc.save("nighthawks-teams.pdf");
}

function downloadUsersPDF() {
  if (!window.jspdf) { showToast("PDF library not loaded"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const users = getUsers();
  let y = 10;
  doc.text("Registered Users List", 10, y); y += 10;
  doc.setFontSize(12);
  users.forEach((u, i) => {
    doc.text(`${i+1}. ${u.team} | ${u.mobile}`, 10, y); y += 7;
    if (y > 280) { doc.addPage(); y = 10; }
  });
  doc.save("nighthawks-users.pdf");
}

/*************************************************
 * 6. FEEDBACK & SETTINGS
 *************************************************/
function toggleCareModal() {
  const modal = document.getElementById("careModal");
  if(modal) modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

function sendFeedback() {
  const text = document.getElementById("feedbackText")?.value?.trim();
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  
  if (!text) { showToast("Please type a message!"); return; }

  let feedbacks = getData("feedbacks");
  feedbacks.push({
    team: user.team || "Guest",
    mobile: user.mobile || "N/A",
    message: text,
    date: new Date().toLocaleString()
  });

  setData("feedbacks", feedbacks);
  showToast("Message Sent!");
  document.getElementById("feedbackText").value = "";
  toggleCareModal();
}

function loadFeedbacks() {
  const list = document.getElementById("adminFeedbackList");
  if (!list) return;
  const feedbacks = getData("feedbacks").reverse();
  list.innerHTML = "";
  
  if (feedbacks.length === 0) { list.innerHTML = "No messages."; return; }

  feedbacks.forEach(f => {
    const div = document.createElement("div");
    div.className = "match-card";
    div.style.borderLeft = "4px solid #ff00de";
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <h4 style="color:#fff;">${f.team}</h4>
        <small style="color:#aaa;">${f.date}</small>
      </div>
      <p style="color:#00e5ff;">Mobile: ${f.mobile}</p>
      <p style="background:#111; padding:5px;">${f.message}</p>
    `;
    list.appendChild(div);
  });
}

function clearFeedbacks() {
  if (confirm("Delete ALL messages?")) {
    localStorage.removeItem("feedbacks");
    loadFeedbacks();
  }
}

// Settings
function saveAnnouncement() {
  const text = document.getElementById("announcementText")?.value;
  localStorage.setItem("announcement", text);
  showToast("Announcement saved!");
}

function clearAnnouncement() {
  localStorage.removeItem("announcement");
  showToast("Cleared");
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
        qrSec.style.display = "block";
        if(qr && img) img.src = qr;
    } else {
        qrSec.style.display = "none";
    }
}

function savePaymentSettings() {
    const mode = document.getElementById("paymentMode").value;
    localStorage.setItem("paymentMode", mode);
    
    const qrSec = document.getElementById("qrSection");
    if(mode === "paid") {
        qrSec.style.display = "block";
        const qrUrl = document.getElementById("qrCodeUrl").value;
        localStorage.setItem("qrCodeUrl", qrUrl);
        document.getElementById("previewQR").src = qrUrl;
    } else {
        qrSec.style.display = "none";
    }
}

function toggleReg(status) {
  localStorage.setItem("registrationOpen", status ? "true" : "false");
  const statusDisplay = document.getElementById("regStatusDisplay");
  if (statusDisplay) {
    statusDisplay.innerText = status ? "STATUS: OPEN ✅" : "STATUS: CLOSED ⛔";
    statusDisplay.style.color = status ? "#00e5ff" : "red";
  }
}

/*************************************************
 * 7. UTILITIES (WA, Room, Kills, AutoClear)
 *************************************************/
function sendWA() {
  const msg = `📢 Nighthawks FF Update\n\nMatch Status: LIVE 🔴\nJoin Fast!`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}

function saveRoom(matchId) {
  const id = prompt("Enter Room ID:");
  const pass = prompt("Enter Password:");
  if(!id || !pass) return;

  let rooms = getData("rooms") || {};
  rooms[matchId] = { id, pass };
  setData("rooms", rooms);
  showToast("Room details saved!");
}

function saveKills() {
  const team = document.getElementById("killTeam")?.value;
  const kills = parseInt(document.getElementById("killCount")?.value);
  if (!team || isNaN(kills)) { showToast("Enter valid data"); return; }

  let board = getData("kills") || [];
  const existing = board.find(t => t.team === team);

  if (existing) { existing.kills += kills; } 
  else { board.push({team, kills}); }

  setData("kills", board);
  showToast("Kills updated!");
}

function autoClearAt9PM() {
  const now = new Date();
  const today = now.toDateString();

  if (now.getHours() >= 21) {
    if (localStorage.getItem("clearedToday") !== today) {
      localStorage.removeItem("registrations");
      localStorage.setItem("clearedToday", today);
    }
  }
}


/*************************************************
 * 8. INITIALIZATION
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
  autoClearAt9PM();

  // Load Announcement
  const ann = localStorage.getItem("announcement");
  const box = document.getElementById("announcementBox");
  if(ann && box){
    box.innerText = "📢 " + ann;
    box.style.display = "block";
  }

  // Page Specific Inits
 if (document.getElementById("matches")) {
  requireLogin();
  loadMatches();
  startCountdown(); // ADD THIS LINE
  loadLeaderboard();

}


  if (document.getElementById("myMatches")) {
    requireLogin();
    loadMyMatches();
  }

  if (document.getElementById("adminMatchList")) {
    requireAdmin();
    showTab('matches');
    
    if (document.getElementById("regStatusDisplay")) {
         const isOpen = localStorage.getItem("registrationOpen") === "true";
         toggleReg(isOpen);
    }
  }
  // 🔥 Restore Countdown Button State
const btn = document.getElementById("startBtn");
const end = Number(localStorage.getItem("registrationEnd"));


if (btn && end && Date.now() < end) {
  btn.innerText = "⏳ Countdown Running...";
  btn.disabled = true;
  btn.style.opacity = "0.7";
}

// SECRET ADMIN TAP
const secretLogo = document.getElementById("secretLogo");
let tapCount = 0;

if (secretLogo) {
  secretLogo.addEventListener("click", () => {
    tapCount++;

    if (navigator.vibrate) navigator.vibrate(50);

    if (tapCount >= 5) {
      window.location.href = "admin-login.html";
      tapCount = 0;
    }

    setTimeout(() => tapCount = 0, 2000);
  });
}


});

// COUNTDOWN REGISTER //

// Add this function to your script (e.g., under Utilities)
function startCountdown() {
  const timerEl = document.getElementById("countdownTimer");
  if (!timerEl) return;

  const endTime = Number(localStorage.getItem("registrationEnd"));

  if (!endTime) {
    timerEl.innerText = "Closed";
    return;
  }

  const interval = setInterval(() => {
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      clearInterval(interval);
      timerEl.innerText = "Closed";
      localStorage.setItem("registrationOpen", "false");
      return;
    }

    const m = Math.floor((remaining / 1000 / 60) % 60);
    const s = Math.floor((remaining / 1000) % 60);
    const h = Math.floor(remaining / 1000 / 60 / 60);

    timerEl.innerText = `${h}:${m}:${s}`;
  }, 1000);
}

function openProfile() {
  const modal = document.getElementById("profileModal");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) return;
  
  document.getElementById("profileTeamName").value = user.team || "";
  document.getElementById("profileMobile").value = user.mobile || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePlace").value = user.place || "";

  document.getElementById("profileLogo").src = user.logo || "nighthawks-logo3.png";

  modal.style.display = "flex";
}

function closeProfile() {
  document.getElementById("profileModal").style.display = "none";
}

function saveProfile() {
  let user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

  user.team = document.getElementById("profileTeamName").value;
  user.mobile = document.getElementById("profileMobile").value;
  user.email = document.getElementById("profileEmail").value;
  user.place = document.getElementById("profilePlace").value;


  localStorage.setItem("loggedInUser", JSON.stringify(user));
  showToast("Profile Updated!");

}

document.getElementById("logoInput")?.addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgData = e.target.result;

    let user = JSON.parse(localStorage.getItem("loggedInUser"));
    user.logo = imgData;
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    document.getElementById("profileLogo").src = imgData;
  };
  reader.readAsDataURL(file);
});


function handleLogoUpload() {
  const input = document.getElementById("logoInput");
  if (!input || !input.files.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const imgData = e.target.result;

    let user = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    user.logo = imgData;
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    const img = document.getElementById("profileLogo");
    if (img) img.src = imgData;
  };

  reader.readAsDataURL(file);
}


// COUNTDOWN 

function openRegistration() {
  const minutes = parseInt(document.getElementById("countdownMinutes")?.value);

  if (!minutes || minutes <= 0) {
    showToast("Enter valid minutes");
    return;
  }

  const endTime = Date.now() + (minutes * 60 * 1000);

  localStorage.setItem("registrationEnd", endTime);
  localStorage.setItem("registrationOpen", "true");

  showToast("Countdown Started!");

  const btn = document.getElementById("startBtn");
  if (btn) {
    btn.innerText = "⏳ Countdown Running...";
    btn.disabled = true;
    btn.style.opacity = "0.7";
  }
}



function closeRegistration() {
  localStorage.setItem("registrationOpen", "false");
  localStorage.removeItem("registrationEnd");
  showToast("Countdown Stopped!");

  const btn = document.getElementById("startBtn");
  if (btn) {
    btn.innerText = "Start Countdown";
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}


function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.innerText = msg;
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
 }, 2500);

}

// HISTORY
function openHistory() {
  const modal = document.getElementById("historyModal");
  const list = document.getElementById("historyList");

  const userStr = localStorage.getItem("loggedInUser");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const regs = getRegistrations().filter(r => r.team === user.team);
  const matches = getMatches();

  list.innerHTML = "";

  const completed = regs.filter(r => {
    const m = matches.find(x => x.id === r.matchId);
    return m && m.status === "Completed";
  });

  if (completed.length === 0) {
    list.innerHTML = "<p style='color:#aaa;'>No completed matches yet.</p>";
  } else {
    completed.forEach(r => {
      const m = matches.find(x => x.id === r.matchId);

      const div = document.createElement("div");
      div.className = "notice";
      div.innerHTML = `
        <h3 style="color:#00e5ff;">${m.title}</h3>
        <p>Map: ${m.map}</p>
        <p>Batch: ${r.batch}</p>
        <p>Result: ${m.winner || "—"}</p>
      `;
      list.appendChild(div);
    });
  }
  

  modal.style.display = "flex";
}

function closeHistory() {
  document.getElementById("historyModal").style.display = "none";
}


// STANDINGS
function openStandings() {
  const modal = document.getElementById("standingsModal");
  const list = document.getElementById("standingsList");
  const matches = getMatches();

  list.innerHTML = "";

  matches.forEach(m => {
    const div = document.createElement("div");
    div.className = "notice";
    div.style.cursor = "pointer";
    div.innerHTML = `<h3 style="color:#00e5ff;">${m.title}</h3>`;

    div.onclick = () => viewResult(m.id);

    list.appendChild(div);
  });

  modal.style.display = "flex";
}

function closeStandings() {
  document.getElementById("standingsModal").style.display = "none";
}

function viewResult(matchId) {
  const results = JSON.parse(localStorage.getItem("results")) || {};
  const img = results[matchId];

  if (!img) {
    showToast("Results Soon");
    return;
  }

  const viewer = document.createElement("div");
  viewer.className = "modal-overlay";
  viewer.innerHTML = `
    <div class="modal-box">
      <img src="${img}" style="width:100%; border-radius:10px;">
      <button class="neon-btn" onclick="this.closest('.modal-overlay').remove()">Close</button>
    </div>
  `;

  document.body.appendChild(viewer);
}



// SAVE IMAGE

function setResultImage(matchId) {
  const url = prompt("Paste Result Image Link");
  if (!url) return;

  let results = JSON.parse(localStorage.getItem("results")) || {};
  results[matchId] = url;
  localStorage.setItem("results", JSON.stringify(results));

  showToast("Result Uploaded!");
}

// LEADERBOARD
function loadLeaderboard() {
  const box = document.getElementById("leaderboardBox");
  if (!box) return;

  let board = getData("kills") || [];

  if (board.length === 0) {
    box.innerHTML = "<h3>🏆 Leaderboard</h3><p>No Data Yet</p>";
    return;
  }

  board.sort((a,b)=>b.kills-a.kills);

  box.innerHTML = "<h3>🏆 Leaderboard</h3>" +
    board.map((t,i)=>`<p>#${i+1} ${t.team} — ${t.kills} Kills</p>`).join("");
}

// REGISTERED TEAMS

function showRegisteredTeams(matchId) {
  const regs = getRegistrations().filter(r => r.matchId === matchId);

  if (regs.length === 0) {
    showToast("No teams registered yet");
    return;
  }

  const viewer = document.createElement("div");
  viewer.className = "modal-overlay";

  viewer.innerHTML = `
    <div class="modal-box">
      <h3 style="color:#00e5ff;">Registered Teams</h3>
      <ul style="list-style:none;padding:0;">
        ${regs.map(r => `<li style="margin:5px 0;">• ${r.team}</li>`).join("")}
      </ul>
      <button class="neon-btn"
        onclick="this.closest('.modal-overlay').remove()">
        Close
      </button>
    </div>
  `;

  document.body.appendChild(viewer);
}

// ANNOUNCEMENTS


function openAnnouncements() {
  const text = localStorage.getItem("announcement") || "No announcements yet.";
  document.getElementById("announcementTextUser").innerText = text;
  document.getElementById("announcementModal").style.display = "flex";
}

function closeAnnouncements() {
  document.getElementById("announcementModal").style.display = "none";
}

