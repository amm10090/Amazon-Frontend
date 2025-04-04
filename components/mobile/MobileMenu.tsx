import { NavbarMenu } from "@heroui/navbar";
import { Link } from "@heroui/react";

import AuthStatus from "@/components/auth/AuthStatus";
import { siteConfig } from "@/config/site";

interface MobileMenuProps {
    isMenuOpen: boolean;
    isCurrentPage: (href: string) => boolean;
    handleNavigation: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
    isMenuOpen,
    isCurrentPage,
    handleNavigation
}) => {
    if (!isMenuOpen) return null;

    return (
        <NavbarMenu className="z-[9999]">
            <div className="px-4 flex flex-col max-w-[1400px] ml-0">
                <h3 className="text-gray-500 text-sm font-medium mb-2 mt-1 text-left">Menu</h3>

                <div className="flex flex-col space-y-1 mb-4">
                    {siteConfig.navMenuItems
                        .filter(item => !isCurrentPage(item.href))
                        .map((item) => (
                            <Link
                                key={item.label || `menu-item-${item.href}`}
                                className="w-full px-3 py-2.5 text-base text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-left"
                                href={item.href}
                                onClick={handleNavigation}
                            >
                                {item.label}
                            </Link>
                        ))}
                </div>

                {/* Mobile Auth Status */}
                <div className="pt-2 border-t border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium mb-2 mt-1 text-left">Account</h3>
                    <div className="flex w-full">
                        <AuthStatus isMobileMenu={true} onNavigate={handleNavigation} />
                    </div>
                </div>
            </div>
        </NavbarMenu>
    );
}; 