document.addEventListener("DOMContentLoaded", function () {
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
      .split("+")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (rsvpForm) {
    const nameInput = document.getElementById("nama");
    if (nameInput) {
      const formattedName = formatName(guestName);
      nameInput.value = formattedName;
      nameInput.setAttribute("readonly", true);

      const formData = new FormData(rsvpForm);
      formData.set("entry.12345678", formattedName);
    }

    const successNotification = document.getElementById("success-notification");
    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const googleFormUrl =
        "https://docs.google.com/forms/u/0/d/e/1FAIpQLSc.../formResponse";
      const formData = new FormData(rsvpForm);
      fetch(googleFormUrl, { method: "POST", mode: "no-cors", body: formData })
        .then(() => {
          successNotification.style.display = "block";
          rsvpForm.reset();
          setTimeout(() => {
            successNotification.style.display = "none";
          }, 3000);
        })
        .catch((error) => {
          console.error("Error!", error.message);
          alert("Maaf, terjadi kesalahan saat mengirim konfirmasi.");
        });
    });
  }

  // --- FUNGSI COUNTDOWN & PROGRESS BAR ---
  const weddingDate = new Date("Jun 09, 2025 12:00:00").getTime();
  const countdownStartDate = new Date("Jun 8, 2025 00:00:00").getTime();
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
        distance / (1000 * 60 * 60 * 24)
      )
        .toString()
        .padStart(2, "0");
      document.getElementById("hours").innerText = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
        .toString()
        .padStart(2, "0");
      document.getElementById("minutes").innerText = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
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

  const giftList = document.getElementById("gift-list");

  // Cek jika elemen #gift-list ada di halaman saat ini
  if (giftList) {
    giftList.addEventListener("click", function (e) {
      // Hanya jalankan jika yang diklik adalah tombol dengan kelas .copy-gift-button
      if (e.target && e.target.classList.contains("copy-gift-button")) {
        const button = e.target;
        const targetId = button.dataset.copyTarget;
        const textToCopy = document.getElementById(targetId).innerText;

        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            // Beri feedback visual setelah berhasil menyalin
            const originalText = button.innerText;
            button.innerText = "Tersalin!";
            button.style.backgroundColor = "#4CAF50"; // Ubah warna jadi hijau tua

            setTimeout(() => {
              button.innerText = originalText;
              button.style.backgroundColor = "var(--spotify-green)"; // Kembalikan warna
            }, 2000); // Kembalikan teks dan warna setelah 2 detik
          })
          .catch((err) => {
            console.error("Gagal menyalin: ", err);
            alert("Gagal menyalin nomor.");
          });
      }
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
      { passive: true }
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
    image: "assets/cw.jpg",
    about: "A beautiful soul with a heart full of love and kindness. Fathya brings joy and warmth to everyone around her.",
    parents: "Putri pertama dari Bapak Haerudin & Ibu Yuniati"
  },
  groom: {
    name: "Nauval Firmansyah",
    role: "The Groom",
    image: "assets/cp.jpg",
    about: "A caring and loving person who always puts his family first. Nauval is known for his dedication and warm personality.",
    parents: "Putra kedua dari Bapak Heriyansyah Fitri & Ibu Ilah Arillah"
  }
};

const coupleModal = document.getElementById("couple-modal");
const coupleClickables = document.querySelectorAll(".couple-clickable");
const coupleModalClose = document.querySelector(".couple-modal-close");

// Open modal when clicking couple item
coupleClickables.forEach(item => {
  item.addEventListener("click", function() {
    const coupleType = this.getAttribute("data-couple");
    const data = coupleData[coupleType];
    
    // Set modal content
    document.getElementById("couple-hero-img").src = data.image;
    document.getElementById("couple-hero-name").textContent = data.name;
    document.getElementById("couple-hero-role").textContent = data.role;
    document.getElementById("couple-detail-about").textContent = data.about;
    document.getElementById("couple-detail-parents").textContent = data.parents;
    
    // Show modal
    coupleModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });
});

// Close modal
coupleModalClose.addEventListener("click", function() {
  coupleModal.classList.remove("show");
  document.body.style.overflow = "";
});

// Close modal when clicking outside
coupleModal.addEventListener("click", function(e) {
  if (e.target === coupleModal) {
    coupleModal.classList.remove("show");
    document.body.style.overflow = "";
  }
});
