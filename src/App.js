import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

function FilterBar({ filter, setFilter }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Notification Type
      </Typography>

      <Box
        component="select"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ width: "100%", p: 1.5 }}
      >
        <option value="">All</option>
        <option value="Event">Event</option>
        <option value="Result">Result</option>
        <option value="Placement">Placement</option>
      </Box>
    </Box>
  );
}

function NotificationCard({ item }) {
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h6">{item.Type}</Typography>

      <Typography>{item.Message}</Typography>

      <Typography variant="caption">{item.Timestamp}</Typography>
    </Box>
  );
}

function App() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/evaluation-service/notifications?page=1&limit=100"
      );
      const data = response.data?.notifications ?? [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizedNotifications = Array.isArray(notifications)
    ? notifications
    : [];

  const filteredNotifications = filter
    ? normalizedNotifications.filter(
        (notification) => notification.Type === filter
      )
    : normalizedNotifications;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
        >
          Campus Notifications
        </Typography>

        <FilterBar
          filter={filter}
          setFilter={setFilter}
        />

        {loading && (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {!loading &&
          !error &&
          filteredNotifications.map(
            (item, index) => (
              <NotificationCard
                key={index}
                item={item}
              />
            )
          )}

        {!loading && !error && filteredNotifications.length === 0 && (
            <Typography
              align="center"
              sx={{ mt: 3 }}
            >
              No notifications found.
            </Typography>
          )}
      </Box>
    </Container>
  );
}

export default App;