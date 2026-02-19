import { useEffect, useState } from "react";
import "./App.css";

type LunchRequest = {
  id: number;
  restaurant: string;
  requestedBy: string;
  volunteers: number;
  drivers: string[];
  passengers: string[];
  postedAt: Date; // posted time
};

// Function to display "time ago" like 15 minutes ago
function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // in minutes
  if (diff < 1) return "just now";
  if (diff === 1) return "1 minute ago";
  if (diff < 60) return `${diff} minutes ago`;
  const hours = Math.floor(diff / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

function App() {
  const [time, setTime] = useState(new Date());

  const [requests] = useState<LunchRequest[]>([
    {
      id: 1,
      restaurant: "Chipotle",
      requestedBy: "Sarah",
      volunteers: 3,
      drivers: ["Mike"],
      passengers: ["Alex", "Jordan"],
      postedAt: new Date(Date.now() - 15 * 60000), // 15 min ago
    },
    {
      id: 2,
      restaurant: "Shake Shack",
      requestedBy: "David",
      volunteers: 2,
      drivers: ["Emma"],
      passengers: ["Chris"],
      postedAt: new Date(Date.now() - 45 * 60000), // 45 min ago
    },
  ]);

  // Update real-time clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-container">
      {/* PNG overlay/logo on top-left */}
      <img src="/Users/el704581/Desktop/dev/hack day/techlaunchers/frontend/src/assets/overlay.png" alt="Overlay Logo" className="overlay-image" />

      {/* Main content */}
      <div className="board-content">
        <div className="board-header">
          <div className="title-section">
            <h1>🍔 Office Lunch Bounty Board</h1>
            <p className="clock">{time.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="cards-container">
          {requests.map((req) => (
            <div key={req.id} className="request-card">
              <div className="card-left">
                <h2 className="restaurant-name">{req.restaurant}</h2>
                <p><strong>Mission #{req.id}</strong></p>
                <p>Posted by <strong>{req.requestedBy}</strong></p>
                <p className="time-ago">{timeAgo(req.postedAt)}</p>
              </div>

              <div className="card-right">
                <p><strong>Crew Count:</strong> {req.volunteers}</p>
                <p><strong>Drivers:</strong> {req.drivers.join(", ") || "None"}</p>
                <p><strong>Passengers:</strong> {req.passengers.join(", ") || "None"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
