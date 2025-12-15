// File: components/offers/AssignVerticalModal.js
export default function AssignVerticalModal({ 
    show, 
    offerId, 
    verticals, 
    onSubmit, 
    onClose 
}) {
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
                <p>Assigning offer: <strong>{offerId}</strong></p>
                <form onSubmit={onSubmit}>
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
                            Assign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}