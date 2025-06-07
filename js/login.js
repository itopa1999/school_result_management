document.addEventListener("DOMContentLoaded", function () {
document.querySelector(".login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const password = formData.get("password");

    if (password.length < 8) {
        showAlert("info","ℹ️ Password must be at least 8 characters long.");
        return;
    }

    const loginButton = document.getElementById("loginBtn");
    const loginSpinner = document.getElementById("loginSpinner");

    loginButton.disabled = true;
    loginSpinner.classList.remove("d-none");

    try {
        const response = await fetch(`${BASE_URL}/user/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        loginButton.disabled = false;
        loginSpinner.classList.add("d-none");

        const data = await response.json();

        if (!response.ok) {
            showAlert('error','❌ '+ data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        localStorage.setItem("constant_token", data.access);
        localStorage.setItem("constant_is_admin", data.is_admin);
        localStorage.setItem("constant_is_manager", data.is_manager);
        localStorage.setItem("constant_profilePicture", data.profile_pic);
        localStorage.setItem("constant_school_name", data.school_info.school_name);
        localStorage.setItem("constant_school_location", data.school_info.location);
        document.querySelector(".login-form").reset();
        window.location.href = "index.html";
        


    } catch (error) {
        showAlert('error', "❌ Server is not responding. Please try again later.");
    } finally {
        loginButton.disabled = false;
        loginSpinner.classList.add("d-none");
    }

});

document.querySelector(".register-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const password = formData.get("password");
    if (password.length < 8) {
        showAlert("info","ℹ️ Password must be at least 8 characters long.");
        return;
    }

    primaryTerms = document.getElementById('primaryTerms')
    secondaryTerms = document.getElementById('secondaryTerms')

    if(!secondaryTerms.checked && !primaryTerms.checked){
        showAlert("info","ℹ️ Primary or Secondary option condition must be check");
        return;
    }

    if(secondaryTerms.checked && primaryTerms.checked){
        showAlert("info","ℹ️ Primary or Secondary option, both condition cannot be check");
        return;
    }

    termCheck = document.getElementById('terms')
    if(!termCheck.checked){
        showAlert("info","ℹ️ Terms and Condition must be check");
        return;
    }

    formData.append("is_secondary", secondaryTerms.checked);
    formData.append("is_primary", primaryTerms.checked);

    console.log(JSON.stringify(Object.fromEntries(formData.entries())))

    const signUpButton = document.getElementById("signUpBtn");
    const signUpSpinner = document.getElementById("signUpSpinner");

    signUpButton.disabled = true;
    signUpSpinner.classList.remove("d-none");

    try {
        const response = await fetch(`${BASE_URL}/user/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        const data = await response.json();

        // console.log(data)

        signUpButton.disabled = false;
        signUpSpinner.classList.add("d-none");

        if (!response.ok) {
            showAlert('error','❌ ' + data.error || "❌ Something went wrong! Please try again.");
            return;
        }

        document.querySelector(".register-form").reset();

        if (response.status === 201) {
            showAlert('success', '✅ ' + data.message);
            localStorage.setItem("constant_email", data.email);
            setTimeout(() => {
                window.location.href = "verify-token.html";
            }, 3000);
        }

        else if (response.status === 200 && data.checkout_url) {
            showAlert('info', '🔄 Redirecting to payment...');
            setTimeout(() => {
                window.location.href = data.checkout_url;
            }, 1500);
        }
        
        

    } catch (error) {
        showAlert('error',"❌ Server is not responding. Please try again later.");
    }finally {
        signUpButton.disabled = false;
        signUpSpinner.classList.add("d-none");
    }
});





const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.form-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active classes
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));

        // Add active classes
        tab.classList.add('active');
        const formId = tab.dataset.form;
        document.getElementById(`${formId}Form`).classList.add('active');
    });
});

});