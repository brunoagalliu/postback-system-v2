// File: components/offers/OfferModeExplainer.js
export default function OfferModeExplainer() {
    return (
        <footer style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Offer Modes Explained:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
                <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#28a745' }}>📦 Simple Mode</h5>
                    <ul style={{ marginLeft: '20px', color: '#666', fontSize: '14px' }}>
                        <li>Caches conversions below threshold</li>
                        <li>Fires ONE postback when threshold reached</li>
                        <li>Sends accumulated sum amount</li>
                        <li>Best for: Cost optimization, reducing postback frequency</li>
                    </ul>
                </div>
                <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#6f42c1' }}>⚡ Advanced Mode</h5>
                    <ul style={{ marginLeft: '20px', color: '#666', fontSize: '14px' }}>
                        <li>Fires postback for EVERY conversion immediately</li>
                        <li>Low conversions: sent with custom event (e.g., CompleteRegistration)</li>
                        <li>High conversions: sent with high event (e.g., Purchase)</li>
                        <li>Best for: Pixel tracking, event-based optimization</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}