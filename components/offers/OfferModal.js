// File: components/offers/OfferModal.js
import { useState } from 'react';

export default function OfferModal({ 
    show, 
    editingOffer, 
    verticals, 
    onSubmit, 
    onClose 
}) {
    const [selectedMode, setSelectedMode] = useState(editingOffer?.mode || 'simple');

    if (!show) return null;

    return (
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
                <form onSubmit={onSubmit}>
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
                            value={selectedMode}
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
                            {selectedMode === 'simple' ? 
                                'Caches conversions below threshold, fires when reached' : 
                                'Fires every conversion instantly with custom event types'}
                        </small>
                    </div>

                    {/* Advanced Mode Fields */}
                    {selectedMode === 'advanced' && (
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
                                    required={selectedMode === 'advanced'}
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
                                    required={selectedMode === 'advanced'}
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
                    {!editingOffer && selectedMode === 'simple' && (
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
                            onClick={onClose}
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
    );
}