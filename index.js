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

// Initialize dataLayer for analytics tracking
window.dataLayer = window.dataLayer || [];

// Helper function to push events to dataLayer
function gtag() {
    dataLayer.push(arguments);
}

// Adobe Web SDK Integration Functions
function sendToAdobe(eventData) {
    if (typeof alloy !== 'undefined') {
        // Map dataLayer event to Adobe XDM format
        const xdmData = mapToXDM(eventData);
        
        alloy("sendEvent", {
            "xdm": xdmData,
            "data": {
                "customData": eventData // Send original data as well
            }
        }).then(function(response) {
            console.log('Adobe Event Sent Successfully:', response);
        }).catch(function(error) {
            console.error('Adobe Event Send Error:', error);
        });
    } else {
        console.warn('Adobe Web SDK not loaded yet, queuing event:', eventData);
        // Queue events for later sending if Adobe SDK isn't ready
        window.adobeEventQueue = window.adobeEventQueue || [];
        window.adobeEventQueue.push(eventData);
    }
}

// Map dataLayer events to Adobe XDM Schema
function mapToXDM(eventData) {
    const timestamp = new Date().toISOString();
    const baseXDM = {
        "timestamp": timestamp,
        "eventType": getAdobeEventType(eventData.event),
        "web": {
            "webPageDetails": {
                "URL": window.location.href,
                "name": document.title,
                "pageViews": {
                    "value": eventData.event === 'page_view' ? 1 : 0
                }
            },
            "webReferrer": {
                "URL": document.referrer
            }
        },
        "device": {
            "screenHeight": screen.height,
            "screenWidth": screen.width
        },
        "environment": {
            "browserDetails": {
                "userAgent": navigator.userAgent,
                "viewportHeight": window.innerHeight,
                "viewportWidth": window.innerWidth
            }
        }
    };

    // Add event-specific XDM mappings
    switch(eventData.event) {
        case 'page_view':
            return {
                ...baseXDM,
                "web": {
                    ...baseXDM.web,
                    "webPageDetails": {
                        ...baseXDM.web.webPageDetails,
                        "siteSection": eventData.page_id,
                        "server": window.location.hostname
                    }
                },
                "_experience": {
                    "analytics": {
                        "customDimensions": {
                            "eVars": {
                                "eVar1": eventData.page_id,
                                "eVar2": eventData.page_title
                            }
                        }
                    }
                }
            };

        case 'click':
            return {
                ...baseXDM,
                "eventType": "web.webinteraction.linkClicks",
                "web": {
                    ...baseXDM.web,
                    "webInteraction": {
                        "name": eventData.element_name,
                        "type": "other",
                        "linkClicks": {
                            "value": 1
                        }
                    }
                },
                "_experience": {
                    "analytics": {
                        "customDimensions": {
                            "eVars": {
                                "eVar3": eventData.element_type,
                                "eVar4": eventData.element_name,
                                "eVar5": eventData.page_id
                            }
                        },
                        "event1to100": {
                            "event1": {
                                "value": 1
                            }
                        }
                    }
                }
            };

        case 'form_interaction':
            return {
                ...baseXDM,
                "eventType": "web.formFilledOut",
                "_experience": {
                    "analytics": {
                        "customDimensions": {
                            "eVars": {
                                "eVar6": eventData.form_name,
                                "eVar7": eventData.form_action,
                                "eVar8": eventData.page_id
                            }
                        },
                        "event1to100": {
                            "event2": {
                                "value": 1
                            }
                        }
                    }
                }
            };

        default:
            return baseXDM;
    }
}

// Get Adobe event type from dataLayer event
function getAdobeEventType(eventName) {
    const eventTypeMap = {
        'page_view': 'web.webpagedetails.pageViews',
        'click': 'web.webinteraction.linkClicks',
        'form_interaction': 'web.formFilledOut',
        'scroll': 'web.webinteraction.linkClicks'
    };
    
    return eventTypeMap[eventName] || 'web.webinteraction.linkClicks';
}

// Track page views
function trackPageView(pageId, pageName) {
    const eventData = {
        'event': 'page_view',
        'page_id': pageId,
        'page_title': pageName || pageId,
        'page_location': window.location.href,
        'timestamp': new Date().toISOString()
    };
    
    // Push to dataLayer
    dataLayer.push(eventData);
    
    // Send to Adobe Experience Platform
    sendToAdobe(eventData);
    
    console.log(`DataLayer: Page view tracked for ${pageId}`);
}

// Track click events
function trackClick(elementType, elementName, pageId, additionalData = {}) {
    const eventData = {
        'event': 'click',
        'element_type': elementType,
        'element_name': elementName,
        'page_id': pageId,
        'click_timestamp': new Date().toISOString(),
        ...additionalData
    };
    
    // Push to dataLayer
    dataLayer.push(eventData);
    
    // Send to Adobe Experience Platform
    sendToAdobe(eventData);
    
    console.log(`DataLayer: Click tracked - ${elementType}: ${elementName} on ${pageId}`);
}

// Track form interactions
function trackFormEvent(action, formName, pageId, formData = {}) {
    const eventData = {
        'event': 'form_interaction',
        'form_action': action,
        'form_name': formName,
        'page_id': pageId,
        'form_timestamp': new Date().toISOString(),
        ...formData
    };
    
    // Push to dataLayer
    dataLayer.push(eventData);
    
    // Send to Adobe Experience Platform
    sendToAdobe(eventData);
    
    console.log(`DataLayer: Form ${action} tracked for ${formName} on ${pageId}`);
}

// Multi-page navigation functionality with dataLayer tracking
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
    
    // Track page view in dataLayer
    const pageNames = {
        'home': 'Home Page',
        'about': 'About Us',
        'services': 'Our Services',
        'portfolio': 'Portfolio',
        'contact': 'Contact Us'
    };
    
    trackPageView(pageId, pageNames[pageId]);
    
    console.log(`Navigated to ${pageId} page`);
}

// Handle navigation clicks with dataLayer tracking
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            const currentPage = getCurrentPage();
            
            // Track navigation click
            trackClick('navigation', pageId, currentPage, {
                'destination_page': pageId,
                'navigation_type': 'main_menu'
            });
            
            showPage(pageId);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            trackClick('navigation', hash, getCurrentPage(), {
                'destination_page': hash,
                'navigation_type': 'browser_navigation'
            });
            showPage(hash);
        } else {
            showPage('home');
        }
    });
    
    // Load page based on URL hash on initial load
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        showPage(initialHash);
    } else {
        // Track initial page load
        trackPageView('home', 'Home Page');
    }
    
    // Track all button clicks with dataLayer
    setupButtonTracking();
    
    // Track service card interactions
    setupServiceTracking();
    
    // Track portfolio gallery interactions
    setupPortfolioTracking();
});

// Contact form functionality with dataLayer tracking
function submitForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Track form start interaction
    trackFormEvent('submit_attempt', 'contact_form', 'contact', {
        'form_fields_filled': {
            'name': !!name,
            'email': !!email,
            'subject': !!subject,
            'message': !!message
        }
    });
    
    if (!name || !email || !subject || !message) {
        // Track validation error
        trackFormEvent('validation_error', 'contact_form', 'contact', {
            'error_type': 'missing_fields',
            'missing_fields': [
                !name ? 'name' : null,
                !email ? 'email' : null,
                !subject ? 'subject' : null,
                !message ? 'message' : null
            ].filter(Boolean)
        });
        
        alert('Please fill in all fields before submitting.');
        return;
    }
    
    if (!isValidEmail(email)) {
        // Track email validation error
        trackFormEvent('validation_error', 'contact_form', 'contact', {
            'error_type': 'invalid_email',
            'email_provided': email
        });
        
        alert('Please enter a valid email address.');
        return;
    }
    
    // Track successful form submission
    trackFormEvent('submit_success', 'contact_form', 'contact', {
        'form_data': {
            'name_length': name.length,
            'email_domain': email.split('@')[1],
            'subject_length': subject.length,
            'message_length': message.length
        }
    });
    
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

// Helper function to get current active page
function getCurrentPage() {
    const activePage = document.querySelector('.page.active');
    return activePage ? activePage.id : 'unknown';
}

// Setup button click tracking
function setupButtonTracking() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const currentPage = getCurrentPage();
            const buttonType = this.onclick ? 'action_button' : 'navigation_button';
            
            trackClick('button', buttonText, currentPage, {
                'button_type': buttonType,
                'button_position': getElementPosition(this)
            });
        });
    });
}

// Setup service card tracking
function setupServiceTracking() {
    const serviceCards = document.querySelectorAll('#services .card');
    serviceCards.forEach((card, index) => {
        const serviceButton = card.querySelector('.btn');
        if (serviceButton) {
            serviceButton.addEventListener('click', function(e) {
                const serviceTitle = card.querySelector('h2').textContent;
                trackClick('service_card', serviceTitle, 'services', {
                    'service_index': index,
                    'service_name': serviceTitle
                });
            });
        }
        
        // Track card hover/interaction
        card.addEventListener('mouseenter', function() {
            const serviceTitle = card.querySelector('h2').textContent;
            trackClick('service_hover', serviceTitle, 'services', {
                'interaction_type': 'hover',
                'service_index': index
            });
        });
    });
}

// Setup portfolio gallery tracking
function setupPortfolioTracking() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const projectName = this.textContent.trim();
            trackClick('portfolio_item', projectName, 'portfolio', {
                'project_index': index,
                'project_name': projectName
            });
        });
    });
}

// Helper function to get element position
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        'x': Math.round(rect.left),
        'y': Math.round(rect.top),
        'width': Math.round(rect.width),
        'height': Math.round(rect.height)
    };
}

// Track form field interactions
function setupFormTracking() {
    const formFields = document.querySelectorAll('#contact input, #contact textarea');
    formFields.forEach(field => {
        // Track field focus
        field.addEventListener('focus', function() {
            trackFormEvent('field_focus', 'contact_form', 'contact', {
                'field_name': this.id,
                'field_type': this.type || 'textarea'
            });
        });
        
        // Track field completion
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                trackFormEvent('field_completed', 'contact_form', 'contact', {
                    'field_name': this.id,
                    'field_length': this.value.length
                });
            }
        });
    });
}

// Track scroll behavior (optional)
function setupScrollTracking() {
    let scrollTimeout;
    let maxScrollPercentage = 0;
    
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
        
        if (scrollPercentage > maxScrollPercentage) {
            maxScrollPercentage = scrollPercentage;
        }
        
        scrollTimeout = setTimeout(function() {
            const currentPage = getCurrentPage();
            trackClick('scroll', 'page_scroll', currentPage, {
                'scroll_percentage': scrollPercentage,
                'max_scroll_percentage': maxScrollPercentage,
                'page_height': documentHeight
            });
        }, 1000); // Track after 1 second of no scrolling
    });
}

// Add some interactive features with dataLayer tracking
document.addEventListener('DOMContentLoaded', function() {
    console.log('Multi-page website loaded successfully!');
    
    // Initialize Adobe Web SDK when ready
    initializeAdobeSDK();
    
    // Track initial page load
    const pageLoadEvent = {
        'event': 'page_loaded',
        'page_load_time': new Date().toISOString(),
        'user_agent': navigator.userAgent,
        'screen_resolution': `${screen.width}x${screen.height}`,
        'viewport_size': `${window.innerWidth}x${window.innerHeight}`
    };
    
    dataLayer.push(pageLoadEvent);
    sendToAdobe(pageLoadEvent);
    
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
    
    // Initialize form tracking
    setupFormTracking();
    
    // Initialize scroll tracking (optional)
    setupScrollTracking();
    
    console.log('DataLayer tracking initialized successfully!');
});

// Initialize Adobe Web SDK and process queued events
function initializeAdobeSDK() {
    // Wait for Adobe Web SDK to be available
    const checkAdobe = setInterval(function() {
        if (typeof alloy !== 'undefined') {
            clearInterval(checkAdobe);
            console.log('Adobe Web SDK is ready');
            
            // Process any queued events
            if (window.adobeEventQueue && window.adobeEventQueue.length > 0) {
                console.log(`Processing ${window.adobeEventQueue.length} queued Adobe events`);
                window.adobeEventQueue.forEach(eventData => {
                    sendToAdobe(eventData);
                });
                window.adobeEventQueue = [];
            }
            
            // Send identity information
            alloy("setConsent", {
                consent: [{
                    standard: "Adobe",
                    version: "2.0",
                    value: {
                        collect: {
                            val: "y"
                        }
                    }
                }]
            });
            
            // Optional: Set user identity if available
            // alloy("sendEvent", {
            //     "xdm": {
            //         "identityMap": {
            //             "Email": [{
            //                 "id": "user@example.com",
            //                 "primary": true
            //             }]
            //         }
            //     }
            // });
            
        }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(function() {
        clearInterval(checkAdobe);
        if (typeof alloy === 'undefined') {
            console.warn('Adobe Web SDK failed to load within 10 seconds');
        }
    }, 10000);
}

