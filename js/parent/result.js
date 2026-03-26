
document.addEventListener('DOMContentLoaded', async function() {
    
    const sessionSelect = document.getElementById('sessionSelect');
    const termSelect = document.getElementById('termSelect');
    const studentSelect = document.getElementById('studentSelect');

    // Disable term and student selects initially
    termSelect.disabled = true;
    studentSelect.disabled = true;

    // 1. Fetch and populate sessions
    try {
        const response = await fetch(`${ADMIN_BASE_URL}/parent/get/session/lists/`, {
            method: 'GET',
            headers: {
                'X-Parent-Code': token
            }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();

        data.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = session.name;
            option.dataset.terms = JSON.stringify(session.terms); // attach terms
            sessionSelect.appendChild(option);
        });

    } catch (error) {
        console.error('❌ Error fetching sessions:', error);
        showAlert('error', '❌ Error loading sessions');
    }

    // 2. When a session is selected
    sessionSelect.addEventListener('change', () => {
        const selectedOption = sessionSelect.options[sessionSelect.selectedIndex];
        const terms = JSON.parse(selectedOption.dataset.terms || '[]');

        // Reset term and student
        termSelect.innerHTML = '<option value="" selected disabled>Choose term</option>';
        studentSelect.innerHTML = '<option value="" selected disabled></option>';
        studentSelect.disabled = true;

        if (terms.length > 0) {
            terms.forEach(term => {
                const option = document.createElement('option');
                option.value = term.id;
                option.textContent = term.name;
                termSelect.appendChild(option);
            });
            termSelect.disabled = false;
        } else {
            termSelect.disabled = true;
        }
    });

    // 3. When a term is selected
    termSelect.addEventListener('change', async () => {
        const sessionId = sessionSelect.value;
        const termId = termSelect.value;

        studentSelect.innerHTML = '<option value="" selected disabled>Loading students...</option>';
        studentSelect.disabled = true;

        if (!sessionId || !termId) return;

        try {
            const studentResponse = await fetch(`${ADMIN_BASE_URL}/parent/get/students/session/lists/${sessionId}/`, {
                method: 'GET',
                headers: {
                    'X-Parent-Code': token
                }
            });

            const students = await studentResponse.json();
            console.log(students)

            studentSelect.innerHTML = '<option value="" selected disabled>Choose student</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.student.id;
                option.textContent = `${student.student.name} (${student.class_level})`; // adjust keys as needed
                studentSelect.appendChild(option);
            });

            studentSelect.disabled = false;

        } catch (error) {
            console.error('❌ Error fetching students:', error);
            showAlert('error', '❌ Error loading students');
        }
    });

    var selectionModal = new bootstrap.Modal(document.getElementById('selectionModal'));
    selectionModal.show();
    
    // Initialize empty state
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('resultContent').style.display = 'none';
});

// Handle form submission
document.getElementById('submitSelection').addEventListener('click', async function() {
    const session = document.getElementById('sessionSelect').value;
    const term = document.getElementById('termSelect').value;
    const student = document.getElementById('studentSelect').value;
    
    if (session && term && student) {
        // Hide modal
        var selectionModal = bootstrap.Modal.getInstance(document.getElementById('selectionModal'));
        selectionModal.hide();
    
        

        try {
            const studentResponse = await fetch(`${ADMIN_BASE_URL}/parent/get/students/result/${student}/${session}/${term}/`, {
                method: 'POST',
                headers: {
                    'X-Parent-Code': token
                }
            });
            const result = await studentResponse.json();
            if (!studentResponse.ok) {
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

            const formattedDate = result.academic_sessions.resumptionDate
                ? new Date(result.academic_sessions.resumptionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                : 'Not Set';

            document.querySelector('.next-resumption-date').innerHTML =`
                <div class="result-info-item" style="text-align: center; margin-top: 20px;">
                <span class="result-info-label">Next Term Begins:</span> ${formattedDate}
                </div>
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
            
            // Hide empty state and show results
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('resultContent').style.display = 'block';

        } catch (error) {
            console.error('❌ Error fetching students:', error);
            showAlert('error', '❌ Error loading students');
        }


        
      
    } else {
        showAlert('info', 'ℹ️ Please select all options before proceeding.');
    }
});


function downloadPDF() {
    const element = document.querySelector('.result-container');
    
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


function printResult() {
    window.print();
}

// Handle modal close without selection
document.getElementById('selectionModal').addEventListener('hidden.bs.modal', function () {
    const session = document.getElementById('sessionSelect').value;
    const term = document.getElementById('termSelect').value;
    const student = document.getElementById('studentSelect').value;
    
    if (!session || !term || !student) {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('resultContent').style.display = 'none';
    }
});