Real-Time Anonymous Group Chat Application
This is a full-stack, real-time group chat application built with Node.js, Express, Socket.IO, and MySQL. It's designed to replicate the core features of modern messaging apps, including an anonymous mode, file sharing, and persistent message history. This project was created as part of an internship assignment to demonstrate proficiency in building dynamic, database-driven web applications.

Final Preview
Here's a look at the finished application, showcasing the mobile-first UI, different message types, and the anonymous mode status bar.

(To make this image appear, make sure you add the screenshot file image_ade908.png to the main directory of your project before pushing to GitHub.)

Features
Real-Time Messaging: Instant message delivery between all connected clients using WebSockets (Socket.IO).

Anonymous Mode: Users can toggle a switch to send messages anonymously, hiding their real name.

Persistent Chat History: All messages are saved to a MySQL database and loaded when a user joins the chat.

Image & File Sharing: Users can upload and share images or other files, which are stored on the server and broadcasted to the chat.

Automatic Link Detection: URLs sent in messages are automatically converted into clickable links.

Date Separators: The chat history automatically displays date separators (e.g., "Today", "Yesterday", or a specific date) when the day changes between messages.

Responsive, Mobile-First UI: The interface is designed to look and feel like a native mobile chat application.

Tech Stack
This project utilizes a modern web development stack:

Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend: Node.js with the Express.js framework

Real-time Communication: Socket.IO

Database: MySQL

File Uploads: Multer middleware for Node.js

Local Setup and Installation
To run this project on your local machine, follow these steps:

1. Prerequisites
Make sure you have the following installed:

Node.js (which includes npm)

[suspicious link removed]

2. Clone the Repository
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

3. Install Dependencies
Install all the required npm packages listed in package.json.

npm install

4. Set Up the Database
You need to create a MySQL database and a table to store the messages.

a. Create the Database:
Connect to your local MySQL server and run this command:

CREATE DATABASE chat_app;

b. Create the Messages Table:
Once you've selected the chat_app database, run the following SQL query to create the messages table with all the necessary columns.

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    message_text TEXT,
    is_anonymous BOOLEAN NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

c. Configure Database Credentials:
Open the server.js file and update the db connection pool with your MySQL username and password.

// server.js

const db = mysql.createPool({
    host: 'localhost',
    user: 'your_mysql_username', // 👈 Update this
    password: 'your_mysql_password', // 👈 Update this
    database: 'chat_app', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

5. Create the Uploads Folder
In the root of the project directory, create a folder named uploads. This is where shared files will be stored.

mkdir uploads

6. Run the Application
Start the Node.js server.

node server.js

Your application should now be running! Open your web browser and navigate to http://localhost:3000.

Author
Omdarshan Shindepatil - Internship Assignment 
