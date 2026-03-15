import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map click for repositioning marker
const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} /> : null;
};

const CreateRequest = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const routeLocation = useLocation();

    const [formData, setFormData] = useState({
        serviceType: '',
        address: '',
        description: '',
        preferredDate: ''
    });
    const [coordinates, setCoordinates] = useState(null); // [lat, lng]
    const [geoStatus, setGeoStatus] = useState('detecting'); // 'detecting' | 'granted' | 'denied' | 'unavailable'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);

    const serviceOptions = [
        { value: "acRepair", label: "AC Repair" },
        { value: "mechanicRepair", label: "Mechanic Repair" },
        { value: "electricalRepair", label: "Electrical Repair" },
        { value: "electronicRepair", label: "Electronics Repair" },
        { value: "plumber", label: "Plumbing Services" },
        { value: "packersMovers", label: "Packers & Movers" },
        { value: "Security Guards", label: "Security Guards" },
        { value: "Watchmen", label: "Watchmen" },
        { value: "Housekeeping", label: "Housekeeping" },
        { value: "Drivers", label: "Drivers" },
        { value: "Skilled Labour", label: "Skilled Labour" },
        { value: "Unskilled Labour", label: "Unskilled Labour" },
        { value: "Office Staff", label: "Office Staff" },
        { value: "Other Staff", label: "Other Staff" }
    ];

    // Get geolocation on mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setGeoStatus('unavailable');
            setCoordinates([17.385, 78.4867]); // Default: Hyderabad
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoordinates([lat, lng]);
                setGeoStatus('granted');
            },
            (err) => {
                console.warn('Geolocation denied/error:', err.message);
                setGeoStatus('denied');
                setCoordinates([17.385, 78.4867]); // Default fallback
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Pre-fill service type from query params
    useEffect(() => {
        const queryParams = new URLSearchParams(routeLocation.search);
        const selectedService = queryParams.get('service');
        if (selectedService) {
            setFormData(prev => ({
                ...prev,
                serviceType: selectedService,
                description: `I need help with ${selectedService}.`
            }));
        }
    }, [routeLocation.search]);

    // Recenter map when coordinates change
    useEffect(() => {
        if (mapRef.current && coordinates) {
            mapRef.current.setView(coordinates, 15);
        }
    }, [coordinates]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!coordinates) {
            setError('Please wait for location to be detected or click on the map to set your location.');
            setLoading(false);
            return;
        }

        if (!formData.address.trim()) {
            setError('Please enter your address.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            };
            const apiUrl = import.meta.env.VITE_API_URL;
            const payload = {
                serviceType: formData.serviceType,
                location: {
                    address: formData.address,
                    coordinates: {
                        lat: coordinates[0],
                        lng: coordinates[1]
                    }
                },
                description: formData.description,
                preferredDate: formData.preferredDate
            };
            await axios.post(`${apiUrl}/api/requests`, payload, config);
            navigate('/customer/dashboard');
        } catch (err) {
            console.error('Error creating request:', err);
            setError(err.response?.data?.error || 'Failed to create request. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="cd">
            {/* ── MOBILE HEADER (Hamburger) ─────────────────────────── */}
            <div className="cd-mobile-header d-md-none">
                <button className="menu-toggle" onClick={() => window.dispatchEvent(new Event('openSidebar'))}>
                    ☰
                </button>
            </div>

            <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>
                    📍 Create Service Request
                </h2>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                {/* Service Type */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#334155' }}>Service Type</label>
                    <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                    >
                        <option value="" disabled>Select a service</option>
                        {serviceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Location Map */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                        📍 Your Location
                        {geoStatus === 'detecting' && <span style={{ fontWeight: 400, color: '#f59e0b', marginLeft: 8 }}>Detecting...</span>}
                        {geoStatus === 'granted' && <span style={{ fontWeight: 400, color: '#10b981', marginLeft: 8 }}>✓ Detected</span>}
                        {geoStatus === 'denied' && <span style={{ fontWeight: 400, color: '#ef4444', marginLeft: 8 }}>Permission denied — tap map to set</span>}
                    </label>

                    {coordinates && (
                        <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid #e2e8f0', marginBottom: 10 }}>
                            <MapContainer
                                center={coordinates}
                                zoom={15}
                                style={{ height: 250, width: '100%', zIndex: 0 }}
                                ref={mapRef}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationPicker
                                    position={coordinates}
                                    setPosition={setCoordinates}
                                />
                            </MapContainer>
                        </div>
                    )}

                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
                        Click on the map to adjust your pin location
                    </p>
                </div>

                {/* Address */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#334155' }}>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. 123 Main St, Apt 4B, Hyderabad"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                    />
                </div>

                {/* Preferred Date */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#334155' }}>Preferred Date</label>
                    <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                    />
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#334155' }}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please describe what you need help with..."
                        rows="3"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', resize: 'vertical' }}
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1, padding: '12px', borderRadius: 8, border: 'none',
                            background: loading ? '#94a3b8' : '#2563eb', color: '#fff',
                            fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating...' : '🚀 Submit Request'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/customer/dashboard')}
                        style={{
                            padding: '12px 20px', borderRadius: 8, border: '1px solid #d1d5db',
                            background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
};

export default CreateRequest;
