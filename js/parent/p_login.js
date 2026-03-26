const ADMIN_BASE_URL = "http://127.0.0.1:8000/admins/api";

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
        const response = await fetch(`${ADMIN_BASE_URL}/parent/login/`, {
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

        console.log(data)
        localStorage.setItem("p_token", data.access_code);
        localStorage.setItem("p_name", data.parent_name);
        localStorage.setItem("p_school_name", data.school_name);
        localStorage.setItem("p_school_location", data.school_address);
        document.querySelector(".login-form").reset();
        window.location.href = "index.html";
        


    } catch (error) {
        showAlert('error', "❌ Server is not responding. Please try again later.");
    } finally {
        loginButton.disabled = false;
        loginSpinner.classList.add("d-none");
    }

});


})