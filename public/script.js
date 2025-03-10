document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Script Loaded");

    const songsFolder = "/songs/";
    const imagesFolder = "/images/";
    let audio = new Audio();
    let currentSongIndex = -1;
    let currentSong = null;
    let songList = [];

    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    let isDragging = false;

    const songContainer = document.getElementById("song-container");
    const playbarPlayButton = document.querySelector(".songbuttons img[alt='play']");
    const playbarNextButton = document.querySelector(".songbuttons img[alt='next']");
    const playbarPrevButton = document.querySelector(".songbuttons img[alt='prev']");
    const songInfo = document.querySelector(".songInfo");
    const songTime = document.querySelector(".songTime");

    fetch("/songs")
        .then(response => response.json())
        .then(songs => {
            console.log("🎶 Songs Loaded:", songs);
            songList = songs;
            loadLibraryUI(songs);
        })
        .catch(error => console.error("❌ Error loading songs:", error));

    function loadLibraryUI(songs) {
        songContainer.innerHTML = "";
        songs.forEach((song, index) => {
            const songName = song.replace(/\.[^/.]+$/, "");
            const imagePath = `${imagesFolder}${songName}.jpg`;
            const displayName = songName.split(" - ")[0];

            const card = document.createElement("div");
            card.classList.add("song-card");

            card.innerHTML = `
                <img src="${imagePath}" alt="${songName}" onerror="this.src='/images/default.jpg';">
                <p>${displayName}</p>
                <div class="play-icon" data-index="${index}">
                    <img src="play.svg" alt="play">
                </div>
            `;

            songContainer.appendChild(card);
        });

        document.querySelectorAll(".play-icon").forEach(playBtn => {
            playBtn.addEventListener("click", function () {
                let songIndex = parseInt(this.getAttribute("data-index"));
                playSong(songIndex);
            });
        });
    }

    function playSong(index) {
        if (index < 0 || index >= songList.length) return;

        currentSongIndex = index;
        currentSong = `${songsFolder}${songList[index]}`;
        audio.src = currentSong;
        audio.play();

        songInfo.textContent = songList[index].replace(/\.[^/.]+$/, "");
        updatePlaybarButton(true);
    }

    function togglePlayPause() {
        if (!currentSong) {
            playSong(0);
        } else {
            if (audio.paused) {
                audio.play();
                updatePlaybarButton(true);
            } else {
                audio.pause();
                updatePlaybarButton(false);
            }
        }
    }

    function playNextSong() {
        let nextIndex = (currentSongIndex + 1) % songList.length;
        playSong(nextIndex);
    }

    function playPreviousSong() {
        let prevIndex = (currentSongIndex - 1 + songList.length) % songList.length;
        playSong(prevIndex);
    }

    function updatePlaybarButton(isPlaying) {
        playbarPlayButton.src = isPlaying ? "pause.svg" : "play.svg";
        document.querySelectorAll(".play-icon img").forEach((btn, index) => {
            btn.src = index === currentSongIndex && isPlaying ? "pause.svg" : "play.svg";
        });
    }

    playbarPlayButton.addEventListener("click", togglePlayPause);
    playbarNextButton.addEventListener("click", playNextSong);
    playbarPrevButton.addEventListener("click", playPreviousSong);

    function updateSeekbar() {
        if (!isDragging && audio.duration) {
            let progressPercent = (audio.currentTime / audio.duration) * 100;
            document.querySelector(".progress-bar").style.width = `${progressPercent}%`;
            document.querySelector(".circle").style.transform = `translateX(${progressPercent}%)`;
            let minutes = Math.floor(audio.currentTime / 60);
            let seconds = Math.floor(audio.currentTime % 60);
            songTime.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }
        requestAnimationFrame(updateSeekbar);
    }
    updateSeekbar();

    seekbar.addEventListener("click", (event) => {
        let seekbarRect = seekbar.getBoundingClientRect();
        let clickPosition = event.clientX - seekbarRect.left;
        let newTime = (clickPosition / seekbar.clientWidth) * audio.duration;
        audio.currentTime = newTime;
    });

    function startDrag(event) {
        isDragging = true;
        document.addEventListener("mousemove", handleDrag);
        document.addEventListener("mouseup", stopDrag);
    }

    function handleDrag(event) {
        let seekbarRect = seekbar.getBoundingClientRect();
        let clientX = event.clientX || event.touches[0].clientX;
        let newPosition = clientX - seekbarRect.left;
        if (newPosition < 0) newPosition = 0;
        if (newPosition > seekbar.clientWidth) newPosition = seekbar.clientWidth;
        circle.style.transform = `translateX(${newPosition}px)`;
    }

    function stopDrag(event) {
        isDragging = false;
        let seekbarRect = seekbar.getBoundingClientRect();
        let clientX = event.clientX || event.changedTouches[0].clientX;
        let newPosition = clientX - seekbarRect.left;
        let newTime = (newPosition / seekbar.clientWidth) * audio.duration;
        audio.currentTime = newTime;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    }

    circle.addEventListener("mousedown", startDrag);
});
