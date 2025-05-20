restrictPageAccess({
    onlyClient: true,
  });
document.addEventListener("DOMContentLoaded", function () {
    async function fetchData() {
        try {
            const response = await fetch(`${BASE_URL}/client/dashboard/`, {
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
            console.error('error','❌ Error fetching dashboard info:', error);
        }
    }

function displayData(data){
    const loading = document.getElementById('rides-spinner');
    const container = document.getElementById('rides-container');
    container.innerHTML = '';
    console.log(data)
    loading.style.display = 'none';
    if (data.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No rides available.</p>';
        return;
    }

    data.rides.forEach(ride => {
    // const rideData = JSON.stringify(ride).replace(/"/g, '&quot;');
    const randomThemes = ['theme-blue', 'theme-purple', 'theme-green'];
    const randomTheme = randomThemes[Math.floor(Math.random() * randomThemes.length)];
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('col-lg-6');
    containerDiv.innerHTML = `
            <div class="ride-card card">
                <div class="route-animation">
                    <div class="route-dots"></div>
                    <i class="bi bi-car-front-fill car-icon"></i>
                    <span class="point-label point-a">${ride.departure}</span>
                    <span class="point-label point-b">${ride.destination}</span>
                </div>

                <div class="detail-item ${randomTheme}">
                    <i class="bi bi-clock me-2"></i>
                    ${new Date(ride.date_of_departure).toLocaleString()}
                    <span class="ms-auto">Seats: ${ride.available_seat}</span>
                </div>

                <div class="detail-item ${randomTheme}">
                    <i class="bi bi-car-front-fill me-2"></i>
                    Car type: ${ride.car_type}
                </div>

                <div class="d-flex justify-content-between align-items-center p-3">
                    <div class="d-flex align-items-center">
                        <span class="fare-badge">₦${ride.price_per_seat}</span>
                    </div>
                    <a href="booking.html?id=${ride.id}" class="btn text-mute ${randomTheme.replace('theme', 'btn-outline')}">
                        <i class="bi bi-bookmark-check me-2"></i>Book
                    </a>
                </div>
            </div>
    `;
    container.appendChild(containerDiv);
    });

}



// Feed switching functionality
const feedTabs = document.querySelectorAll('.feed-tab');
const feedContents = document.querySelectorAll('.feed-content');

feedTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active classes
        feedTabs.forEach(t => t.classList.remove('active'));
        feedContents.forEach(c => c.classList.remove('active'));

        // Add active classes
        this.classList.add('active');
        const feedType = this.dataset.feed;
        document.getElementById(`${feedType}-feed`).classList.add('active');
    });
});




document.querySelector(".myRequest").addEventListener('click', () => {
    if (token === null){
        showAlert("error",'❌ Authorized request');
        RemoveAccessFromLocalStorage()
        setTimeout(() => {
            window.location.href = "auth.html";
        }, 3000);
        return;
    }
});

fetchData()

});