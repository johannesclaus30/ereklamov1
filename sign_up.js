// Toggle password visibility
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
}

// Password strength indicator
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthBar.className = 'password-strength';
    } else if (password.length < 6) {
        strengthBar.className = 'password-strength weak';
    } else if (password.length < 10) {
        strengthBar.className = 'password-strength medium';
    } else {
        strengthBar.className = 'password-strength strong';
    }
});

// Form submission
document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const streetAddress = document.getElementById('streetAddress').value;
    const barangay = document.getElementById('barangay').value;
    const city = document.getElementById('city').value;
    const province = document.getElementById('province').value;
    const zipCode = document.getElementById('zipCode').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!streetAddress || !barangay || !city || !province || !zipCode) {
        alert('Please fill in all address fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    if (!terms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    // Construct complete address
    const completeAddress = `${streetAddress}, ${barangay}, ${city}, ${province} ${zipCode}`;
    
    // Store user data
    const userData = {
        firstName,
        lastName,
        email,
        phone,
        address: {
            street: streetAddress,
            barangay,
            city,
            province,
            zipCode,
            complete: completeAddress
        }
    };
    
    // Success - auto sign in and go to dashboard
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userData', JSON.stringify(userData));
    alert('Account created successfully!');
    window.location.href = 'user_dashboard.html';
});
