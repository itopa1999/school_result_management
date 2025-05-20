document.addEventListener("DOMContentLoaded", function () {

const emailForm = document.getElementById('emailForm');
const tokenForm = document.getElementById('tokenForm');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const inputs = document.querySelectorAll('#tokenForm input');

// Handle form submissions
emailForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const forgetButton = document.getElementById("forgetBtn");
    const forgetSpinner = document.getElementById("forgetSpinner");

    forgetButton.disabled = true;
    forgetSpinner.classList.remove("d-none");


    try {
        const response = await fetch(`${BASE_URL}/user/forget/password/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
        });

        

        const data = await response.json();
        console.log(data)
        forgetButton.disabled = false;
        forgetSpinner.classList.add("d-none");

        if (!response.ok) {
            showAlert('error','❌ '+ data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        showAlert('success','✅ ' + data.message);
        setTimeout(() => {
            step1.style.display = 'none';
            emailForm.style.display = 'none';
            step2.style.display = 'block';
            tokenForm.style.display = 'block';
            inputs[0].focus();
        }, 2000);

    } catch (error) {
        showAlert('error',"❌ Server is not responding. Please try again later.");
    } finally{
        forgetButton.disabled = false;
        forgetSpinner.classList.add("d-none");
    }
});

tokenForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let otpInputs = document.querySelectorAll(".otp-input");
    let otpCode = parseInt(Array.from(otpInputs).map(input => input.value).join(""), 10);

    if (isNaN(otpCode) || otpCode.toString().length !== 6) {
        showAlert("info","ℹ️ Please enter a valid 6-digit verification code.");
        return;
    }

    const formData = new FormData(this);
    const password = formData.get("password");

    if (password.length < 8) {
        showAlert("info","ℹ️ Password must be at least 8 characters long.");
        return;
    }

    const confirmButton = document.getElementById("confirmBtn");
    const confirmSpinner = document.getElementById("confirmSpinner");

    confirmButton.disabled = true;
    confirmSpinner.classList.remove("d-none");

    
    try {
        const response = await fetch(`${BASE_URL}/user/forget/password/verify/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token: otpCode, password: password })
        });

        const data = await response.json();

        confirmButton.disabled = false;
        confirmSpinner.classList.add("d-none");

        if (!response.ok) {
            showAlert('error','❌ ' + data.error || "❌ Something went wrong! Please try again.");
            return;
        }

        localStorage.setItem("constant_token", data.access);
        localStorage.setItem("constant_user_id", data.id);
        localStorage.setItem("constant_is_admin", data.is_admin);
        localStorage.setItem("constant_is_manager", data.is_manager);
        localStorage.setItem("constant_profilePicture", data.profile_pic);
        showAlert('success','✅ ' +data.message);
        if (data.is_admin){
            setTimeout(() => {
                window.location.href = "D_index.html";
            }, 3000);
        }else if (data.is_manager){
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        }else{
            showAlert('error', "❌ Sorry, we can't no account type please login again or create an account");;
        }
        
        

    } catch (error) {
        showAlert('error',"❌ Server is not responding. Please try again later.");
    }finally {
        confirmButton.disabled = false;
        confirmSpinner.classList.add("d-none");
    }

});


// OTP Input Handling
inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && index > 0 && !input.value) {
            inputs[index - 1].focus();
        }
    });

})

});