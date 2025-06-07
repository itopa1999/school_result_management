// Function to get query parameters from the URL
function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

window.onload = function() {
    const message = getQueryParameter('message');

    if (message) {
        console.log("Displaying alert for message: " + message);
        if (message === "1") {
            showAlert('success', '✅  Account created successfully. Please check your email for verification.');
        }

    }
};


 document.getElementById("tokenForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    let otpInputs = document.querySelectorAll(".otp-input");
    let otpCode = parseInt(Array.from(otpInputs).map(input => input.value).join(""), 10);

    if (isNaN(otpCode) || otpCode.toString().length !== 6) {
        showAlert("info","ℹ️ Please enter a valid 6-digit verification code.");
        return;
    }

    const verifyButton = document.getElementById("verifyBtn");
    const verifySpinner = document.getElementById("verifySpinner");

    verifyButton.disabled = true;
    verifySpinner.classList.remove("d-none");

    try {
        const response = await fetch(`${BASE_URL}/user/verify/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token: otpCode })
        });

        const data = await response.json();
        verifyButton.disabled = false;
        verifySpinner.classList.add("d-none");

        if (!response.ok) {
            showAlert('error','❌' + data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        localStorage.setItem("constant_token", data.access);
        localStorage.setItem("constant_user_id", data.id);
        localStorage.setItem("constant_is_admin", data.is_admin);
        localStorage.setItem("constant_is_manager", data.is_manager);
        localStorage.setItem("constant_school_name", data.school_info.school_name);
        localStorage.setItem("constant_school_location", data.school_info.location);
        localStorage.setItem("constant_profilePicture", data.profile_pic);
        showAlert('success','✅ ' +data.message);
        localStorage.removeItem('constant_email');

        window.location.href = "index.html";

        


    } catch (error) {
        showAlert('error',"❌ Server is not responding. Please try again later.");
    }finally {
        verifyButton.disabled = false;
        verifySpinner.classList.add("d-none");
    }
});

async function resendToken(element){
    const email = localStorage.getItem("constant_email") || getQueryParameter('email');;
    if(email === null || email === undefined){
        showAlert("info","ℹ️ cannot find email, please contact support");
        return;
    }

    const originalText = element.innerHTML;

    element.innerHTML = '<span class="spinner"></span> Sending...';
    element.disabled = true; 

    try {
        const response = await fetch(`${BASE_URL}/user/resend/verification/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        element.innerHTML = originalText;
        element.disabled = false;
        if (!response.ok) {
            showAlert('error','❌ ' + data.error || "❌ Something went wrong! Please try again.");
            return;
        }
        showAlert('success','✅ ' +data.message);
        
    } catch (error) {
        showAlert('error',"❌ Server is not responding. Please try again later.");
    }finally {
        element.innerHTML = originalText;
        element.disabled = false;
    } 

}

const inputs = document.querySelectorAll('#tokenForm input');
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
});

