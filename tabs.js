// Show navigation bar
document.addEventListener("DOMContentLoaded", () => {
    // Show/hide navigation bar on click
    function toggleMenu() {
        const navTabs = document.querySelector(".nav-tabs");
        navTabs.classList.toggle("show");
    }

    // Add event listener to the hamburger menu button
    document.querySelector(".menu-toggle").addEventListener("click", toggleMenu);

    // Automatically close menu when clicking a nav link (on mobile)
    document.querySelectorAll(".nav-tabs button").forEach(button => {
        button.addEventListener("click", () => {
            const navTabs = document.querySelector(".nav-tabs");
            if (navTabs.classList.contains("show")) {
                navTabs.classList.remove("show"); // Hide menu after clicking
            }
        });
    });
});

// Tab switching
function openTab(evt, tabName) {
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
        tabcontent[i].innerHTML = "";
    }

    var tablinks = document.getElementsByClassName("tablinks");
    for (var j = 0; j < tablinks.length; j++) {
        tablinks[j].classList.remove("active");
    }

    var targetTab = document.getElementById(tabName);
    if (!targetTab) {
        targetTab = document.createElement("div");
        targetTab.id = tabName;
        targetTab.classList.add("tabcontent");
        var container = document.querySelector(".container");
        if (container) container.appendChild(targetTab);
        else {
            console.error("Container element not found!");
            return;
        }
    }

    // Add a loading message while fetching
    targetTab.innerHTML = `<p>Loading ${tabName}...</p>`;
    targetTab.classList.add("active");

    fetch(tabName + ".html", { cache: "no-cache" })
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load content (${response.status})`);
            return response.text();
        })
        .then(data => {
            if (!data.trim()) throw new Error(`Empty content for ${tabName}.html`);
            var doc = new DOMParser().parseFromString(data, "text/html");
            var fetchedContent = doc.getElementById(tabName);
            if (fetchedContent) {
                targetTab.innerHTML = fetchedContent.innerHTML;
                targetTab.classList.add("active");
                if (tabName === "home") initializeCarousel();
                if (tabName === "contact") attachFormHandler();
            } else {
                throw new Error(`Tab content not found in ${tabName}.html`);
            }
        })
        .catch(error => {
            console.error(`Error loading tab '${tabName}':`, error);
            targetTab.innerHTML = `<p>Failed to load ${tabName} content. Please try again later.</p>`;
            targetTab.classList.add("active");
        });

    if (evt?.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else if (tabName === "home") {
        var homeBtn = document.querySelector(".tablinks[onclick*='openTab(event, \"home\")']");
        if (homeBtn) homeBtn.classList.add("active");
    }

    history.pushState(null, "", `/${tabName}`);
}

// Load correct tab on page load with redirect check
window.onload = function () {
    // If the page is loaded with a direct URL (e.g., /contact), ensure index.html is loaded first
    if (!document.querySelector(".container")) {
        window.location.replace("/index.html" + window.location.hash);
        return;
    }

    let path = window.location.hash.substring(1) || "home"; // Default to "home"
    const validTabs = ["home", "contact", "faq", "tos", "privacy", "release", "about"];
    openTab(null, validTabs.includes(path) ? path : "home");
};

// Handle back/forward navigation
window.onpopstate = function () {
    let path = window.location.pathname.substring(1) || "home"; // Default to "home"
    openTab(null, path);
};

// Carousel Initialization
function initializeCarousel() {
    var currentSlide = 0;
    var slides = document.getElementsByClassName("slide");
    var dots = document.getElementsByClassName("dot");

    function showSlide(index) {
        currentSlide = index >= slides.length ? 0 : index < 0 ? slides.length - 1 : index;
        for (var i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
            if (dots[i]) dots[i].classList.remove("active");
        }
        slides[currentSlide].classList.add("active");
        if (dots[currentSlide]) dots[currentSlide].classList.add("active");
    }

    window.changeSlide = n => showSlide(currentSlide + n);
    window.jumpToSlide = n => showSlide(n);

    var featureHeading = document.getElementById("featureHeading");
    var featureCarousel = document.getElementById("featureCarousel");
    var adAndCarousel = document.getElementById("adAndCarousel");

    if (featureHeading && featureCarousel && adAndCarousel) {
        // Show and animate carousel immediately
        setTimeout(() => {
            adAndCarousel.style.maxHeight = adAndCarousel.scrollHeight + "px";
            featureCarousel.style.opacity = "1";
            featureCarousel.style.transform = "translateY(0)";
            featureCarousel.style.pointerEvents = "auto";
        }, 100); // Small delay to ensure DOM is ready and animation triggers

        showSlide(0);
    } else {
        console.warn("Carousel elements missing.");
    }
}

// Form handler function
function attachFormHandler() {
    var Form = document.getElementById("Form");
    var ResponseEl = document.getElementById("Response");

    if (Form && ResponseEl) {
        console.log("Attaching form handler for contact tab");
        Form.addEventListener("submit", function(e) {
            e.preventDefault();
            console.log("Form submission intercepted");

            var formData = new FormData(Form);
            var submitButton = Form.querySelector("button[type='submit']");
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerText = "Submitting...";
            }

            fetch(Form.action, {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: formData
            })
            .then(response => {
                console.log("Fetch response:", response);
                if (response.ok) {
                    return response.json().then(() => {
                        ResponseEl.innerText = "Thank you! Your message has been submitted.";
                        ResponseEl.style.color = "green";
                        setTimeout(() => {
                            Form.reset(); // Reset the form but do not reload the page
                            submitButton.disabled = false;
                            submitButton.innerText = "Submit";
                        }, 3000);
                    });
                } else {
                    return response.json().then(data => {
                        ResponseEl.innerText = data.errors
                            ? data.errors.map(error => error.message).join(", ")
                            : "Oops! There was a problem submitting your form.";
                        ResponseEl.style.color = "red";
                    });
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                ResponseEl.innerText = "Oops! There was a problem submitting your form.";
                ResponseEl.style.color = "red";
            })
            .finally(() => {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerText = "Submit";
                }
            });
        });
    } else {
        console.error("Form or Response element not found in contact tab");
    }
}

// Initial page load
document.addEventListener("DOMContentLoaded", function() {
    // Already handled by window.onload
});