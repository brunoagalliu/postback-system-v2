// File: components/offers/OfferStats.js
export default function OfferStats({ offers }) {
    // Safely calculate total cached amount
    const totalCached = offers && offers.length > 0 
        ? offers.reduce((sum, o) => sum + (parseFloat(o.total_cached_amount) || 0), 0)
        : 0;

    return (
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
                    {offers ? offers.length : 0}
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
                    {offers ? offers.filter(o => !o.mode || o.mode === 'simple').length : 0}
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
                    {offers ? offers.filter(o => o.mode === 'advanced').length : 0}
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
                    ${totalCached.toFixed(2)}
                </p>
            </div>
        </div>
    );
}