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


async function viewResult(studentId) {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/show/result/${studentId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert("error", `❌ Failed to view results: ${result.error || 'Unknown error'}`);
      return;
    }

    // === Fill School Info ===
    document.querySelector('.result-school-name').textContent = result.school_info.school_name;
    document.querySelector('.result-school-info').textContent = `${result.school_info.location} | Phone: ${result.school_info.phone} | Email: ${result.school_info.email}`;

    // === Fill Student Info ===
    document.querySelector('.result-student-info').innerHTML = `
      <div class="result-info-item"><span class="result-info-label">Student Name:</span> ${result.student.student_name}</div>
      <div class="result-info-item"><span class="result-info-label">Class:</span> ${result.student.class}</div>
      <div class="result-info-item"><span class="result-info-label">Other Info:</span> ${result.student.other_info || 'N/A'}</div>
      <div class="result-info-item"><span class="result-info-label">Academic Session:</span> ${result.academic_sessions.session}</div>
      <div class="result-info-item"><span class="result-info-label">Term:</span> ${result.academic_sessions.term}</div>
    `;

    // === Fill Result Table ===
    const tbody = document.querySelector('.result-table tbody');
    tbody.innerHTML = ''; // Clear existing rows
    result.results.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="result-subject-cell">${item.subjects}</td>
        <td>${item.first_test || 0}</td>
        <td>${item.second_test || 0}</td>
        <td>${item.third_test || 0}</td>
        <td>${item.exam || 0}</td>
        <td>${item.total_score || 0}</td>
        <td>${item.grade || 'N/A'}</td>
        <td>${item.remark || 'N/A'}</td>
      `;
      tbody.appendChild(row);
    });

    // === Fill Summary Section ===
    const summary = result.performance_summary;
    document.querySelectorAll('.summary-section .result-summary-card')[0].innerHTML = `
      <div class="result-summary-title">Total Score</div>
      <div class="result-summary-value">${summary.total_score}</div>
      <div class="result-info-item">Out of ${summary.out_of}</div>
    `;

    document.querySelectorAll('.summary-section .result-summary-card')[1].innerHTML = `
      <div class="result-summary-title">Average Score</div>
      <div class="result-summary-value">${summary.average_score}</div>
      <div class="result-info-item">Class Avg: ${summary.class_average}</div>
    `;

    document.querySelectorAll('.summary-section .result-summary-card')[2].innerHTML = `
      <div class="result-summary-title">Position</div>
      <div class="result-summary-value">${summary.position}</div>
      <div class="result-info-item">Out of ${summary.out_of_students} students</div>
    `;

    // comments
    document.getElementById('commentTeacher').innerHTML = result.comments.teacher_comment
    document.getElementById('commentPrincipal').innerHTML = result.comments.principal_comment

    // === Show Modal ===
    const resultModal = document.getElementById('resultModal');
    resultModal.classList.add('active');
    document.body.style.overflow = 'hidden';

  } catch (error) {
    console.error("Error fetching results:", error);
    showAlert("error", '❌ Something went wrong while fetching results.');
  }
}


async function uploadResult(studentId, studentName) {
  const modalTitle = document.getElementById('uploadStudentModalLabel');
  modalTitle.textContent = `Upload result for: ${studentName}`;
  document.getElementById('uploadStudentId').value = studentId;
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/get/comments/${studentId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const comment = await response.json();

    if (!response.ok) {
      showAlert("error", `❌ Failed to load comments: ${comment.error || 'Unknown error'}`);
      return
    } else {
      document.getElementById('teacherComment').value = comment.teacher_comment;
      document.getElementById('principalComment').value = comment.principal_comment;
    }
  } catch (error) {
    console.error("Error ", error);
    showAlert("error", '❌ Something went wrong ');
  }

  const modal = new bootstrap.Modal(document.getElementById('uploadStudentResultModal'));
  modal.show();
}

async function resetResult(studentId, studentName) {
  if (!confirm(`Are you sure you want to reset ${studentName}'s results? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/result/reset/${studentId}/`, {
      method: 'POST', // Or 'DELETE' if your backend expects it
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      showAlert("error", `❌ Failed to reset results: ${result.error || 'Unknown error'}`);
    } else {
      showAlert("success", `✅ Successfully reset results for ${studentName}`);
      // Optional: Refresh table or remove UI items here
    }
  } catch (error) {
    console.error("Error resetting results:", error);
    showAlert("error", '❌ Something went wrong while resetting results.');
  }
}

document.getElementById('upload-result').addEventListener('submit', async function(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submitBtn2');
  const spinner = document.getElementById('submitSpinner2');
  const excelFileInput = document.getElementById('excelFile');
  const studentId = document.getElementById('uploadStudentId').value;

  if (!studentId) {
    showAlert('error', '❌ Student ID is missing.');
    return;
  }

  if (excelFileInput.files.length === 0) {
    showAlert('error', '❌ Please select an Excel file to upload.');
    return;
  }

  // Show spinner, disable submit button
  submitBtn.disabled = true;
  spinner.classList.remove('d-none');

  const formData = new FormData();
  formData.append('file', excelFileInput.files[0]);
  formData.append('student_id', studentId);

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/result/preview/${studentId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert('error', '❌ Error: ' + (data.error || 'Failed to upload'));
      console.error(data);
      return;
    }

    renderPreviewModal(data)
  

  } catch (error) {
    console.error('Upload error:', error);
    alert('An error occurred while uploading.');
  } finally {
    // Hide spinner, enable submit button
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
  }
});


function renderPreviewModal(data) {

  window._uploadPreviewData = {
      student_id: data.student_id,
      results: data.valid_rows
    };
  const tableBody = document.getElementById('previewStudentsTableBody');
  tableBody.innerHTML = '';

  let index = 1;

  // Valid rows (green faded)
  data.valid_rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.classList.add('table-success', 'bg-opacity-25');
    tr.innerHTML = `
      <td>${index++}</td>
      <td>${row.subject}</td>
      <td>${row.ca1}</td>
      <td>${row.ca2}</td>
      <td>${row.ca3}</td>
      <td>${row.exam}</td>
      <td></td>
    `;
    tableBody.appendChild(tr);
  });

  // Invalid rows (red faded)
  data.skipped_rows.forEach(row => {
    const [subject = '', ca1 = '', ca2 = '', ca3 = '', exam = ''] = row.data;
    const tr = document.createElement('tr');
    tr.classList.add('table-danger', 'bg-opacity-25');
    tr.innerHTML = `
      <td>${index++}</td>
      <td>${subject}</td>
      <td>${ca1}</td>
      <td>${ca2}</td>
      <td>${ca3}</td>
      <td>${exam}</td>
      <td><small class="text-danger">${row.reason}</small></td>
    `;
    tableBody.appendChild(tr);
  });

  // Info header
  const infoDiv = document.getElementById('previewInfo');
  infoDiv.innerHTML = `
    <div class="mb-2">
      <strong>Student:</strong> ${data.student} &nbsp;&nbsp;|&nbsp;&nbsp; 
      <strong>Session:</strong> ${data.session}
    </div>
    <div class="alert alert-info">
      <strong>${data.valid_rows.length}</strong> valid entries, 
      <strong>${data.skipped_rows.length}</strong> skipped due to errors.
    </div>
  `;

  // Show modal
  const previewModal = new bootstrap.Modal(document.getElementById('previewUploadModal'));
  previewModal.show();
}



document.getElementById('confirmUploadBtn').addEventListener('click', async function (e) {
  e.preventDefault();
  const payload = window._uploadPreviewData;
  if (!payload || !payload.results || !payload.student_id) {
    showAlert("error",'❌ Invalid data. Please re-upload.');
    return;
  }
  const submitButton = document.getElementsByName(".submitBtn3");
  const submitSpinner = document.getElementById("submitSpinner3");

    submitButton.disabled = true;
    submitSpinner.classList.remove("d-none");

    payload.teacher_comment = document.getElementById('teacherComment').value
    payload.principal_comment = document.getElementById('principalComment').value


  try {
    const response = await fetch(`${ADMIN_BASE_URL}/result/upload/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    submitButton.disabled = false;
    submitSpinner.classList.add("d-none");

    const result = await response.json();

    if (!response.ok) {
      showAlert("error",'❌ Upload failed: ' + (result.error || 'Unknown error'));
    } else {
      showAlert("success", `✅ Results uploaded successfully!`);;
      const modal = bootstrap.Modal.getInstance(document.getElementById('previewUploadModal'));
      modal.hide();
    }
  } catch (error) {
    console.error('Error during upload:', error);
    showAlert("error",'❌ Something went wrong while uploading.');
  } finally {
    submitButton.disabled = false;
    submitSpinner.classList.add("d-none");
  }
});





  document.getElementById('download-template').addEventListener('click', async function (e) {
    e.preventDefault();

    const submitButton = document.getElementsByName(".submitBtn1");
    const submitSpinner = document.getElementById("submitSpinner1");

    submitButton.disabled = true;
    submitSpinner.classList.remove("d-none");

    studentId = document.getElementById('uploadStudentId').value

    const url = `${ADMIN_BASE_URL}/result/export/${studentId}/`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Replace `token` with your auth token
        }
      });

      submitButton.disabled = false;
      submitSpinner.classList.add("d-none");

      if (!response.ok) {
        const error = await response.text();
        showAlert("error",`❌ Failed to download file: ${error}`);
        return;
      }

      const blob = await response.blob();
      const fileName = response.headers.get('Content-Disposition')
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'student_result.xlsx';

      // Trigger download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download error:', error);
      showAlert("error",'❌ Something went wrong while downloading.');
    } finally {
      submitButton.disabled = false;
      submitSpinner.classList.add("d-none");
    }
  });


function downloadPDF() {
    const element = document.querySelector('.result-container'); // Content to export
    
    // PDF options
    const opt = {
        margin:       0.5,
        filename:     'Student_Result_Sheet.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();

}
        // Modal functions
        const resultModal = document.getElementById('resultModal');
        
        function openResultModal() {
            resultModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeResultModal() {
            resultModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        function printResult() {
            window.print();
        }
        
        // Close modal when clicking outside content
        resultModal.addEventListener('click', (e) => {
            if (e.target === resultModal) {
                closeResultModal();
            }
        });
        
        // Close modal with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && resultModal.classList.contains('active')) {
                closeResultModal();
            }
        });



document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#studentsTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });
});