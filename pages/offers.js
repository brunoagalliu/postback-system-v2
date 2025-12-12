// File: pages/offers.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function OffersManagement() {
    const router = useRouter();
    const [offers, setOffers] = useState([]);
    const [verticals, setVerticals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(null);
    const [selectedMode, setSelectedMode] = useState('simple');

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

        // If unauthorized, redirect to login
        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            router.push('/admin-login');
            throw new Error('Authentication failed');
        }

        return response;
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin-login');
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await authFetch('/api/admin/simple-offers');
            const data = await response.json();

            if (response.ok) {
                setOffers(data.offers);
            } else {
                setError(data.message || 'Failed to load offers');
            }
        } catch (err) {
            setError('Error loading offers: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchVerticals = async () => {
        try {
            const response = await authFetch('/api/admin/verticals');
            const data = await response.json();

            if (response.ok) {
                setVerticals(data.verticals);
            }
        } catch (err) {
            console.error('Error loading verticals:', err);
        }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const offerData = {
            offer_id: formData.get('offer_id'),
            offer_name: formData.get('offer_name'),
            mode: formData.get('mode'),
            trigger_amount: formData.get('trigger_amount'),
            low_event_type: formData.get('low_event_type'),
            high_event_type: formData.get('high_event_type')
        };

        try {
            const response = await authFetch('/api/admin/simple-offers', {
                method: 'POST',
                body: JSON.stringify(offerData)
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setShowOfferModal(false);
                setSelectedMode('simple');
                fetchOffers();
                
                // Auto-assign to vertical if selected
                const verticalId = formData.get('vertical_id');
                if (verticalId && verticalId !== '') {
                    await assignOfferToVertical(offerData.offer_id, verticalId);
                }
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error creating offer: ' + err.message);
        }
    };

    const handleUpdateOffer = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const offerData = {
            offer_id: editingOffer.offer_id,
            offer_name: formData.get('offer_name'),
            mode: formData.get('mode'),
            trigger_amount: formData.get('trigger_amount'),
            low_event_type: formData.get('low_event_type'),
            high_event_type: formData.get('high_event_type')
        };

        try {
            const response = await authFetch('/api/admin/simple-offers', {
                method: 'PUT',
                body: JSON.stringify(offerData)
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setEditingOffer(null);
                setShowOfferModal(false);
                setSelectedMode('simple');
                fetchOffers();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error updating offer: ' + err.message);
        }
    };

    const assignOfferToVertical = async (offerId, verticalId) => {
        try {
            const response = await authFetch('/api/admin/assign-offer', {
                method: 'POST',
                body: JSON.stringify({ offer_id: offerId, vertical_id: parseInt(verticalId) })
            });

            const result = await response.json();
            if (result.success) {
                fetchOffers();
                setShowAssignModal(null);
                alert(result.message);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error assigning offer: ' + err.message);
        }
    };

    const handleDeleteOffer = async (offerId) => {
        try {
            const response = await authFetch(`/api/admin/simple-offers?offer_id=${offerId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setShowDeleteConfirm(null);
                fetchOffers();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error deleting offer: ' + err.message);
        }
    };

    useEffect(() => {
        fetchOffers();
        fetchVerticals();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <Head>
                <title>Offer Management - Conversion Tracking</title>
                <meta name="description" content="Manage offers and their assignments to verticals" />
            </Head>

            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Offer Management</h1>
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
                        onClick={fetchOffers}
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
                            setEditingOffer(null);
                            setSelectedMode('simple');
                            setShowOfferModal(true);
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
                        Create Offer
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Offers</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
                        {offers.length}
                    </p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Simple Mode</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                        {offers.filter(o => !o.mode || o.mode === 'simple').length}
                    </p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Advanced Mode</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                        {offers.filter(o => o.mode === 'advanced').length}
                    </p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Cached</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                        ${offers.reduce((sum, o) => sum + (o.total_cached_amount || 0), 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Offers Table */}
            {offers.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        background: 'white'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Offer ID</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Offer Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>Mode</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Config</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Assigned Vertical</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Conversions</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Cached</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                        {offer.offer_id}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {offer.offer_name || <span style={{ color: '#666', fontStyle: 'italic' }}>No name</span>}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            background: offer.mode === 'advanced' ? '#e7d4f5' : '#d4edda',
                                            color: offer.mode === 'advanced' ? '#6f42c1' : '#28a745'
                                        }}>
                                            {offer.mode === 'advanced' ? '⚡ Advanced' : '📦 Simple'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '12px' }}>
                                        {offer.mode === 'advanced' ? (
                                            <div>
                                                <div><strong>Trigger:</strong> ${parseFloat(offer.trigger_amount || 0).toFixed(2)}</div>
                                                <div><strong>Low:</strong> {offer.low_event_type || 'N/A'}</div>
                                                <div><strong>High:</strong> {offer.high_event_type || 'Purchase'}</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#666', fontStyle: 'italic' }}>Cache & Threshold</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        {offer.vertical_name ? (
                                            <div>
                                                <strong>{offer.vertical_name}</strong>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    ${parseFloat(offer.payout_threshold || 10).toFixed(2)} threshold
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        {offer.total_conversions || 0}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        {offer.mode === 'advanced' ? (
                                            <span style={{ color: '#666', fontStyle: 'italic' }}>N/A</span>
                                        ) : (
                                            `$${parseFloat(offer.total_cached_amount || 0).toFixed(2)}`
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => {
                                                    setEditingOffer(offer);
                                                    setSelectedMode(offer.mode || 'simple');
                                                    setShowOfferModal(true);
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
                                            {offer.mode !== 'advanced' && (
                                                <button 
                                                    onClick={() => setShowAssignModal(offer.offer_id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Assign
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setShowDeleteConfirm(offer.offer_id)}
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

            {offers.length === 0 && !loading && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px' 
                }}>
                    <h3>No offers found</h3>
                    <p>Create your first offer to get started with conversion tracking.</p>
                </div>
            )}

            {/* Offer Modal */}
            {showOfferModal && (
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
                    zIndex: 1000,
                    overflowY: 'auto'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '600px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        margin: '20px'
                    }}>
                        <h3>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
                        <form onSubmit={editingOffer ? handleUpdateOffer : handleCreateOffer}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Offer ID: *
                                </label>
                                <input
                                    type="text"
                                    name="offer_id"
                                    defaultValue={editingOffer?.offer_id || ''}
                                    disabled={!!editingOffer}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: editingOffer ? '#f8f9fa' : 'white',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Offer Name: (optional)
                                </label>
                                <input
                                    type="text"
                                    name="offer_name"
                                    defaultValue={editingOffer?.offer_name || ''}
                                    placeholder="e.g., Weight Loss Campaign A"
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
                                    Mode: *
                                </label>
                                <select
                                    name="mode"
                                    value={editingOffer ? (editingOffer.mode || 'simple') : selectedMode}
                                    onChange={(e) => setSelectedMode(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="simple">📦 Simple Mode (Cache & Threshold)</option>
                                    <option value="advanced">⚡ Advanced Mode (Instant Fire with Events)</option>
                                </select>
                                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                    {(editingOffer ? (editingOffer.mode || 'simple') : selectedMode) === 'simple' ? 
                                        'Caches conversions below threshold, fires when reached' : 
                                        'Fires every conversion instantly with custom event types'}
                                </small>
                            </div>

                            {/* Advanced Mode Fields */}
                            {((editingOffer && (editingOffer.mode === 'advanced')) || (!editingOffer && selectedMode === 'advanced')) && (
                                <div style={{ 
                                    padding: '15px', 
                                    background: '#f8f9fa', 
                                    borderRadius: '8px',
                                    marginBottom: '15px'
                                }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#6f42c1' }}>⚡ Advanced Mode Settings</h4>
                                    
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                            Trigger Amount ($): *
                                        </label>
                                        <input
                                            type="number"
                                            name="trigger_amount"
                                            step="0.01"
                                            min="0.01"
                                            defaultValue={editingOffer?.trigger_amount || 50}
                                            required={(editingOffer ? (editingOffer.mode === 'advanced') : (selectedMode === 'advanced'))}
                                            placeholder="50.00"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <small style={{ color: '#666' }}>Conversions below this will use low event type</small>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                            Low Event Type: *
                                        </label>
                                        <input
                                            type="text"
                                            name="low_event_type"
                                            defaultValue={editingOffer?.low_event_type || 'CompleteRegistration'}
                                            required={(editingOffer ? (editingOffer.mode === 'advanced') : (selectedMode === 'advanced'))}
                                            placeholder="CompleteRegistration"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <small style={{ color: '#666' }}>Event fired when param1 &lt; trigger amount</small>
                                    </div>

                                    <div style={{ marginBottom: '0' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                            High Event Type: (optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="high_event_type"
                                            defaultValue={editingOffer?.high_event_type || 'Purchase'}
                                            placeholder="Purchase"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <small style={{ color: '#666' }}>Event fired when param1 ≥ trigger amount (default: Purchase)</small>
                                    </div>
                                </div>
                            )}

                            {/* Simple Mode: Show vertical assignment */}
                            {!editingOffer && ((editingOffer ? (editingOffer.mode || 'simple') : selectedMode) === 'simple') && (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Assign to Vertical: (optional)
                                    </label>
                                    <select
                                        name="vertical_id"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        <option value="">Select a vertical...</option>
                                        {verticals.map(vertical => (
                                            <option key={vertical.id} value={vertical.id}>
                                                {vertical.name} (${vertical.payout_threshold})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowOfferModal(false);
                                        setEditingOffer(null);
                                        setSelectedMode('simple');
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
                                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Vertical Modal */}
            {showAssignModal && (
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
                        <h3>Assign Offer to Vertical</h3>
                        <p>Assigning offer: <strong>{showAssignModal}</strong></p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const verticalId = formData.get('vertical_id');
                            if (verticalId) {
                                assignOfferToVertical(showAssignModal, verticalId);
                            }
                            }}>
                            <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Select Vertical:
                            </label>
                            <select
                            name="vertical_id"
                            required
                            style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                            }}
                            >
                            <option value="">Select a vertical...</option>
                            {verticals.map(vertical => (
                            <option key={vertical.id} value={vertical.id}>
                            {vertical.name} (${vertical.payout_threshold})
                            </option>
                            ))}
                            </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(null)}
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
                                Assign
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
                    <p>Are you sure you want to delete offer <strong>{showDeleteConfirm}</strong>?</p>
                    <p style={{ color: '#dc3545', fontSize: '14px' }}>
                        This will also remove all cached conversions and vertical assignments for this offer.
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
                            onClick={() => handleDeleteOffer(showDeleteConfirm)}
                            style={{
                                padding: '8px 16px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Delete Offer
                        </button>
                    </div>
                </div>
            </div>
        )}

        <footer style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Offer Modes Explained:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
                <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#28a745' }}>📦 Simple Mode</h5>
                    <ul style={{ marginLeft: '20px', color: '#666', fontSize: '14px' }}>
                        <li>Caches conversions below threshold</li>
                        <li>Fires ONE postback when threshold reached</li>
                        <li>Sends accumulated sum amount</li>
                        <li>Best for: Cost optimization, reducing postback frequency</li>
                    </ul>
                </div>
                <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#6f42c1' }}>⚡ Advanced Mode</h5>
                    <ul style={{ marginLeft: '20px', color: '#666', fontSize: '14px' }}>
                        <li>Fires postback for EVERY conversion immediately</li>
                        <li>Low conversions: sent with custom event (e.g., CompleteRegistration)</li>
                        <li>High conversions: sent with high event (e.g., Purchase)</li>
                        <li>Best for: Pixel tracking, event-based optimization</li>
                    </ul>
                </div>
            </div>
        </footer>
    </div>
);}                            