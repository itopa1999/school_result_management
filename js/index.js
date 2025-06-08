// restrictPageAccess({
//     onlyAdmin: true,
//   });

  async function fetchData() {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/dashboard/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.status === 401 || response.status === 403) {
            window.location.href = 'auth.html';
            return;
        }

        if (!response.ok) {
            showAlert('error', '❌ Failed to fetch dashboard info:', response.statusText);
            return;
        }

        const data = await response.json();
        
        displayData(data);
        renderSubscriptionCard(data.subscription_info)
    } catch (error) {
        showAlert('error','❌ Error fetching dashboard info:', error);
    }
}

function displayData(data){
    console.log(data)
    document.getElementById("sessionVal").innerHTML = data.current_session;
    document.getElementById("termVal").innerHTML = data.current_term
    document.getElementById("active-class").innerHTML = data.active_classes
    document.getElementById('schoolNameCard').textContent = data.school_info.school_name;
    document.getElementById("school_location").innerHTML = data.school_info.location
    document.getElementById("total_students").innerHTML = data.school_info.total_students
    document.getElementById("total-subjects").innerHTML = data.total_subjects
    
}


function renderSubscriptionCard(subscription) {
  const container = document.querySelector('.dashboard-card.subscription-card');

  if (!subscription) {
    container.innerHTML = `
      <div class="card-body text-center text-muted">
        <p>No subscription info available</p>
      </div>
    `;
    return;
  }

  // Status and style mapping
  const status = subscription.status.toLowerCase();
  const isFree = status === 'free';
  const badgeClass = isFree ? 'bg-warning text-dark' : 'bg-success text-white';
  const badgeIcon = isFree ? 'fa-star' : 'fa-check-circle';
  const badgeText = isFree ? 'Free Plan' : 'Active Plan';
  const planDescription = isFree
    ? 'This is a test Subscription'
    : 'Full Subscription';

  // Dates formatting fallback
  const expiresOn = subscription.expires_on ? new Date(subscription.expires_on).toLocaleDateString() : 'N/A';
  const paidOn = subscription.paid_on ? new Date(subscription.paid_on).toLocaleDateString() : 'N/A';

  container.innerHTML = `
    <div class="card-header">
      <div class="card-header-text">
        <i class="fas fa-credit-card"></i> Subscription Status
      </div>
    </div>
    <div class="card-body">
      <div class="subscription-status d-flex align-items-center mb-3 gap-3">
        <span class="status-badge badge ${badgeClass} d-flex align-items-center gap-2 px-3 py-1 rounded">
          <i class="fas ${badgeIcon}"></i> ${badgeText}
        </span>
        <div>
          <h5 class="${isFree ? 'text-warning' : 'text-success'} mb-0">${subscription.session}</h5>
          <p class="text-muted mb-0">${planDescription}</p>
        </div>
      </div>

      <div class="subscription-details">
        <div class="d-flex flex-wrap justify-content-between">
          <div class="text-secondary">
            <p class="mb-1 "><strong>Expiration:</strong> ${expiresOn}</p>
            <p class="mb-0"><strong>Paid On:</strong> ${paidOn}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}



fetchData();


const counters = document.querySelectorAll('.counter-animation');
counters.forEach(counter => {
    const target = +counter.innerText;
    let count = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
    
    const updateCount = () => {
        count += increment;
        if (count < target) {
            counter.innerText = Math.ceil(count);
            setTimeout(updateCount, 16);
        } else {
            counter.innerText = target;
        }
    };
    
    updateCount();
});