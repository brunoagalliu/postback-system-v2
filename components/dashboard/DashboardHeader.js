// File: components/dashboard/DashboardHeader.js
export default function DashboardHeader({ loading, onRefresh, onLogout }) {
    return (
        <header style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Admin Dashboard</h1>
                <button 
                    onClick={onLogout}
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
                    onClick={onRefresh}
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
                <a href="/offers" style={{ 
                    padding: '8px 16px',
                    background: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    Manage Offers
                </a>
                <a href="/logs" style={{ 
                    padding: '8px 16px',
                    background: '#6c757d',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    View Logs
                </a>
            </div>
        </header>
    );
}