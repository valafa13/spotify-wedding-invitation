document.addEventListener("DOMContentLoaded", function () {
  // =========================================================
  // ==== SCROLL REVEAL ANIMATION ====
  // =========================================================
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // =========================================================
  // ==== FUNGSI UNTUK NAVIGASI SINGLE-PAGE (SPA) === =
  // =========================================================
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section");

  // --- Fungsi Update Otomatis saat di-scroll ---
  const changeActiveLinkOnScroll = () => {
    let currentSectionId = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (pageYOffset >= sectionTop - 90) {
        // Memberi sedikit tambahan offset
        currentSectionId = section.getAttribute("id");
      }
    });

    // --- Logika Baru untuk Mengelompokkan Seksi ---
    let activeHref = "";
    // Jika seksi saat ini adalah salah satu dari grup 'Beranda'
    if (
      currentSectionId === "beranda" ||
      currentSectionId === "episode-feature" ||
      currentSectionId === "the-couple"
    ) {
      activeHref = "#beranda";
    } else {
      // Jika tidak, gunakan ID seksi itu sendiri
      activeHref = "#" + currentSectionId;
    }

    // Terapkan kelas 'active' ke link yang tepat
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === activeHref) {
        link.classList.add("active");
      }
    });
  };

  // --- Fungsi Smooth Scroll saat menu di-klik ---
  const handleLinkClick = (e) => {
    e.preventDefault();
    navLinks.forEach((nav) => nav.classList.remove("active"));
    e.currentTarget.classList.add("active");
    const targetId = e.currentTarget.getAttribute("href");
    const targetSection = document.querySelector(targetId);
    window.scrollTo({
      top: targetSection.offsetTop - 80,
      behavior: "smooth",
    });
  };

  // Jalankan kedua fungsi
  window.addEventListener("scroll", changeActiveLinkOnScroll);
  navLinks.forEach((link) => {
    link.addEventListener("click", handleLinkClick);
  });

  // =========================================================
  // ==== FUNGSI-FUNGSI LAINNYA === =
  // =========================================================

  // --- FUNGSI TAB ACARA ---
  const eventTabsContainer = document.querySelector(".event-tabs");
  if (eventTabsContainer) {
    eventTabsContainer.addEventListener("click", function (e) {
      const clickedButton = e.target.closest(".tab-button");
      if (!clickedButton) return;
      document
        .querySelectorAll(".tab-button")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".event-tab-content")
        .forEach((c) => c.classList.remove("active"));
      clickedButton.classList.add("active");
      document
        .querySelector(clickedButton.dataset.target)
        .classList.add("active");
    });
  }

  // --- FUNGSI RSVP FORM ---
  const rsvpForm = document.getElementById("rsvp-form");

  // Get URL parameters once at the start and use throughout the code
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get("to") || "Guest";

  // Format name function to ensure consistency
  const formatName = (name) => {
    return name
      .split(/[\s+]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (rsvpForm) {
    const nameInput = document.getElementById("nama");
    const formattedName = formatName(guestName);
    if (nameInput) {
      nameInput.value = formattedName;
      nameInput.setAttribute("readonly", true);
    }

    const successNotification = document.getElementById("success-notification");
    const rsvpStatus = document.getElementById("rsvp-status");
    const rsvpStatusText = document.getElementById("rsvp-status-text");
    const rsvpChangeBtn = document.getElementById("rsvp-change-btn");
    const rsvpSubmitBtn = document.getElementById("rsvp-submit-btn");
    const rsvpKey = "rsvp_" + formattedName;

    // Check if already confirmed
    const savedRsvp = localStorage.getItem(rsvpKey);
    if (savedRsvp) {
      const rsvpData = JSON.parse(savedRsvp);
      rsvpForm.style.display = "none";
      rsvpStatus.style.display = "block";
      rsvpStatusText.textContent = "You have confirmed: " + rsvpData.kehadiran;
    }

    // Change RSVP button
    if (rsvpChangeBtn) {
      rsvpChangeBtn.addEventListener("click", function () {
        rsvpForm.style.display = "";
        rsvpStatus.style.display = "none";
        nameInput.value = formattedName;
        rsvpSubmitBtn.textContent = "Update Confirmation";
      });
    }

    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const scriptUrl = SCRIPT_URL;

      const nama = document.getElementById("nama").value;
      const kehadiran = document.querySelector('input[name="entry.87654321"]:checked');
      const catatan = document.getElementById("catatan").value;

      if (!kehadiran) {
        alert("Silakan pilih konfirmasi kehadiran.");
        return;
      }

      const payload = {
        type: "rsvp",
        nama: nama,
        kehadiran: kehadiran.value,
        catatan: catatan,
      };

      // Save to localStorage
      localStorage.setItem(rsvpKey, JSON.stringify(payload));

      // Show success immediately (optimistic UI)
      successNotification.style.display = "block";
      rsvpForm.style.display = "none";
      setTimeout(() => {
        successNotification.style.display = "none";
        rsvpStatus.style.display = "block";
        rsvpStatusText.textContent = "You have confirmed: " + kehadiran.value;
      }, 3000);

      // Send data in background
      fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error("Error!", error.message);
      });
    });
  }

  // =========================================================
  // ==== GUEST BOOK FUNCTIONALITY ===
  // =========================================================
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxK13sIqNJNNE2uVWdUnEBa1dcgEu6NvKBv_1aLXOTfulCEhtwEr-p_VZU-Eetc0xY1PA/exec";

  const guestBookForm = document.getElementById("guest-book-form");
  const guestBookList = document.getElementById("guest-book-list");
  const guestMessageTextarea = document.getElementById("guest-message");
  const charCountSpan = document.getElementById("char-count");
  const commentCountSpan = document.getElementById("comment-count");
  const guestInitialSpan = document.getElementById("guest-initial");

  // Set initial from guest name
  if (guestInitialSpan && guestName) {
    const initial = formatName(guestName).charAt(0).toUpperCase();
    guestInitialSpan.textContent = initial;
  }

  // Avatar color based on name (consistent per person)
  function getAvatarColor(name) {
    const colors = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Time ago helper
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " min ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hours ago";
    const days = Math.floor(hours / 24);
    if (days < 30) return days + " days ago";
    const months = Math.floor(days / 30);
    return months + " months ago";
  }

  // Render a single comment element
  function createCommentElement(nama, message, timestamp) {
    const item = document.createElement("div");
    item.className = "guest-wish-item";
    const initial = nama.charAt(0).toUpperCase();
    const color = getAvatarColor(nama);
    const time = timestamp ? timeAgo(timestamp) : "Just now";

    item.innerHTML = `
      <div class="guest-wish-header">
        <div class="guest-avatar-comment" style="background: ${color}">
          <span>${initial}</span>
        </div>
        <div class="guest-wish-info">
          <p class="guest-wish-name">${escapeHtml(nama)}</p>
          <p class="guest-wish-time">${time}</p>
        </div>
      </div>
      <p class="guest-wish-message">${escapeHtml(message)}</p>
    `;
    return item;
  }

  // Load comments from Google Sheet
  function loadComments() {
    fetch(SCRIPT_URL)
      .then((res) => res.json())
      .then((comments) => {
        guestBookList.innerHTML = "";
        if (commentCountSpan) commentCountSpan.textContent = comments.length;

        // Show newest first
        comments.reverse().forEach((c) => {
          const el = createCommentElement(c.nama, c.message, c.timestamp);
          guestBookList.appendChild(el);
        });
      })
      .catch((err) => {
        console.error("Failed to load comments:", err);
        guestBookList.innerHTML = '<p style="text-align:center; color:#b3b3b3;">Failed to load comments</p>';
      });
  }

  // Load comments on page load
  loadComments();

  // Character counter
  if (guestMessageTextarea && charCountSpan) {
    guestMessageTextarea.addEventListener("input", function () {
      const length = this.value.length;
      charCountSpan.textContent = length;
      if (length > 500) {
        this.value = this.value.substring(0, 500);
        charCountSpan.textContent = 500;
      }
    });
  }

  if (guestBookForm) {
    guestBookForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const guestMessage = document.getElementById("guest-message").value.trim();
      const formattedGuestName = formatName(guestName);

      if (guestMessage) {
        const payload = {
          type: "comment",
          nama: formattedGuestName,
          message: guestMessage,
        };

        // Optimistic UI: show comment immediately
        const newComment = createCommentElement(formattedGuestName, guestMessage, null);
        newComment.style.animation = "fadeInUp 0.5s ease-out";
        guestBookList.insertBefore(newComment, guestBookList.firstChild);

        if (commentCountSpan) {
          const currentCount = parseInt(commentCountSpan.textContent) || 0;
          commentCountSpan.textContent = currentCount + 1;
        }

        // Reset form
        guestBookForm.reset();
        if (charCountSpan) charCountSpan.textContent = "0";
        showNotification("Thank you for your comment! \u2764\ufe0f");

        // Send to Google Sheet in background
        fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch((err) => console.error("Error sending comment:", err));
      }
    });
  }
  const weddingDate = new Date("Apr 11, 2026 09:00:00").getTime();
  const countdownStartDate = new Date("Jan 01, 2026 00:00:00").getTime();
  const totalDuration = weddingDate - countdownStartDate;
  const progressBar = document.querySelector(".progress-bar");
  const secondsSpan = document.getElementById("seconds");

  if (document.getElementById("days")) {
    // Pastikan elemen countdown ada
    const countdownFunction = setInterval(function () {
      const now = new Date().getTime();
      const distance = weddingDate - now;
      if (distance < 0) {
        clearInterval(countdownFunction);
        if (document.querySelector(".countdown-container")) {
          document.querySelector(".countdown-container").innerHTML =
            "<p style='font-size: 1rem; color: var(--spotify-green);'>The Wedding has Started!</p>";
        }
        return;
      }
      const elapsedDuration = now - countdownStartDate;
      let progressPercentage = (elapsedDuration / totalDuration) * 100;
      if (progressBar)
        progressBar.style.width = Math.min(100, progressPercentage) + "%";

      document.getElementById("days").innerText = Math.floor(
        distance / (1000 * 60 * 60 * 24),
      )
        .toString()
        .padStart(2, "0");
      document.getElementById("hours").innerText = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
        .toString()
        .padStart(2, "0");
      document.getElementById("minutes").innerText = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60),
      )
        .toString()
        .padStart(2, "0");
      secondsSpan.innerText = Math.floor((distance % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, "0");
      secondsSpan.classList.add("tick-animation");
      setTimeout(() => {
        secondsSpan.classList.remove("tick-animation");
      }, 200);
    }, 1000);
  }

  // --- FUNGSI AUDIO PLAYER ---
  const episodePlayBtn = document.getElementById("episode-play-btn");
  const weddingSong = document.getElementById("wedding-song");

  if (episodePlayBtn && weddingSong) {
    const episodePlayIcon = document.getElementById("episode-play-icon");
    const previewBtn = document.querySelector(".preview-button");

    const togglePlay = () => {
      if (weddingSong.paused) {
        weddingSong.play();
        episodePlayIcon.classList.replace("fa-play", "fa-pause");
      } else {
        weddingSong.pause();
        episodePlayIcon.classList.replace("fa-pause", "fa-play");
      }
    };

    // Check for autoplay parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autoplay") === "true") {
      // Create a user interaction promise
      const userInteractionPromise = new Promise((resolve) => {
        document.addEventListener("click", resolve, { once: true });
        document.addEventListener("touchstart", resolve, { once: true });
      });

      // Try to autoplay after user interaction
      userInteractionPromise.then(() => {
        weddingSong
          .play()
          .then(() => {
            episodePlayIcon.classList.replace("fa-play", "fa-pause");
          })
          .catch((error) => {
            console.log("Autoplay failed:", error);
          });
      });
    }

    episodePlayBtn.addEventListener("click", togglePlay);
    if (previewBtn) previewBtn.addEventListener("click", togglePlay);
  }

  // Gift Tab Switching
  const giftTabs = document.querySelectorAll(".gift-tab");
  const giftTabContents = document.querySelectorAll(".gift-tab-content");

  giftTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      giftTabs.forEach((t) => t.classList.remove("active"));
      giftTabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById("gift-" + tab.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  // Copy Gift Button (rekening & alamat)
  const weddingGiftSection = document.getElementById("wedding-gift");

  if (weddingGiftSection) {
    weddingGiftSection.addEventListener("click", function (e) {
      const button = e.target.closest(".copy-gift-button");
      if (!button) return;

      const targetId = button.dataset.copyTarget;
      const textToCopy = document.getElementById(targetId).innerText;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const originalText = button.innerText;
          button.innerText = "✓ Tersalin!";
          button.style.backgroundColor = "#1db954";
          button.style.transform = "scale(1.1)";

          setTimeout(() => {
            button.innerText = originalText;
            button.style.backgroundColor = "";
            button.style.transform = "";
          }, 2000);
        })
        .catch((err) => {
          console.error("Gagal menyalin: ", err);
          alert("Gagal menyalin.");
        });
    });
  }
  // =========================================================
  // ==== FUNGSI BARU UNTUK GALERI INTERAKTIF (SWIPE & NAV) ====
  // =========================================================
  const modal = document.getElementById("image-modal");

  if (modal) {
    const modalImg = document.getElementById("modal-img");
    const galleryImages = document.querySelectorAll(".gallery-img img");
    const imagesArray = Array.from(galleryImages); // Ubah NodeList ke Array
    const closeModalBtn = document.querySelector(".close-modal-btn");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    let currentIndex = 0;

    // --- Fungsi untuk menampilkan gambar berdasarkan index ---
    function showImage(index) {
      if (index >= imagesArray.length) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = imagesArray.length - 1;
      } else {
        currentIndex = index;
      }
      modalImg.src = imagesArray[currentIndex].src;
    }

    // --- Event listener untuk setiap gambar di galeri ---
    imagesArray.forEach((img, index) => {
      img.addEventListener("click", function () {
        modal.style.display = "flex";
        showImage(index);
      });
    });

    // --- Fungsi Navigasi ---
    const showNextImage = () => showImage(currentIndex + 1);
    const showPrevImage = () => showImage(currentIndex - 1);
    const closeModal = () => (modal.style.display = "none");

    // --- Event Listener untuk Tombol ---
    nextBtn.addEventListener("click", showNextImage);
    prevBtn.addEventListener("click", showPrevImage);
    closeModalBtn.addEventListener("click", closeModal);

    // --- Navigasi dengan Keyboard (Arrow Keys & Escape) ---
    document.addEventListener("keydown", function (e) {
      if (modal.style.display === "flex") {
        if (e.key === "ArrowRight") {
          showNextImage();
        } else if (e.key === "ArrowLeft") {
          showPrevImage();
        } else if (e.key === "Escape") {
          closeModal();
        }
      }
    });

    // --- Logika untuk SWIPE di Layar Sentuh ---
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true },
    );

    modal.addEventListener("touchend", function (event) {
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      // Swipe ke kiri (untuk gambar selanjutnya)
      if (touchEndX < touchStartX - 50) {
        // 50px adalah ambang batas swipe
        showNextImage();
      }
      // Swipe ke kanan (untuk gambar sebelumnya)
      if (touchEndX > touchStartX + 50) {
        showPrevImage();
      }
    }
  }
});

// =========================================================
// ==== FUNGSI UNTUK COUPLE MODAL DETAIL ====
// =========================================================

const coupleData = {
  bride: {
    name: "Al Fathya Khaerunnisa",
    role: "The Bride",
    image: "assets/cw.JPG",
    about:
      "Transforming from Miss to Mrs., savouring each precious second along the way.",
    parents: "The first daughter of Mr. Haerudin and Mrs. Yuniati",
  },
  groom: {
    name: "Nauval Firmansyah",
    role: "The Groom",
    image: "assets/cp.JPG",
    about:
      "Growing from Mr. to Husband, cherishing every moment of the journey together.",
    parents: "The second son of Mr. Heriyansyah Fitri and Mrs. Ilah Arillah",
  },
};

const coupleModal = document.getElementById("couple-modal");
const coupleClickables = document.querySelectorAll(".couple-clickable");
const coupleModalClose = document.querySelector(".couple-modal-close");

// Open modal when clicking couple item
coupleClickables.forEach((item) => {
  item.addEventListener("click", function () {
    const coupleType = this.getAttribute("data-couple");
    const data = coupleData[coupleType];

    // Set modal content
    document.getElementById("couple-hero-img").src = data.image;
    document.getElementById("couple-hero-name").textContent = data.name;
    document.getElementById("couple-hero-role").textContent = data.role;
    document.getElementById("couple-detail-about").textContent = data.about;
    document.getElementById("couple-detail-parents").textContent = data.parents;

    // Push state so back button closes modal instead of navigating away
    history.pushState({ coupleModalOpen: true }, "");

    // Show modal
    coupleModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });
});

// Helper to close couple modal
function closeCoupleModal() {
  coupleModal.classList.remove("show");
  document.body.style.overflow = "";
}

// Close modal with X button
coupleModalClose.addEventListener("click", function () {
  closeCoupleModal();
  // Go back to remove the pushed state
  if (history.state && history.state.coupleModalOpen) {
    history.back();
  }
});

// Close modal when clicking outside
coupleModal.addEventListener("click", function (e) {
  if (e.target === coupleModal) {
    closeCoupleModal();
    if (history.state && history.state.coupleModalOpen) {
      history.back();
    }
  }
});

// Handle browser back button to close modal
window.addEventListener("popstate", function (e) {
  if (coupleModal.classList.contains("show")) {
    closeCoupleModal();
  }
});

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Show notification helper
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "guest-book-notification";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #1DB954, #1ed760);
    color: #000;
    padding: 12px 24px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 1000;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
