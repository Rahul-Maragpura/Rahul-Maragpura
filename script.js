
/* =========================================
   RAHUL KUMAR PERSONAL WEBSITE
   Complete JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. AUTOMATIC FOOTER YEAR ---------- */

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  /* ---------- 2. SCROLL REVEAL ANIMATION ---------- */

  const revealElements = document.querySelectorAll(
    ".reveal, .scroll-reveal"
  );

  if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active", "visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach((element) => {
      element.classList.add("active", "visible");
    });

  }


  /* ---------- 3. PHOTO ZOOM VIEWER ---------- */

  const overlay = document.createElement("div");
  overlay.className = "photo-zoom-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Photo viewer");

  overlay.innerHTML = `
    <div class="photo-zoom-controls">

      <button
        type="button"
        class="zoom-out"
        aria-label="Zoom out"
        title="Zoom out"
      >−</button>

      <span class="photo-zoom-level">100%</span>

      <button
        type="button"
        class="zoom-in"
        aria-label="Zoom in"
        title="Zoom in"
      >+</button>

      <button
        type="button"
        class="zoom-reset"
        aria-label="Reset zoom"
        title="Reset zoom"
      >⟲</button>

    </div>

    <button
      type="button"
      class="photo-zoom-close"
      aria-label="Close photo"
      title="Close"
    >×</button>

    <img class="zoom-photo" alt="Enlarged photo">
  `;

  document.body.appendChild(overlay);


  const zoomImage = overlay.querySelector(".zoom-photo");
  const zoomLevel = overlay.querySelector(".photo-zoom-level");
  const zoomInButton = overlay.querySelector(".zoom-in");
  const zoomOutButton = overlay.querySelector(".zoom-out");
  const zoomResetButton = overlay.querySelector(".zoom-reset");
  const closeButton = overlay.querySelector(".photo-zoom-close");

  let scale = 1;
  let currentPhoto = null;
  let previousOverflow = "";


  /* ---------- 4. UPDATE ZOOM LEVEL ---------- */

  function updateZoom() {
    zoomImage.style.transform = `scale(${scale})`;
    zoomLevel.textContent = `${Math.round(scale * 100)}%`;

    zoomImage.style.cursor = scale > 1 ? "grab" : "zoom-in";

    zoomInButton.disabled = scale >= 4;
    zoomOutButton.disabled = scale <= 0.5;

    zoomInButton.style.opacity = scale >= 4 ? "0.5" : "1";
    zoomOutButton.style.opacity = scale <= 0.5 ? "0.5" : "1";
  }


  /* ---------- 5. ZOOM IN / ZOOM OUT ---------- */

  function changeZoom(amount) {
    scale = Math.min(4, Math.max(0.5, scale + amount));
    updateZoom();
  }


  /* ---------- 6. OPEN PHOTO ---------- */

  function openPhoto(photo) {

    const imageSource = photo.currentSrc || photo.src;

    if (!imageSource || !photo.complete || photo.naturalWidth === 0) {
      return;
    }

    currentPhoto = photo;
    zoomImage.src = imageSource;
    zoomImage.alt = photo.alt || "Enlarged photo";

    scale = 1;
    updateZoom();

    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("photo-zoom-open");

    overlay.classList.add("active");
    closeButton.focus();
  }


  /* ---------- 7. CLOSE PHOTO ---------- */

  function closePhoto() {

    overlay.classList.remove("active");

    document.body.style.overflow = previousOverflow;
    document.body.classList.remove("photo-zoom-open");

    zoomImage.removeAttribute("src");

    if (currentPhoto) {
      currentPhoto.focus?.();
    }

    currentPhoto = null;
  }


  /* ---------- 8. MAKE ALL PHOTOS CLICKABLE ---------- */

  function enablePhotoZoom() {

    const allImages = document.querySelectorAll("img");

    allImages.forEach((photo) => {

      if (photo.dataset.zoomReady === "true") {
        return;
      }

      if (photo.closest(".photo-zoom-overlay")) {
        return;
      }

      photo.dataset.zoomReady = "true";
      photo.style.cursor = "zoom-in";

      photo.addEventListener("click", () => {
        openPhoto(photo);
      });

      photo.setAttribute("tabindex", "0");

      photo.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPhoto(photo);
        }
      });

    });

  }

  enablePhotoZoom();


  /* ---------- 9. ZOOM BUTTONS ---------- */

  zoomInButton.addEventListener("click", () => {
    changeZoom(0.25);
  });

  zoomOutButton.addEventListener("click", () => {
    changeZoom(-0.25);
  });

  zoomResetButton.addEventListener("click", () => {
    scale = 1;
    updateZoom();
  });

  closeButton.addEventListener("click", closePhoto);


  /* ---------- 10. CLICK PHOTO TO ZOOM ---------- */

  zoomImage.addEventListener("click", () => {
    changeZoom(0.25);
  });


  /* ---------- 11. CLICK OUTSIDE TO CLOSE ---------- */

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closePhoto();
    }
  });


  /* ---------- 12. MOUSE WHEEL ZOOM ---------- */

  overlay.addEventListener("wheel", (event) => {

    if (!overlay.classList.contains("active")) {
      return;
    }

    event.preventDefault();

    if (event.deltaY < 0) {
      changeZoom(0.15);
    } else {
      changeZoom(-0.15);
    }

  }, { passive: false });


  /* ---------- 13. KEYBOARD CONTROLS ---------- */

  document.addEventListener("keydown", (event) => {

    if (!overlay.classList.contains("active")) {
      return;
    }

    if (event.key === "Escape") {
      closePhoto();
    }

    if (event.key === "+" || event.key === "=") {
      changeZoom(0.25);
    }

    if (event.key === "-") {
      changeZoom(-0.25);
    }

    if (event.key === "0") {
      scale = 1;
      updateZoom();
    }

  });


  /* ---------- 14. SUPPORT IMAGES ADDED LATER.  ---------- */

  const imageObserver = new MutationObserver(() => {
    enablePhotoZoom();
  });

  imageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

});
