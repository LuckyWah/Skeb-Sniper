// ------------------------------------ Show navigation bar ------------------------------------
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

// ------------------------------------ Tab switching ------------------------------------
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
        tabcontent[i].innerHTML = "";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let j = 0; j < tablinks.length; j++) {
        tablinks[j].classList.remove("active");
    }

    let targetTab = document.getElementById(tabName);
    if (!targetTab) {
        targetTab = document.createElement("div");
        targetTab.id = tabName;
        targetTab.classList.add("tabcontent");
        const container = document.querySelector(".container");
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
            const doc = new DOMParser().parseFromString(data, "text/html");
            const fetchedContent = doc.getElementById(tabName);
            if (fetchedContent) {
                targetTab.innerHTML = fetchedContent.innerHTML;
                targetTab.classList.add("active");
                if (tabName === "home") initializeCarousel();
                if (tabName === "contact") attachFormHandler();
                if (tabName === "purchase") initializePurchaseTab();
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
        const homeBtn = document.querySelector(".tablinks[onclick*='openTab(event, \"home\")']");
        if (homeBtn) homeBtn.classList.add("active");
    }

    history.pushState(null, "", `/${tabName}`);
}

// ------------------------------------ Load tab with redirect check ------------------------------------
window.onload = function () {
    // If the page is loaded with a direct URL (e.g., /contact), ensure index.html is loaded first
    if (!document.querySelector(".container")) {
        window.location.replace("/index.html" + window.location.hash);
        return;
    }

    let path = window.location.hash.substring(1) || "home"; // Default to "home"
    const validTabs = ["home", "purchase", "contact", "faq", "tos", "privacy", "release", "about"];
    openTab(null, validTabs.includes(path) ? path : "home");
};

// Handle back/forward navigation
window.onpopstate = function () {
    let path = window.location.pathname.substring(1) || "home"; // Default to "home"
    openTab(null, path);
};

// Carousel Initialization
function initializeCarousel() {
    let currentSlide = 0;
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");

    function showSlide(index) {
        currentSlide = index >= slides.length ? 0 : index < 0 ? slides.length - 1 : index;
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
            if (dots[i]) dots[i].classList.remove("active");
        }
        slides[currentSlide].classList.add("active");
        if (dots[currentSlide]) dots[currentSlide].classList.add("active");
    }

    window.changeSlide = n => showSlide(currentSlide + n);
    window.jumpToSlide = n => showSlide(n);

    const featureHeading = document.getElementById("featureHeading");
    const featureCarousel = document.getElementById("featureCarousel");
    const adAndCarousel = document.getElementById("adAndCarousel");

    if (featureHeading && featureCarousel && adAndCarousel) {
        // Function to set height
        function setContainerHeight() {
            adAndCarousel.getBoundingClientRect(); // Force reflow
            const newHeight = adAndCarousel.scrollHeight + "px";
            adAndCarousel.style.maxHeight = newHeight;
        }

        // Wait for advertisement animation to complete
        setTimeout(() => {
            setContainerHeight();
            // Animate carousel into view
            featureCarousel.style.opacity = "1";
            featureCarousel.style.transform = "translateX(0)";
            featureCarousel.style.pointerEvents = "auto";

            // Recheck height after another delay to catch late renders
            setTimeout(setContainerHeight, 500);}, 1500); // Increased delay to 1.5s for safety

        showSlide(0);
    } else {
        console.warn("Carousel elements missing.");
    }
}

// ------------------------------------ Form handler ------------------------------------
function attachFormHandler() {
    const Form = document.getElementById("Form");
    const ResponseEl = document.getElementById("Response");

    if (Form && ResponseEl) {
        Form.addEventListener("submit", function(e) {
            e.preventDefault();
            console.log("Form submission intercepted");

            const formData = new FormData(Form);
            const submitButton = Form.querySelector("button[type='submit']");
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

// ------------------------------------ Purchase function ------------------------------------
// Global state for the purchase tab
const purchaseState = {
    originalPrice: 50,
    discountedPrice: 50,
    couponCode: null, // Store the applied coupon code
    downloadLinks: null // Store download links after successful payment/free access
};

// Update the price display element
function updatePriceDisplay(priceDisplay, discountedPrice) {
    priceDisplay.innerHTML = `<strong>$${discountedPrice.toFixed(2)}</strong>`;
}

// Update the discount message element
function updateDiscountMessage(discountMessage, message, color) {
    discountMessage.innerText = message;
    discountMessage.style.color = color;
}

// Function to check if a coupon has been used (client-side, temporary - optional)
function isCouponUsed(couponCode) {
    const usedCoupons = JSON.parse(sessionStorage.getItem("usedCoupons") || "[]");
    return usedCoupons.includes(couponCode);
}

// Function to mark a coupon as used (client-side, temporary - optional)
function markCouponAsUsed(couponCode) {
    let usedCoupons = JSON.parse(sessionStorage.getItem("usedCoupons") || "[]");
    if (!usedCoupons.includes(couponCode)) {
        usedCoupons.push(couponCode);
        sessionStorage.setItem("usedCoupons", JSON.stringify(usedCoupons));
    }
}

// Render the download section with the provided links
function renderDownloadSection(downloadContainer, downloadLinks) {
    if (!downloadContainer) return;

    const downloadBtnWindows = downloadContainer.querySelector("#download-btn-windows");
    const downloadBtnLinux = downloadContainer.querySelector("#download-btn-linux");

    // Show both download buttons
    if (downloadBtnWindows) {
        downloadBtnWindows.onclick = () => {
            window.location.href = downloadLinks.windows;
        };
        downloadBtnWindows.style.display = "inline-block";
    }
    if (downloadBtnLinux) {
        downloadBtnLinux.onclick = () => {
            window.location.href = downloadLinks.linux;
        };
        downloadBtnLinux.style.display = "inline-block";
    }

    downloadContainer.style.display = "block";
    const purchaseButtonContainer = document.getElementById("purchase-button");
    if (purchaseButtonContainer) {
        purchaseButtonContainer.style.display = "none"; // Hide PayPal button after success
    }
}

// Render the PayPal button with the current price
function renderPayPalButton(purchaseButtonContainer, discountedPrice) {
    purchaseButtonContainer.innerHTML = "";
    purchaseButtonContainer.style.display = "block";

    if (typeof paypal === 'undefined' || !paypal.Buttons) {
        console.error("PayPal SDK not loaded. Check client ID or network.");
        updateDiscountMessage(document.getElementById("discount-message"), "PayPal SDK failed to load. Please try again later.", "red");
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: discountedPrice.toFixed(2) },
                    description: "Lifetime Access to Software"
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(async function(details) {
                try {
                    const response = await fetch('https://download.kasorashibainu.com/api/validate-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: details.id, couponCode: purchaseState.couponCode || "" })
                    });
                    const data = await response.json();
                    if (data.success) {
                        purchaseState.downloadLinks = data.downloadLinks;
                        sessionStorage.setItem("paymentCompleted", "true");
                        sessionStorage.setItem("downloadLinks", JSON.stringify(data.downloadLinks));
                        const downloadContainer = document.getElementById("download-container");
                        renderDownloadSection(downloadContainer, purchaseState.downloadLinks);
                        updateDiscountMessage(document.getElementById("discount-message"), "Payment successful! Click the button below to download.", "green");
                    } else {
                        updateDiscountMessage(document.getElementById("discount-message"), "Payment validation failed: " + data.message, "red");
                    }
                } catch (error) {
                    console.error("Error validating payment:", error);
                    updateDiscountMessage(document.getElementById("discount-message"), "An error occurred while validating your payment.", "red");
                }
            });
        },
        onError: function(err) {
            console.error("PayPal error:", err);
            updateDiscountMessage(document.getElementById("discount-message"), "An error occurred during the payment process.", "red");
        }
    }).render("#purchase-button");
}

// Handle the coupon application
async function handleCouponClick() {
    const couponInput = document.getElementById("coupon");
    const priceDisplay = document.getElementById("price");
    const discountMessage = document.getElementById("discount-message");

    const couponCode = couponInput.value.trim();

    // Store the coupon code in the state for later use
    purchaseState.couponCode = couponCode;

    if (couponCode) {
        // Show a loading message while validating
        updateDiscountMessage(discountMessage, "Validating coupon...", "gray");

        // Validate coupon with the server
        try {
            const response = await fetch('https://download.kasorashibainu.com/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode })
            });
            const data = await response.json();

            if (data.valid) {
                purchaseState.discountedPrice = purchaseState.originalPrice - data.discount;
                updatePriceDisplay(priceDisplay, purchaseState.discountedPrice);
                if (purchaseState.discountedPrice === 0) {
                    updateDiscountMessage(discountMessage, "Coupon applied: Free access granted!", "green");
                } else {
                    updateDiscountMessage(discountMessage, `Coupon applied: -$${data.discount.toFixed(2)}!`, "green");
                }
                // Optional: Mark as used client-side (redundant with server, but kept for offline fallback)
                markCouponAsUsed(couponCode);
            } else {
                purchaseState.discountedPrice = purchaseState.originalPrice;
                updatePriceDisplay(priceDisplay, purchaseState.discountedPrice);
                updateDiscountMessage(discountMessage, data.message || "Invalid coupon code.", "red");
            }
        } catch (error) {
            console.error("Error validating coupon:", error);
            updateDiscountMessage(discountMessage, "Error validating coupon. Try again.", "red");
        }
    } else {
        purchaseState.discountedPrice = purchaseState.originalPrice;
        updatePriceDisplay(priceDisplay, purchaseState.discountedPrice);
        updateDiscountMessage(discountMessage, "No coupon applied.", "black");
    }
}

// Handle proceeding to checkout
async function handleProceedCheckout() {
    const purchaseButtonContainer = document.getElementById("purchase-button");
    
    if (purchaseState.discountedPrice === 0) {
        // Skip payment for $0 and grant access directly
        try {
            const response = await fetch('https://download.kasorashibainu.com/api/free-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode: purchaseState.couponCode })
            });
            const data = await response.json();
            if (data.success) {
                purchaseState.downloadLinks = data.downloadLinks;
                sessionStorage.setItem("paymentCompleted", "true");
                sessionStorage.setItem("downloadLinks", JSON.stringify(data.downloadLinks));
                const downloadContainer = document.getElementById("download-container");
                renderDownloadSection(downloadContainer, purchaseState.downloadLinks);
                updateDiscountMessage(document.getElementById("discount-message"), "Free access granted! Click the button below to download.", "green");
            } else {
                updateDiscountMessage(document.getElementById("discount-message"), "Error granting free access: " + data.message, "red");
            }
        } catch (error) {
            console.error("Error granting free access:", error);
            updateDiscountMessage(document.getElementById("discount-message"), "An error occurred while granting free access.", "red");
        }
    } else {
        renderPayPalButton(purchaseButtonContainer, purchaseState.discountedPrice);
    }
}

// Initialize the Purchase tab
function initializePurchaseTab() {
    const purchaseTab = document.getElementById("purchase");
    if (!purchaseTab) return;

    // Set initial state values
    purchaseState.originalPrice = 50;
    purchaseState.discountedPrice = 50;
    purchaseState.couponCode = null;
    purchaseState.downloadLinks = null;

    const priceDisplay = document.getElementById("price");
    updatePriceDisplay(priceDisplay, purchaseState.discountedPrice);

    // Attach event listener to the Purchase button
    const purchaseBtn = document.getElementById("purchase-btn");
    const couponSection = document.getElementById("coupon-section");
    if (purchaseBtn && couponSection) {
        purchaseBtn.addEventListener("click", () => {
            couponSection.style.display = "block";
            purchaseBtn.style.display = "none";
        });
    }

    // Attach event listener to the Apply Coupon button
    const applyCouponButton = document.getElementById("apply-coupon");
    if (applyCouponButton) {
        applyCouponButton.addEventListener("click", handleCouponClick);
    }

    // Attach event listener to the Proceed to Checkout button
    const proceedCheckoutButton = document.getElementById("proceed-checkout");
    if (proceedCheckoutButton) {
        proceedCheckoutButton.addEventListener("click", handleProceedCheckout);
    }
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePurchaseTab);