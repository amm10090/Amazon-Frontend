'use client';

import { Card, CardHeader, CardBody } from '@heroui/react';

import ManualProductForm from '@/components/dashboard/products/ManualProductForm';

export default function ManualProductContent() {
    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold">Product Information</h2>
            </CardHeader>
            <CardBody>
                <ManualProductForm />
            </CardBody>
        </Card>
    );
} 