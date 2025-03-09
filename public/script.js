document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script Loaded");

    const songsFolder = "/songs/"; // Folder where MP3s are stored
    const imagesFolder = "/images/"; // Folder where images are stored
    let audio = new Audio();
    let currentSong = null; // Track the currently playing song
    let currentButton = null; // Track the currently active button

    fetch("/songs")
        .then(response => response.json())
        .then(songs => {
            console.log("🎶 Songs Loaded:", songs);

            const songContainer = document.getElementById("song-container");
            songContainer.innerHTML = "";

            songs.forEach((song, index) => {
                const songName = song.replace(/\.[^/.]+$/, ""); // Remove file extension
                const imagePath = `${imagesFolder}${songName}.jpg`; // Auto-match image
                const displayName = songName.split(" - ")[0];

                const card = document.createElement("div");
                card.classList.add("song-card");

                card.innerHTML = `
                    <img src="${imagePath}" alt="${songName}" onerror="this.src='/images/default.jpg';">
                    <p>${displayName}</p>
                    <div class="play-icon" data-song="${songsFolder}${song}">
                        <svg class="play-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                            <circle cx="12" cy="12" r="11" fill="#1ed760" />
                            <path d="M10 8L16 12L10 16Z" fill="black"/>
                        </svg>
                    </div>
                `;

                songContainer.appendChild(card);
            });

            // Add event listeners to play buttons
            document.querySelectorAll(".play-icon").forEach(playBtn => {
                playBtn.addEventListener("click", function () {
                    const songPath = this.getAttribute("data-song");
                    togglePlayPause(songPath, this);
                });
            });
        })
        .catch(error => console.error("❌ Error loading songs:", error));

    function togglePlayPause(songSrc, button) {
        const playSvg = button.querySelector(".play-svg");

        if (currentSong !== songSrc) {
            // New song is clicked, play it and update the button
            if (currentButton) updateButtonToPlay(currentButton.querySelector(".play-svg")); // Reset previous button
            audio.src = songSrc;
            audio.play();
            updateButtonToPause(playSvg);
            currentSong = songSrc;
            currentButton = button;
        } else {
            // Same song clicked, toggle play/pause
            if (audio.paused) {
                audio.play();
                updateButtonToPause(playSvg);
            } else {
                audio.pause();
                updateButtonToPlay(playSvg);
            }
        }
    }

    function updateButtonToPause(svgElement) {
        svgElement.innerHTML = `
            <circle cx="12" cy="12" r="11" fill="#1ed760" />
            <rect x="9.5" y="8" width="2" height="8" fill="black"/>
            <rect x="12.5" y="8" width="2" height="8" fill="black"/>
        `;
    }
    

    function updateButtonToPlay(svgElement) {
        svgElement.innerHTML = `
            <circle cx="12" cy="12" r="11" fill="#1ed760" />
            <path d="M10 8L16 12L10 16Z" fill="black"/>
        `;
    }
});

