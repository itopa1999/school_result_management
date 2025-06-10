
document.addEventListener("DOMContentLoaded", function () {

const ADMIN_BASE_URL = "https://luck1999.pythonanywhere.com/admins/api";

const emailForm = document.getElementById('emailForm');
// Handle form submissions
emailForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    const forgetButton = document.getElementById("forgetBtn");
    const forgetSpinner = document.getElementById("forgetSpinner");

    forgetButton.disabled = true;
    forgetSpinner.classList.remove("d-none");


    try {
        const response = await fetch(`${ADMIN_BASE_URL}/parent/forget/password/`, {
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
        emailForm.reset()
    } catch (error) {
        showAlert('error',"❌ Server is not responding. Please try again later.");
    } finally{
        forgetButton.disabled = false;
        forgetSpinner.classList.add("d-none");
    }
});

});