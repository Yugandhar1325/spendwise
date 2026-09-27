const API_BASE = "http://localhost:5000/api";


// ==========================================
// HELPER: Get token from localStorage
// ==========================================

function getToken() {
    return localStorage.getItem("spendwiseToken");
}


// ==========================================
// HELPER: Get user from localStorage
// ==========================================

function getUser() {
    const user = localStorage.getItem("spendwiseUser");
    return user ? JSON.parse(user) : null;
}


// ==========================================
// HELPER: API request with auth
// ==========================================

async function apiRequest(endpoint, method = "GET", body = null) {

    const headers = {
        "Content-Type": "application/json"
    };

    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE + endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}


// ==========================================
// REGISTER FORM
// ==========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            const data = await apiRequest("/auth/register", "POST", {
                name,
                email,
                password
            });

            alert("Account created successfully! Please log in.");
            window.location.href = "login.html";

        } catch (error) {
            alert(error.message);
        }

    });

}


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        // Validation
        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {
            const data = await apiRequest("/auth/login", "POST", {
                email,
                password
            });

            // Save token and user info
            localStorage.setItem("spendwiseToken", data.token);
            localStorage.setItem("spendwiseUser", JSON.stringify({
                _id: data._id,
                name: data.name,
                email: data.email
            }));

            alert("Login successful!");
            window.location.href = "dashboard.html";

        } catch (error) {
            alert(error.message);
        }

    });

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {
    localStorage.removeItem("spendwiseToken");
    localStorage.removeItem("spendwiseUser");
    window.location.href = "login.html";
}


// ==========================================
// CHECK AUTH (redirect if not logged in)
// ==========================================

function checkAuth() {
    const token = getToken();

    // If on dashboard and no token, redirect to login
    if (
        window.location.pathname.includes("dashboard") &&
        !token
    ) {
        window.location.href = "login.html";
    }

    // If on login/register and has token, redirect to dashboard
    if (
        (window.location.pathname.includes("login") ||
         window.location.pathname.includes("register")) &&
        token
    ) {
        window.location.href = "dashboard.html";
    }
}

// Run auth check on page load
checkAuth();