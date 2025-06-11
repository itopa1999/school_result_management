// Show modal on page load
document.addEventListener('DOMContentLoaded', function() {
    var selectionModal = new bootstrap.Modal(document.getElementById('selectionModal'));
    selectionModal.show();
    
    // Initialize empty state
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('resultContent').style.display = 'none';
});

// Handle form submission
document.getElementById('submitSelection').addEventListener('click', function() {
    const session = document.getElementById('sessionSelect').value;
    const term = document.getElementById('termSelect').value;
    const student = document.getElementById('studentSelect').value;
    
    if (session && term && student) {
        // Hide modal
        var selectionModal = bootstrap.Modal.getInstance(document.getElementById('selectionModal'));
        selectionModal.hide();
        
        // Hide empty state and show results
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('resultContent').style.display = 'block';
        
        // Load results based on selections
        document.getElementById('resultContent').innerHTML = `
            <div class="alert alert-success mt-3">
                <i class="fas fa-check-circle me-2"></i>
                Results loaded for Student ID ${student}, ${session} Session, Term ${term}.
            </div>
            <div class="card result-card">
                <div class="card-header">
                    <i class="fas fa-chart-bar me-2"></i>Result Summary
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <h5 class="mb-1">${document.getElementById('studentSelect').options[document.getElementById('studentSelect').selectedIndex].text}</h5>
                            <small class="text-muted">${session} Session | Term ${term}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-primary">GPA: 3.8</span>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Mathematics</td>
                                    <td>85</td>
                                    <td>A</td>
                                    <td>Excellent</td>
                                </tr>
                                <tr>
                                    <td>English</td>
                                    <td>78</td>
                                    <td>B+</td>
                                    <td>Very Good</td>
                                </tr>
                                <tr>
                                    <td>Science</td>
                                    <td>92</td>
                                    <td>A+</td>
                                    <td>Outstanding</td>
                                </tr>
                                <tr>
                                    <td>History</td>
                                    <td>68</td>
                                    <td>B-</td>
                                    <td>Good</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#selectionModal">
                        <i class="fas fa-edit me-2"></i>Change Selection
                    </button>
                </div>
            </div>
        `;
    } else {
        alert('Please select all options before proceeding.');
    }
});

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