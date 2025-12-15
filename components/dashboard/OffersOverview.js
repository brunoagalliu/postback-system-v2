// File: components/dashboard/OffersOverview.js
export default function OffersOverview({ offers }) {
    const totalCached = offers && offers.length > 0 
        ? offers.reduce((sum, o) => sum + (parseFloat(o.total_cached_amount) || 0), 0)
        : 0;

    return (
        <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Offers Overview</h2>
                <a href="/offers" style={{ 
                    padding: '8px 16px',
                    background: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}>
                    Manage Offers →
                </a>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '20px',
                marginBottom: '20px'
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

            {/* Offers List */}
            {offers && offers.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <h3>Offers List</h3>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        background: 'white',
                        marginTop: '15px'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Offer ID</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>Mode</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Vertical</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Conversions</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Cached</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer, index) => {
                                const isAdvanced = offer.mode === 'advanced';
                                
                                return (
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
                                                background: isAdvanced ? '#e7d4f5' : '#d4edda',
                                                color: isAdvanced ? '#6f42c1' : '#28a745'
                                            }}>
                                                {isAdvanced ? '⚡ Advanced' : '📦 Simple'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            {offer.vertical_name || <span style={{ color: '#dc3545', fontStyle: 'italic' }}>Unassigned</span>}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                            {offer.total_conversions || 0}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                            {isAdvanced ? (
                                                <span style={{ color: '#666', fontStyle: 'italic' }}>N/A</span>
                                            ) : (
                                                `$${parseFloat(offer.total_cached_amount || 0).toFixed(2)}`
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}