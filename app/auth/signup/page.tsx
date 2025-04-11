import type { Metadata } from 'next';

import SignUpForm from './SignUpForm';

export const metadata: Metadata = {
    title: 'Oohunt-Sign Up',
    description: 'Create a new Oohunt account'
};

export default function SignUpPage() {
    return <SignUpForm />;
} 