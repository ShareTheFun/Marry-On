document.getElementById('searchButton').addEventListener('click', fetchVideoDetails);

function fetchVideoDetails() {
    const urlInput = document.getElementById('ytUrl');
    const videoDetails = document.getElementById('videoDetails');
    const videoTitle = document.getElementById('videoTitle');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoDescription = document.getElementById('videoDesc');
    const errorMessage = document.getElementById('errorMessage');
    const downloadButtons = document.getElementById('downloadButtons');
    const downloadAudio = document.getElementById('downloadAudio');

    const url = urlInput.value.trim();
    errorMessage.style.display = 'none';
    videoDetails.style.display = 'none';

    if (!url) {
        errorMessage.innerText = "Please enter a YouTube URL.";
        errorMessage.style.display = 'block';
        return;
    }

    videoTitle.innerHTML = "Loading...";
    videoPlayer.src = '';
    videoDescription.innerHTML = '';
    downloadButtons.style.display = 'none';

    fetch(`/api/ytdl?link=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                videoTitle.innerHTML = data.data.title;
                videoPlayer.src = data.data.video_hd; // Use HD video
                videoDescription.innerHTML = formatDescription(data.data.desc);
                downloadAudio.href = data.data.audio; // Assuming audio URL is available
                downloadButtons.style.display = 'block';
                videoDetails.style.display = 'block';
                urlInput.value = ''; // Clear search bar
            } else {
                videoTitle.innerHTML = "Error fetching video";
                errorMessage.innerText = "Failed to fetch video data.";
                errorMessage.style.display = 'block';
            }
        })
        .catch(err => {
            console.error(err);
            videoTitle.innerHTML = "Error fetching video";
            errorMessage.innerText = "An error occurred. Please try again.";
            errorMessage.style.display = 'block';
        });
}

function formatDescription(description) {
    // Convert URLs in the description to clickable buttons
    return description.replace(/(https?:\/\/[^\s]+)/g, (url) => {
        const label = new URL(url).hostname.replace('www.', '');
        return `<a href="${url}" class="link" target="_blank">${label}</a>`;
    });
}

function goBack() {
    window.location.href = '/';
}
