import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerDetails from './WorkerDetails';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const WorkerDetailsPage = () => {
  const { categoryId } = useParams();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Map categoryId to service names in the database
  const categoryToService = {
    electrician: 'Electrician',
    plumber: 'Plumber',
    carpenter: 'Carpenter',
    'daily-labour': 'Daily Labour',
    'skilled-labour': 'Skilled Labour',
    driver: 'Driver',
    'ac-technician': 'AC Technician',
    security: 'Security',
    watchman: 'Watchman',
    'office-boy': 'Office Boy',
    housekeeping: 'Housekeeping',
  };

  // Convert category ID to a more readable format
  const getCategoryName = (catId) => {
    return categoryToService[catId] || catId;
  };

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      try {
        // Get the service name from the categoryId
        const serviceType = categoryToService[categoryId];

        // If category is not recognized, handle it
        if (!serviceType) {
          setWorkers([]);
          setError(`Unknown category: ${categoryId}`);
          setLoading(false);
          return;
        }

        // Set debug info about what we're trying to fetch
        setDebugInfo(`Fetching workers with service=${serviceType} from ${import.meta.env.VITE_API_URL}/api/worker-form/by-type/${serviceType}`);

        // Fetch workers based on their services
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/worker-form/by-type/${serviceType}`);

        console.log('API Response:', response.data);

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setWorkers(response.data);
          setDebugInfo(prev => `${prev} → Got ${response.data.length} worker(s)`);
        } else {
          setWorkers([]);
          setDebugInfo(prev => `${prev} → No workers found`);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workers:', err);
        setError(`Failed to load workers: ${err.message}. Please try again later.`);
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [categoryId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Function to fetch all workers for debugging
  const fetchAllWorkers = async () => {
    try {
      setDebugInfo("Fetching all workers...");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/worker-form/all`);
      setDebugInfo(`Found ${response.data.length} total workers in database`);
    } catch (err) {
      setDebugInfo(`Error fetching all workers: ${err.message}`);
    }
  };

  return (
    <div className="worker-page-container">
      <div className="workers-header">
        <h2>Service Partners - {getCategoryName(categoryId)}</h2>
        {/* <button onClick={handleLogout} className="logout-btn">Logout</button> */}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading workers...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          {debugInfo && <p className="debug-info">{debugInfo}</p>}
          <button onClick={fetchAllWorkers} className="debug-button">Debug: Check All Workers</button>
        </div>
      ) : workers.length === 0 ? (
        <div className="no-workers-container">
          <p>No workers available in this category.</p>
          {debugInfo && <p className="debug-info">{debugInfo}</p>}
          <button onClick={fetchAllWorkers} className="debug-button">Debug: Check All Workers</button>
        </div>
      ) : (
        <WorkerDetails workers={workers} />
      )}
    </div>
  );
};

export default WorkerDetailsPage;
