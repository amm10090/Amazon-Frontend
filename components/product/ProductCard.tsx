import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useUserStore } from '@/store';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        price: number;
        originalPrice: number;
        discount: number;
        image: string;
        category: string;
    };
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { favorites, addFavorite, removeFavorite } = useUserStore();
    const isFavorite = favorites.includes(product.id);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFavorite) {
            removeFavorite(product.id);
        } else {
            addFavorite(product.id);
        }
    };

    return (
        <Link href={`/product/${product.id}`}>
            <motion.div
                className="card group cursor-pointer"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* 图片容器 */}
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                    />
                    {/* 折扣标签 */}
                    <div className="absolute top-2 left-2 bg-accent text-text px-2 py-1 rounded-full text-sm font-medium">
                        -{product.discount}%
                    </div>
                    {/* 收藏按钮 */}
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background"
                    >
                        <motion.span
                            initial={false}
                            animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                            className={`text-xl ${isFavorite ? 'text-primary' : 'text-text-light'}`}
                        >
                            {isFavorite ? '❤️' : '🤍'}
                        </motion.span>
                    </button>
                </div>

                {/* 商品信息 */}
                <div className="space-y-2">
                    <h3 className="font-medium line-clamp-2">{product.title}</h3>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-primary">
                            ¥{product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-text-light line-through">
                            ¥{product.originalPrice.toFixed(2)}
                        </span>
                    </div>
                    <div className="text-sm text-text-light">{product.category}</div>
                </div>
            </motion.div>
        </Link>
    );
};

export default ProductCard; 