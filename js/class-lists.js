
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
      card.classList.add('card', 'm-2', 'p-3', 'text-center', 'shadow-sm');
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="card-body">
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
      if (!res.ok) throw new Error('Failed to fetch students');
      const students = await res.json();
      populateStudentsTable(students);
      const studentsModalEl = document.getElementById('studentsModal');
      studentsModalEl.setAttribute('data-level-id', levelId);
      const studentsModal = new bootstrap.Modal(studentsModalEl);
      studentsModal.show();
    } catch (error) {
      alert(error.message);
    }
  }

  function populateStudentsTable(students) {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';
    students.forEach(student => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.other_info}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" onclick="openEditStudentModal(${student.id})">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
          <button class="btn btn-sm btn-dark result-btn" onclick="previewStudentResult(${student.id})">Preview Result</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  async function deleteStudent(studentId) {
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/students/${studentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete student');
      alert('Student deleted');
      const currentLevelId = document.querySelector('#studentsModal').getAttribute('data-level-id');
      openStudentsModal(currentLevelId);
    } catch (error) {
      alert(error.message);
    }
  }

  async function openEditStudentModal(studentId) {
    try {
      const res = await fetch(`${ADMIN_BASE_URL}/students/${studentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch student details');
      const student = await res.json();
      document.getElementById('editStudentId').value = student.id;
      document.getElementById('editStudentName').value = student.name;
      document.getElementById('editStudentOtherInfo').value = student.other_info;
      const editModal = new bootstrap.Modal(document.getElementById('editStudentModal'));
      editModal.show();
    } catch (error) {
      alert(error.message);
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

    try {
      const res = await fetch(`${ADMIN_BASE_URL}/students/${studentId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: updatedName, other_info: updatedOtherInfo }),
      });
      if (!res.ok) throw new Error('Failed to update student');
      alert('Student updated successfully');
      bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();
      const currentLevelId = document.querySelector('#studentsModal').getAttribute('data-level-id');
      openStudentsModal(currentLevelId);
    } catch (error) {
      alert(error.message);
    }
  });

  // Call on page load
  document.addEventListener('DOMContentLoaded', getAllClassLevels);


document.getElementById('download-template').addEventListener('click', async  function() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/download/students-upload-template/`, {
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

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/upload-students/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (response.status === 401) {
      window.location.href = 'auth.html';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      showAlert('error','❌ Upload failed: ' + (data.error || 'Unknown error'));
      return;
    }

    showAlert('success',`✅ ${data.message}\nTotal collected: ${data.total_collected}\nSaved: ${data.total_saved}\nSkipped: ${data.total_skipped}\n updated: ${data.updated_rows}`);

    // Optional: reset form or close modal
    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadStudentModal'));
    modal.hide();

    getAllClassLevels()

  } catch (error) {
    showAlert('error','❌ Error: ' + error.message);
    console.error(error);
  }
});


async function previewStudentResult(studentId) {
  try {
    const res = await fetch(`${ADMIN_BASE_URL}/results/${studentId}/${currentTermId}/${currentSessionId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch student details');
    const data = await res.json();

    const modal = document.getElementById('StudentResultPreviewModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('.modal-title');

    // Set student name in modal title
    modalTitle.innerText = data.results[0]?.student_name || "Student Result";

    // Build result table HTML
    let resultTableHTML = `
      <h6 class="mb-3">Term: ${data.results[0]?.term_name || ''} | Session: ${data.results[0]?.session_name || ''}</h6>
      <table class="table table-bordered table-striped">
        <thead class="table-dark">
          <tr>
            <th>Subject</th>
            <th>1st Test</th>
            <th>2nd Test</th>
            <th>3rd Test</th>
            <th>CA</th>
            <th>Exam</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let result of data.results) {
      resultTableHTML += `
        <tr>
          <td>${result.subjects}</td>
          <td>${result.first_test ?? '-'}</td>
          <td>${result.second_test ?? '-'}</td>
          <td>${result.third_test ?? '-'}</td>
          <td>${result.c_a}</td>
          <td>${result.exam}</td>
          <td>${result.total_score}</td>
          <td>${result.grade}</td>
        </tr>
      `;
    }

    resultTableHTML += `</tbody></table>`;

    // Add term total
    const total = data.term_total;
    resultTableHTML += `
      <div class="mt-4">
        <h6>Term Summary</h6>
        <table class="table table-sm table-bordered w-50">
          <tr><th>Total CA</th><td>${total.total_ca}</td></tr>
          <tr><th>Total Exam</th><td>${total.total_exam}</td></tr>
          <tr><th>Total Score</th><td>${total.total_score}</td></tr>
          <tr><th>Grade</th><td>${total.grade}</td></tr>
          <tr><th>Remarks</th><td>${total.remarks}</td></tr>
        </table>
      </div>
    `;

    modalBody.innerHTML = resultTableHTML;

    const editModal = new bootstrap.Modal(modal);
    editModal.show();

  } catch (error) {
    alert(error.message);
  }
}
