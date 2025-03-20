import { motion } from 'framer-motion';

interface ErrorMessageProps {
    message: string;
    retry?: () => void;
}

const ErrorMessage = ({ message, retry }: ErrorMessageProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-6 bg-error/10 rounded-lg"
        >
            <span className="text-4xl mb-4">😕</span>
            <p className="text-error font-medium mb-4">{message}</p>
            {retry && (
                <button
                    onClick={retry}
                    className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
                >
                    重试
                </button>
            )}
        </motion.div>
    );
};

export default ErrorMessage; 