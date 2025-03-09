// Tab switching
function openTab(evt, tabName) {
    // Hide existing tab content
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
        tabcontent[i].innerHTML = ""; // Clear previous content
    }

    // Deactivate all tab buttons
    var tablinks = document.getElementsByClassName("tablinks");
    for (var j = 0; j < tablinks.length; j++) {
        tablinks[j].classList.remove("active");
    }

    // Check or create the target tab container
    var targetTab = document.getElementById(tabName);
    if (!targetTab) {
        targetTab = document.createElement("div");
        targetTab.id = tabName;
        targetTab.classList.add("tabcontent");
        var container = document.querySelector(".container");
        if (container) {
            container.appendChild(targetTab);
        }
    }

    // Fetch the corresponding HTML file (e.g. "home.html")
    fetch(tabName + ".html", { cache: "no-cache" })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load content (${response.status}): ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            if (!data.trim()) {
                throw new Error(`Received empty content for ${tabName}.html`);
            }

            // Extract the #tabName div from the fetched HTML
            var parser = new DOMParser();
            var doc = parser.parseFromString(data, "text/html");
            var fetchedContent = doc.getElementById(tabName);

            if (fetchedContent) {
                targetTab.innerHTML = fetchedContent.innerHTML; // Insert only the relevant inner content
                targetTab.classList.add("active");

                // Initialize carousel if this is the "home" tab
                if (tabName === "home") {
                    initializeCarousel();
                }
            } else {
                console.error(`Error: Tab content not found in ${tabName}.html`);
            }
        })
        .catch(error => {
            console.error(`Error loading tab '${tabName}':`, error);
        });

    // If this was triggered by a real click event, mark the tab link as active
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    } else if (tabName === "home") {
        var homeBtn = document.querySelector(".tablinks[onclick*='openTab(event, \"home\")']");
        if (homeBtn) {
            homeBtn.classList.add("active");
        }
    }

    // Update the URL without reloading the page
    history.pushState(null, "", `/${tabName}`);
}

// Load the correct tab if accessed directly
window.onload = function () {
    let path = window.location.pathname.substring(1); // Remove leading "/"

    // Default to "home" if path is empty
    if (path === "") {
        path = "home";
    }

    // Ensure tab exists before opening
    const validTabs = ["home", "payment", "faq", "tos", "privacy-policy", "release", "about"];
    if (validTabs.includes(path)) {
        openTab(null, path);
    } else {
        console.error(`Invalid tab: '${path}' does not exist.`);
        openTab(null, "home"); // Redirect to home if invalid
    }
};

// Handle back/forward browser navigation
window.onpopstate = function () {
    let path = window.location.pathname.substring(1); // Get new URL path
    if (path === "") {
        path = "home";
    }
    openTab(null, path);
};

// Carousel Initialization
function initializeCarousel() {
    var currentSlide = 0;
    var slides = document.getElementsByClassName("slide");
    var dots = document.getElementsByClassName("dot");

    function showSlide(index) {
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        for (var i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
            if (dots[i]) {
                dots[i].classList.remove("active");
            }
        }
        slides[currentSlide].classList.add("active");
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add("active");
        }
    }

    // Expose functions globally for HTML onclick attributes
    window.changeSlide = function(n) {
        showSlide(currentSlide + n);
    };

    window.jumpToSlide = function(n) {
        showSlide(n);
    };

    // Carousel expand/collapse
    var featureLocked = false;
    var featureHeading = document.getElementById("featureHeading");
    var featureCarousel = document.getElementById("featureCarousel");
    var adAndCarousel = document.getElementById("adAndCarousel");

    if (featureHeading && featureCarousel && adAndCarousel) {
        function expandContainer() {
            setTimeout(function() {
                adAndCarousel.style.maxHeight = adAndCarousel.scrollHeight + "px";
            }, 500);
        }

        function collapseContainer() {
            adAndCarousel.style.maxHeight = "300px";
        }

        featureHeading.addEventListener("mouseenter", function() {
            if (!featureLocked) {
                expandContainer();
                featureCarousel.style.pointerEvents = "auto";
                featureCarousel.style.opacity = "1";
                featureCarousel.style.transform = "translateX(0)";
            }
        });

        featureHeading.addEventListener("mouseleave", function() {
            if (!featureLocked) {
                collapseContainer();
                featureCarousel.style.opacity = "0";
                featureCarousel.style.transform = "translateX(100%)";
                featureCarousel.style.pointerEvents = "none";
            }
        });

        featureHeading.addEventListener("click", function() {
            featureLocked = true;
            expandContainer();
            featureCarousel.style.pointerEvents = "auto";
            featureCarousel.style.opacity = "1";
            featureCarousel.style.transform = "translateX(0)";
        });

        // Initialize the first slide
        showSlide(0);
    } else {
        console.warn("Carousel elements (featureHeading, featureCarousel, adAndCarousel) are missing.");
    }
}

// Payment form
var quickPaymentForm = document.getElementById("paymentForm");
if (quickPaymentForm) {
    quickPaymentForm.addEventListener("submit", function(e) {
        e.preventDefault();
        var paymentResponseEl = document.getElementById("paymentResponse");
        if (paymentResponseEl) {
            paymentResponseEl.innerText = "Thank you! Your request has been submitted.";
        }
        this.reset();
    });
}

// Payment form using AJAX
document.addEventListener("DOMContentLoaded", function() {
    // Try to find the Payment Form if it exists at DOMContentLoaded
    var paymentForm = document.getElementById("paymentForm");
    var paymentResponseEl = document.getElementById("paymentResponse");

    if (paymentForm && paymentResponseEl) {
        paymentForm.addEventListener("submit", function(e) {
            e.preventDefault();

            console.log("Submitting form:", paymentForm.action);
            var formData = new FormData(paymentForm);
            var submitButton = paymentForm.querySelector("button[type='submit']");
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerText = "Submitting...";
            }

            fetch(paymentForm.action, {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: formData
            })
            .then(function(response) {
                console.log("Response received:", response);
                if (response.ok) {
                    return response.json().then(function() {
                        paymentResponseEl.innerText = "Thank you! Your request has been submitted.";
                        paymentResponseEl.style.color = "green";

                        setTimeout(function() {
                            paymentForm.reset();
                            if (submitButton) {
                                submitButton.disabled = false;
                                submitButton.innerText = "Submit";
                            }
                        }, 3000);
                    });
                } else {
                    return response.json().then(function(data) {
                        console.log("Data received:", data);
                        if (data.errors) {
                            paymentResponseEl.innerText = data.errors
                                .map(function(error) { return error.message; })
                                .join(", ");
                        } else {
                            paymentResponseEl.innerText = "Oops! There was a problem submitting your form.";
                        }
                        paymentResponseEl.style.color = "red";
                    });
                }
            })
            .catch(function(error) {
                console.error("Submission error:", error);
                paymentResponseEl.innerText = "Oops! There was a problem submitting your form.";
                paymentResponseEl.style.color = "red";
            })
            .finally(function() {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerText = "Submit";
                }
            });
        });
    }

    // Automatically show the HOME tab on page load
    openTab(null, "home");
});