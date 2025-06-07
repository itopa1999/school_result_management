
let currentStudents = [];
let currentSortOrder = 'asc';
let currentPage = 1;
const studentsPerPage = 10;

async function getAllClassLevels() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/classlevels/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to fetch Class Levels lists info:', response.statusText);
        return;
    }

    const data = await response.json();
    populateClassLevels(data)
    await Promise.all(data.map(async level => {
      const res = await fetch(`${ADMIN_BASE_URL}/classlevels/${level.id}/students/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const students = await res.json();
      level.studentCount = students.length;
    }));
    console.log(data)
    displayLevels(data);
  } catch (error) {
    showAlert('error', '❌ Error fetching Class Levels:', error);
    console.error('error', '❌ Error fetching Class Levels:', error);
  }
}
function displayLevels(levels) {
    const levelsContainer = document.getElementById('levelsContainer');
    levelsContainer.innerHTML = '';
    levels.forEach(level => {
      const card = document.createElement('div');
      card.classList.add('card', 'm-2', 'p-3', 'text-center', 'shadow-lg');
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="card-body">
        <div class="level-icon mb-3">
            <i class="fas fa-graduation-cap fa-2x"></i>
          </div>
          <h5 class="card-title">${level.name}</h5>
           <p class="card-text">${level.studentCount} student(s)</p>
          <p class="card-text">View all students in this level</p>
        </div>
      `;
      card.addEventListener('click', () => openStudentsModal(level.id));
      levelsContainer.appendChild(card);
    });
  }

  async function openStudentsModal(levelId) {
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/classlevels/${levelId}/students/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const students = await res.json();
      if (!res.ok){
        showAlert('error', '❌ ' + students.error || ' Failed to fetch students')
        return;
      }
      populateStudentsTable(students);
      const studentsModalEl = document.getElementById('studentsModal');
      studentsModalEl.setAttribute('data-level-id', levelId);
      const studentsModal = new bootstrap.Modal(studentsModalEl);
      studentsModal.show();
    } catch (error) {
      console.log(error.message);
      showAlert('error', '❌ Failed to fetch students')
    }
  }

function populateStudentsTable(students) {
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '';

  students.forEach((student, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>${student.other_info}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="openEditStudentModal(${student.id})">
          <i class="fas fa-edit me-1"></i> Edit
        </button>
      
        <button class="btn btn-sm btn-dark" onclick="previewStudentResult(${student.id})">
          <i class="fas fa-eye me-1"></i> Preview
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

  async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/students/${studentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok){
        showAlert('error', '❌ Failed to delete students')
        return;
      }
      showAlert('success', '✅ Deleted successfully')
      const currentLevelId = document.querySelector('#studentsModal').getAttribute('data-level-id');
      openStudentsModal(currentLevelId);
    } catch (error) {
      alert(error.message);
      showAlert('error', '❌ Failed to delete students')
    }
  }

  async function openEditStudentModal(studentId) {
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/students/${studentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const student = await res.json();
      if (!res.ok){
        showAlert('error', '❌ ' + student.error || ' Failed to fetch student details')
        return;
      }
      document.getElementById('editStudentId').value = student.id;
      document.getElementById('editStudentName').value = student.name;
      document.getElementById('editStudentOtherInfo').value = student.other_info;
      const editModal = new bootstrap.Modal(document.getElementById('editStudentModal'));
      editModal.show();
    } catch (error) {
      console.log(error.message);
      showAlert('error', '❌ Failed to fetch student details')
    }
  }


  

  document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('editStudentId').value;
    const updatedName = document.getElementById('editStudentName').value.trim();
    const updatedOtherInfo = document.getElementById('editStudentOtherInfo').value.trim();

    if (!updatedName) {
      document.getElementById('editStudentName').classList.add('is-invalid');
      return;
    } else {
      document.getElementById('editStudentName').classList.remove('is-invalid');
    }

    if (!updatedOtherInfo) {
      document.getElementById('editStudentOtherInfo').classList.add('is-invalid');
      return;
    } else {
      document.getElementById('editStudentOtherInfo').classList.remove('is-invalid');
    }

    const submitButton4 = document.getElementById("submitBtn4");
    const submitSpinner4 = document.getElementById("submitSpinner4");

    submitButton4.disabled = true;
    submitSpinner4.classList.remove("d-none");
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/students/${studentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: updatedName, other_info: updatedOtherInfo }),
      });
      submitButton4.disabled = false;
      submitSpinner4.classList.add("d-none");
      if (!res.ok) throw new Error('Failed to update student');
      alert('Student updated successfully');
      bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();
      const currentLevelId = document.querySelector('#studentsModal').getAttribute('data-level-id');
      openStudentsModal(currentLevelId);
    } catch (error) {
      alert(error.message);
    }finally {
        submitButton4.disabled = false;
        submitSpinner4.classList.add("d-none");
    }
  });

  // Call on page load
  document.addEventListener('DOMContentLoaded', getAllClassLevels);


document.getElementById('download-template').addEventListener('click', async  function() {

  const submitButton2 = document.getElementsByClassName(".submitBtn2");
  const submitSpinner2 = document.getElementById("submitSpinner2");

  submitButton2.disabled = true;
  submitSpinner2.classList.remove("d-none");
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/download/students-upload-template/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    submitButton2.disabled = false;
    submitSpinner2.classList.add("d-none");

    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to fetch Class Levels lists info:', response.statusText);
        return;
    }

    const blob = await response.blob(); // get the file as blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary <a> to trigger the download
    const a = document.createElement('a');
    a.href = url;

    // Optionally get filename from response headers, or hardcode
    const disposition = response.headers.get('Content-Disposition');
    let filename = 'upload_students_template.xlsx'; // fallback filename

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameMatch = disposition.match(/filename="(.+)"/);
      if (filenameMatch.length === 2) filename = filenameMatch[1];
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    showAlert('error', '❌ Error:', error);
    console.error('Error:', error);
  }finally {
        submitButton2.disabled = false;
        submitSpinner2.classList.add("d-none");
    }

});


function populateClassLevels(levels) {
  const select = document.getElementById('classLevel');
  
  // Clear existing options except the placeholder
  select.innerHTML = '<option value="" selected disabled>Select a class</option>';
  
  levels.forEach(level => {
    const option = document.createElement('option');
    option.value = level.id;
    option.textContent = level.name;
    select.appendChild(option);
  });
}



document.querySelector('#uploadStudentModal form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const submitButton = document.getElementById("submitBtn");
  const submitSpinner = document.getElementById("submitSpinner");

  submitButton.disabled = true;
  submitSpinner.classList.remove("d-none");


  try {
    const response = await fetch(`${ADMIN_BASE_URL}/preview-upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    submitButton.disabled = false;
    submitSpinner.classList.add("d-none");

    if (response.status === 401) {
      window.location.href = 'auth.html';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      showAlert('error','❌ Upload failed: ' + (data.error || 'Unknown error'));
      return;
    }

    // ✅ Populate modal
    document.getElementById('previewInfo').innerHTML = `
      <h6>Class Level: <strong>${data.class_level}</strong></h6>
      <p>Total Students: <strong>${data.total_valid}</strong></p>
    `;

    const tableBody = document.getElementById('previewStudentsTableBody');
    tableBody.innerHTML = '';
    data.students.forEach((student, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${student.name}</td>
        <td>${student.other_info}</td>
      `;
      tableBody.appendChild(row);
    });

    // Store data for upload
    window._uploadPreviewData = {
      class_level_id: data.class_level_id,
      students: data.students
    };

    // ✅ Show the modal
    const modal = new bootstrap.Modal(document.getElementById('previewUploadModal'));
    modal.show();

    // Optional: reset form or close modal
    // form.reset();
    // const modal = bootstrap.Modal.getInstance(document.getElementById('uploadStudentModal'));
    // modal.hide();

    // getAllClassLevels()

  } catch (error) {
    showAlert('error','❌ Error: ' + error.message);
    console.error(error);
  }finally {
        submitButton.disabled = false;
        submitSpinner.classList.add("d-none");
    }
});


document.getElementById('confirmUploadBtn').addEventListener('click', async () => {
  const payload = window._uploadPreviewData;

  if (!payload || !payload.students || !payload.class_level_id) {
    showAlert('error', 'Invalid data. Please re-upload.');
    return;
  }

  const submitButton1 = document.getElementsByClassName(".submitBtn1");
  const submitSpinner1 = document.getElementById("submitSpinner1");

  submitButton1.disabled = true;
  submitSpinner1.classList.remove("d-none");

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/upload-students/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    submitButton1.disabled = false;
    submitSpinner1.classList.add("d-none");

    const data = await response.json();

    if (!response.ok) {
      showAlert('error', `❌ Upload failed: ${data.error || 'Unknown error'}`);
      return;
    }

    showAlert('success', `✅ ${data.message}\nSaved: ${data.saved}\nUpdated: ${data.updated}\nSkipped: ${data.skipped}`);
    
    // Close modal after success
    const modal = bootstrap.Modal.getInstance(document.getElementById('previewUploadModal'));
    modal.hide();

    const modal1 = bootstrap.Modal.getInstance(document.getElementById('uploadStudentModal'));
    modal1.hide();

    // Clear memory
    window._uploadPreviewData = null;
    getAllClassLevels();

  } catch (error) {
    showAlert('error', '❌ Error: ' + error.message);
    console.error(error);
  }finally {
        submitButton1.disabled = false;
        submitSpinner1.classList.add("d-none");
    }
});


async function previewStudentResult(studentId) {
  try {
    const res = await fetch(`${ADMIN_BASE_URL}/results/${studentId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    if (!res.ok){
      showAlert('error','❌ ' + data.error || 'Failed to preview student results');
      return;
    }
    
    const modal = document.getElementById('StudentResultPreviewModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('.modal-title');

    // Set student name in modal title
    modalTitle.innerText = data.results[0]?.student_name || "Student Result";

    // Build result table HTML
    let resultTableHTML = `
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <p class="text-muted mb-0">
          Term: <strong>${data.results[0]?.term_name || 'N/A'}</strong> |
          Session: <strong>${data.results[0]?.session_name || 'N/A'}</strong>
        </p>
      </div>

      <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle">
          <thead class="table-primary text-center">
            <tr>
              <th>Subject</th>
              <th>1st Test</th>
              <th>2nd Test</th>
              <th>3rd Test</th>
              <th>CA</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (data.results.length === 0) {
      resultTableHTML += `
        <tr>
          <td colspan="8" class="text-center text-danger">No result for this student</td>
        </tr>
      `;
    } else {
      for (let result of data.results) {
        resultTableHTML += `
          <tr class="text-center">
            <td class="text-start fw-semibold">${result.subjects}</td>
            <td>${result.first_test ?? '-'}</td>
            <td>${result.second_test ?? '-'}</td>
            <td>${result.third_test ?? '-'}</td>
            <td>${result.c_a}</td>
            <td>${result.exam}</td>
            <td class="fw-bold">${result.total_score}</td>
            <td><span class="badge bg-secondary">${result.grade}</span></td>
            <td><span class="badge bg-secondary">${result.remark}</span></td>
          </tr>
        `;
      }
    }

    resultTableHTML += `
          </tbody>
        </table>
      </div>
    `;

    // Term Summary
    const total = data.term_total;

    if (total) {
      resultTableHTML += `
        <div class="mt-5">
          <h6 class="fw-bold mb-3">📊 Term Summary</h6>
          <div class="table-responsive">
            <table class="table table-bordered w-100" style="max-width: 500px;">
              <tbody>
                <tr><th>Total CA</th><td>${total.total_ca}</td></tr>
                <tr><th>Total Exam</th><td>${total.total_exam}</td></tr>
                <tr><th>Total Score</th><td class="fw-bold">${total.total_score}</td></tr>
                <tr><th>Grade</th><td><span class="badge bg-info text-dark">${total.grade}</span></td></tr>
                <tr><th>Remarks</th><td>${total.remarks}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      resultTableHTML += `
        <p class="text-danger mt-4 text-center">❌ No term summary available.</p>
      `;
    }



    modalBody.innerHTML = resultTableHTML;

    const editModal = new bootstrap.Modal(modal);
    editModal.show();

  } catch (error) {
    console.error(error.message);
    showAlert('error', '❌  Failed to preview student results')

  }
}

document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#studentsTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });
});


// Download single item report
document.getElementById("exportStudents").addEventListener("click", async function () {
  const submitButton3 = document.getElementsByClassName(".submitBtn3");
  const submitSpinner3 = document.getElementById("submitSpinner3");

  submitButton3.disabled = true;
  submitSpinner3.classList.remove("d-none");
  try {
    const res = await fetch(`${ADMIN_BASE_URL}/download/all-students/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    submitButton3.disabled = false;
    submitSpinner3.classList.add("d-none");

    if (!res.ok) {
      const data = await res.json();
      showAlert('error', `❌ Export failed: ${data.error || 'Unknown error'}`);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_students.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showAlert('error', `❌ ${error.message}`);
  }finally {
        submitButton3.disabled = false;
        submitSpinner3.classList.add("d-none");
    }
});
