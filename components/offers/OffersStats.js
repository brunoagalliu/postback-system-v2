// File: components/offers/OfferStats.js
export default function OfferStats({ offers }) {
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
    );
}