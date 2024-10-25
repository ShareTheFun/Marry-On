document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    const introTexts = document.querySelectorAll('.intro-text');
    const searchButton = document.getElementById('searchButton');
    const urlInput = document.getElementById('ytUrl');
    const videoDetails = document.getElementById('videoDetails');
    const videoTitle = document.getElementById('videoTitle');
    const videoPlayer = document.getElementById('video');
    const videoDescription = document.getElementById('videoDesc');
    const errorMessage = document.getElementById('errorMessage');
    const downloadButtons = document.getElementById('downloadButtons');
    const downloadAudio = document.getElementById('downloadAudio');
    const fullViewControls = document.getElementById('fullViewControls');
    const brightnessControl = document.getElementById('brightnessControl');
    const volumeControl = document.getElementById('volumeControl');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const currentTime = document.getElementById('currentTime');
    const currentDuration = document.getElementById('currentDuration');
    const totalDuration = document.getElementById('totalDuration');

    // Intro animation
    function playIntro() {
        intro.style.display = 'flex';
        introTexts.forEach((text, index) => {
            setTimeout(() => {
                text.classList.add('fade-in');
            }, index * 500);
        });

        setTimeout(() => {
            intro.classList.add('fade-out');
            setTimeout(() => {
                intro.style.display = 'none';
            }, 1000);
        }, 3000);
    }

    // Check if it's the first visit or a refresh
    if (!sessionStorage.getItem('introPlayed')) {
        playIntro();
        sessionStorage.setItem('introPlayed', 'true');
    } else {
        intro.style.display = 'none';
    }

    urlInput.addEventListener('input', validateInput);
    searchButton.addEventListener('click', fetchVideoDetails);

    function validateInput() {
        const url = urlInput.value.trim();
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

        if (url === '') {
            urlInput.classList.remove('valid', 'invalid');
            searchButton.disabled = true;
            searchButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            searchButton.classList.add('bg-gray-500', 'cursor-not-allowed');
        } else if (youtubeRegex.test(url)) {
            urlInput.classList.add('valid');
            urlInput.classList.remove('invalid');
            searchButton.disabled = false;
            searchButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
            searchButton.classList.remove('bg-gray-500', 'cursor-not-allowed');
        } else {
            urlInput.classList.add('invalid');
            urlInput.classList.remove('valid');
            searchButton.disabled = true;
            searchButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            searchButton.classList.add('bg-gray-500', 'cursor-not-allowed');
            showError("Only YouTube links are valid!");
        }
    }

    async function fetchVideoDetails() {
        const url = urlInput.value.trim();
        errorMessage.style.display = 'none';
        videoDetails.style.display = 'none';

        if (!url) {
            showError("Please enter a YouTube URL.");
            return;
        }

        urlInput.value = '';
        videoTitle.innerHTML = "Loading...";
        videoPlayer.src = '';
        videoDescription.innerHTML = '';
        downloadButtons.style.display = 'none';

        showLoading();

        try {
            const response = await fetch(`/api/ytdl?link=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.status) {
                displayVideoDetails(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            showError("An error occurred: " + err.message);
        } finally {
            hideLoading();
        }
    }

    function displayVideoDetails(data) {
        videoTitle.innerHTML = data.title;
        videoPlayer.src = data.video_hd;
        videoDescription.innerHTML = formatDescription(data.desc);
        downloadAudio.href = data.audio;
        downloadAudio.download = `${data.title}.mp3`;
        downloadButtons.style.display = 'flex';
        videoDetails.style.display = 'block';
        videoPlayer.load();
        videoPlayer.play();
    }

    function showError(message) {
        errorMessage.innerText = message;
        errorMessage.style.display = 'block';
    }

    function formatDescription(desc) {
        return desc
            .replace(/\n/g, '<br>')
            .replace(/((https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:\/?#[\]@!$&'()*+,;=]*)?)/g, '<a href="$1" class="link" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/(\d{1,2}:\d{2})/g, '<span class="timestamp" onclick="seekToTime(\'$1\')">$1</span>')
            .replace(/#(\w+)/g, '<a href="https://www.youtube.com/hashtag/$1" class="hashtag" target="_blank" rel="noopener noreferrer">#$1</a>');
    }

    // Full View Controls
    videoPlayer.addEventListener('play', updateFullViewControls);
    videoPlayer.addEventListener('pause', updateFullViewControls);
    videoPlayer.addEventListener('timeupdate', updateFullViewControls);
    videoPlayer.addEventListener('loadedmetadata', () => {
        totalDuration.textContent = formatTime(videoPlayer.duration);
    });

    brightnessControl.addEventListener('input', () => {
        videoPlayer.style.filter = `brightness(${brightnessControl.value}%)`;
    });

    volumeControl.addEventListener('input', () => {
        videoPlayer.volume = volumeControl.value / 100;
    });

    playPauseBtn.addEventListener('click', () => {
        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            videoPlayer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    function updateFullViewControls() {
        currentTime.textContent = formatTime(videoPlayer.currentTime);
        currentDuration.textContent = formatTime(videoPlayer.currentTime);
        playPauseBtn.innerHTML = videoPlayer.paused ? 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
});

function seekToTime(time) {
    const video = document.getElementById('video');
    const [minutes, seconds] = time.split(':').map(Number);
    video.currentTime = minutes * 60 + seconds;
    video.play();
}

function showLoading() {
    document.getElementById('loadingAnimation').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingAnimation').classList.add('hidden');
}