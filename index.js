const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Function to serve files
const serveFile = (filePath, res) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            const extname = String(path.extname(filePath)).toLowerCase();
            let contentType = 'text/html';
            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data, 'utf-8');
        }
    });
};

// Create server
const server = http.createServer((req, res) => {
    console.log(`Request for: ${req.url}`);

    // Serve static files from the public directory
    if (req.url === '/') {
        serveFile(path.join(__dirname, 'public', 'docs.html'), res);
    } else if (req.url.startsWith('/public/')) {
        serveFile(path.join(__dirname, req.url), res);
    } else if (req.url.startsWith('/api/ytdl')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const link = url.searchParams.get('link');
        if (link) {
            fetch(`https://luffy-api-v3.onrender.com/api/ytdl?link=${encodeURIComponent(link)}`)
                .then(apiRes => apiRes.json())
                .then(data => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                })
                .catch(err => {
                    console.error(err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error fetching data from API');
                });
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request: Missing link parameter');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
