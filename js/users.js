

document.addEventListener("DOMContentLoaded", function () {

    
    async function fetchData() {
        try {
            const response = await fetch(`${ADMIN_BASE_URL}/school-users/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
    
            if (response.status === 401) {
                window.location.href = 'auth.html';
                return;
            }
    
            if (!response.ok) {
                showAlert('error', '❌ Failed to fetch dashboard info:', response.statusText);
                return;
            }
    
            const data = await response.json();
            
            displayData(data);
        } catch (error) {
            showAlert('error','❌ Error fetching dashboard info:', error);
        }
    }


    function displayData(data) {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '';

    data.forEach(user => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        // Determine button label and style
        const isActive = user.is_active;
        const buttonLabel = isActive ? 'Deactivate' : 'Activate';
        const buttonClass = isActive ? 'btn-outline-danger' : 'btn-outline-success';
        const iconClass = isActive ? 'fa-user-slash' : 'fa-user-check';

        // Build inner card
        col.innerHTML = `
            <div class="card user-card shadow-sm rounded-4 h-100 border-0">
                <div class="card-body d-flex align-items-center">
                    <img src="${user.profile_picture || 'https://via.placeholder.com/60'}"
                         class="rounded-circle me-3 flex-shrink-0"
                         alt="User Avatar" width="60" height="60">
                    <div class="flex-grow-1">
                        <p class="fw-semibold text mb-1">${user.email}</p>
                        <button class="btn btn-sm ${buttonClass}">
                            <i class="fas ${iconClass} me-1"></i> ${buttonLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}



document.getElementById('createUserForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById('userEmail');
    const email = emailInput.value.trim();

    if (!email) return alert('Please enter an email.');

    const response = await fetch(`${ADMIN_BASE_URL}/school/users/create/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (response.ok) {
        showAlert('success','✅ User created successfully')
        // Success: refresh user list and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
        modal.hide();  // Close the modal

        emailInput.value = ''; // Clear input
        fetchData(); // Refresh user list (make sure this function is defined)
    } else {
        const errorData = await response.json();
        showAlert('error','❌ Failed to create user: ' + (errorData.detail || 'Unknown error'));
    }
});


    fetchData()


});