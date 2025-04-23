# CMS富文本编辑器组件

本目录包含CMS系统的富文本编辑器及相关组件，用于内容管理系统中的文本编辑功能。

## 组件概述

### 核心组件

- **RichTextEditor.tsx**: 主要的富文本编辑器组件，基于TipTap编辑器库实现，支持文本格式化、媒体插入和产品嵌入等功能。
- **ProductBlot.tsx**: 产品嵌入组件，用于在富文本中插入产品卡片。
- **ProductSelector.tsx**: 产品选择器模态框，用于在编辑过程中选择产品。

### 辅助组件

- **RichTextEditorToolbar.tsx**: 独立的编辑器工具栏组件（当前未使用，保留以备未来使用）。
- **ProductPickerModal.tsx**: 产品选择器的替代实现。

## 特性与功能

富文本编辑器支持以下功能：

- 基本文本格式化（粗体、斜体等）
- 列表（有序和无序）
- 文本对齐（左、中、右对齐）
- 链接插入和编辑
- 图片上传和插入
- 产品嵌入（从产品库中选择产品并插入）
- 撤销和重做操作

## 使用方法

### 基本用法

```tsx
import { RichTextEditor } from '@/components/cms/RichTextEditor';

function MyEditor() {
  const [content, setContent] = useState('<p>初始内容</p>');
  
  return (
    <RichTextEditor
      value={content}
      onChange={(newContent) => setContent(newContent)}
      placeholder="开始编辑内容..."
    />
  );
}
```

### 带编辑器实例访问

```tsx
import { RichTextEditor } from '@/components/cms/RichTextEditor';

function MyEditorWithInstance() {
  const [content, setContent] = useState('<p>初始内容</p>');
  const [editor, setEditor] = useState(null);
  
  const handleEditorReady = (editorInstance) => {
    setEditor(editorInstance);
    // 现在可以使用编辑器实例进行高级操作
  };
  
  return (
    <div>
      <RichTextEditor
        value={content}
        onChange={(newContent) => setContent(newContent)}
        onEditorReady={handleEditorReady}
        placeholder="开始编辑内容..."
      />
      <button onClick={() => editor?.commands.clearContent()}>
        清空编辑器
      </button>
    </div>
  );
}
```

## 产品嵌入功能

产品嵌入功能允许用户在编辑器中插入产品卡片，展示产品信息。使用步骤：

1. 点击编辑器工具栏中的"添加产品"按钮
2. 在产品选择器中选择要插入的产品
3. 产品卡片将被插入到当前光标位置

产品卡片支持以下信息展示：
- 产品名称
- 产品价格
- 产品图片
- SKU编号

## 技术实现

### 依赖库

- TipTap 编辑器框架 (@tiptap/react, @tiptap/core)
- 编辑器扩展 (@tiptap/starter-kit, @tiptap/extension-image等)
- UI组件库 (Shadcn UI)

### 架构设计

编辑器采用组件化设计，将功能分解为独立的组件：
- 核心编辑器组件处理文本编辑和格式化
- 产品节点扩展处理特殊内容的渲染
- 模态框组件处理产品选择

这种设计使得各部分职责明确，便于维护和扩展。

## 未来计划

- 添加表格支持
- 增强图片编辑功能
- 添加代码块高亮
- 优化移动端体验

## 开发指南

参考项目根目录的`INSTALLATION_GUIDE.md`文件，了解如何安装和配置开发环境。