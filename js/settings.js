if (!is_admin){
  window.location.href = "index.html";
}

async function fetchSubjects() {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/subjects/`, {
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
            showAlert('error', '❌ Failed to add subject: ' + data.error);
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
    if (response.status === 401 || response.status === 403) {
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

  const colors = [
  'rgba(110, 66, 193, 0.69)',   // light purple
  'rgba(13, 109, 253, 0.49)',   // light blue
  'rgba(32, 201, 150, 0.58)',   // light teal
  'rgba(253, 125, 20, 0.46)',   // light orange
  'rgba(220, 53, 70, 0.46)',    // light red
  'rgba(25, 135, 84, 0.46)'     // light green
];

  if (gradings.length === 0) {
    list.innerHTML = `<div class="no-gradings">📭 No gradings available.</div>`;
    return;
  }

  gradings.forEach((g, index) => {
    const item = document.createElement('div');
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    item.className = 'grading-card';
    item.style.backgroundColor = bgColor;

    item.innerHTML = `
      <h5 class='mb-3'>📊 Grade ${index + 1}</h5>

      <div class="mb-3">
        <label for="grading-min-${index}" class="form-label">Minimum Score</label>
        <input type="number" min="0" value="${g.min_score}" id="grading-min-${index}" class="form-control grading-min" />
      </div>

      <div class="mb-3">
        <label for="grading-max-${index}" class="form-label">Maximum Score</label>
        <input type="number" min="0" value="${g.max_score}" id="grading-max-${index}" class="form-control grading-max" />
      </div>

      <div class="mb-3">
        <label for="grading-grade-${index}" class="form-label">Grade</label>
        <input type="text" maxlength="2" value="${g.grade}" id="grading-grade-${index}" class="form-control grading-grade" />
      </div>

      <div class="mb-3">
        <label for="grading-remark-${index}" class="form-label">Remark</label>
        <input type="text" maxlength="255" value="${g.remark}" id="grading-remark-${index}" class="form-control grading-remark" />
      </div>

      <button class="btn btn-dark" id="edit-gradingBtn-${g.id}">
        <i class="fas fa-save"></i> Save Changes
        <span class="spinner-border spinner-border-sm d-none" id="edit-gradingSpinner-${g.id}" role="status" aria-hidden="true"></span>
      </button>
    `;

    item.querySelector(`#edit-gradingBtn-${g.id}`).onclick = () => updateGrading(g.id, item);
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

    if (response.status === 401 || response.status === 403) {
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

        if (response.status === 401 || response.status === 403) {
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

        if (response.status === 401 || response.status === 403) {
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



// Fetch and render grading list
async function fetchSessions() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/sessions/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.status === 401 || response.status === 403) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to fetch session lists info:', response.statusText);
        return;
    }
    const data = await response.json();
    renderSessions(data);
  } catch (error) {
    showAlert('error', `❌ Error fetching sessions data: ${error.message}`);
  }
}

function renderSessions(gradings) {
  const list = document.getElementById('sessionsList');
  list.innerHTML = '';

  const colors = [
  'rgba(110, 66, 193, 0.69)',   // light purple
  'rgba(13, 109, 253, 0.49)',   // light blue
  'rgba(32, 201, 150, 0.58)',   // light teal
  'rgba(253, 125, 20, 0.46)',   // light orange
  'rgba(220, 53, 70, 0.46)',    // light red
  'rgba(25, 135, 84, 0.46)'     // light green
];

  if (gradings.length === 0) {
    list.innerHTML = `<div class="no-sessions">📭 No sessions available.</div>`;
    return;
  }

  gradings.forEach((session, index) => {
    const item = document.createElement('div');
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    item.className = 'session-card';
    item.style.backgroundColor = bgColor;

    item.innerHTML = `
      <h5 class='mb-3'>📘 Session ${index + 1}</h5>

      <div class="mb-3">
        <label for="session-name-${index}" class="form-label">Session Name</label>
        <input type="text" value="${session.name}" id="session-name-${index}" class="form-control session-name" disabled />
        <span class="badge bg-${session.is_current ? 'success' : 'light text-dark'} mt-2">
          ${session.is_current ? '✅ Current Session' : '🕓 Inactive'}
        </span>
      </div>

      <div class="mb-3">
        <label for="session-date-${index}" class="form-label">📅 Next Term Resumption</label>
        <input type="date" value="${session.next_term_date}" id="session-date-${index}" class="form-control session-date" />
      </div>

      <div class="form-check form-switch mb-3">
        <input class="form-check-input session-toggle" type="checkbox" ${session.show ? 'checked' : ''} 
          data-session-id="${session.id}" id="show-result-${index}">
        <label class="form-check-label" for="show-result-${index}">Show result</label>
      </div>

      <button class="btn btn-light text-dark" id="edit-gradingBtn-${session.id}">
        <i class="fas fa-save"></i> Save Changes
        <span class="spinner-border spinner-border-sm d-none" id="edit-sessionSpinner-${session.id}" role="status" aria-hidden="true"></span>
      </button>
    `;

    // Save handler
    item.querySelector(`#edit-gradingBtn-${session.id}`).onclick = () => updateSession(session.id, item);

    list.appendChild(item);
  });
}


fetchSessions()

async function updateSession (id, sessionElement){
  // const nameInput = sessionElement.querySelector('.session-name');
  const dateInput = sessionElement.querySelector('.session-date');
  const showToggle = sessionElement.querySelector('.session-toggle');

  const updatedData = {
    show: showToggle.checked
  };
  
  if (dateInput.value) {
    updatedData.next_term_date = dateInput.value;
  }

  // Debug (optional)
  console.log('Sending session update:', updatedData);

  // Show spinner
  const spinner = sessionElement.querySelector(`#edit-sessionSpinner-${id}`);
  spinner.classList.remove('d-none');

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/sessions/update/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    spinner.classList.add('d-none');

    if (response.status === 401 || response.status === 403) {
        window.location.href = 'auth.html';
        return;
    }

    if (!response.ok) {
        showAlert('error', '❌ Failed to update session info:', response.statusText);
        return;
    }

    const data = await response.json();
    showAlert('success','✅ Session updated successfully!');
    fetchSessions()
  } catch (error) {
    spinner.classList.add('d-none');
    showAlert('error','❌ Failed to update session.');
  } finally{
    spinner.classList.add('d-none');
  }
}









async function fetchLevies() {
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/levies/`, {
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
            showAlert('error', '❌ Failed to fetch levies info:', response.statusText);
            return;
        }

        const data = await response.json();
        
        renderLevies(data);
    } catch (error) {
        showAlert('error','❌ Error fetching levies info:', error);
        console.error('error','❌ Error fetching levies info:', error);
    }
}

function renderLevies(levies) {
    const container = document.getElementById('levies-list');
    container.innerHTML = '';

    levies.forEach((levies, index) => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex align-items-center justify-content-between gap-3';

        item.innerHTML = `
            <span>${index + 1}</span><input type="text" class="form-control flex-grow-1" value="${levies.name}" id="levy-input-${levies.id}">
            <div class="btn-group">
                <button class="btn btn-primary" id="edit-levyBtn-${levies.id}" btn-sm" onclick="editLevy(${levies.id})">
                 <i class="fas fa-edit"></i>Edit
                <span class="spinner-border spinner-border-sm d-none" id="edit-levySpinner-${levies.id}" role="status" aria-hidden="true"></span>
                </button>
            </div>
        `;

        container.appendChild(item);
    });
}




document.getElementById('addLevyForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nameInput = this.elements['name'];
    const name = nameInput.value.trim();

    if (!name) {
        showAlert('error', '❌ Levy name cannot be empty.');
        return;
    }
    const submitButton = document.getElementById("submitBtn5");
    const submitSpinner = document.getElementById("submitSpinner5");

    submitButton.disabled = true;
    submitSpinner.classList.remove("d-none");

    try {
        const response = await fetch(`${ADMIN_BASE_URL}/levies/`, {
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
            showAlert('error', '❌ Failed to add levy: ' + data.error);
            return;
        }

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLevyModal'));
            modal.hide();

            nameInput.value = '';

            fetchLevies()

            showAlert('success', `✅ Levy "${data.name}" added successfully.`);
        } else {
            showAlert('error', '❌ Failed to add levy.');
        }

    } catch (error) {
        console.error(error);
        showAlert('error', '❌ An error occurred while adding the levy.');
    } finally {
        submitButton.disabled = false;
        submitSpinner.classList.add("d-none");
    }
});



async function editLevy(id) {
    const input = document.getElementById(`levy-input-${id}`);
    const newName = input.value;

    const submitButton2 = document.getElementById(`edit-levyBtn-${id}`);
    const submitSpinner2 = document.getElementById(`edit-levySpinner-${id}`);

    submitButton2.disabled = true;
    submitSpinner2.classList.remove("d-none");

    try{
      const response = await fetch(`${ADMIN_BASE_URL}/levies/${id}/`, {
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
          showAlert('error','❌ Failed to update levy.');
          return;
      }
      showAlert('success','✅ levy updated successfully!');
      fetchLevies();
      return;

    } catch (error) {
        console.error(error);
        showAlert('error', '❌ An error occurred while edit levy.');
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
        fetchLevies()
    } else {
        showAlert('error','❌ Failed to delete subject.');
    }
}

fetchLevies();

