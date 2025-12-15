// File: components/offers/DeleteConfirmModal.js
export default function DeleteConfirmModal({ 
    show, 
    offerId, 
    onConfirm, 
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
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete offer <strong>{offerId}</strong>?</p>
                <p style={{ color: '#dc3545', fontSize: '14px' }}>
                    This will also remove all cached conversions and vertical assignments for this offer.
                </p>
                
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
                        type="button"
                        onClick={onConfirm}
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
    );
}