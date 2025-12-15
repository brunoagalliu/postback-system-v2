// File: pages/admin.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import VerticalsOverview from '../components/dashboard/VerticalsOverview';
import OffersOverview from '../components/dashboard/OffersOverview';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin-login');
            return;
        }
    }, [router]);

    // Helper function to make authenticated requests
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
            router.push('/admin-login');
            throw new Error('No authentication token');
        }
        
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            router.push('/admin-login');
            throw new Error('Authentication failed');
        }

        return response;
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin-login');
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch stats
            const statsResponse = await authFetch('/api/admin/stats');
            const statsData = await statsResponse.json();

            if (statsResponse.ok) {
                setStats(statsData);
            }

            // Fetch offers
            const offersResponse = await authFetch('/api/admin/simple-offers');
            const offersData = await offersResponse.json();

            if (offersResponse.ok) {
                setOffers(offersData.offers || []);
            }

        } catch (err) {
            setError('Error loading dashboard: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <Head>
                <title>Admin Dashboard - Conversion Tracking</title>
                <meta name="description" content="Admin dashboard for conversion tracking system" />
            </Head>

            <DashboardHeader 
                loading={loading}
                onRefresh={fetchDashboardData}
                onLogout={handleLogout}
            />

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

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    Loading dashboard data...
                </div>
            )}

            {!loading && (
                <>
                    <VerticalsOverview stats={stats} />
                    <OffersOverview offers={offers} />
                </>
            )}
        </div>
    );
}