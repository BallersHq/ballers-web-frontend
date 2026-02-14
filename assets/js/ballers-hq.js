const video = document.getElementById('ballersVideo');
const muteToggleButton = document.getElementById('muteToggleButton');
const muteIconSvg = document.getElementById('muteIconSvg');
const unmuteIconSvg = document.getElementById('unmuteIconSvg');

// Initial state from the HTML attribute
let isMuted = video.muted;

// Update button UI based on initial state
updateMuteButtonUI();

muteToggleButton.addEventListener('click', () => {
    isMuted = !isMuted; // Toggle the mute state
    video.muted = isMuted; // Apply the mute state to the video element
    updateMuteButtonUI(); // Update button appearance
});

function updateMuteButtonUI() {
    if (isMuted) {
        muteIconSvg.style.display = 'block';   // Show muted icon
        unmuteIconSvg.style.display = 'none'; // Hide unmuted icon
    } else {
        muteIconSvg.style.display = 'none';   // Hide muted icon
        unmuteIconSvg.style.display = 'block'; // Show unmuted icon
    }
}

// Optional: Listen for 'volumechange' event on the video
// This is useful if something else (e.g., another script) changes the volume
video.addEventListener('volumechange', () => {
    isMuted = video.muted;
    updateMuteButtonUI();
});

// Ensure video plays from start if it encounters issues (e.g., due to autoplay policies)
// This is a robust way to handle autoplay, especially if 'autoplay' attribute fails
video.play().catch(error => {
    console.log("Autoplay prevented:", error);
    // Optionally, show a play button if autoplay is blocked
    // For example: muteToggleButton.style.display = 'none'; and show a play button instead
});


const radios = document.querySelectorAll('.sixth-page-form-radio');

radios.forEach(radio => {
    radio.addEventListener('click', () => {
        // Reset all
        radios.forEach(r => {
            r.style.background = "#0C111D";
            r.style.border = "1px solid #98A2B3";
            r.style.color = "#fff"; // reset text color if needed
        });

        // Highlight clicked one
        radio.style.background = "#154327";
        radio.style.border = "1px solid #29864D";
        radio.style.color = "#fff"; // optional
        radio.querySelector('input[type="radio"]').checked = true;
    });
});


// subscribe to waitingList/newsletter
function subscribeToWaitingList() {

    document.getElementById('notifyForm').addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form elements
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const radios = document.querySelectorAll('input[name="userType"]');
        const messageDiv = document.getElementById('message');

        let valid = true;

        // Reset all borders
        document.querySelectorAll('.sixth-page-form-radio, .sixth-page-form-email-number')
            .forEach(el => el.classList.remove('error-border'));

        // Validate radio buttons
        const userType = document.querySelector('input[name="userType"]:checked');
        if (!userType) {
            // highlight BOTH containers since none is chosen
            document.querySelectorAll('.sixth-page-form-radio')
                .forEach(el => el.classList.add('error-border'));
            valid = false;
        }

        // Validate email
        if (!emailInput.value.trim() && !phoneInput.value.trim()) {
            // highlight both email + phone
            emailInput.closest('.sixth-page-form-email-number').classList.add('error-border');
            phoneInput.closest('.sixth-page-form-email-number').classList.add('error-border');
            valid = false;
        } else {
            // highlight whichever is empty if needed (optional)
            if (!emailInput.value.trim() && !phoneInput.value.trim()) {
                emailInput.closest('.sixth-page-form-email-number').classList.add('error-border');
                phoneInput.closest('.sixth-page-form-email-number').classList.add('error-border');
            }

        }

        if (!valid) {
            messageDiv.textContent = "Please fill in required fields.";
            messageDiv.style.color = "tomato";
            return; // stop fetch if validation fails
        }

        // If validation passes, send data
        fetch('https://ballershq.com/backend/api/v1/landing/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            body: JSON.stringify({
                email: emailInput.value,
                phone: phoneInput.value,
                userType: userType.value
            })
        })
            .then(async response => {
                const data = await response.json();
                messageDiv.textContent = data.message || 'User added to waiting list';
                messageDiv.style.color = response.ok ? '#02D866' : 'tomato';
            })
            .catch(error => {
                messageDiv.textContent = error.error?.message || "Something went wrong.";
                messageDiv.style.color = 'tomato';
            });
    });

}

subscribeToWaitingList();

const scrollContainer = document.querySelector(
    '.third-page-second-section-cards-container'
);

const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');

// How far to scroll per click
const SCROLL_AMOUNT = scrollContainer.clientWidth * 0.8;

scrollLeftBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({
        left: -SCROLL_AMOUNT,
        behavior: 'smooth'
    });
});

scrollRightBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({
        left: SCROLL_AMOUNT,
        behavior: 'smooth'
    });
});