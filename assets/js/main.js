/*
  Michael Mejia Website
  Shared JavaScript
  Handles:
  - sticky header state
  - mobile menu
  - homepage featured work rendering
  - category gallery rendering
  - lightbox
*/

(function () {
  var body = document.body;
  var header = document.getElementById("site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var featuredGrid = document.getElementById("featured-grid");
  var galleryGrid = document.getElementById("gallery-grid");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxCount = document.getElementById("lightbox-count");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");

  var pageName = body ? body.getAttribute("data-page") : "";
  var currentGalleryItems = [];
  var currentLightboxIndex = 0;
  var lastFocusedElement = null;

  function onScroll() {
    if (!header) {
      return;
    }

    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function setMenuState(isOpen) {
    if (!navToggle || !mobileMenu) {
      return;
    }

    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.hidden = !isOpen;
    body.classList.toggle("menu-open", isOpen);
  }

  function setupMobileMenu() {
    if (!navToggle || !mobileMenu) {
      return;
    }

    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    mobileMenu.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.tagName === "A") {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) {
        setMenuState(false);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getGalleryKey() {
    if (pageName === "curated-reality") {
      return "curatedReality";
    }

    return pageName;
  }

  function buildImagePath(folder, src) {
    return "assets/images/" + folder + "/" + src;
  }

  function renderFeaturedWork() {
    if (!featuredGrid || typeof GALLERY === "undefined" || !GALLERY.featured) {
      return;
    }

    var items = GALLERY.featured;
    var html = "";

    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      var folder = item.folder || "featured";
      var href = folder === "curated-reality" ? "curated-reality.html" : folder + ".html";

      html +=
        '<a class="featured-card" href="' + escapeHtml(href) + '">' +
          '<img src="' + escapeHtml(buildImagePath(folder, item.src)) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy">' +
        "</a>";
    }

    featuredGrid.innerHTML = html;
  }

  function getGalleryLayoutClass(index) {
    var pattern = ["is-standard", "is-standard", "is-wide", "is-standard", "is-square", "is-standard"];
    return pattern[index % pattern.length];
  }

  function renderCategoryGallery() {
    if (!galleryGrid || typeof GALLERY === "undefined") {
      return;
    }

    var key = getGalleryKey();
    var items = GALLERY[key];

    if (!items || !items.length) {
      galleryGrid.innerHTML =
        '<div class="gallery-empty">' +
          "<p>ADD IMAGE HERE: Update <strong>assets/js/gallery-data.js</strong> and add files to the matching image folder.</p>" +
        "</div>";
      return;
    }

    currentGalleryItems = items.slice();

    var folderName = pageName === "curated-reality" ? "curated-reality" : pageName;
    var html = "";

    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      var layoutClass = getGalleryLayoutClass(i);
      var caption = item.caption ? item.caption : item.alt;
      var imagePath = buildImagePath(folderName, item.src);

      html +=
        '<article class="gallery-item ' + layoutClass + '">' +
          '<button class="gallery-button" type="button" data-index="' + i + '">' +
            '<div class="gallery-frame">' +
              '<img src="' + escapeHtml(imagePath) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy">' +
            "</div>" +
            '<div class="gallery-caption">' +
              "<p>" + escapeHtml(caption) + "</p>" +
              '<p class="gallery-index">' + String(i + 1).padStart(2, "0") + "</p>" +
            "</div>" +
          "</button>" +
        "</article>";
    }

    galleryGrid.innerHTML = html;

    var buttons = galleryGrid.querySelectorAll(".gallery-button");
    for (var j = 0; j < buttons.length; j += 1) {
      buttons[j].addEventListener("click", function () {
        var index = Number(this.getAttribute("data-index"));
        openLightbox(index);
      });
    }
  }

  function updateLightbox() {
    if (!lightbox || !lightboxImage || !currentGalleryItems.length) {
      return;
    }

    var item = currentGalleryItems[currentLightboxIndex];
    var folderName = pageName === "curated-reality" ? "curated-reality" : pageName;
    var imagePath = buildImagePath(folderName, item.src);
    var captionText = item.caption ? item.caption : item.alt;

    lightboxImage.src = imagePath;
    lightboxImage.alt = item.alt || "";
    lightboxCaption.textContent = captionText || "";
    lightboxCount.textContent = (currentLightboxIndex + 1) + " / " + currentGalleryItems.length;
  }

  function openLightbox(index) {
    if (!lightbox || !currentGalleryItems.length) {
      return;
    }

    currentLightboxIndex = index;
    lastFocusedElement = document.activeElement;
    updateLightbox();
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("menu-open");

    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function showPrevImage() {
    if (!currentGalleryItems.length) {
      return;
    }

    currentLightboxIndex =
      (currentLightboxIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    updateLightbox();
  }

  function showNextImage() {
    if (!currentGalleryItems.length) {
      return;
    }

    currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryItems.length;
    updateLightbox();
  }

  function setupLightbox() {
    if (!lightbox) {
      return;
    }

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", showPrevImage);
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", showNextImage);
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      var lightboxOpen = lightbox.hidden === false;

      if (event.key === "Escape") {
        if (lightboxOpen) {
          closeLightbox();
        } else if (navToggle && navToggle.getAttribute("aria-expanded") === "true") {
          setMenuState(false);
        }
      }

      if (!lightboxOpen) {
        return;
      }

      if (event.key === "ArrowLeft") {
        showPrevImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    });
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  setupMobileMenu();
  renderFeaturedWork();
  renderCategoryGallery();
  setupLightbox();
})();
