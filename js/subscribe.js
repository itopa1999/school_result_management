

async function fetchData() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/subscriptions/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to fetch subscription info:', response.statusText);
        return;
    }

    const data = await response.json();
    console.log(data)
    DisplayData(data.results);
  } catch (error) {
    console.error('error', '❌ Error fetching subscription:', error);
  }
}



function DisplayData(data) {
    const container = document.querySelector('.row.g-4');
    container.innerHTML = ''; // Clear current cards

    if (!data.length) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text- fs-5">No subscriptions found</div>
            </div>
        `;
        return;
    }

    data.forEach(sub => {
        const status = sub.status.toLowerCase();
        const badgeClass = {
            'active': 'bg-success',
            'expired': 'bg-secondary',
            'free': 'bg-warning text-dark'
        }[status] || 'bg-secondary';

        const statusLabel = {
            'active': 'Active',
            'expired': 'Expired',
            'free': 'Free Trial'
        }[status] || 'Unknown';

        const paidDate = sub.paid_on ? new Date(sub.paid_on) : null;
        const expiresDate = sub.expires_on ? new Date(sub.expires_on) : null;
        const today = new Date();

        // Calculate progress %
        let progress = 0;
        if (paidDate && expiresDate) {
            const total = expiresDate - paidDate;
            const used = today - paidDate;
            progress = Math.min(Math.max((used / total) * 100, 0), 100);
        }

        const paidText = paidDate ? `Paid: ${formatDate(paidDate)}` : 'Paid: N/A';
        const expiryText = expiresDate
            ? `${status === 'expired' ? 'Expired' : 'Expires'}: ${formatDate(expiresDate)}`
            : 'Expires: N/A';

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        col.innerHTML = `
          <div class="subscription-card shadow-sm p-4 rounded-4 h-100 border-0">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="fw-bold text-dark mb-1">${sub.session}</h5>
                <p class="text-muted small mb-0">${paidText}</p>
                <p class="text-muted small">${expiryText}</p>
              </div>
              <span class="badge ${badgeClass} text-uppercase">${statusLabel}</span>
            </div>
            <div class="progress" style="height: 6px;">
              <div class="progress-bar ${badgeClass}" style="width: ${progress.toFixed(0)}%;"></div>
            </div>
          </div>
        `;

        container.appendChild(col);
    });
}

function formatDate(date) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}



fetchData()