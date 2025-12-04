// File: pages/admin-login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminLogin() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

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
                setError('Invalid admin token');
            }
        } catch (err) {
            setError('Login failed: ' + err.message);
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
                <title>Admin Login</title>
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
                    Admin Login
                </h1>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fff0f0',
                        color: '#d32f2f',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px',
                            fontWeight: 'bold'
                        }}>
                            Admin Token:
                        </label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter your admin token"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Login
                    </button>
                </form>

                <p style={{ 
                    marginTop: '20px', 
                    fontSize: '12px', 
                    color: '#666',
                    textAlign: 'center'
                }}>
                    Token is stored in your .env.local as ADMIN_SECRET_TOKEN
                </p>
            </div>
        </div>
    );
}