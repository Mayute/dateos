import { useNavigate } from 'react-router-dom';
export default function DisclaimerPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0c0c10', padding: '40px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ color: '#e8556a', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}>← Back</button>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', color: '#333', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.7' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>DISCLAIMER</h1>
        <p style={{ color: '#595959' }}>Last updated: June 06, 2026</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>AI-Generated Content</h2>
        <p>DateOS uses artificial intelligence to generate date night plans. All venue recommendations, timing suggestions, dress code advice, and insider tips are AI-generated and intended for inspiration purposes only. DATEOS LLC does not guarantee the accuracy, completeness, or current status of any recommended venue, restaurant, bar, or experience.</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>No Guarantee of Availability</h2>
        <p>Venues may be closed, fully booked, or no longer operating. Always verify reservations, hours, and availability directly with the venue before your date.</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>No Affiliation</h2>
        <p>DateOS is not affiliated with, endorsed by, or sponsored by any venue, restaurant, or business mentioned in generated plans. All venue names are used for informational purposes only.</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>Accuracy of Information</h2>
        <p>While we strive to provide useful and relevant recommendations, the AI may occasionally suggest venues that have closed, moved, or changed. Pricing estimates are approximate and may not reflect current menu prices or service charges.</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>Limitation of Liability</h2>
        <p>DATEOS LLC is not responsible for any loss, disappointment, or damages arising from reliance on AI-generated date plans. This includes but is not limited to closed venues, incorrect pricing, unavailable reservations, or unsatisfactory experiences. Use of this service is at your own risk.</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>External Links</h2>
        <p>DateOS may include links to third-party websites such as Google Maps. We are not responsible for the content, accuracy, or availability of any external sites.</p>
        <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '24px', marginBottom: '8px', color: '#000' }}>Contact</h2>
        <p>For questions or concerns: hello@dateos.io</p>
      </div>
    </div>
  );
}
