import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const CustomerDashboard = () => {
    const { authToken } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003';
            const response = await axios.get(`${apiUrl}/api/requests/my`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setRequests(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load your service requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken) {
            fetchRequests();
        }
    }, [authToken]);

    const getStatusBadge = (status) => {
        const styles = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'assigned': 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-purple-100 text-purple-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        const defaultStyle = 'bg-gray-100 text-gray-800';
        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || defaultStyle}`}>
                {status.replace('-', ' ').toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading your requests...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Customer Dashboard</h2>
                <Link to="/customer/request" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    + New Request
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Your Service Requests</h3>
                </div>
                {requests.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 border-t border-gray-200">
                        You have no service requests yet.
                    </div>
                ) : (
                    <div className="border-t border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Provider</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timing</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((req) => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{req.serviceType}</div>
                                            <div className="text-sm text-gray-500">{req.location}</div>
                                            <div className="text-xs text-gray-400 mt-1">Pref: {new Date(req.preferredDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.assignedWorker ? (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{req.assignedWorker.username}</div>
                                                    <div className="text-sm text-gray-500">{req.assignedWorker.phone}</div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not assigned yet</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.checkInTime && <div className="text-green-600">In: {new Date(req.checkInTime).toLocaleTimeString()}</div>}
                                            {req.checkOutTime && <div className="text-blue-600">Out: {new Date(req.checkOutTime).toLocaleTimeString()}</div>}
                                            {!req.checkInTime && !req.checkOutTime && <span>-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
