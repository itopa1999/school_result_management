

const ADMIN_BASE_URL = "http://127.0.0.1:8000/admins/api";
const MANAGER_BASE_URL = "http://127.0.0.1:8000/backend/api";


// FETCH USER DETAILS
const profilePicture = localStorage.getItem('constant_profilePicture');
const token = localStorage.getItem('constant_token');
const is_admin = localStorage.getItem('constant_is_admin');
const is_manager = localStorage.getItem('constant_is_manager');


const navContainer = document.getElementById("navContainer");

const adminNav = `
  <nav class="nav flex-column">
    <a class="nav-link active" href="admin.html"><i class="fas fa-home me-2"></i> Dashboard</a>
    <a class="nav-link" href="session-lists.html"><i class="fas fa-users-cog me-2"></i> Manage Sessions</a>
    <a class="nav-link" href="class-lists.html"><i class="fas fa-chalkboard me-2"></i> Classes</a>
    <a class="nav-link" href="#"><i class="fas fa-chart-bar me-2"></i> Results</a>
    <a class="nav-link" href="#"><i class="fas fa-credit-card me-2"></i> Subscription</a>
    <a class="nav-link" href="#"><i class="fas fa-users-cog me-2"></i> Manage Users</a>
    <a class="nav-link" id="ChangePassword" href="#"><i class="fas fa-key me-2"></i> Change Password</a>
    <a class="nav-link" id="logoutUser" href="#"><i class="fas fa-sign-out-alt me-2"></i> Logout</a>
  </nav>
`;

const managerNav = `
  <nav class="nav flex-column">
    <a class="nav-link active" href="manager.html"><i class="fas fa-home me-2"></i> Dashboard</a>
    <a class="nav-link" href="class-lists.html"><i class="fas fa-chalkboard me-2"></i> Classes</a>
    <a class="nav-link" href="#"><i class="fas fa-chart-bar me-2"></i> Results</a>
    <a class="nav-link" id="ChangePassword" href="#"><i class="fas fa-key me-2"></i> Change Password</a>
    <a class="nav-link" id="logoutUser" href="#"><i class="fas fa-sign-out-alt me-2"></i> Logout</a>
  </nav>
`;

if (is_admin) {
  navContainer.innerHTML = adminNav;
} else if (is_manager) {
  navContainer.innerHTML = managerNav;
} else {
  window.location.href = "login.html";
}


// if (profilePicture) {
//     document.getElementById('profilePic').src = profilePicture;
// }else{
//     document.getElementById('profilePic').src = "/img/l8.jpeg";
// }


document.getElementById('logoutUser').addEventListener('click', function() {
    RemoveAccessFromLocalStorage()
    showAlert("success","✅ Logout successful! ")
    setTimeout(() => {
        window.location.href = "auth.html";
    }, 2000);
});



function showAlert(type, message) {
    const alertBox = document.getElementById("customAlert");
    const alertContent = document.getElementById("alertContent");
    const alertProgress = document.getElementById("alertProgress");

    alertContent.textContent = message;

    // Apply type-based color
    let bgColor;
    switch (type) {
        case 'success':
            bgColor = 'var(--success)';
            break;
        case 'info':
            bgColor = 'var(--info)';
            break;
        case 'error':
            bgColor = 'var(--error)';
            break;
        default:
            bgColor = '#ccc';
    }

    alertProgress.style.background = bgColor;

    // Show alert
    alertBox.classList.add("active");

    // Auto-close after 6 seconds
    setTimeout(closeAlert, 6000);
}

function closeAlert() {
    document.getElementById("customAlert").classList.remove("active");
}


function showChangePasswordModal() {
    let existingModal = document.getElementById("changePasswordModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML dynamically
    let modalHTML = `
    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-mute">Change Password</h5>
                    <button type="button" class="btn-close modal-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm">
                        <div class="mb-3">
                            <label for="oldPassword" class="form-label text-mute">Old Password</label>
                            <input type="password" name='password' class="form-control" id="oldPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="newPassword" class="form-label text-mute">New Password</label>
                            <input type="password"  name='password1' class="form-control" id="newPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="confirmPassword" class="form-label text-mute">Confirm Password</label>
                            <input type="password"  name='password2' class="form-control" id="confirmPassword" required>
                        </div>
                        <button type="submit" id="changePasswordBtn" class="btn btn-primary w-100" >Change Password → 
                            <span class="spinner-border spinner-border-sm d-none" id="changePasswordSpinnerBtn" role="status" aria-hidden="true"></span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;

    // Append modal to body
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Show the modal
    let modal = new bootstrap.Modal(document.getElementById("changePasswordModal"));
    modal.show();

    // Add submit event listener for the form
    document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (token === null){
            showAlert("error",'❌ Authorized request');
            RemoveAccessFromLocalStorage()
            setTimeout(() => {
                window.location.href = "auth.html";
            }, 3000);
        return;
        }
        const formData = new FormData(this);
        const password = formData.get("password");
        const password1 = formData.get("password1");
        const password2 = formData.get("password2");
        
        if (password.length < 8 || password1.length < 8 || password2.length < 8) {
            showAlert("error","❌ Password must be at least 8 characters long.");
            return;
        }

        if (password1 !== password2) {
            showAlert("error","❌ New Password and Confirm Password do not match.");
            return;
        }

        const changePasswordButton = document.getElementById("changePasswordBtn");
        const changePasswordSpinner = document.getElementById("changePasswordSpinnerBtn");

        changePasswordButton.disabled = true;
        changePasswordSpinner.classList.remove("d-none");

        try {
            
            const response = await fetch("http://127.0.0.1:8000/auth/api/user/change/password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
           

            const data = await response.json();
            console.log(data)
            changePasswordButton.disabled = false;
            changePasswordSpinner.classList.add("d-none");

            if (response.status === 401) {
                showAlert("error",'❌ Authorized request');
                RemoveAccessFromLocalStorage()
                setTimeout(() => {
                    window.location.href = "auth.html";
                }, 3000);
        return;
            }

            if (!response.ok) {
                showAlert("error",'❌ ' + data.error || "error","❌ Something went wrong! Please try again.");
                return;
            }

            

            RemoveAccessFromLocalStorage()

            showAlert("success",'✅ ' + data.message);

            setTimeout(() => {
                window.location.href = "auth.html";
            }, 3000);
        return;

        } catch (error) {
            showAlert("error","❌ Server is not responding. Please try again later.");
        }finally {
            changePasswordButton.disabled = false;
            changePasswordSpinner.classList.add("d-none");
        }
    });
}

// Add the event listener to the "Change Password" dropdown item
document.getElementById("ChangePassword").addEventListener("click", showChangePasswordModal);


function RemoveAccessFromLocalStorage(){
    localStorage.removeItem("constant_token");
    localStorage.removeItem("constant_profilePicture");
    localStorage.removeItem("constant_user_id");
    localStorage.setItem("constant_is_admin", false);
    localStorage.setItem("constant_is_manager", false);
}

function restrictPageAccess(options) {
    if (options.onlyAdmin && is_admin == false) {
        window.location.href = options.redirectTo || "manager.html";
    }else if(options.onlyManager && is_manager == false) {
        window.location.href = options.redirectTo || "admin.html";
    }
    else{
        window.location.href = options.redirectTo || "auth.html";
    }
}



// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    overlay.style.display = 'block';
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.style.display = 'none';
});

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
});

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Time-based Greeting
function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = document.getElementById('timeGreeting');
    const dateElement = document.getElementById('currentDate');
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);

    if (hour < 12) {
        greeting.textContent = 'Good Morning 🌞';
    } else if (hour < 18) {
        greeting.textContent = 'Good Afternoon ☀️';
    } else {
        greeting.textContent = 'Good Evening 🌙';
    }
}

// Initialize greeting and update every minute
updateGreeting();
setInterval(updateGreeting, 60000);

// Close sidebar on mobile when clicking links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
        }
    });
});

// Update active nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

let currentSessionId = null;
let currentTermId = null;

async function fetchMainInfo() {
  try {
    const response = await fetch(`${ADMIN_BASE_URL}/main/info/`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch main info");
    }

    const data = await response.json();

    currentSessionId = data.current_session_id;
    currentTermId = data.current_term_id;

    // Optional: update HTML or variables in your app
    document.getElementById("schoolNameDisplay").innerHTML = data.school_name;

  } catch (error) {
    console.error("Error fetching main info:", error);
  }
}

// Call the function
fetchMainInfo();
