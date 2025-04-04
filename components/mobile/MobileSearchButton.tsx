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
            className="w-8 h-8 p-1.5 text-default-500 bg-default-100/50 hover:bg-default-200/70 rounded-lg"
            isIconOnly
            variant="light"
            onPress={toggleSearch}
        >
            <Search size={20} />
        </Button>
    );
}; 