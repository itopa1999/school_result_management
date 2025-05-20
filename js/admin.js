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

function displayData(data){
    console.log(data)
    document.getElementById("sessionVal").innerHTML = data.current_session;
    document.getElementById("termVal").innerHTML = data.current_term
    document.getElementById("active-class").innerHTML = data.active_classes
    document.getElementById('schoolNameCard').textContent = data.school_info.school_name;
    document.getElementById("school_location").innerHTML = data.school_info.location
    document.getElementById("total_students").innerHTML = data.school_info.total_students
    
}


fetchData();