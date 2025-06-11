const ADMIN_BASE_URL = "https://luck1999.pythonanywhere.com/admins/api";


// FETCH USER DETAILS
const token = localStorage.getItem('p_token');
const parent_name = localStorage.getItem('p_name');
const school_name = localStorage.getItem('p_school_name');
const school_location = localStorage.getItem('p_school_location');

document.getElementById("schoolNameDisplay").innerHTML = school_name;

const navContainer = document.getElementById("navContainer");

const adminNav = `
    <div class="nav-item">
        <a href="index.html" class="nav-link">
            <i class="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
        </a>
    </div>
    <div class="nav-item">
        <a href="results.html" class="nav-link ">
            <i class="fa fa-file-text "></i>
            <span>Manage Results</span>
        </a>
    </div>
    <div class="nav-item">
        <a href="fees.html" class="nav-link ">
            <i class="fas fa-chalkboard"></i>
            <span>Manage School fees</span>
        </a>
    </div>
`;

navContainer.innerHTML = adminNav;

document.getElementById('profilePic').src = "/img/parent_icon.png";

document.getElementById('logoutUser').addEventListener('click', function() {
    RemoveAccessFromLocalStorage()
    showAlert("success","✅ Logout successful! ")
    setTimeout(() => {
        window.location.href = "login.html";
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
                        <button type="submit" id="changePasswordBtn" class="btn btn-green w-100" >Change Password → 
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
            
            const response = await fetch(`${ADMIN_BASE_URL}/parent/change/password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-Parent-Code': `${token}`,
                },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
           

            const data = await response.json();
            console.log(data)
            changePasswordButton.disabled = false;
            changePasswordSpinner.classList.add("d-none");

            if (response.status === 401 || response.status === 403) {
                showAlert("error",'❌ Authorized request');
                RemoveAccessFromLocalStorage()
                setTimeout(() => {
                    window.location.href = "login.html";
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
    localStorage.removeItem('p_token');
    localStorage.removeItem('p_name');
    localStorage.removeItem('p_school_name');
    localStorage.removeItem('p_school_location');
}



// Toggle sidebar on mobile
document.querySelector('.menu-btn').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
});

// Close sidebar when clicking on overlay
document.querySelector('.overlay').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.remove('active');
    this.classList.remove('active');
});

// Toggle dark mode
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Toggle user dropdown
const userBtn = document.querySelector('.user-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');

userBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (dropdownMenu.classList.contains('show') && !e.target.closest('.user-dropdown')) {
        dropdownMenu.classList.remove('show');
    }
});

// Set current date and time greeting
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    
    const hour = now.getHours();
    let greeting;
    if (hour < 12) {
        greeting = 'Good Morning 🌞';
    } else if (hour < 18) {
        greeting = 'Good Afternoon ☀️';
    } else {
        greeting = 'Good Evening 🌙';
    }
    
    document.getElementById('timeGreeting').textContent = greeting + " " + parent_name;
}

// Initialize
updateDateTime();

// Update greeting every minute (in case page is left open)
setInterval(updateDateTime, 60000);
    




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



const currentPath = window.location.pathname.split("/").pop();
const links = document.querySelectorAll(".nav-link");

links.forEach(link => {
    const href = link.getAttribute("href");
    if (href && href === currentPath) {
        link.classList.add("active");
    } else {
        link.classList.remove("active");
    }
});
