import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../context/UserContext'; // Adjust the import path as needed

const ScheduleComponent = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userContext = useContext(UserContext);

  useEffect(() => {
    if (userContext && userContext.token) {
      fetchSchedules();
    }
  }, [userContext]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/get-all-schedule`,
        {
          headers: {
            'Authorization': `Bearer ${userContext.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchSchedules();
  };

  const getCodename = (userId) => {
    return `User-${userId.slice(-6)}`;
  };

  // Check if user is authenticated
  if (!userContext || !userContext.token) {
    return (
      <div className="auth-container">
        <div className="auth-prompt">
          <h2>Authentication Required</h2>
          <p>You need to be authenticated to view schedules.</p>
          <p>Please login through your application's login system.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="loading">Loading schedules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-container">
        <div className="error-container">
          <div className="error">Error: {error}</div>
          <button onClick={handleRetry} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="header-bar">
        <h1>Payment Schedules</h1>
        {userContext.user && (
          <div className="user-info">
            Welcome, {userContext.user.name || userContext.user.email}
          </div>
        )}
      </div>

      {schedules.length === 0 ? (
        <div className="no-schedules">
          No schedules found
          <button onClick={handleRetry} className="retry-btn">
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="schedule-stats">
            <span>Total Schedules: {schedules.length}</span>
            <span>
              Pending: {schedules.filter(s => s.status === 'pending').length}
            </span>
          </div>

          <div className="schedule-grid">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="schedule-card">
                <div className="card-header">
                  <h3>{getCodename(schedule.userId)}</h3>
                  <span className={`status-badge ${schedule.status}`}>
                    {schedule.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="total-amount">
                    Total Amount: ₱{schedule.totalAmount?.toLocaleString()}
                  </div>

                  <div className="schedule-items">
                    <h4>Scheduled Payments:</h4>
                    {schedule.scheduleOrdered?.map((item) => (
                      <div key={item._id} className="schedule-item">
                        <div className="item-details">
                          <strong>{item.productId?.name}</strong>
                          <span>Category: {item.productId?.category}</span>
                          <span>Amount: ₱{item.productId?.amount?.toLocaleString()}</span>
                          <span>Number: {item.productId?.number}</span>
                        </div>
                        <span className={`payment-status ${item.status}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleComponent;