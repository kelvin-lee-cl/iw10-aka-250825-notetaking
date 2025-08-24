showTeacherArea();

let currentImageIndex = 0;
const images = [
    'highlight/1.png',
    'highlight/2.png',
    'highlight/3.jpeg',
    'highlight/4.png',
    'highlight/5.png',
    'highlight/6.png',
    'highlight/7.png',
    'highlight/9.jpg',
    'highlight/10.jpg',
    'highlight/11.jpg',
    'highlight/12.jpg',
    'highlight/13.jpg',
    'highlight/14.jpg'
];

function setImage(index) {
    currentImageIndex = index;
    document.getElementById('modalImage').src = images[currentImageIndex];
}



function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1; // Loop to last image
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0; // Loop to first image
    }
    document.getElementById('modalImage').src = images[currentImageIndex];
}

const rows = document.querySelectorAll('.row.fade-in');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Fade in
        } else {
            entry.target.classList.remove('visible'); // Fade out
        }
    });
}, { threshold: 0.1 }); // Adjust threshold as needed

rows.forEach(row => {
    observer.observe(row);
});

// Add event listener for keydown events
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        changeImage(-1); // Trigger changeImage for left arrow
    } else if (event.key === 'ArrowRight') {
        changeImage(1); // Trigger changeImage for right arrow
    }
});

// Global variables for slide functionality
const totalSlides = 19;
let currentSlide = 1;

document.addEventListener('DOMContentLoaded', function () {
    // Slides inline viewer logic
    const slideImage = document.getElementById('slideImage');
    const slideCounter = document.getElementById('slideCounter');
    const slidePrevBtn = document.getElementById('slidePrevBtn');
    const slideNextBtn = document.getElementById('slideNextBtn');

    function updateSlide() {
        if (slideImage && slideCounter) {
            slideImage.src = `images/slides/${currentSlide}.png`;
            slideCounter.textContent = `${currentSlide} / ${totalSlides}`;
        }
    }

    if (slidePrevBtn && slideNextBtn) {
        slidePrevBtn.addEventListener('click', function () {
            currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
            updateSlide();
        });
        slideNextBtn.addEventListener('click', function () {
            currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
            updateSlide();
        });
    }

    // Keyboard navigation for inline slides viewer
    document.addEventListener('keydown', function (event) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (slideImage) {
            if (event.key === 'ArrowLeft') {
                currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
                updateSlide();
            } else if (event.key === 'ArrowRight') {
                currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
                updateSlide();
            }
        }
    });

    // Initialize first slide
    updateSlide();

    // Initialize modal slides functionality
    initializeModalSlides();
});

// Modal slide functionality - will be initialized after DOM loads
let modalCurrentSlide = 1;
let modalSlideImage, modalSlideCounter, modalSlidePrevBtn, modalSlideNextBtn;

function updateModalSlide() {
    if (modalSlideImage && modalSlideCounter) {
        modalSlideImage.src = `images/slides/${modalCurrentSlide}.png`;
        modalSlideCounter.textContent = `${modalCurrentSlide} / ${totalSlides}`;
    }
}

function initializeModalSlides() {
    // Get modal elements
    modalSlideImage = document.getElementById('modalSlideImage');
    modalSlideCounter = document.getElementById('modalSlideCounter');
    modalSlidePrevBtn = document.getElementById('modalSlidePrevBtn');
    modalSlideNextBtn = document.getElementById('modalSlideNextBtn');

    console.log('Modal elements found:', {
        modalSlideImage: !!modalSlideImage,
        modalSlideCounter: !!modalSlideCounter,
        modalSlidePrevBtn: !!modalSlidePrevBtn,
        modalSlideNextBtn: !!modalSlideNextBtn
    });

    // Modal slide navigation
    if (modalSlidePrevBtn && modalSlideNextBtn) {
        modalSlidePrevBtn.addEventListener('click', function () {
            console.log('Modal Previous button clicked');
            modalCurrentSlide = modalCurrentSlide === 1 ? totalSlides : modalCurrentSlide - 1;
            updateModalSlide();
        });
        modalSlideNextBtn.addEventListener('click', function () {
            console.log('Modal Next button clicked');
            modalCurrentSlide = modalCurrentSlide === totalSlides ? 1 : modalCurrentSlide + 1;
            updateModalSlide();
        });
        console.log('Modal navigation buttons initialized successfully');
    } else {
        console.error('Modal navigation buttons not found');
    }

    // Reset modal slide when modal opens
    const slidesModal = document.getElementById('slidesModal');
    if (slidesModal) {
        slidesModal.addEventListener('show.bs.modal', function () {
            modalCurrentSlide = currentSlide; // Start with current slide from main viewer
            updateModalSlide();
        });
    }
}

// Keyboard navigation for modal slides
document.addEventListener('keydown', function (event) {
    const slidesModal = document.getElementById('slidesModal');
    if (slidesModal && slidesModal.classList.contains('show')) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        if (event.key === 'ArrowLeft') {
            modalCurrentSlide = modalCurrentSlide === 1 ? totalSlides : modalCurrentSlide - 1;
            updateModalSlide();
        } else if (event.key === 'ArrowRight') {
            modalCurrentSlide = modalCurrentSlide === totalSlides ? 1 : modalCurrentSlide + 1;
            updateModalSlide();
        } else if (event.key === 'Escape') {
            const modal = bootstrap.Modal.getInstance(slidesModal);
            if (modal) modal.hide();
        }
    }
});

// Reverse mapping: passcode to user ID
const passcodeToUser = {
    // First set (101-135)
    '101': '101', '102': '102', '103': '103', '104': '104', '105': '105',
    '106': '106', '107': '107', '108': '108', '109': '109', '110': '110',
    '111': '111', '112': '112', '113': '113', '114': '114', '115': '115',
    '116': '116', '117': '117', '118': '118', '119': '119', '120': '120',
    '121': '121', '122': '122', '123': '123', '124': '124', '125': '125',
    '126': '126', '127': '127', '128': '128', '129': '129', '130': '130',
    '131': '131', '132': '132', '133': '133', '134': '134', '135': '135',

    // Second set (201-235)
    '201': '201', '202': '202', '203': '203', '204': '204', '205': '205',
    '206': '206', '207': '207', '208': '208', '209': '209', '210': '210',
    '211': '211', '212': '212', '213': '213', '214': '214', '215': '215',
    '216': '216', '217': '217', '218': '218', '219': '219', '220': '220',
    '221': '221', '222': '222', '223': '223', '224': '224', '225': '225',
    '226': '226', '227': '227', '228': '228', '229': '229', '230': '230',
    '231': '231', '232': '232', '233': '233', '234': '234', '235': '235',

    // Third set (301-335)
    '301': '301', '302': '302', '303': '303', '304': '304', '305': '305',
    '306': '306', '307': '307', '308': '308', '309': '309', '310': '310',
    '311': '311', '312': '312', '313': '313', '314': '314', '315': '315',
    '316': '316', '317': '317', '318': '318', '319': '319', '320': '320',
    '321': '321', '322': '322', '323': '323', '324': '324', '325': '325',
    '326': '326', '327': '327', '328': '328', '329': '329', '330': '330',
    '331': '331', '332': '332', '333': '333', '334': '334', '335': '335',

    // Fourth set (401-435)
    '401': '401', '402': '402', '403': '403', '404': '404', '405': '405',
    '406': '406', '407': '407', '408': '408', '409': '409', '410': '410',
    '411': '411', '412': '412', '413': '413', '414': '414', '415': '415',
    '416': '416', '417': '417', '418': '418', '419': '419', '420': '420',
    '421': '421', '422': '422', '423': '423', '424': '424', '425': '425',
    '426': '426', '427': '427', '428': '428', '429': '429', '430': '430',
    '431': '431', '432': '432', '433': '433', '434': '434', '435': '435',

    // Fifth set (501-535)
    '501': '501', '502': '502', '503': '503', '504': '504', '505': '505',
    '506': '506', '507': '507', '508': '508', '509': '509', '510': '510',
    '511': '511', '512': '512', '513': '513', '514': '514', '515': '515',
    '516': '516', '517': '517', '518': '518', '519': '519', '520': '520',
    '521': '521', '522': '522', '523': '523', '524': '524', '525': '525',
    '526': '526', '527': '527', '528': '528', '529': '529', '530': '530',
    '531': '531', '532': '532', '533': '533', '534': '534', '535': '535',

    // Admin numbers
    '180': '180', '280': '280', '380': '380', '480': '480', '580': '580'
};

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const passcode = document.getElementById('passcode').value.toUpperCase();
            console.log('Attempting login with passcode:', passcode);
            const userId = passcodeToUser[passcode];
            console.log('Found userId:', userId);

            if (userId) {
                // Store the user ID in localStorage
                localStorage.setItem('currentUserId', userId);

                // Hide the login button
                const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
                loginBtn.style.display = 'none';

                // Show logout button
                const logoutBtn = document.getElementById('logoutBtn');
                console.log('Current userId:', userId);
                if (logoutBtn && userId) {
                    logoutBtn.style.display = 'block';
                    console.log('Showing logout button');
                }

                // Add welcome message in place of the button
                const welcomeMsg = document.createElement('p');
                welcomeMsg.className = 'mt-5';
                welcomeMsg.innerHTML = `Welcome ID ${userId}`;
                loginBtn.parentNode.appendChild(welcomeMsg);

                // Show the class presentation link
                const classPptLink = document.getElementById('classPptLink');
                if (classPptLink) {
                    classPptLink.classList.remove('d-none');
                }
                const imgGenLink = document.getElementById('imgGenLink');
                if (imgGenLink) {
                    imgGenLink.classList.remove('d-none');
                }
                const aiArtStudio = document.getElementById('aiArtStudio');
                if (aiArtStudio) {
                    aiArtStudio.classList.remove('d-none');
                }

                // Show teacher area
                showTeacherArea();

                // Show exercise tabs
                showExerciseTabs();
            } else {
                alert('Wrong Password！');
            }
        });
    }
});

// Check login status when page loads
document.addEventListener('DOMContentLoaded', function () {
    const currentUserId = localStorage.getItem('currentUserId');
    console.log('Stored userId:', currentUserId);
    if (currentUserId) {
        // User is logged in, hide login button and show welcome message
        const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
        if (loginBtn) {
            loginBtn.style.display = 'none';

            const welcomeMsg = document.createElement('p');
            welcomeMsg.className = 'mt-5';
            welcomeMsg.innerHTML = `User ID ${currentUserId}`;
            loginBtn.parentNode.appendChild(welcomeMsg);
        }

        // Show logout button
        const logoutBtn = document.getElementById('logoutBtn');
        const userIdDisplay = document.getElementById('userIdDisplay');
        if (logoutBtn && userIdDisplay) {
            userIdDisplay.classList.remove('d-none');
            userIdDisplay.textContent = `User ID: ${currentUserId} ${getEmojiForUserId(currentUserId)}`;
            logoutBtn.style.display = 'block';
            console.log('Showing logout button on page load');
        }

        // Show the class presentation link
        const classPptLink = document.getElementById('classPptLink');
        if (classPptLink) {
            classPptLink.classList.remove('d-none');
        }

        // Show the AI Art Studio link
        const imgGenLink = document.getElementById('imgGenLink');
        if (imgGenLink) {
            imgGenLink.classList.remove('d-none');
        }

        // Show AI tools link
        const aiArtStudio = document.getElementById('aiArtStudio');
        if (aiArtStudio) {
            aiArtStudio.classList.remove('d-none');
        }

        // Show exercise tabs
        showExerciseTabs();
    }
});

// Optional: Add a logout function
function logout() {
    localStorage.removeItem('currentUserId');
    location.reload()
    window.location.href = '../static/index.html';

    // Refresh the page
}

// Check if currentUserId is already declared
if (!window.currentUserId) {
    window.currentUserId = localStorage.getItem('currentUserId');
}

// After successful login and user ID verification
function showTeacherArea() {
    const currentUserId = localStorage.getItem('currentUserId');
    console.log("it is working!");
    if (currentUserId) {
        const teacherArea = document.getElementById('teacherArea');
        if (teacherArea) {
            teacherArea.classList.remove('d-none'); // Remove the 'd-none' class
        }
    }
}

// Show exercise tabs after successful login
function showExerciseTabs() {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
        const exercise1 = document.getElementById('exercise1');
        const exercise2 = document.getElementById('exercise2');
        const exercise3 = document.getElementById('exercise3');

        if (exercise1) exercise1.classList.remove('d-none');
        if (exercise2) exercise2.classList.remove('d-none');
        if (exercise3) exercise3.classList.remove('d-none');
    }
}

// Array of kid-friendly, positive emojis
const kidFriendlyEmojis = [
    '🌟', '🌈', '🦄', '🐱', '🐶', '🦁', '🐼', '🐨', '🦊', '🦋',
    '🌸', '🌺', '🌻', '🌞', '⭐', '🌙', '☀️', '🌤️', '🌺', '🌷',
    '🍀', '🌱', '🌳', '🌴', '🌵', '🌿', '🍄', '🌼', '🌻', '🌹',
    '🎨', '🎭', '🎪', '🎯', '🎲'
];

// Function to get emoji based on user ID
function getEmojiForUserId(userId) {
    // Subtract 1 from userId since we want to start from 0
    const index = (userId - 1) % kidFriendlyEmojis.length;
    return kidFriendlyEmojis[index];
}

// Add error handling for missing elements and functions
document.addEventListener('DOMContentLoaded', function () {
    // Check if elements exist before trying to access them
    const textItems = document.querySelectorAll('.text-item');
    const buttons = document.querySelectorAll('.button-container .btn');

    // Only run the text rotation if elements exist
    if (textItems.length > 0 && buttons.length > 0) {
        let currentIndex = 0;

        function showText(index) {
            // Remove active class from all items
            textItems.forEach(item => item.classList.remove('active'));
            // Add active class to selected item
            if (textItems[index]) {
                textItems[index].classList.add('active');
            }
            currentIndex = index;
        }

        function rotateText() {
            currentIndex = (currentIndex + 1) % textItems.length;
            showText(currentIndex);
        }

        // Start rotation
        setInterval(rotateText, 5000);

        // Add hover effect to buttons
        buttons.forEach((button, index) => {
            button.addEventListener('mouseover', () => {
                showText(index);
            });
        });
    }
});

// Add missing initializeProgressGrid function to prevent errors
function initializeProgressGrid() {
    // This function was being called but didn't exist
    // Adding empty implementation to prevent errors
    console.log('Progress grid initialization called');
}

