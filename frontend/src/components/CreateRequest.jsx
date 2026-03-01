import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const CreateRequest = () => {
    const { authToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        serviceType: '',
        location: '',
        description: '',
        preferredDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Provide access to options for both useEffect mapping and render dropdown
    const serviceOptions = [
        { value: "acRepair", label: "AC Repair" },
        { value: "mechanicRepair", label: "Mechanic Repair" },
        { value: "electricalRepair", label: "Electrical Repair" },
        { value: "electronicRepair", label: "Electronics Repair" },
        { value: "plumber", label: "Plumbing Services" },
        { value: "packersMovers", label: "Packers & Movers" }
    ];

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const service = queryParams.get('service');
        if (service && serviceOptions.some(opt => opt.value === service)) {
            const matchedOption = serviceOptions.find(opt => opt.value === service);
            setFormData(prev => ({
                ...prev,
                serviceType: matchedOption.value,
                description: `I need help with ${matchedOption.label}.`
            }));
        }
    }, [location.search]);

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

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            };
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003';
            await axios.post(`${apiUrl}/api/requests`, formData, config);

            // Redirect to customer dashboard on success
            navigate('/customer/dashboard');
        } catch (err) {
            console.error('Error creating request:', err);
            setError(err.response?.data?.error || 'Failed to create request. Please try again.');
            setLoading(false);
        }
    };



    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Create Service Request</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceType">
                        Service Type
                    </label>
                    <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="" disabled>Select a service</option>
                        {serviceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. 123 Main St, Apt 4B"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preferredDate">
                        Preferred Date
                    </label>
                    <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please describe what you need help with..."
                        rows="4"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creating...' : 'Submit Request'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/customer/dashboard')}
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRequest;
