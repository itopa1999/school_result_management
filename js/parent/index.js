// restrictPageAccess({
//     onlyAdmin: true,
//   });


console.log('Fetching from:', `${ADMIN_BASE_URL}/parent/dashboard/`);
  async function fetchData() {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/parent/dashboard/`, {
            method: 'GET',
            headers: {
                'X-Parent-Code': `${token}`,
            }
        })

        if (response.status === 401 || response.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            showAlert('error', '❌ Failed to fetch dashboard info:', response.statusText);
            return;
        }

        const data = await response.json();
        
        displayData(data);
    } catch (error) {
        console.log('error','❌ Error fetching dashboard info:', error);
    }
}

function displayData(data){
    console.log(data)
    document.getElementById("students").innerHTML = data.students_count;
    document.getElementById("sessions").innerHTML = data.sessions
    document.getElementById('schoolNameCard').textContent = data.school_name;
    document.getElementById("school_location").innerHTML = data.school_location
    document.getElementById("total_students").innerHTML = data.students_count

    const container = document.getElementById('student-list');
    container.innerHTML = ''; // Clear existing

    data.students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';

        card.innerHTML = `
            <div class="student-name">${student.name}</div>
            <div class="student-info">${student.other_info}</div>
        `;

        container.appendChild(card);
    });
    
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