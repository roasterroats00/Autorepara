'use client';

import Header from "./Header";
import Footer from "./Footer";

interface PageWrapperProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
}

export default function PageWrapper({
    children,
    showHeader = true,
    showFooter = true,
}: PageWrapperProps) {
    return (
        <>
            {showHeader && <Header />}
            <main className="min-h-screen bg-mf-dark">
                {children}
            </main>
            {showFooter && <Footer />}
        </>
    );
}
