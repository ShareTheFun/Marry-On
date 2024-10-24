document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchButton');
  const urlInput = document.getElementById('ytUrl');
  const videoDetails = document.getElementById('videoDetails');
  const videoTitle = document.getElementById('videoTitle');
  const videoPlayer = document.getElementById('video');
  const videoDescription = document.getElementById('videoDesc');
  const errorMessage = document.getElementById('errorMessage');
  const downloadButtons = document.getElementById('downloadButtons');
  const downloadAudio = document.getElementById('downloadAudio');

  searchButton.addEventListener('click', fetchVideoDetails);

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