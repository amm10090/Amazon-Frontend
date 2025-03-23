import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

import { useUserStore } from '@/store';

import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { theme } = useUserStore();

    return (
        <div data-theme={theme}>
            <Header />
            <main className="min-h-screen pt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

export default Layout; 