const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");
const mysql = require('mysql2');
const multer = require('multer'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Database Connection ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'yourpassword', 
    database: 'chat_app', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // The folder where files will be saved
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwriting
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });


// --- Middleware ---
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // File was uploaded successfully. Now, prepare the chat message.
    const { senderName, isAnonymous } = req.body;
    const messageData = {
        sender_name: isAnonymous === 'true' ? 'Anonymous' : senderName,
        message_text: '', // No text content for file messages
        is_anonymous: isAnonymous === 'true',
        created_at: new Date(),
        // Add file information
        message_type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
        file_url: `/uploads/${req.file.filename}`,
        original_filename: req.file.originalname
    };

    // Save message reference to the database
    const query = 'INSERT INTO messages (sender_name, message_text, is_anonymous, message_type, file_url) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [messageData.sender_name, messageData.original_filename, messageData.is_anonymous, messageData.message_type, messageData.file_url])
        .then(() => {
            
            io.emit('chat message', messageData);
            res.status(200).json({ message: 'File uploaded and message sent.' });
        })
        .catch(err => {
            console.error('Failed to save file message to DB:', err);
            res.status(500).send('Server error.');
        });
});

// --- Socket.IO Connection Handling ---
io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);

    
    try {
        // Update query to get new file-related columns
        const [rows] = await db.query('SELECT * FROM messages ORDER BY created_at ASC');
        socket.emit('load history', rows);
    } catch (err) {
        console.error('Failed to load message history:', err);
    }

    // Handle incoming TEXT messages
    socket.on('chat message', async (msg) => {
        const currentUserName = "Abhay Shukla"; 
        const messageData = {
            sender_name: msg.isAnonymous ? 'Anonymous' : currentUserName,
            message_text: msg.text,
            is_anonymous: msg.isAnonymous,
            created_at: new Date(),
            message_type: 'text', 
            file_url: null
        };

        try {
            const query = 'INSERT INTO messages (sender_name, message_text, is_anonymous, message_type) VALUES (?, ?, ?, ?)';
            await db.query(query, [messageData.sender_name, messageData.message_text, messageData.is_anonymous, messageData.message_type]);

            socket.broadcast.emit('chat message', messageData);
        } catch (err) {
            console.error('Failed to save message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});