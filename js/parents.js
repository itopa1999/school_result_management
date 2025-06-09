if (is_manager) {
  window.location.href = "index.html";
}

let editChoices;

document.addEventListener("DOMContentLoaded", async function () {
  // Initialize Choices for add form
  const studentSelect = document.getElementById("studentSelect");
  const studentChoices = new Choices(studentSelect, {
    removeItemButton: true,
    placeholderValue: 'Select student(s)',
    searchPlaceholderValue: 'Search students...',
    searchEnabled: true,
    shouldSort: false,
  });

  // Initialize Choices for edit modal select
  const editStudentSelect = document.getElementById("editStudentSelect");
  editChoices = new Choices(editStudentSelect, {
    removeItemButton: true,
    placeholderValue: 'Select student(s)',
    searchPlaceholderValue: 'Search students...',
    searchEnabled: true,
    shouldSort: false,
  });

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/students/`, {
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
    const students = data.results || data;  // Supports both paginated and non-paginated APIs

    const options = students.map(student => ({
      value: student.student.id,
      label: student.student.name + ' ' + student.class_level
    }));

    studentChoices.setChoices(options, 'value', 'label', true);
    editChoices.setChoices(options, 'value', 'label', false);

  } catch (error) {
    console.error('❌ Error fetching students:', error);
    showAlert('error', '❌ Error fetching students. Please try again later.');
  }

  // Add Parent Form submission
  document.getElementById("addParentForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById("submitBtn");
    const spinner = document.getElementById("submitSpinner");
    spinner.classList.remove('d-none');
    submitBtn.disabled = true;

    const name = form.name.value.trim();
    const email = form.email.value.trim();

    const selectedStudents = Array.from(document.getElementById("studentSelect").selectedOptions)
      .map(option => parseInt(option.value));

    const payload = {
      name,
      email,
      student_ids: selectedStudents
    };

    try {
      const response = await fetch(`${ADMIN_BASE_URL}/parents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401 || response.status === 403) {
        window.location.href = 'auth.html';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        showAlert('error', `❌ ${errorData.error || 'Failed to add parent'}`);
        return;
      }

      await response.json();
      showAlert('success', `✅ Parent added successfully.`);
      fetchAndRenderParents();
      form.reset();
      studentChoices.clearStore();
      studentChoices.setChoices([], 'value', 'label', false);

    } catch (error) {
      console.error("Submit error:", error);
      showAlert('error', '❌ Network or server error. Try again.');
    } finally {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
    }
  });
});

let nextPageUrl = null;
let prevPageUrl = null;

async function fetchAndRenderParents(url, direction = null) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const prevSpinner = document.getElementById('prevSpinner');
  const nextSpinner = document.getElementById('nextSpinner');

  // Show spinner on the button based on direction
  if (direction === 'next') {
    nextSpinner.classList.remove('d-none');
    nextBtn.disabled = true;
  } else if (direction === 'prev') {
    prevSpinner.classList.remove('d-none');
    prevBtn.disabled = true;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      window.location.href = 'auth.html';
      return;
    }

    if (!response.ok) {
      showAlert('error', `❌ Failed to load parents: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const parents = data.results || data;

    console.log(data)

    const tbody = document.querySelector('#parentsTable tbody');
    tbody.innerHTML = '';

    parents.forEach(parent => {
      const studentNames = parent.students.map(s => s.name).join(', ');
      const studentIds = JSON.stringify(parent.students.map(s => s.id));

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${parent.name}</td>
        <td>${parent.email}</td>
        <td>${studentNames}</td>
        <td>
        <span class="badge ${parent.is_active ? 'bg-success' : 'bg-danger'}">
          ${parent.is_active ? 'Active' : 'Inactive'}
        </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick='editParent(${parent.id}, "${escapeQuotes(parent.name)}", "${escapeQuotes(parent.email)}", ${studentIds}, ${parent.is_active})'>
            <i class="fa fa-pencil"></i> Edit
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

    nextPageUrl = data.next;
    prevPageUrl = data.previous;

    nextBtn.disabled = !nextPageUrl;
    prevBtn.disabled = !prevPageUrl;

  } catch (error) {
    console.error('Error fetching parents:', error);
    showAlert('error', '❌ Network error while loading parents.');
  } finally {
    nextSpinner.classList.add('d-none');
    prevSpinner.classList.add('d-none');

    nextBtn.disabled = !nextPageUrl;
    prevBtn.disabled = !prevPageUrl;
  }
}

window.editParent = function(id, name, email, studentIds, isActive) {
  // Set form values
  document.getElementById('editParentId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editEmail').value = email;
  document.getElementById('editIsActive').checked = isActive;

  // Set selected students in Choices multi-select
  editChoices.removeActiveItems();
  editChoices.setChoiceByValue(studentIds.map(String)); // Choices expects strings

  // Show modal (Bootstrap 5)
  const modal = new bootstrap.Modal(document.getElementById('editParentModal'));
  modal.show();
};

// Pagination buttons
document.getElementById('nextBtn').addEventListener('click', () => {
  if (nextPageUrl) {
    fetchAndRenderParents(nextPageUrl, 'next');
  }
});
document.getElementById('prevBtn').addEventListener('click', () => {
  if (prevPageUrl) {
    fetchAndRenderParents(prevPageUrl, 'prev');
  }
});

// Initial fetch
fetchAndRenderParents(`${ADMIN_BASE_URL}/parents/`);


document.getElementById('editParentForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = form.querySelector('.spinner-border');
  spinner.classList.remove('d-none');
  submitBtn.disabled = true;

  const id = form.editParentId.value;
  const name = form.editName.value.trim();
  const email = form.editEmail.value.trim();
  const isActive = form.editIsActive.checked;

  // Get selected students from Choices instance (editChoices)
  const selectedStudents = editChoices.getValue(true); // returns array of selected values as strings

  const payload = {
    name,
    email,
    student_ids: selectedStudents.map(Number), // convert strings to numbers
    is_active: isActive
  };

  try {
    const response = await fetch(`${ADMIN_BASE_URL}/parents/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 401 || response.status === 403) {
      window.location.href = 'auth.html';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      showAlert('error', `❌ ${errorData.error || 'Failed to update parent'}`);
      return;
    }

    showAlert('success', '✅ Parent updated successfully.');
    bootstrap.Modal.getInstance(document.getElementById('editParentModal')).hide();
    fetchAndRenderParents(`${ADMIN_BASE_URL}/parents/`);

  } catch (error) {
    console.error("Edit submit error:", error);
    showAlert('error', '❌ Network or server error. Try again.');
  } finally {
    spinner.classList.add('d-none');
    submitBtn.disabled = false;
  }
});



function escapeQuotes(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}


