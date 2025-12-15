// File: pages/offers.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import OfferStats from '../components/offers/OfferStats';
import OfferTable from '../components/offers/OfferTable';
import OfferModal from '../components/offers/OfferModal';
import AssignVerticalModal from '../components/offers/AssignVerticalModal';
import DeleteConfirmModal from '../components/offers/DeleteConfirmModal';
import OfferModeExplainer from '../components/offers/OfferModeExplainer';

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

    const handleOfferSubmit = async (e) => {
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
                method: editingOffer ? 'PUT' : 'POST',
                body: JSON.stringify(editingOffer ? {...offerData, offer_id: editingOffer.offer_id} : offerData)
            });

            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setShowOfferModal(false);
                setEditingOffer(null);
                fetchOffers();
                
                // Auto-assign to vertical if creating new simple mode offer
                if (!editingOffer && offerData.mode === 'simple') {
                    const verticalId = formData.get('vertical_id');
                    if (verticalId && verticalId !== '') {
                        await assignOfferToVertical(offerData.offer_id, verticalId);
                    }
                }
            } else {
                alert('Error: ' + result.message);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const verticalId = formData.get('vertical_id');
        
        if (verticalId && showAssignModal) {
            await assignOfferToVertical(showAssignModal, verticalId);
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

    const handleDeleteOffer = async () => {
        if (!showDeleteConfirm) return;

        try {
            const response = await authFetch(`/api/admin/simple-offers?offer_id=${showDeleteConfirm}`, {
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

            <OfferStats offers={offers} />

            <OfferTable 
                offers={offers}
                loading={loading}
                onEdit={(offer) => {
                    setEditingOffer(offer);
                    setShowOfferModal(true);
                }}
                onAssign={(offerId) => setShowAssignModal(offerId)}
                onDelete={(offerId) => setShowDeleteConfirm(offerId)}
            />

            <OfferModal
                show={showOfferModal}
                editingOffer={editingOffer}
                verticals={verticals}
                onSubmit={handleOfferSubmit}
                onClose={() => {
                    setShowOfferModal(false);
                    setEditingOffer(null);
                }}
            />

            <AssignVerticalModal
                show={!!showAssignModal}
                offerId={showAssignModal}
                verticals={verticals}
                onSubmit={handleAssignSubmit}
                onClose={() => setShowAssignModal(null)}
            />

            <DeleteConfirmModal
                show={!!showDeleteConfirm}
                offerId={showDeleteConfirm}
                onConfirm={handleDeleteOffer}
                onClose={() => setShowDeleteConfirm(null)}
            />

            <OfferModeExplainer />
        </div>
    );
}