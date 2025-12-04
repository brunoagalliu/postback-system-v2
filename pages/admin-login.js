// File: pages/admin-login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminLogin() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Test the token by making a request
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Token is valid - save it
                localStorage.setItem('admin_token', token);
                // Redirect to admin dashboard
                router.push('/admin');
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid admin token');
            }
        } catch (err) {
            setError('Login failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f5f5f5'
        }}>
            <Head>
                <title>Admin Login - Conversion Tracker</title>
            </Head>

            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                width: '400px',
                maxWidth: '90vw'
            }}>
                <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>
                    🔐 Admin Login
                </h1>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fff0f0',
                        color: '#d32f2f',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            Admin Token:
                        </label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter your admin token"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: loading ? '#ccc' : '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '12px', 
                    color: '#666'
                }}>
                    <strong>💡 Where to find your token:</strong>
                    <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                        <li>Check your <code>.env.local</code> file</li>
                        <li>Look for <code>ADMIN_SECRET_TOKEN</code></li>
                        <li>Copy the value after the <code>=</code></li>
                    </ol>
                </div>
            </div>
        </div>
    );
}