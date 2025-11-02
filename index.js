// My first JS code
console.log('Good Morning Guys!');
let myName = 'Hari';
console.log(myName);

// Variable can not start with number, should not contain space or - special characters
// Variables are case sensitive
let firstName = 'Hari';
let last_name = 'Kolukuluri';
console.log(firstName + ' ' + last_name);

// Data Types: string, number, boolean, undefined, null

// Multi-page navigation functionality
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show the selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Add active class to the corresponding nav link
    const targetNavLink = document.querySelector(`[data-page="${pageId}"]`);
    if (targetNavLink) {
        targetNavLink.classList.add('active');
    }
    
    // Update browser history (optional)
    if (history.pushState) {
        history.pushState(null, null, `#${pageId}`);
    }
    
    console.log(`Navigated to ${pageId} page`);
}

// Handle navigation clicks
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            showPage(hash);
        } else {
            showPage('home');
        }
    });
    
    // Load page based on URL hash on initial load
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        showPage(initialHash);
    }
});

// Contact form functionality
function submitForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields before submitting.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate form submission
    alert(`Thank you, ${name}! Your message has been sent successfully. We'll get back to you soon.`);
    
    // Clear the form
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('subject').value = '';
    document.getElementById('message').value = '';
    
    console.log('Form submitted:', { name, email, subject, message });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    console.log('Multi-page website loaded successfully!');
    
    // Add smooth scrolling effect when switching pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.transition = 'opacity 0.3s ease-in-out';
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
});

