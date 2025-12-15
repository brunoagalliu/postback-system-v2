// File: components/dashboard/VerticalsOverview.js
export default function VerticalsOverview({ stats }) {
    if (!stats) return null;

    return (
        <section style={{ marginBottom: '40px' }}>
            <h2>Verticals Overview</h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                marginBottom: '20px'
            }}>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Verticals</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
                        {stats.total_verticals}
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
                        ${parseFloat(stats.total_cached || 0).toFixed(2)}
                    </p>
                </div>
                <div style={{ 
                    padding: '20px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Conversions</h3>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                        {stats.total_conversions}
                    </p>
                </div>
            </div>

            {/* Verticals Details Table */}
            {stats.verticals && stats.verticals.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <h3>Verticals Details</h3>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        background: 'white',
                        marginTop: '15px'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Vertical</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Threshold</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Cached</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>Offers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.verticals.map((vertical, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                                        {vertical.name}
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}