// File: components/offers/OfferTable.js
export default function OfferTable({ 
    offers, 
    loading, 
    onEdit, 
    onAssign, 
    onDelete 
}) {
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading offers...</div>;
    }

    if (offers.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                background: '#f8f9fa', 
                borderRadius: '8px' 
            }}>
                <h3>No offers found</h3>
                <p>Create your first offer to get started with conversion tracking.</p>
            </div>
        );
    }

    return (
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
                                        onClick={() => onEdit(offer)}
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
                                            onClick={() => onAssign(offer.offer_id)}
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
                                        onClick={() => onDelete(offer.offer_id)}
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
    );
}