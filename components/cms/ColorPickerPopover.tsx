'use client';

import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import type { Editor } from '@tiptap/core';
import { useState } from 'react';

interface ColorPickerPopoverProps {
    editor: Editor | null;
    trigger: React.ReactNode;
    mode?: 'textColor' | 'highlight';
}

// Color options
const TEXT_COLORS = [
    { name: 'Default', value: 'inherit' },
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#666666' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Orange', value: '#ff9900' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Green', value: '#00ff00' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Purple', value: '#9900ff' },
];

const HIGHLIGHT_COLORS = [
    { name: 'Default', value: 'inherit' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Light Yellow', value: '#ffffcc' },
    { name: 'Light Green', value: '#ccffcc' },
    { name: 'Light Blue', value: '#cce5ff' },
    { name: 'Light Pink', value: '#ffcccc' },
    { name: 'Light Purple', value: '#e5ccff' },
    { name: 'Light Orange', value: '#ffe5cc' },
    { name: 'Light Gray', value: '#f2f2f2' },
];

export function ColorPickerPopover({ editor, trigger, mode = 'textColor' }: ColorPickerPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Handle color selection
    const handleColorSelect = (color: string) => {
        if (!editor) return;

        if (mode === 'highlight') {
            if (color === 'inherit') {
                editor.chain().focus().unsetHighlight().run();
            } else {
                editor.chain().focus().setHighlight({ color }).run();
            }
        } else {
            if (color === 'inherit') {
                editor.chain().focus().unsetColor().run();
            } else {
                editor.chain().focus().setColor(color).run();
            }
        }

        setIsOpen(false);
    };

    // Get current color
    const getCurrentColor = () => {
        if (!editor) return 'inherit';

        if (mode === 'highlight') {
            const attrs = editor.getAttributes('highlight');

            return attrs.color || 'inherit';
        } else {
            const attrs = editor.getAttributes('textStyle');

            return attrs.color || 'inherit';
        }
    };

    const colors = mode === 'highlight' ? HIGHLIGHT_COLORS : TEXT_COLORS;
    const currentColor = getCurrentColor();

    return (
        <Popover placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="p-2 w-48">
                <div className="grid grid-cols-3 gap-1">
                    {colors.map(({ name, value }) => (
                        <button
                            key={value}
                            onClick={() => handleColorSelect(value)}
                            className={`p-2 rounded hover:bg-gray-100 text-center ${currentColor === value ? 'ring-2 ring-blue-500' : ''}`}
                            title={name}
                        >
                            <div
                                className="w-6 h-6 rounded mx-auto mb-1"
                                style={{
                                    backgroundColor: value === 'inherit' ? 'transparent' : value,
                                    border: value === 'inherit' ? '1px dashed #666' : '1px solid rgba(0,0,0,0.1)'
                                }}
                            />
                            <span className="text-xs">{name}</span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
} 