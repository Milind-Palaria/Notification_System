import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the updated CSS

function App() {
  const [formData, setFormData] = useState({
    target: '',
    userId: '',
    message: '',
    source: '',
    timestamp: ''
  });

  const [fetchedNotifications, setFetchedNotifications] = useState([]); // To store fetched notifications
  const [fetchUserId, setFetchUserId] = useState(''); // To store User ID for fetching
  const [toShow,changetoShow]=useState(false)
  // Set the current date and time on component mount for the timestamp
  useEffect(() => {
    const currentDateTime = new Date().toISOString().slice(0, 16); // Format for datetime-local
    setFormData((prevData) => ({
      ...prevData,
      timestamp: currentDateTime
    }));
  }, []);

  // Function to update state on input change for sending notification
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to handle form submission for sending notification
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/notifications/send', formData);
      console.log('Notification sent:', response.data);
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  // Function to update state for fetching notifications
  const handleFetchChange = (e) => {
    setFetchUserId(e.target.value);
  };
  const fetchAllNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications/all');
      setFetchedNotifications(response.data);
      console.log('Fetched all notifications:', response.data);
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      alert('Error fetching all notifications');
    }
  };
  // Function to handle form submission for fetching notifications
  const handleFetchSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`http://localhost:3000/api/notifications/${fetchUserId}`);
      setFetchedNotifications(response.data);
      console.log('Fetched notifications:', response.data);
      if(response.data.length>0)changetoShow(true)
    } catch (error) {
      console.error('Error fetching notifications:', error);
      alert('Error fetching notifications');
    }
  };

  return (
    <div className="App">
      <div className="send_notification_part">
      <h1>Send Notification</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Target:</label>
          <select name="target" value={formData.target} onChange={handleChange} required>
            <option value="">Select Target</option>
            <option value="specific">Specific User</option>
            <option value="all_users">All Users</option>
          </select>
        </div>
        <div>
          <label>User ID (only for specific target):</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Enter User ID"
          />
        </div>
        <div>
          <label>Message:</label>
          <input
            type="text"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter Notification Message"
            required
          />
        </div>
        <div>
          <label>Source:</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="Enter Notification Source"
            required
          />
        </div>
        <div>
          <label>Timestamp:</label>
          <input
            type="datetime-local"
            name="timestamp"
            value={formData.timestamp}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Send Notification</button>
      </form>
      </div>
      <div className="get_notification_part">
      <h1>Fetch Notifications</h1>
      <form onSubmit={handleFetchSubmit}>
        <div>
          <label>Enter User ID:</label>
          <input
            type="text"
            value={fetchUserId}
            onChange={handleFetchChange}
            placeholder="Enter User ID"
            required
          />
        </div>
        <button type="submit">Fetch Notifications</button>
      </form>
        <button onClick={fetchAllNotifications}>Fetch All Notifications</button>

      
      {(fetchedNotifications.length === 0 && toShow)? (
        <p>No notifications found for this user.</p>
      ) : (
        <div className="notifications-container">

          {fetchedNotifications.map((notification, index) => (
            <div className="notification-card" key={index}>
              <strong>Message:</strong> {notification.message}
              <strong>Source:</strong> {notification.source}
              <strong>Status:</strong> {notification.status}
              <strong>Timestamp:</strong> {notification.timestamp}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
