// ===========================
// ===== DEFAULT EVENTS =====
// ===========================

const DEFAULT_EVENTS = [
  { id: 'e1', name: 'Bangalore Music Fest', category: 'Music', date: '2026-07-15', time: '06:00 PM', venue: 'Palace Grounds, Bangalore', price: 500, seats: 200, registered: 45, desc: 'A grand music festival featuring top artists from across India.' },
  { id: 'e2', name: 'Tech Summit 2026', category: 'Technology', date: '2026-07-20', time: '09:00 AM', venue: 'NIMHANS Convention, Bangalore', price: 299, seats: 150, registered: 80, desc: 'Annual technology summit with talks on AI, Web3, and Cloud.' },
  { id: 'e3', name: 'IPL Fan Meet', category: 'Sports', date: '2026-08-05', time: '04:00 PM', venue: 'Chinnaswamy Stadium, Bangalore', price: 0, seats: 300, registered: 120, desc: 'Meet your favourite IPL stars and enjoy cricket activities.' },
  { id: 'e4', name: 'Food Carnival Mysuru', category: 'Food', date: '2026-07-28', time: '11:00 AM', venue: 'Mysuru Palace Grounds', price: 150, seats: 500, registered: 200, desc: 'Taste cuisines from 50+ stalls — street food, desserts & more.' },
  { id: 'e5', name: 'Art & Craft Exhibition', category: 'Art', date: '2026-08-10', time: '10:00 AM', venue: 'Jaganmohan Palace, Mysuru', price: 100, seats: 100, registered: 30, desc: 'Showcasing local artists and handcraft from Karnataka.' },
  { id: 'e6', name: 'Startup Pitch Day', category: 'Business', date: '2026-08-18', time: '10:00 AM', venue: 'T-Hub, Hyderabad', price: 0, seats: 80, registered: 40, desc: 'Pitch your startup idea to top investors and mentors.' },
];

// ===== LOAD DATA =====
let events        = JSON.parse(localStorage.getItem('em_events'))        || DEFAULT_EVENTS;
let registrations = JSON.parse(localStorage.getItem('em_registrations')) || [];

// ===== SAVE =====
function save() {
  localStorage.setItem('em_events',        JSON.stringify(events));
  localStorage.setItem('em_registrations', JSON.stringify(registrations));
}

// ===========================
// ===== NAVIGATION =====
// ===========================

function showPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');

  document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (page === 'home')            renderHome();
  if (page === 'events')          renderEvents();
  if (page === 'register')        loadEventDropdown();
  if (page === 'myregistrations') renderRegistrations();
  if (page === 'admin')           renderAdmin();
}

function filterByCategory(cat) {
  showPage('events', null);
  document.getElementById('filter-category').value = cat;
  renderEvents();
}

// ===========================
// ===== HOME PAGE =====
// ===========================

function renderHome() {
  const today    = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.date >= today).length;

  document.getElementById('stat-total').textContent         = events.length;
  document.getElementById('stat-registrations').textContent = registrations.length;
  document.getElementById('stat-upcoming').textContent      = upcoming;

  // Show first 3 events as featured
  const featured = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  document.getElementById('featured-events').innerHTML = featured.map(e => eventCardHTML(e)).join('');
}

// ===========================
// ===== EVENTS PAGE =====
// ===========================

function renderEvents() {
  const search   = (document.getElementById('search-input')?.value || '').toLowerCase();
  const category = document.getElementById('filter-category')?.value || 'all';

  let filtered = events;
  if (category !== 'all') filtered = filtered.filter(e => e.category === category);
  if (search)             filtered = filtered.filter(e =>
    e.name.toLowerCase().includes(search) ||
    e.venue.toLowerCase().includes(search) ||
    e.desc.toLowerCase().includes(search)
  );

  // Sort by date
  filtered = filtered.sort((a, b) => a.date.localeCompare(b.date));

  const grid = document.getElementById('events-grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="no-items" style="grid-column:1/-1">No events found. Try a different search!</p>';
    return;
  }
  grid.innerHTML = filtered.map(e => eventCardHTML(e)).join('');
}

function eventCardHTML(e) {
  const today     = new Date().toISOString().split('T')[0];
  const isPast    = e.date < today;
  const isFull    = e.registered >= e.seats;
  const seatsLeft = e.seats - e.registered;

  const catIcons = { Music: '🎵', Technology: '💻', Sports: '⚽', Food: '🍕', Art: '🎨', Business: '💼' };

  return `
    <div class="event-card">
      <span class="event-cat-badge">${catIcons[e.category] || '🎪'} ${e.category}</span>
      <h3>${e.name}</h3>
      <div class="event-meta">
        <p>📅 ${formatDate(e.date)} at ${e.time}</p>
        <p>📍 ${e.venue}</p>
        <p>📝 ${e.desc}</p>
      </div>
      <div class="event-footer">
        <div>
          <div class="event-price">${e.price === 0 ? '🆓 Free' : '₹' + e.price.toLocaleString('en-IN')}</div>
          <div class="event-seats ${isFull ? 'seats-full' : ''}">
            ${isFull ? '🔴 Fully Booked' : `${seatsLeft} seats left`}
          </div>
        </div>
        ${!isPast && !isFull
          ? `<button class="btn-register" onclick="goRegister('${e.id}')">Register →</button>`
          : isPast
            ? `<span style="font-size:0.8rem;color:#aaa;">Event Ended</span>`
            : `<span style="font-size:0.8rem;color:#ef4444;font-weight:700;">Full</span>`
        }
      </div>
    </div>
  `;
}

function goRegister(eventId) {
  showPage('register', null);
  loadEventDropdown();
  document.getElementById('reg-event').value = eventId;
  updateEventPreview();
}

// ===========================
// ===== REGISTER PAGE =====
// ===========================

function loadEventDropdown() {
  const today = new Date().toISOString().split('T')[0];
  const sel   = document.getElementById('reg-event');
  const available = events.filter(e => e.date >= today && e.registered < e.seats);

  sel.innerHTML = '<option value="">-- Select an event --</option>' +
    available.map(e => `<option value="${e.id}">${e.name} — ${formatDate(e.date)}</option>`).join('');

  document.getElementById('event-preview').style.display = 'none';
  document.getElementById('reg-error').style.display     = 'none';
  document.getElementById('reg-success').style.display   = 'none';
}

document.addEventListener('change', function(e) {
  if (e.target.id === 'reg-event' || e.target.id === 'reg-tickets') updateEventPreview();
});

function updateEventPreview() {
  const eventId = document.getElementById('reg-event').value;
  const tickets = parseInt(document.getElementById('reg-tickets').value) || 1;
  const preview = document.getElementById('event-preview');

  if (!eventId) { preview.style.display = 'none'; return; }

  const ev = events.find(e => e.id === eventId);
  if (!ev)  { preview.style.display = 'none'; return; }

  document.getElementById('prev-name').textContent    = ev.name;
  document.getElementById('prev-cat').textContent     = ev.category;
  document.getElementById('prev-date').textContent    = `${formatDate(ev.date)} at ${ev.time}`;
  document.getElementById('prev-venue').textContent   = ev.venue;
  document.getElementById('prev-tickets').textContent = tickets;
  document.getElementById('prev-total').textContent   = ev.price === 0 ? 'Free' : '₹' + (ev.price * tickets).toLocaleString('en-IN');

  preview.style.display = 'block';
}

function registerForEvent() {
  const name    = document.getElementById('reg-name').value.trim();
  const email   = document.getElementById('reg-email').value.trim();
  const phone   = document.getElementById('reg-phone').value.trim();
  const eventId = document.getElementById('reg-event').value;
  const tickets = parseInt(document.getElementById('reg-tickets').value);
  const notes   = document.getElementById('reg-notes').value.trim();

  const errEl = document.getElementById('reg-error');
  const sucEl = document.getElementById('reg-success');
  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!name)              { showError(errEl, 'Please enter your full name.');        return; }
  if (!email)             { showError(errEl, 'Please enter your email.');            return; }
  if (!phone || phone.length < 10) { showError(errEl, 'Please enter a valid phone number.'); return; }
  if (!eventId)           { showError(errEl, 'Please select an event.');             return; }

  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  if (ev.registered + tickets > ev.seats) {
    showError(errEl, `Only ${ev.seats - ev.registered} seats left. Please reduce ticket count.`);
    return;
  }

  // Check duplicate
  const already = registrations.find(r => r.email === email && r.eventId === eventId);
  if (already) { showError(errEl, 'You have already registered for this event.'); return; }

  const regId = 'REG' + Date.now().toString().slice(-6);
  const total = ev.price * tickets;

  ev.registered += tickets;

  registrations.push({
    id: regId, name, email, phone, eventId,
    eventName: ev.name, category: ev.category,
    date: ev.date, time: ev.time, venue: ev.venue,
    tickets, total, notes,
    registeredAt: new Date().toISOString()
  });

  save();

  sucEl.textContent   = `✅ Registered successfully! ID: ${regId} | ${ev.name} | ${tickets} ticket${tickets > 1 ? 's' : ''}${total > 0 ? ' | ₹' + total.toLocaleString('en-IN') : ' | Free'}`;
  sucEl.style.display = 'block';

  // Reset
  document.getElementById('reg-name').value    = '';
  document.getElementById('reg-email').value   = '';
  document.getElementById('reg-phone').value   = '';
  document.getElementById('reg-event').value   = '';
  document.getElementById('reg-tickets').value = '1';
  document.getElementById('reg-notes').value   = '';
  document.getElementById('event-preview').style.display = 'none';
}

// ===========================
// ===== MY REGISTRATIONS =====
// ===========================

function renderRegistrations() {
  const list = document.getElementById('registrations-list');

  if (registrations.length === 0) {
    list.innerHTML = '<p class="no-items">No registrations yet. Register for an event! 🎉</p>';
    return;
  }

  const sorted = [...registrations].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  list.innerHTML = sorted.map(r => `
    <div class="reg-card">
      <div class="reg-info">
        <h3>🎪 ${r.eventName} <span style="font-size:0.78rem;color:#a78bfa;font-weight:600;">(${r.category})</span></h3>
        <p>📅 ${formatDate(r.date)} at ${r.time}</p>
        <p>📍 ${r.venue}</p>
        <p>👤 ${r.name} &nbsp;|&nbsp; ✉️ ${r.email} &nbsp;|&nbsp; 📞 ${r.phone}</p>
        ${r.notes ? `<p>📝 Note: ${r.notes}</p>` : ''}
        <div class="reg-id">Registration ID: ${r.id} | Registered: ${formatDateTime(r.registeredAt)}</div>
      </div>
      <div>
        <div class="reg-amount">
          ${r.total === 0 ? 'Free' : '₹' + r.total.toLocaleString('en-IN')}
          <span>${r.tickets} Ticket${r.tickets > 1 ? 's' : ''}</span>
        </div>
        <button class="btn btn-danger" style="margin-top:10px;width:100%;" onclick="cancelRegistration('${r.id}')">Cancel</button>
      </div>
    </div>
  `).join('');
}

function cancelRegistration(id) {
  if (!confirm('Cancel this registration?')) return;
  const reg = registrations.find(r => r.id === id);
  if (!reg) return;

  const ev = events.find(e => e.id === reg.eventId);
  if (ev) ev.registered = Math.max(0, ev.registered - reg.tickets);

  registrations = registrations.filter(r => r.id !== id);
  save();
  renderRegistrations();
}

function clearRegistrations() {
  if (registrations.length === 0) return;
  if (!confirm('Clear ALL registrations?')) return;
  registrations.forEach(r => {
    const ev = events.find(e => e.id === r.eventId);
    if (ev) ev.registered = Math.max(0, ev.registered - r.tickets);
  });
  registrations = [];
  save();
  renderRegistrations();
}

// ===========================
// ===== ADMIN PAGE =====
// ===========================

function renderAdmin() {
  const today    = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.date >= today).length;
  const revenue  = registrations.reduce((sum, r) => sum + r.total, 0);

  document.getElementById('a-total').textContent    = events.length;
  document.getElementById('a-regs').textContent     = registrations.length;
  document.getElementById('a-upcoming').textContent = upcoming;
  document.getElementById('a-revenue').textContent  = '₹' + revenue.toLocaleString('en-IN');

  const catIcons = { Music: '🎵', Technology: '💻', Sports: '⚽', Food: '🍕', Art: '🎨', Business: '💼' };
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = events.map(e => {
    const isPast = e.date < today;
    return `
      <tr>
        <td><strong>${catIcons[e.category] || '🎪'} ${e.name}</strong></td>
        <td>${e.category}</td>
        <td>${formatDate(e.date)}</td>
        <td>${e.venue}</td>
        <td>${e.price === 0 ? 'Free' : '₹' + e.price}</td>
        <td>${e.seats}</td>
        <td>${e.registered}</td>
        <td>
          <span class="badge ${isPast ? 'badge-past' : 'badge-upcoming'}">${isPast ? 'Past' : 'Upcoming'}</span>
          <button class="btn btn-danger" style="margin-left:8px;" onclick="deleteEvent('${e.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  // Set min date for new event
  document.getElementById('ev-date').min = today;
}

function addEvent() {
  const name     = document.getElementById('ev-name').value.trim();
  const category = document.getElementById('ev-category').value;
  const date     = document.getElementById('ev-date').value;
  const time     = document.getElementById('ev-time').value;
  const venue    = document.getElementById('ev-venue').value.trim();
  const price    = parseInt(document.getElementById('ev-price').value) || 0;
  const seats    = parseInt(document.getElementById('ev-seats').value);
  const desc     = document.getElementById('ev-desc').value.trim();

  const errEl = document.getElementById('admin-error');
  const sucEl = document.getElementById('admin-success');
  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!name)  { showError(errEl, 'Please enter event name.');  return; }
  if (!date)  { showError(errEl, 'Please select a date.');     return; }
  if (!time)  { showError(errEl, 'Please select a time.');     return; }
  if (!venue) { showError(errEl, 'Please enter venue.');       return; }
  if (!seats || seats <= 0) { showError(errEl, 'Please enter valid seat count.'); return; }

  const newEvent = {
    id: 'e' + Date.now(),
    name, category, date, time, venue, price, seats,
    registered: 0, desc: desc || 'No description provided.'
  };

  events.push(newEvent);
  save();

  sucEl.textContent   = `✅ Event "${name}" added successfully!`;
  sucEl.style.display = 'block';

  // Clear form
  ['ev-name','ev-date','ev-time','ev-venue','ev-price','ev-seats','ev-desc'].forEach(id => {
    document.getElementById(id).value = '';
  });

  renderAdmin();
}

function deleteEvent(id) {
  if (!confirm('Delete this event? All its registrations will also be removed.')) return;
  events = events.filter(e => e.id !== id);
  registrations = registrations.filter(r => r.eventId !== id);
  save();
  renderAdmin();
}

// ===========================
// ===== HELPERS =====
// ===========================

function showError(el, msg) {
  el.textContent   = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ===== INIT =====
renderHome();
