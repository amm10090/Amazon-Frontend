import * as React from 'react';

interface SubscriptionEmailProps {
    email: string;
}

export const SubscriptionEmail: React.FC<Readonly<SubscriptionEmailProps>> = ({
    email,
}) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#333' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#16A085', margin: '0 0 10px' }}>Welcome to Our Newsletter!</h1>
                <p style={{ fontSize: '16px', color: '#666' }}>Thank you for subscribing.</p>
            </div>

            <div style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                <p>Hello <strong>{email}</strong>,</p>
                <p>Thank you for subscribing to our newsletter. You will now receive the latest deals and offers directly to your inbox.</p>
                <p>We&apos;re excited to share amazing deals with you soon!</p>
            </div>

            <div style={{ backgroundColor: '#16A085', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
                <a
                    href="https://example.com/deals"
                    style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}
                >
                    Check Out Today&apos;s Deals
                </a>
            </div>

            <div style={{ marginTop: '30px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
                <p>If you didn&apos;t subscribe to our newsletter, you can ignore this email.</p>
                <p>
                    © 2023 Amazon Deals Newsletter. All rights reserved.<br />
                    Our company address, City, Country
                </p>
            </div>
        </div>
    </div>
); 