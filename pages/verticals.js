// File: pages/verticals.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function VerticalsManagement() {
    const router = useRouter();
    const [verticals, setVerticals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states
    const [showVerticalModal, setShowVerticalModal] = useState(false);
    const [editingVertical, setEditingVertical] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin-login');
            return;
        }
    }, [router]);

    // Helper function to make authenticated requests
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
            router.push('/admin-login');
            throw new Error('No authentication token');
        }
        
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            router.push('/admin-login');
            throw new Error('Authentication failed');
        }

        return response;
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin-login');
    };

    const fetchVerticals = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await authFetch('/api/admin/verticals');
            const data = await response.json();

            if (response.ok && data.success) {
                setVerticals(data.verticals || []);
            } else {
                setError(data.message || 'Failed to load verticals');
            }
        } catch (err) {
            setError('Error loading verticals: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerticalSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const verticalData = {
            name: formData.get('name'),
            payout_threshold: parseFloat(formData.get('payout_threshold')),
            description: formData.get('description')
        };

        try {
            const response = await authFetch('/api/admin/verticals', {
                method: editingVertical ? 'PUT' : 'POST',
                body: JSON.stringify(editingVertical ? {...verticalData, id: editingVertical.id} : verticalData)
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setShowVerticalModal(false);
                setEditingVertical(null);
                fetchVerticals();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleDeleteVertical = async () => {
        if (!showDeleteConfirm) return;

        try {
            const response = await authFetch(`/api/admin/verticals?id=${showDeleteConfirm}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setShowDeleteConfirm(null);
                fetchVerticals();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error deleting vertical: ' + err.message);
        }
    };

    useEffect(() => {
        fetchVerticals();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <Head>
                <title>Vertical Management - Conversion Tracking</title>
                <meta name="description" content="Manage verticals and their payout thresholds" />
            </Head>

            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Vertical Management</h1>
                    <button 
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={fetchVerticals}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            background: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'default' : 'pointer'
                        }}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                    <button 
                        onClick={() => {
                            setEditingVertical(null);
                            setShowVerticalModal(true);
                        }}
                        style={{
                            padding: '8px 16px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Create Vertical
                    </button>
                    <a href="/admin" style={{ 
                        padding: '8px 16px',
                        background: '#6c757d',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        display: 'inline-block'
                    }}>
                        Back to Dashboard
                    </a>
                </div>
            </header>

            {error && (
                <div style={{ 
                    padding: '12px', 
                    background: '#fff0f0', 
                    color: '#d32f2f',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* Summary Stats */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Verticals</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
                        {verticals.length}
                    </p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Cached</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                        ${verticals.reduce((sum, v) => sum + (parseFloat(v.cached_amount) || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Offers</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                        {verticals.reduce((sum, v) => sum + (parseInt(v.offer_count) || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Verticals Table */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading verticals...</div>
            )}

            {!loading && verticals.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        background: 'white'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Vertical Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Threshold</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Cached</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Offers</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verticals.map((vertical, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                        {vertical.name}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {vertical.description || <span style={{ color: '#666', fontStyle: 'italic' }}>No description</span>}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        ${parseFloat(vertical.payout_threshold || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        ${parseFloat(vertical.cached_amount || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        {vertical.offer_count || 0}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
        <button 
            onClick={() => {
                setEditingVertical(vertical);
                setShowVerticalModal(true);
            }}
            style={{
                padding: '4px 8px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
            }}
        >
            Edit
        </button>
        <a 
            href={`/vertical/${vertical.id}`}
            style={{
                padding: '4px 8px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'none',
                display: 'inline-block'
            }}
        >
            View
        </a>
        <button 
            onClick={() => setShowDeleteConfirm(vertical.id)}
            style={{
                padding: '4px 8px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
            }}
        >
            Delete
        </button>
    </div>
</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && verticals.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px' 
                }}>
                    <h3>No verticals found</h3>
                    <p>Create your first vertical to organize your offers.</p>
                </div>
            )}

            {/* Create/Edit Vertical Modal */}
            {showVerticalModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '500px',
                        maxWidth: '90vw'
                    }}>
                        <h3>{editingVertical ? 'Edit Vertical' : 'Create New Vertical'}</h3>
                        <form onSubmit={handleVerticalSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Vertical Name: *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingVertical?.name || ''}
                                    required
                                    placeholder="e.g., Weight Loss"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Payout Threshold ($): *
                                </label>
                                <input
                                    type="number"
                                    name="payout_threshold"
                                    step="0.01"
                                    min="0.01"
                                    defaultValue={editingVertical?.payout_threshold || 10.00}
                                    required
                                    placeholder="10.00"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <small style={{ color: '#666' }}>Minimum amount to trigger postback</small>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Description: (optional)
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={editingVertical?.description || ''}
                                    placeholder="Brief description of this vertical"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowVerticalModal(false);
                                        setEditingVertical(null);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingVertical ? 'Update Vertical' : 'Create Vertical'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '400px',
                        maxWidth: '90vw'
                    }}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this vertical?</p>
                        <p style={{ color: '#dc3545', fontSize: '14px' }}>
                            This will also unassign all offers from this vertical.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(null)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteVertical}
                                style={{
                                    padding: '8px 16px',
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete Vertical
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}