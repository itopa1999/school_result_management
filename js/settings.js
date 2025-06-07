

async function fetchSubjects() {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/subjects/`, {
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
            showAlert('error', '❌ Failed to fetch subjects info:', response.statusText);
            return;
        }

        const data = await response.json();
        
        renderSubjects(data);
    } catch (error) {
        showAlert('error','❌ Error fetching subjects info:', error);
        console.error('error','❌ Error fetching subjects info:', error);
    }
}

function renderSubjects(subjects) {
    const container = document.getElementById('subject-list');
    container.innerHTML = '';

    subjects.forEach((subject, index) => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex align-items-center justify-content-between gap-3';

        item.innerHTML = `
            <span>${index + 1}</span><input type="text" class="form-control flex-grow-1" value="${subject.name}" id="input-${subject.id}">
            <div class="btn-group">
                <button class="btn btn-primary" id="edit-subjectBtn-${subject.id}" btn-sm" onclick="editSubject(${subject.id})">
                 <i class="fas fa-edit"></i>Edit
                <span class="spinner-border spinner-border-sm d-none" id="edit-subjectSpinner-${subject.id}" role="status" aria-hidden="true"></span>
                </button>
            </div>
        `;

        container.appendChild(item);
    });
}


document.getElementById('addSubjectForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nameInput = this.elements['name'];
    const name = nameInput.value.trim();

    if (!name) {
        showAlert('error', '❌ Subject name cannot be empty.');
        return;
    }
    const submitButton = document.getElementById("submitBtn");
    const submitSpinner = document.getElementById("submitSpinner");

    submitButton.disabled = true;
    submitSpinner.classList.remove("d-none");

    try {
        const response = await fetch(`${ADMIN_BASE_URL}/subjects/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        submitButton.disabled = false;
        submitSpinner.classList.add("d-none");

        const data = await response.json();
        console.log(data)
        if (!response.ok) {
            showAlert('error', '❌ Failed to add subjects: ' + data.error);
            return;
        }

        if (response.ok) {
            // Hide the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSubjectModal'));
            modal.hide();

            // Clear the input
            nameInput.value = '';

            // Optionally refresh the list of subjects
            fetchSubjects();

            showAlert('success', `✅ Subject "${data.name}" added successfully.`);
        } else {
            showAlert('error', '❌ Failed to add subject.');
        }

    } catch (error) {
        console.error(error);
        showAlert('error', '❌ An error occurred while adding the subject.');
    } finally {
        submitButton.disabled = false;
        submitSpinner.classList.add("d-none");
    }
});



async function editSubject(id) {
    const input = document.getElementById(`input-${id}`);
    const newName = input.value;

    const submitButton2 = document.getElementById(`edit-subjectBtn-${id}`);
    const submitSpinner2 = document.getElementById(`edit-subjectSpinner-${id}`);

    submitButton2.disabled = true;
    submitSpinner2.classList.remove("d-none");

    try{
      const response = await fetch(`${ADMIN_BASE_URL}/subject/${id}/`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newName })
      });

      submitButton2.disabled = false;
      submitSpinner2.classList.add("d-none");

      if (!response.ok) {
          showAlert('error','❌ Failed to update subject.');
          return;
      }
      showAlert('success','✅ Subject updated successfully!');

    } catch (error) {
        console.error(error);
        showAlert('error', '❌ An error occurred while edit subject.');
    } finally {
        submitButton2.disabled = false;
        submitSpinner2.classList.add("d-none");
    }

}

async function deleteSubject(id) {
    const confirmed = confirm("Are you sure you want to delete this subject?");
    if (!confirmed) return;

    const response = await fetch(`${ADMIN_BASE_URL}/subject/${id}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        showAlert('success','✅ Subject deleted!');
        fetchSubjects();
    } else {
        showAlert('error','❌ Failed to delete subject.');
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', fetchSubjects);



// Fetch and render grading list
async function fetchGradings() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/grades/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to fetch grading info:', response.statusText);
        return;
    }
    const data = await response.json();
    displayGradings(data);
  } catch (error) {
    showAlert('error', `❌ Error fetching grading data: ${error.message}`);
  }
}

function displayGradings(gradings) {
  const list = document.getElementById('gradingList');
  list.innerHTML = '';
  gradings.forEach((g, index) => {
    const item = document.createElement('div');
    item.className = 'list-group-item ';

    // Inputs for inline editing
    item.innerHTML = `
    <div class='mt-3 mb-4'><strong>Grade ${index + 1}</strong></div>

    <div class="mb-2">
      <label for="grading-min-${index}" class="form-label">Min Score</label>
      <input type="number" min="0" value="${g.min_score}" id="grading-min-${index}" class="form-control w-15 grading-min" />
    </div>

    <div class="mb-2">
      <label for="grading-max-${index}" class="form-label">Max Score</label>
      <input type="number" min="0" value="${g.max_score}" id="grading-max-${index}" class="form-control w-15 grading-max" />
    </div>

    <div class="mb-2">
      <label for="grading-grade-${index}" class="form-label">Grade</label>
      <input type="text" maxlength="2" value="${g.grade}" id="grading-grade-${index}" class="form-control w-10 grading-grade" />
    </div>

    <div class="mb-3">
      <label for="grading-remark-${index}" class="form-label">Remark</label>
      <input type="text" maxlength="255" value="${g.remark}" id="grading-remark-${index}" class="form-control w-40 grading-remark" />
    </div>

    <button class="btn btn-success" id="edit-gradingBtn-${g.id}" btn-sm""><i class="fas fa-save"></i> Save Changes
                <span class="spinner-border spinner-border-sm d-none" id="edit-gradingSpinner-${g.id}" role="status" aria-hidden="true"></span>
    </button>
        
      <hr>
    `;

    // Save handler
    item.querySelector('.btn-success').onclick = () => updateGrading(g.id, item);


    list.appendChild(item);
  });
}

// Update grading via PUT
async function updateGrading(id, item) {
  const min_score = item.querySelector('.grading-min').value;
  const max_score = item.querySelector('.grading-max').value;
  const grade = item.querySelector('.grading-grade').value.trim();
  const remark = item.querySelector('.grading-remark').value.trim();

  const submitButton3 = document.getElementById(`edit-gradingBtn-${id}`);
  const submitSpinner3 = document.getElementById(`edit-gradingSpinner-${id}`);

  submitButton3.disabled = true;
  submitSpinner3.classList.remove("d-none");

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/grade/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ min_score, max_score, grade, remark })
    });

    submitButton3.disabled = false;
    submitSpinner3.classList.add("d-none");

    if (response.status === 401) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to update grade settings info:', response.statusText);
        return;
    }
    showAlert('success', '✅ Grading updated successfully');
    fetchGradings();
  } catch (error) {
    showAlert('error', `❌ Error updating grading: ${error.message}`);
  } finally {
        submitButton3.disabled = false;
        submitSpinner3.classList.add("d-none");
    }
}

// Delete grading via DELETE
async function deleteGrading(id) {
  if (!confirm('Are you sure you want to delete this grading?')) return;

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/grade/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (response.status === 204) {
      showAlert('success', '✅ Grading deleted');
      fetchGradings();
    } else {
        showAlert('error', '❌ Failed to delete grade settings info:', response.statusText);

    }
  } catch (error) {
    showAlert('error', `❌ Error deleting grading: ${error.message}`);
  }
}

// Handle Add Grading Form Submission
document.getElementById('addGradingForm').addEventListener('submit', async (e) => {
  e.preventDefault();



  const form = e.target;
  const min_score = form.min_score.value.trim();
  const max_score = form.max_score.value.trim();
  const grade = form.grade.value.trim();
  const remark = form.remark.value.trim();

  const submitButton1 = document.getElementById("submitBtn1");
  const submitSpinner1 = document.getElementById("submitSpinner1");

  submitButton1.disabled = true;
  submitSpinner1.classList.remove("d-none");


  try {
    const response = await fetch(`${ADMIN_BASE_URL}/grades/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ min_score, max_score, grade, remark })
    });

    submitButton1.disabled = false;
    submitSpinner1.classList.add("d-none");

    if (response.ok) {
      showAlert('success', '✅ Grading added successfully');
      bootstrap.Modal.getInstance(document.getElementById('addGradingModal')).hide();
      form.reset();
      fetchGradings();
    } else {
      const data = await response.json();
      showAlert('error', `❌ Failed to add grading: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    showAlert('error', `❌ Error adding grading: ${error.message}`);
  } finally {
        submitButton1.disabled = false;
        submitSpinner1.classList.add("d-none");
    }
});

// Initial fetch on page load or tab show
fetchGradings();


async function fetchSchoolInfo() {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/school-info/`, {
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
            showAlert('error', '❌ Failed to fetch school info:', response.statusText);
            return;
        }

        const data = await response.json();
        console.log(data)
        document.getElementById('schoolName').value = data.school.school_name || 'Not Set';
        document.getElementById('schoolAddress').value = data.school.school_address || 'Not set';
        
    } catch (error) {
        showAlert('error','❌ Error fetching school info:', error);
        console.error('error','❌ Error fetching school info:', error);
    }
}


document.getElementById('schoolProfileForm').addEventListener('submit', async function(event) {
      event.preventDefault();

      const schoolName = document.getElementById('schoolName').value;
      const schoolAddress = document.getElementById('schoolAddress').value;

      const data = {
        school_name: schoolName,
        school_address: schoolAddress
      };

      const submitButton4 = document.getElementById("submitBtn4");
      const submitSpinner4 = document.getElementById("submitSpinner4");

      submitButton4.disabled = true;
      submitSpinner4.classList.remove("d-none");

      try{
        const response = await fetch(`${ADMIN_BASE_URL}/school-info/update/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data)
        })
        submitButton4.disabled = false;
        submitSpinner4.classList.add("d-none");

        if (response.status === 401) {
            window.location.href = 'auth.html';
            return;
        }

        if (!response.ok) {
            showAlert('error', '❌ Failed to fetch school info:', response.statusText);
            return;
        }

        const responseData = await response.json();
        showAlert('success', '✅ School info updated successfully');
        fetchSchoolInfo();



      } catch(error) {
        console.error('Error updating school profile:', error);
        showAlert('error', '❌ Failed to update school profile.');
      }finally {
        submitButton4.disabled = false;
        submitSpinner4.classList.add("d-none");
    }

    })

fetchSchoolInfo()