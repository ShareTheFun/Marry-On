document.getElementById('searchButton').addEventListener('click', fetchVideoDetails);

function fetchVideoDetails() {
    const urlInput = document.getElementById('ytUrl');
    const videoDetails = document.getElementById('videoDetails');
    const videoTitle = document.getElementById('videoTitle');
    const videoPlayer = document.getElementById('video');
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

    // Clear the search bar
    urlInput.value = '';

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
                downloadAudio.download = `${data.data.title}.mp3`;
                downloadButtons.style.display = 'block';
                videoDetails.style.display = 'block';
                videoPlayer.load();
                videoPlayer.play(); // Autoplay the video
            } else {
                throw new Error(data.message);
            }
        })
        .catch(err => {
            errorMessage.innerText = "An error occurred: " + err;
            errorMessage.style.display = 'block';
        });
}

function formatDescription(desc) {
    return desc
        .replace(/\n/g, '<br>') // Replace newline characters with HTML line breaks
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="link" target="_blank">$1</a>')
        .replace(/(\d{1,2}:\d{2})/g, '<span class="timestamp" onclick="seekToTime(\'$1\')">$1</span>');
}

function seekToTime(time) {
    const video = document.getElementById('video');
    const [minutes, seconds] = time.split(':').map(Number);
    video.currentTime = minutes * 60 + seconds; // Convert time to seconds
    video.play(); // Play video when timestamp is clicked
}
