// Get modal elements
const modal = document.getElementById("emojiModal");
const modalLink = document.querySelector("a[href='Website Assets/PeacockApprovedEmojis.pdf']");
const closeBtn = document.getElementsByClassName("close")[0];
const carouselTrack = document.querySelector(".carousel-track");
const prevButton = document.querySelector(".carousel-btn.prev");
const nextButton = document.querySelector(".carousel-btn.next");

// Image paths array
const imagePaths = [
    "Website Assets/Layer 2@0.25x.jpg",
    "Website Assets/Layer 3@0.25x.jpg",
    "Website Assets/Layer 4@0.25x.jpg",
    "Website Assets/Layer 5@0.25x.jpg",
    "Website Assets/Layer 6@0.25x.jpg",
    "Website Assets/Layer 7@0.25x.jpg",
    "Website Assets/Layer 8@0.25x.jpg",
    "Website Assets/Layer 9@0.25x.jpg",
    "Website Assets/Layer 10@0.25x.jpg",
    "Website Assets/Layer 11@0.25x.jpg"
];

// Load images into carousel
imagePaths.forEach(path => {
    const img = document.createElement("img");
    img.src = path;
    img.alt = "Emoji Reference";
    img.onload = function() {
        // Ensure image is properly sized after loading
        this.style.maxWidth = '100%';
        this.style.maxHeight = '100%';
    };
    carouselTrack.appendChild(img);
});

let currentIndex = 0;

// Event listeners
// Update the modal link event to adjust modal size based on current image plus 10px border
modalLink.addEventListener("click", (e) => {
    e.preventDefault();
    const currentImg = carouselTrack.querySelectorAll("img")[currentIndex];
    if (currentImg && currentImg.complete) {
        modalContent.style.width = (currentImg.naturalWidth + 10) + "px";
        modalContent.style.height = (currentImg.naturalHeight + 10) + "px";
    }
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

nextButton.addEventListener("click", () => {
    if (currentIndex < imagePaths.length - 1) {
        currentIndex++;
        updateCarousel();
    }
});

function updateCarousel() {
    const offset = -currentIndex * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
    
    // Update button states
    prevButton.style.display = currentIndex === 0 ? 'none' : 'flex';
    nextButton.style.display = currentIndex === imagePaths.length - 1 ? 'none' : 'flex';
    
    // Adjust modal size if it is visible
    if (modal.style.display === "block") {
        const currentImg = carouselTrack.querySelectorAll("img")[currentIndex];
        if (currentImg && currentImg.complete) {
            modalContent.style.width = (currentImg.naturalWidth + 10) + "px";
            modalContent.style.height = (currentImg.naturalHeight + 10) + "px";
        }
    }
}

// Initialize carousel
updateCarousel();

// Add window resize handler to maintain proper sizing
window.addEventListener('resize', () => {
    if (modal.style.display === 'block') {
        const images = carouselTrack.querySelectorAll('img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
        });
    }
});

// Add dragging functionality to modal
const modalContent = document.querySelector('.modal-content');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

modalContent.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    if (e.target === modalContent || e.target.parentNode === modalContent) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === modalContent) {
            isDragging = true;
        }
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setModalPosition(currentX, currentY);
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function setModalPosition(xPos, yPos) {
    modalContent.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

// Reset position when modal is closed
closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
    xOffset = 0;
    yOffset = 0;
    setModalPosition(0, 0);
});

// Add resize handles to modal
const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(position => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${position}`;
    modalContent.appendChild(handle);
    return handle;
});

let isResizing = false;
let currentHandle = null;
let originalWidth;
let originalHeight;
let originalX;
let originalY;

resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', startResize);
});

function startResize(e) {
    isResizing = true;
    currentHandle = e.target;
    originalWidth = modalContent.offsetWidth;
    originalHeight = modalContent.offsetHeight;
    originalX = e.clientX;
    originalY = e.clientY;
    e.stopPropagation(); // Prevent drag event from firing
}

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - originalX;
    const deltaY = e.clientY - originalY;
    const isLeft = currentHandle.classList.contains('left');
    const isTop = currentHandle.classList.contains('top');

    let newWidth = isLeft ? originalWidth - deltaX : originalWidth + deltaX;
    let newHeight = isTop ? originalHeight - deltaY : originalHeight + deltaY;

    // Enforce minimum size
    newWidth = Math.max(300, newWidth);
    newHeight = Math.max(200, newHeight);

    modalContent.style.width = newWidth + 'px';
    modalContent.style.height = newHeight + 'px';

    // Update the carousel and images to fit the new size
    const images = carouselTrack.querySelectorAll('img');
    images.forEach(img => {
        img.style.maxHeight = (newHeight - 80) + 'px'; // Account for padding
    });
});

document.addEventListener('mouseup', () => {
    isResizing = false;
    currentHandle = null;
});

// Prevent text selection during resize
resizeHandles.forEach(handle => {
    handle.addEventListener('dragstart', (e) => e.preventDefault());
});