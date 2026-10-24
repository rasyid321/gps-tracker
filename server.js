const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Menyediakan file statis dari folder 'public' (tempat file HTML/Leaflet.js Anda berada)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint sederhana untuk tes server
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server GPS Berjalan Aktif', timestamp: new Date() });
});

// Menangani koneksi WebSocket saat perangkat mengirim atau memantau lokasi
io.on('connection', (socket) => {
    console.log(`Perangkat terhubung dengan ID: ${socket.id}`);

    // Menerima data koordinat GPS dari HP / Perangkat pelacak
    socket.on('send-location', (data) => {
        // Menyebarkan (broadcast) koordinat GPS ke semua client yang membuka peta (misal: laptop)
        io.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        console.log(`Perangkat terputus: ${socket.id}`);
        // Beritahu client lain bahwa perangkat ini offline
        io.emit('user-disconnected', socket.id);
    });
});

// Menggunakan port dari environment cloud (Render) atau port 3000 untuk lokal
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server GPS aktif dan berjalan di port ${PORT}`);
});