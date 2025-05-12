'use client';

import { Input, Textarea, Button, Switch, Select, SelectItem, DateInput, Form, NumberInput } from "@heroui/react"; // 添加 Form 组件
import { zodResolver } from '@hookform/resolvers/zod';
import { TrashIcon } from 'lucide-react'; // 添加 Globe 图标
import React, { useState } from 'react'; // 添加 useEffect
import { useForm, useFieldArray, Controller, type Resolver, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
// 使用 HeroUI 组件 (Use HeroUI components)

import { revalidateProductsList } from '@/app/actions/revalidateProducts'; // 导入 Server Action
import CoverImageUploader from '@/components/dashboard/cms/pages/CoverImageUploader'; // 导入图片上传组件
import { productsApi } from '@/lib/api'; // Verify API import path
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { ProductInfo, ProductOffer } from '@/types/api'; // Verify type import path

// 定义 Offer 的 Zod Schema (Define Zod Schema for Offer)
const productOfferSchema = z.object({
    condition: z.string().min(1, { message: 'Condition is required' }).default('New'),
    price: z.preprocess( // 预处理以允许字符串输入，然后验证数字
        (val: unknown) => (typeof val === 'string' && val !== '' ? parseFloat(val) : typeof val === 'number' ? val : undefined), // Add explicit type 'unknown' and handle number input
        z.number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' }).positive({ message: 'Price must be positive' })
    ), // 售价
    currency: z.string().min(1, { message: 'Currency is required' }).default('USD'), // 货币
    availability: z.string().min(1, { message: 'Availability is required' }), // 库存状况
    merchant_name: z.string().min(1, { message: 'Merchant Name is required' }), // 卖家名称
    original_price: z.preprocess( // 预处理
        (val: unknown) => (typeof val === 'string' && val !== '' ? parseFloat(val) : typeof val === 'number' ? val : undefined), // Add explicit type 'unknown' and handle number input
        z.number().positive().optional()
    ), // 原价 (可选)
    savings: z.preprocess( // 预处理
        (val: unknown) => (typeof val === 'string' && val !== '' ? parseFloat(val) : typeof val === 'number' ? val : undefined), // Add explicit type 'unknown' and handle number input
        z.number().positive().optional()
    ), // 节省金额 (可选)
    savings_percentage: z.preprocess( // 预处理
        (val: unknown) => (typeof val === 'string' && val !== '' ? parseInt(val, 10) : typeof val === 'number' ? val : undefined), // Add explicit type 'unknown' and handle number input
        z.number().int().min(0).max(100).optional()
    ), // 折扣百分比 (可选)
    is_prime: z.boolean().optional().default(false), // 是否Prime (可选)
    coupon_type: z.enum(['percentage', 'fixed']).optional().nullable(), // 优惠券类型 (可选, 允许 null)
    coupon_value: z.preprocess( // 预处理
        (val: unknown) => (typeof val === 'string' && val !== '' ? parseFloat(val) : typeof val === 'number' ? val : undefined), // Add explicit type 'unknown' and handle number input
        z.number().positive().optional()
    ), // 优惠券面值 (可选)
    commission: z.string().optional(), // CJ 佣金 (可选) - 假设为字符串
});

// 定义 ProductInfo 的 Zod Schema (Define Zod Schema for ProductInfo)
const productInfoSchema = z.object({
    asin: z.string().optional(), // ASIN (必需) -> ASIN (Optional)
    title: z.string().min(1, { message: 'Title is required' }), // 标题 (必需)
    url: z.string().url({ message: 'Invalid URL format' }), // URL (必需, 验证格式)
    offers: z.array(productOfferSchema).min(1, { message: 'At least one offer is required' }), // Offers (必需, 至少一个)
    brand: z.string().optional(), // 品牌 (可选)
    main_image: z.string().url({ message: 'Invalid URL format' }).optional().or(z.literal('')), // 主图链接 (可选, 验证格式, 允许空字符串)
    timestamp: z.string().optional(), // 时间戳 (在提交时自动生成)
    binding: z.string().optional(), // 绑定类型 (可选)
    product_group: z.string().optional(), // 商品分组 (可选)
    categories: z.preprocess( // 预处理逗号分隔字符串为数组
        (val: unknown) => (typeof val === 'string' && val.length > 0 ? val.split(',').map(s => s.trim()).filter(Boolean) : []), // Add explicit type 'unknown'
        z.array(z.string()).optional()
    ), // 分类 (可选)
    browse_nodes: z.preprocess( // 预处理JSON字符串
        (val: unknown) => { // Add explicit type 'unknown'
            if (typeof val === 'string' && val.trim().startsWith('[')) {
                try { return JSON.parse(val); } catch { /* ignore error */ }
            }

            return undefined; // 返回 undefined 让 optional 生效
        },
        z.array(z.object({ id: z.string().min(1), name: z.string().min(1) })).optional() // 必须是对象数组 {id, name} (可选)
    ),
    features: z.preprocess( // 预处理逗号分隔字符串为数组
        (val: unknown) => (typeof val === 'string' && val.length > 0 ? val.split(',').map(s => s.trim()).filter(Boolean) : []), // Add explicit type 'unknown'
        z.array(z.string()).optional()
    ), // 特性 (可选)
    cj_url: z.string().url({ message: 'Invalid URL format' }).optional().or(z.literal('')), // CJ URL (可选, 验证格式, 允许空字符串)
    api_provider: z.enum(['manual', 'pa-api', 'cj-api'], { invalid_type_error: 'Invalid API provider' }).optional().default('manual'), // API 提供者 (可选)
    source: z.enum(['manual', 'coupon', 'discount'], { invalid_type_error: 'Invalid source' }).optional().default('manual'), // 数据来源 (可选)
    coupon_expiration_date: z.any().optional().nullable(), // 优惠券过期日期 (可选，使用 any 类型接受 ZonedDateTime)
    coupon_terms: z.string().optional(), // 优惠券条款 (可选)
    raw_data: z.preprocess( // 预处理JSON字符串
        (val: unknown) => { // Add explicit type 'unknown'
            if (typeof val === 'string' && val.trim().startsWith('{')) {
                try { return JSON.parse(val); } catch { /* ignore error */ }
            }

            return undefined; // 返回 undefined 让 optional 生效
        },
        z.record(z.unknown()).optional() // 必须是JSON对象 (可选)
    ),
});

// 从 Zod Schema 推断 TypeScript 类型 (Infer TypeScript type from Zod Schema)
type ProductFormData = z.infer<typeof productInfoSchema>;

// Helper type for offer mapping
type MappedOffer = Omit<ProductOffer, 'price'> & { price: number };

const ManualProductForm: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productInfoSchema) as Resolver<ProductFormData>,
        defaultValues: {
            // 设置默认值 (Set default values)
            asin: '',
            title: '',
            url: '',
            offers: [{ // 默认添加一个空的 offer (Default add one empty offer)
                condition: 'New',
                price: 0, // 使用数字0作为初始值
                currency: 'USD',
                availability: '',
                merchant_name: '',
                is_prime: false,
                coupon_type: null, // Default to null
            }],
            api_provider: 'manual',
            source: 'manual',
            categories: [],
            features: [],
            coupon_expiration_date: null, // 初始为 null
        },
    });

    // useFieldArray 用于管理 offers 动态数组 (Used to manage offers dynamic array)
    const { fields: offerFields, append: appendOffer, remove: removeOffer } = useFieldArray({
        control,
        name: "offers",
    });

    // 表单提交处理函数 (Form submission handler)
    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        setIsLoading(true);
        setServerErrors({});

        // 获取当前时间戳字符串 (获取标准 UTC ISO 8601 格式)
        const currentTimestamp = new Date().toISOString(); // 使用标准 Date API 获取 UTC 时间戳

        // 格式化数据以匹配 API 期望的 ProductInfo 结构 (Format data to match expected ProductInfo structure)
        const formattedData: ProductInfo = {
            ...data,
            asin: data.asin ?? '', // Handle optional ASIN, provide fallback
            // Zod schema 的 preprocess 已经处理了 categories, features, browse_nodes, raw_data
            browse_nodes: data.browse_nodes || undefined, // 处理空数组情况 (Handle empty array case)
            raw_data: data.raw_data || undefined, // 处理空对象情况 (Handle empty object case)
            // 将时区日期对象转换为 ISO 字符串 (Convert ZonedDateTime objects to ISO strings)
            timestamp: currentTimestamp, // 自动设置当前时间戳
            coupon_expiration_date: data.coupon_expiration_date
                ? (data.coupon_expiration_date as { toDate: () => Date }).toDate().toISOString()
                : undefined,
            // 确保 offers 数组中的 price 和其他 number 字段在发送前确实是数字 (Ensure numeric fields are numbers)
            offers: data.offers.map((offer: ProductFormData['offers'][number]) => ({
                ...offer,
                price: typeof offer.price === 'number' && offer.price > 0 ? offer.price :
                    (() => { throw new Error('Price must be a valid number'); })(),
                coupon_type: offer.coupon_type ?? undefined,
            } as MappedOffer)),
        };


        try {
            const response = await productsApi.manualAddProduct(formattedData);

            // 后端可能返回 200 OK 或 201 Created
            if (response.status === 201 || response.status === 200) {
                showSuccessToast({
                    title: 'Success!',
                    description: 'Product added successfully.',
                });
                reset(); // 成功后重置表单 (Reset form on success)

                // --- 触发缓存重新验证 ---
                try {
                    await revalidateProductsList();
                } catch {
                    // 可以选择性地显示一个错误提示，告知用户列表可能不会立即更新
                    showErrorToast({
                        title: 'Cache Revalidation Pending',
                        description: 'Product list may take a moment to update.'
                    });
                }
                // --- 结束触发缓存重新验证 ---

            } else {
                // 处理非 2xx 但可能是成功的响应 (或者后端直接在错误时抛出)
                const errorMessage = (response.data as { message?: string; detail?: string })?.message ||
                    (response.data as { message?: string; detail?: string })?.detail ||
                    'Failed to add product. Unexpected status.';

                showErrorToast({
                    title: `Error: ${response.status || 'Request Failed'}`,
                    description: errorMessage,
                });
            }
        } catch (error: unknown) {
            let errorMessage = 'An unexpected error occurred.';

            // 处理Axios错误
            const axiosError = error as {
                response?: {
                    data?: { detail?: string | Array<{ loc: string[]; msg: string; type: string }> };
                    status?: number
                };
                request?: unknown;
                message?: string
            };

            if (axiosError.response) {
                // 处理 Axios 错误响应 (Handle Axios error response)
                const detail = axiosError.response.data?.detail;
                const status = axiosError.response.status;

                if (status === 409) { // Conflict (ASIN exists)
                    errorMessage = (typeof detail === 'string' ? detail : '') || 'ASIN already exists.';
                    setServerErrors({ asin: errorMessage });
                } else if (status === 400) { // Bad Request (generic)
                    errorMessage = (typeof detail === 'string' ? detail : '') || 'Invalid data provided.';
                } else if (status === 422) { // FastAPI Validation Error
                    // 尝试提取更详细的 FastAPI 验证信息 (Try to extract detailed FastAPI validation info)
                    if (Array.isArray(detail)) {
                        try {
                            // 提取具体字段错误并设置serverErrors

                            const errors: Record<string, string> = {};

                            detail.forEach(err => {
                                // 跳过'body'部分，获取实际字段路径

                                const fieldPath = err.loc.slice(1).join('.');

                                errors[fieldPath] = err.msg;
                            });
                            setServerErrors(errors);
                            errorMessage = 'Please correct the errors in the form.';
                        } catch {
                            errorMessage = JSON.stringify(detail); // Fallback
                        }
                    } else {
                        errorMessage = detail || 'Validation failed.';
                    }
                } else if (status === 500) {
                    errorMessage = (typeof detail === 'string' ? detail : '') || 'Internal server error.';
                } else {
                    errorMessage = (typeof detail === 'string' ? detail : '') || `Server error: ${status}`;
                }
            } else if (axiosError.request) {
                errorMessage = 'No response received from server.';
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
            }
            showErrorToast({
                title: 'Error',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 调试用: 打印表单错误 (Debug: print form errors)
    // React.useEffect(() => {
    //    if (Object.keys(errors).length > 0) {
    //        console.log("Form Errors:", errors);
    //    }
    // }, [errors]);

    return (
        <Form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
            validationBehavior="aria" // 使用ARIA验证行为，提供实时错误反馈
            validationErrors={serverErrors} // 添加服务器错误
        >
            {/* 区域 A: 基本产品信息 */}
            <div className="border rounded-md p-4 space-y-4 md:col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6">
                    <Input
                        {...register("asin")}
                        label="ASIN (Optional)"
                        placeholder="Enter product ASIN"
                        isInvalid={!!errors.asin}
                        errorMessage={errors.asin?.message}
                        labelPlacement="outside-left"
                        variant="bordered" // HeroUI 支持 bordered
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                    <Input
                        {...register("title")}
                        label="Title"
                        placeholder="Enter product title"
                        isRequired
                        isInvalid={!!errors.title}
                        errorMessage={errors.title?.message}
                        labelPlacement="outside-left"
                        variant="bordered"
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                    <Input
                        {...register("url")}
                        label="Source URL"
                        placeholder="https://www.example.com/product/..."
                        type="url"
                        isRequired
                        isInvalid={!!errors.url}
                        errorMessage={errors.url?.message}
                        labelPlacement="outside-left"
                        variant="bordered"
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                    <Input
                        {...register("brand")}
                        label="Brand"
                        placeholder="Enter brand name (optional)"
                        isInvalid={!!errors.brand}
                        errorMessage={errors.brand?.message}
                        labelPlacement="outside-left"
                        variant="bordered"
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                </div>
            </div>

            {/* 区域 C: 更多产品信息 */}
            <div className="border rounded-md p-4 space-y-4 md:col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 gap-6">
                    <Input
                        {...register("binding")}
                        label="Binding"
                        placeholder="e.g., Electronics (optional)"
                        isInvalid={!!errors.binding}
                        errorMessage={errors.binding?.message}
                        labelPlacement="outside-left"
                        variant="bordered"
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                    <Input
                        {...register("product_group")}
                        label="Product Group"
                        placeholder="e.g., Test Products (optional)"
                        isInvalid={!!errors.product_group}
                        errorMessage={errors.product_group?.message}
                        labelPlacement="outside-left"
                        variant="bordered"
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                    <Input
                        {...register("cj_url")}
                        label="CJ Affiliate URL"
                        placeholder="https://... (optional)"
                        type="url"
                        isInvalid={!!errors.cj_url}
                        errorMessage={errors.cj_url?.message}
                        labelPlacement="outside-left"
                        variant="bordered"
                        className="w-full" // Added w-full
                        classNames={{ inputWrapper: "flex-1" }} // Added for internal width
                    />
                    <Controller
                        name="api_provider"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="API Provider"
                                placeholder="Select API provider"
                                selectedKeys={field.value ? [field.value] : []}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.api_provider}
                                errorMessage={errors.api_provider?.message}
                                labelPlacement="outside-left"
                                variant="bordered"
                                className="w-full" // Added w-full
                                classNames={{ trigger: "flex-1" }} // Added for internal width
                            >
                                <SelectItem key="pa-api">PA-API</SelectItem>
                                <SelectItem key="cj-api">CJ-API</SelectItem>
                            </Select>
                        )}
                    />
                    <Controller
                        name="source"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Discount Type"
                                placeholder="Select data source"
                                selectedKeys={field.value ? [field.value] : []}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                isInvalid={!!errors.source}
                                errorMessage={errors.source?.message}
                                labelPlacement="outside-left"
                                variant="bordered"
                                className="w-full" // Added w-full
                                classNames={{ trigger: "flex-1" }} // Added for internal width
                            >
                                <SelectItem key="coupon">Coupon</SelectItem>
                                <SelectItem key="discount">Discount</SelectItem>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* 区域 B: 图片上传 */}
            <div className="border rounded-md p-4 space-y-4 md:col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Cover Image</h3>
                <Controller
                    name="main_image"
                    control={control}
                    render={({ field }) => (
                        <CoverImageUploader
                            currentImageUrl={field.value || ''} // Provide current value to the uploader
                            onImageUploaded={(url) => field.onChange(url)} // Update form state on upload
                        />
                        // 可以考虑在这里添加错误信息显示，如果需要的话
                        // {errors.main_image && <p className="text-tiny text-danger mt-1">{errors.main_image.message}</p>}
                    )}
                />
                {/* 显示 main_image 字段本身的错误 */}
                {errors.main_image && (
                    <p className="mt-1 text-xs text-red-500">{errors.main_image.message}</p>
                )}
            </div>

            {/* 区域 D: 分类与特性 */}
            <div className="border rounded-md p-4 space-y-4 md:col-span-2 lg:col-span-6">
                <h3 className="text-lg font-semibold mb-2">Categories & Features</h3>
                <div className="space-y-4">
                    <Textarea
                        {...register("categories")}
                        label="Categories (comma-separated, optional)"
                        placeholder="e.g., Electronics, Test Category"
                        isInvalid={!!errors.categories}
                        errorMessage={errors.categories?.message as string | undefined}
                        variant="bordered"
                    />
                    <Textarea
                        {...register("features")}
                        label="Features (comma-separated, optional)"
                        placeholder="e.g., Feature 1, Feature 2"
                        isInvalid={!!errors.features}
                        errorMessage={errors.features?.message as string | undefined}
                        variant="bordered"
                    />
                    <Textarea
                        {...register("browse_nodes")}
                        label="Browse Nodes (JSON Array, optional)"
                        placeholder="e.g., [{&quot;id&quot;: &quot;123&quot;, &quot;name&quot;: &quot;Test Node&quot;}]"
                        isInvalid={!!errors.browse_nodes}
                        errorMessage={errors.browse_nodes ? `Must be a valid JSON array like '[{"id": "...", "name": "..."}]'` : undefined}
                        variant="bordered"
                        minRows={2} // Assuming HeroUI Textarea has minRows
                    />
                    <Textarea
                        {...register("raw_data")}
                        label="Raw Data (JSON Object, optional)"
                        placeholder="e.g., {&quot;key&quot;: &quot;value&quot;}"
                        isInvalid={!!errors.raw_data}
                        errorMessage={errors.raw_data ? `Must be a valid JSON object like '{"key": "value"}'` : undefined}
                        variant="bordered"
                        minRows={2} // Assuming HeroUI Textarea has minRows
                    />
                </div>
            </div>

            {/* 区域 E: 优惠券信息 */}
            <div className="border rounded-md p-4 space-y-4 md:col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Coupon Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 sm:col-span-2"> {/* 让日期选择器占满整行 */}
                        <label className="text-sm font-medium">Coupon Expiration Date (Optional)</label>
                        <Controller
                            name="coupon_expiration_date"
                            control={control}
                            render={({ field }) => (
                                <DateInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    variant="bordered"
                                    isInvalid={!!errors.coupon_expiration_date}
                                    errorMessage={errors.coupon_expiration_date?.message?.toString()}
                                    granularity="second"
                                    labelPlacement="outside-left"
                                />
                            )}
                        />
                    </div>
                    <div className="sm:col-span-2"> {/* 让 Coupon Terms 占满整行 */}
                        <Input
                            {...register("coupon_terms")}
                            label="Coupon Terms (optional)"
                            placeholder="e.g., Minimum spend $100"
                            isInvalid={!!errors.coupon_terms}
                            errorMessage={errors.coupon_terms?.message}
                            labelPlacement="outside-left"
                            variant="bordered"
                        />
                    </div>
                </div>
            </div>

            {/* 区域 F: Offers 列表 */}
            <div className="border rounded-md space-y-4 md:col-span-2 lg:col-span-4 p-4"> {/* 添加 P-4 */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Offers (at least one required)</h3>
                    {/* 添加 Offer 按钮 (Add Offer Button) */}
                    <Button
                        color="primary"
                        variant="ghost" // HeroUI supports ghost variant
                        size="sm" // HeroUI supports size
                        onPress={() => appendOffer({ // Use onPress for HeroUI Button
                            condition: 'New',
                            price: 0, // 使用数字0作为初始值
                            currency: 'USD',
                            availability: '',
                            merchant_name: '',
                            is_prime: false,
                            coupon_type: null,
                        })}
                    >
                        Add Offer
                    </Button>
                </div>
                {/* 显示 Offers 级别的错误 (Display Offers level error) */}
                {errors.offers && !Array.isArray(errors.offers) && (
                    <p className="text-tiny text-danger">{errors.offers.message}</p> // Assuming text-tiny and text-danger work with Tailwind setup
                )}

                {offerFields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-4 relative bg-content1/5 dark:bg-content1/10"> {/* Check if bg-content1 classes exist */}
                        {/* 删除 Offer 按钮 (Delete Offer Button) */}
                        {offerFields.length > 1 && (
                            <Button
                                color="danger" // HeroUI supports danger color
                                variant="light" // HeroUI supports light variant
                                onPress={() => removeOffer(index)} // Use onPress
                                isIconOnly // HeroUI supports isIconOnly
                                size="sm"
                                className="absolute top-1 right-1 z-10" // Positioning should work
                            >
                                <TrashIcon size={16} />
                            </Button>
                        )}
                        {/* Offer 字段 (Offer Fields) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2"> {/* 增加上边距, 移除 xl:grid-cols-3, 增加垂直间距 */}
                            <Controller // 使用 Controller 包裹 Select
                                name={`offers.${index}.condition`}
                                control={control}
                                rules={{ required: 'Condition is required' }} // 添加 RHF 级别的 required
                                render={({ field }) => (
                                    <Select
                                        // 使用 HeroUI Select props
                                        label="Condition"
                                        placeholder="Select condition"
                                        isRequired
                                        isInvalid={!!errors.offers?.[index]?.condition}
                                        errorMessage={errors.offers?.[index]?.condition?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered" // HeroUI supports bordered
                                        selectedKeys={field.value ? [field.value] : []}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)} // Add explicit type for event
                                        onBlur={field.onBlur} // 添加 onBlur
                                        value={field.value ?? ""} // Select might need controlled value prop like this
                                    >
                                        {/* 添加常见的 Condition 选项 */}
                                        <SelectItem key="New">New</SelectItem>
                                        <SelectItem key="Used - Like New">Used - Like New</SelectItem>
                                        <SelectItem key="Used - Very Good">Used - Very Good</SelectItem>
                                        <SelectItem key="Used - Good">Used - Good</SelectItem>
                                        <SelectItem key="Used - Acceptable">Used - Acceptable</SelectItem>
                                        <SelectItem key="Refurbished">Refurbished</SelectItem>
                                    </Select>
                                )}
                            />
                            <Controller
                                name={`offers.${index}.price`}
                                control={control}
                                rules={{ required: 'Price is required' }}
                                render={({ field }) => (
                                    <NumberInput
                                        label="Price"
                                        placeholder="e.g., 99.99"
                                        isRequired
                                        isInvalid={!!errors.offers?.[index]?.price}
                                        errorMessage={errors.offers?.[index]?.price?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered"
                                        step={0.01}
                                        minValue={0.01}
                                        value={field.value ?? 0}
                                        onValueChange={(value: number | null | undefined) => field.onChange(value ?? 0)}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                            <Input
                                {...register(`offers.${index}.currency`)}
                                label="Currency"
                                placeholder="e.g., USD"
                                isRequired
                                isInvalid={!!errors.offers?.[index]?.currency}
                                errorMessage={errors.offers?.[index]?.currency?.message}
                                labelPlacement="outside-left"
                                variant="bordered"
                            />
                            <Input
                                {...register(`offers.${index}.availability`)}
                                label="Availability"
                                placeholder="e.g., In Stock"
                                isRequired
                                isInvalid={!!errors.offers?.[index]?.availability}
                                errorMessage={errors.offers?.[index]?.availability?.message}
                                labelPlacement="outside-left"
                                variant="bordered"
                            />
                            <Input
                                {...register(`offers.${index}.merchant_name`)}
                                label="Merchant Name"
                                placeholder="e.g., Amazon.com"
                                isRequired
                                isInvalid={!!errors.offers?.[index]?.merchant_name}
                                errorMessage={errors.offers?.[index]?.merchant_name?.message}
                                labelPlacement="outside-left"
                                variant="bordered"
                            />
                            <Controller
                                name={`offers.${index}.original_price`}
                                control={control}
                                render={({ field }) => (
                                    <NumberInput
                                        label="Original Price (Optional)"
                                        placeholder="e.g., 129.99"
                                        isInvalid={!!errors.offers?.[index]?.original_price}
                                        errorMessage={errors.offers?.[index]?.original_price?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered"
                                        step={0.01}
                                        minValue={0}
                                        value={field.value ?? undefined}
                                        onValueChange={(value) => field.onChange(value ?? undefined)}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                            <Controller
                                name={`offers.${index}.savings`}
                                control={control}
                                render={({ field }) => (
                                    <NumberInput
                                        label="Savings Amount (Optional)"
                                        placeholder="e.g., 30.00"
                                        isInvalid={!!errors.offers?.[index]?.savings}
                                        errorMessage={errors.offers?.[index]?.savings?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered"
                                        step={0.01}
                                        minValue={0}
                                        value={field.value ?? undefined}
                                        onValueChange={(value) => field.onChange(value ?? undefined)}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                            <Controller
                                name={`offers.${index}.savings_percentage`}
                                control={control}
                                render={({ field }) => (
                                    <NumberInput
                                        label="Savings Percentage (Optional)"
                                        placeholder="e.g., 23"
                                        isInvalid={!!errors.offers?.[index]?.savings_percentage}
                                        errorMessage={errors.offers?.[index]?.savings_percentage?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered"
                                        step={1}
                                        minValue={0}
                                        maxValue={100}
                                        value={field.value ?? undefined}
                                        onValueChange={(value) => field.onChange(value ?? undefined)}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                            <Controller // 使用 Controller 包裹 Select
                                name={`offers.${index}.coupon_type`}
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        // 使用 HeroUI Select props
                                        label="Coupon Type (Optional)"
                                        placeholder="Select coupon type"
                                        isInvalid={!!errors.offers?.[index]?.coupon_type}
                                        errorMessage={errors.offers?.[index]?.coupon_type?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered"
                                        selectedKeys={field.value ? [field.value] : []} // 控制 Select 的值
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value || null)} // Add explicit type, 更新 react-hook-form, 处理空值
                                        value={field.value ?? ""} // 确保 Select 显示正确
                                        onBlur={field.onBlur} // 添加 onBlur
                                    >
                                        {/* 添加空选项，允许清除选择 */}
                                        <SelectItem key="">None</SelectItem>
                                        <SelectItem key="percentage">Percentage</SelectItem>
                                        <SelectItem key="fixed">Fixed Amount</SelectItem>
                                    </Select>
                                )}
                            />
                            <Controller
                                name={`offers.${index}.coupon_value`}
                                control={control}
                                render={({ field }) => (
                                    <NumberInput
                                        label="Coupon Value (Optional)"
                                        placeholder="Value based on type"
                                        isInvalid={!!errors.offers?.[index]?.coupon_value}
                                        errorMessage={errors.offers?.[index]?.coupon_value?.message}
                                        labelPlacement="outside-left"
                                        variant="bordered"
                                        step={0.01}
                                        minValue={0}
                                        value={field.value ?? undefined}
                                        onValueChange={(value) => field.onChange(value ?? undefined)}
                                        onBlur={field.onBlur}
                                        classNames={{ input: 'min-w-[80px]' }}
                                    />
                                )}
                            />
                            <Controller // 使用 Controller 包裹 Switch
                                name={`offers.${index}.is_prime`}
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center pt-6"> {/* 调整对齐 */}
                                        <Switch
                                            // 使用 HeroUI Switch props
                                            isSelected={field.value}
                                            onValueChange={field.onChange} // HeroUI uses onValueChange
                                            color="primary" // HeroUI supports color
                                        >
                                            Is Prime? (Optional)
                                        </Switch>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 15. 16. 响应式提交按钮 */}
            <div className="md:col-span-2 lg:col-span-6 pt-4 flex justify-center sm:justify-end">
                <Button
                    type="submit"
                    color="primary"
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    {isLoading ? 'Submitting...' : 'Add Product'}
                </Button>
            </div>
        </Form>
    );
};

export default ManualProductForm;