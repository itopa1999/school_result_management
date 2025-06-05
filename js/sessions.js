


async function fetchSessions() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/sessions/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to fetch session lists info:', response.statusText);
        return;
    }

    const data = await response.json();
    console.log(data)
    renderSessions(data);
  } catch (error) {
    console.error('error', '❌ Error fetching sessions:', error);
  }
}
function renderSessions(sessions) {
  const container = document.getElementById('sessionContainer');
  container.innerHTML = '';

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center mt-5">
        <p class="text-mute mb-3">No academic sessions found.</p>
        <button class="btn btn-green" data-bs-toggle="modal" data-bs-target="#addSessionModal">Add Session</button>
      </div>
    `;
    return;
  }

  sessions.forEach(session => {
    let termsHTML = '';
    session.terms.forEach(term => {
      termsHTML += `
        <div class="form-check form-switch mb-2">
          <input class="form-check-input term-toggle" type="checkbox" ${term.is_current ? 'checked' : ''} 
            data-term-id="${term.id}" data-session-id="${session.id}">
          <label class="form-check-label ms-2">
            <i class="fas fa-calendar-week me-1 text-secondary"></i> ${term.name}
          </label>
        </div>
      `;
    });

    const cardHTML = `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card border-0 shadow-lg h-100 rounded-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="card-title fw-bold mb-0">
                  <i class="fas fa-school me-2 text-success"></i> ${session.name}
                </h5>
                <span class="badge bg-${session.is_current ? 'success' : 'secondary'} mt-1">
                  ${session.is_current ? 'Current Session' : 'Inactive'}
                </span>
              </div>
              <div class="form-check form-switch mt-1">
                <input class="form-check-input session-toggle" type="checkbox" ${session.is_current ? 'checked' : ''} 
                  data-session-id="${session.id}">
              </div>
            </div>
            <h6 class="fw-semibold text-muted mb-2">Terms</h6>
            ${termsHTML}
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });

  setupToggles();
}


function setupToggles() {
  // Session toggle
  document.querySelectorAll('.session-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const sessionId = e.target.dataset.sessionId;
      await fetch(`${ADMIN_BASE_URL}/sessions/${sessionId}/toggle/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchSessions();
    });
  });

  // Term toggle
  document.querySelectorAll('.term-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const termId = e.target.dataset.termId;
      const sessionId = e.target.dataset.sessionId;
      const response = await fetch(`${ADMIN_BASE_URL}/terms/${termId}/toggle/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        showAlert('error', '❌ ' + data.error || '❌ Failed to update term');
      }
      fetchSessions();
    });
  });
}


document.getElementById('addSessionForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const sessionName = document.getElementById('sessionName').value.trim();
  const isCurrent = document.getElementById('isCurrentSwitch').checked;

  if (!sessionName) return;

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/add/sessions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_name: sessionName,
        is_current: isCurrent
      })
    });

    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    const data = await response.json();

    if (!response.ok) {
      showAlert('error', '❌ ' + data.error || '❌ Failed to create session');
      return;
    }

    showAlert('success', '✅ Session created successfully');
    fetchSessions(); // Refresh session list

    const modal = bootstrap.Modal.getInstance(document.getElementById('addSessionModal'));
    modal.hide();
    this.reset();
  } catch (error) {
    showAlert('error', '❌ Error creating session');
    console.log(error)
  }
});



fetchSessions()