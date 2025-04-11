import type { Metadata } from 'next';

import SignInForm from './SignInForm';

export const metadata: Metadata = {
    title: 'Oohunt-Sign In',
    description: 'Sign in to your Oohunt account'
};

export default function SignInPage() {
    return <SignInForm />;
} 