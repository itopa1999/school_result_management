if (!is_admin && !is_admin) {
  window.location.href = "auth.html";
}


const studentsContainer = document.getElementById('studentsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const prevSpinner = document.getElementById('prevSpinner');
const nextSpinner = document.getElementById('nextSpinner');

let nextPageUrl = null;
let prevPageUrl = null;

async function fetchData(url) {
  if (!url) return;

  // Show spinner on the correct button
  if (url === nextPageUrl) {
    nextSpinner.classList.remove('d-none');
    nextBtn.disabled = true;
  } else if (url === prevPageUrl) {
    prevSpinner.classList.remove('d-none');
    prevBtn.disabled = true;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      window.location.href = 'auth.html';
      return;
    }

    if (!response.ok) {
      showAlert('error', `❌ Failed to fetch students: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    renderStudents(data);

  } catch (error) {
    showAlert('error', '❌ Error fetching students:', error);
    console.error('Error fetching students:', error);
  } finally {
    // Hide spinner and enable buttons after fetch
    nextSpinner.classList.add('d-none');
    prevSpinner.classList.add('d-none');

    nextBtn.disabled = !nextPageUrl;
    prevBtn.disabled = !prevPageUrl;
  }
}

function renderStudents(data) {
  console.log(data)
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '';

   data.results.forEach((student, index) => {
  const row = document.createElement('tr');
  row.innerHTML = `
      <td>${student.student.id}</td>
      <td>${student.student.name}</td>
      <td>${student.student.other_info || ''}</td>
      <td>${student.class_level}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-primary me-1" title="View Result" onclick="viewResult(${student.student.id})">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-success me-1" title="Upload Result" onclick="uploadResult(${student.student.id}, '${student.student.name}')">
          <i class="fas fa-upload"></i>
        </button>
         ${!is_manager ? `
          <button class="btn btn-sm btn-danger" title="Reset Result" onclick="resetResult(${student.student.id}, '${student.student.name}')">
            <i class="fas fa-redo"></i>
          </button>` : ''}
      </td>
    </tr>
  `;
  tbody.appendChild(row);
  });

  nextPageUrl = data.next;
  prevPageUrl = data.previous;

  nextBtn.disabled = !nextPageUrl;
  prevBtn.disabled = !prevPageUrl;
}


// Initial URL to fetch
const initialUrl = `${ADMIN_BASE_URL}/students/`;

// Load first page on page load
fetchData(initialUrl);

// Pagination buttons
nextBtn.addEventListener('click', () => {
  if (nextPageUrl) fetchData(nextPageUrl);
});
prevBtn.addEventListener('click', () => {
  if (prevPageUrl) fetchData(prevPageUrl);
});











document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#studentsTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });

})