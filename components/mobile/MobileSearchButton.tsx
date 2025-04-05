import { Button } from "@heroui/react";
import { Search } from "lucide-react";

interface MobileSearchButtonProps {
    toggleSearch: () => void;
}

export const MobileSearchButton: React.FC<MobileSearchButtonProps> = ({
    toggleSearch
}) => {
    return (
        <Button
            className="!w-8 !h-8 !p-1.5 text-white bg-gradient-to-r from-[#1B5479] to-[#287EB7] hover:opacity-90 rounded-lg lg:hidden min-w-[32px] max-w-[32px]"
            isIconOnly
            variant="flat"
            disableRipple
            onPress={toggleSearch}
        >
            <Search size={18} />
        </Button>
    );
};