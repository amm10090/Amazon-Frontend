'use client';

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    ScrollShadow,
    Tab,
    Tabs
} from '@heroui/react';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

import type { ComponentProduct } from '@/types';

import { METADATA_FIELDS } from './ProductMetadataBlot';

interface ProductMetadataSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    product: ComponentProduct | null;
    onSelect: (fieldId: string) => void;
}

export function ProductMetadataSelector({
    isOpen,
    onClose,
    product,
    onSelect
}: ProductMetadataSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('basic');

    // 过滤字段
    const filteredFields = useMemo(() => {
        const query = searchQuery.toLowerCase();

        if (!query) return METADATA_FIELDS;

        const result = Object.entries(METADATA_FIELDS).reduce((acc, [category, fields]) => {
            const matchedFields = fields.filter(field =>
                field.name.toLowerCase().includes(query) ||
                field.id.toLowerCase().includes(query)
            );

            if (matchedFields.length > 0) {
                return {
                    ...acc,
                    [category]: matchedFields
                };
            }

            return acc;
        }, {} as Partial<typeof METADATA_FIELDS>) as typeof METADATA_FIELDS;

        return result;
    }, [searchQuery]);

    // 处理字段选择
    const handleFieldSelect = (fieldId: string) => {
        onSelect(fieldId);
        onClose();
    };

    // 修改渲染部分，使用类型安全的字段访问
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderFieldValue = (field: { id: string; render: (value: any) => string }, value: any) => {
        try {
            return field.render(value);
        } catch {
            return '格式错误';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                <ModalHeader>
                    <h3 className="text-lg font-medium">选择产品元数据</h3>
                </ModalHeader>

                <ModalBody>
                    {/* 搜索框 */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="搜索字段..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* 选项卡 */}
                    <Tabs selectedKey={selectedTab} onSelectionChange={key => setSelectedTab(key as string)}>
                        <Tab key="basic" title="基本信息">
                            <ScrollShadow className="h-[300px]">
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredFields.basic?.map(field => (
                                        <button
                                            key={field.id}
                                            onClick={() => handleFieldSelect(field.id)}
                                            className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="font-medium text-sm">{field.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {renderFieldValue(field, product?.[field.id as keyof ComponentProduct])}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollShadow>
                        </Tab>
                        <Tab key="price" title="价格信息">
                            <ScrollShadow className="h-[300px]">
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredFields.price?.map(field => (
                                        <button
                                            key={field.id}
                                            onClick={() => handleFieldSelect(field.id)}
                                            className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="font-medium text-sm">{field.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {renderFieldValue(field, Number(product?.[field.id as keyof ComponentProduct] || 0))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollShadow>
                        </Tab>
                        <Tab key="shipping" title="配送信息">
                            <ScrollShadow className="h-[300px]">
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredFields.shipping?.map(field => (
                                        <button
                                            key={field.id}
                                            onClick={() => handleFieldSelect(field.id)}
                                            className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="font-medium text-sm">{field.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {renderFieldValue(field, Boolean(product?.[field.id as keyof ComponentProduct] || false))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollShadow>
                        </Tab>
                        <Tab key="coupon" title="优惠信息">
                            <ScrollShadow className="h-[300px]">
                                <div className="grid grid-cols-2 gap-2">
                                    {filteredFields.coupon?.map(field => (
                                        <button
                                            key={field.id}
                                            onClick={() => handleFieldSelect(field.id)}
                                            className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="font-medium text-sm">{field.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {renderFieldValue(field, product?.[field.id as keyof ComponentProduct] || null)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollShadow>
                        </Tab>
                    </Tabs>
                </ModalBody>

                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        取消
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
} 