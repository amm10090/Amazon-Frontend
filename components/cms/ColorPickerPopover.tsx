'use client';

import { Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react';
import type { Editor } from '@tiptap/core';
import { useState, useCallback, type ReactNode, useEffect } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';

interface ColorPickerPopoverProps {
    editor: Editor | null;
    trigger: ReactNode;
    mode?: 'textColor' | 'highlight'; // 新增模式属性
    initialColor?: string; // 接受初始文本颜色 e.g., '#RRGGBB'
    defaultHighlightColor?: string; // 新增: 高亮模式下的默认颜色
}

export function ColorPickerPopover({
    editor,
    trigger,
    mode = 'textColor', // 默认为文本颜色模式
    initialColor = '#000000',
    defaultHighlightColor = '#fef3c7' // 默认高亮颜色 (黄色)
}: ColorPickerPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    // 根据模式确定初始状态的颜色
    const [currentColor, setCurrentColor] = useState<string>(
        mode === 'textColor' ? initialColor : defaultHighlightColor
    );

    // 当 Popover 打开时，尝试获取当前选区的颜色
    useEffect(() => {
        if (isOpen && editor) {
            let activeColor: string | undefined | null;

            if (mode === 'textColor') {
                activeColor = editor.getAttributes('textStyle').color;
                setCurrentColor(activeColor || initialColor);
            } else if (mode === 'highlight') {
                activeColor = editor.getAttributes('highlight').color;
                setCurrentColor(activeColor || defaultHighlightColor);
            }
        }
    }, [isOpen, editor, mode, initialColor, defaultHighlightColor]); // 添加依赖

    // 处理颜色选择器变化
    const handleColorChange = useCallback((color: ColorResult) => {
        setCurrentColor(color.hex);
    }, []);

    // 应用选中的颜色
    const handleApplyColor = useCallback(() => {
        if (!editor) return;
        const command = editor.chain().focus();

        if (mode === 'textColor') {
            command.setColor(currentColor).run();
        } else if (mode === 'highlight') {
            command.setHighlight({ color: currentColor }).run(); // 高亮需要对象参数
        }
        setIsOpen(false); // 关闭 Popover
    }, [editor, currentColor, mode]);

    // 清除颜色
    const handleClearColor = useCallback(() => {
        if (!editor) return;
        const command = editor.chain().focus();

        if (mode === 'textColor') {
            command.unsetColor().run();
        } else if (mode === 'highlight') {
            command.unsetHighlight().run();
        }
        setIsOpen(false); // 关闭 Popover
    }, [editor, mode]);

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom" showArrow>
            <PopoverTrigger>
                {/* 直接渲染 trigger，假设它是一个有效的触发元素（如按钮） */}
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none shadow-lg">
                {/* 阻止 Picker 内部点击关闭 Popover，并添加 a11y 属性 */}
                <div
                    role="group" // 添加 role
                    tabIndex={0} // 使其可聚焦
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()} // 添加键盘事件处理器
                    aria-label="颜色选择器控件组" // 提供描述
                >
                    <SketchPicker
                        color={currentColor}
                        onChangeComplete={handleColorChange}
                        presetColors={[]} // 禁用预设颜色
                        disableAlpha // 禁用透明度选择
                    />
                    <div className="flex justify-end gap-2 p-2 bg-white border-t border-gray-200">
                        <Button size="sm" variant="bordered" onPress={handleClearColor}>
                            Clear
                        </Button>
                        <Button size="sm" variant="solid" color="primary" onPress={handleApplyColor}>
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
} 