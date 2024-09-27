
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB
app.use(cors({
    origin: 'http://localhost:3001', 
    methods: ['GET', 'POST'], 
    credentials: true 
  }));
mongoose.connect('mongodb://localhost:27017/notification_service')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


// Middleware
app.use(bodyParser.json());

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  source: String,
  timestamp: String,
  status: { type: String, default: 'unread' }
});

const Notification = mongoose.model('Notification', notificationSchema);



// WebSocket connection for real-time notifications
io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Send Notification API (POST /api/notifications/send)
app.post('/api/notifications/send', async (req, res) => {
  const { target, userId, message, source, timestamp } = req.body;
    console.log(req.body)
  if (target === 'specific') {
    // Send to a specific user
    const notification = new Notification({ userId, message, source, timestamp });
    await notification.save();
    
    // Emit real-time notification to specific user
    io.emit(`notification_${userId}`, notification);
    res.status(200).json({ message: 'Notification sent to specific user!' });
  } else if (target === 'all_users') {
    // Send to all users
    const notification = new Notification({ message, source, timestamp });
    
    // Broadcast the notification to all connected users
    io.emit('broadcast_notification', notification);
    res.status(200).json({ message: 'Broadcast notification sent!' });
  }
});

// Fetch Notifications API (GET /api/notifications/:userId)
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  const notifications = await Notification.find({ userId });
  
  res.status(200).json(notifications);
});

// Mark Notifications as Read API (POST /api/notifications/read)
app.post('/api/notifications/read', async (req, res) => {
  const { userId, notificationIds } = req.body;
  
  await Notification.updateMany(
    { _id: { $in: notificationIds }, userId },
    { $set: { status: 'read' } }
  );
  
  res.status(200).json({ message: 'Notifications marked as read' });
});
// Fetch all notifications (GET /api/notifications/all)
app.get('/api/notifications/all', async (req, res) => {
  try {
    const notifications = await Notification.find(); // Fetch all notifications
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Error fetching all notifications' });
  }
});
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
