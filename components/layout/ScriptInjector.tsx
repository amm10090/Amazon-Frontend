"use client";

import { useEffect, useState, Fragment } from 'react';

import { ScriptLocation } from '@/lib/models/CustomScript';

// 自定义脚本接口
interface CustomScript {
    _id: string;
    name: string;
    content: string;
    location: ScriptLocation;
    enabled: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// 服务端和客户端的脚本加载器
export function HeadScripts() {
    return <ClientScriptsLoader location={ScriptLocation.HEAD} />;
}

export function BodyStartScripts() {
    return <ClientScriptsLoader location={ScriptLocation.BODY_START} />;
}

export function BodyEndScripts() {
    return <ClientScriptsLoader location={ScriptLocation.BODY_END} />;
}

// 纯客户端脚本加载器 - 注意，不返回div元素
function ClientScriptsLoader({ location }: { location: ScriptLocation }) {
    // 使用state来存储脚本内容，而不是引用DOM
    const [isLoaded, setIsLoaded] = useState(false);
    const [scriptElements, setScriptElements] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        // 防止重复加载
        if (isLoaded) return;

        // 获取并注入脚本
        const loadScripts = async () => {
            try {
                // 确保去重脚本只加载一次
                if (location === ScriptLocation.HEAD) {
                    // 只在HeadScripts注入去重辅助脚本
                    injectDeduplicatorScript();
                }

                // 获取该位置的所有脚本
                const scripts = await fetchScripts(location);

                if (scripts && scripts.length > 0) {
                    // 准备脚本元素，但不实际插入DOM
                    const elements = prepareScriptElements(scripts);

                    setScriptElements(elements);
                }

                setIsLoaded(true);
            } catch {
                setIsLoaded(true); // 即使出错也标记为已加载，防止无限重试
            }
        };

        loadScripts();
    }, [location, isLoaded]);

    // 返回Fragment而不是div，避免在head中插入div元素
    return <>{scriptElements}</>;
}

// 获取脚本数据
async function fetchScripts(location: ScriptLocation): Promise<CustomScript[]> {
    const response = await fetch(`/api/settings/custom-scripts?location=${location}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch scripts: ${response.statusText}`);
    }

    const data = await response.json();

    return data.items || [];
}

// 注入去重辅助脚本
function injectDeduplicatorScript() {
    // 避免重复注入
    if (typeof window !== 'undefined' && !window.__CUSTOM_SCRIPTS_DEDUPLICATOR_INJECTED__) {
        window.__CUSTOM_SCRIPTS_DEDUPLICATOR_INJECTED__ = true;

        const deduplicatorCode = `
      (function() {
        if (window.__CUSTOM_SCRIPTS_DEDUPLICATOR_RUNNING__) return;
        window.__CUSTOM_SCRIPTS_DEDUPLICATOR_RUNNING__ = true;
        
        // 记录已处理的脚本ID
        var processedScripts = {};
        
        // 去重函数
        function deduplicateScripts() {
          document.querySelectorAll('script[data-custom-script]').forEach(function(script) {
            var id = script.id;
            if (id && processedScripts[id]) {
              if (script.parentNode) {
                script.parentNode.removeChild(script);
              }
            } else if (id) {
              processedScripts[id] = true;
            }
          });
        }
        
        // 立即执行一次去重
        deduplicateScripts();
        
        // 监听DOM变化
        var observer = new MutationObserver(function(mutations) {
          var needsDedupe = false;
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && 
                    node.tagName === 'SCRIPT' && 
                    node.hasAttribute('data-custom-script')) {
                  needsDedupe = true;
                }
              });
            }
          });
          
          if (needsDedupe) {
            deduplicateScripts();
          }
        });
        
        // 监听整个文档
        observer.observe(document, { childList: true, subtree: true });
      })();
    `;

        // 直接在客户端创建并添加脚本
        const scriptEl = document.createElement('script');

        scriptEl.id = 'script-deduplicator';
        scriptEl.textContent = deduplicatorCode;
        document.head.appendChild(scriptEl);
    }
}

// 创建脚本元素但不立即插入DOM
function prepareScriptElements(scripts: CustomScript[]): React.ReactNode[] {
    return scripts.map(script => {
        const scriptId = `custom-script-${script._id}`;
        const content = script.content || '';

        // 判断是否为src脚本
        const srcMatch = content.match(/src=["']([^"']*)["']/);
        const isSrcScript = srcMatch && srcMatch[1];

        if (content.trim().startsWith('<script') && content.trim().endsWith('</script>')) {
            // 提取script标签内的内容
            const scriptContent = extractScriptContent(content);

            if (isSrcScript) {
                // 外部脚本，使用nonce确保安全
                const nonce = generateRandomId();
                const scriptSrc = srcMatch ? srcMatch[1] : '';

                return (
                    <script
                        key={scriptId}
                        id={scriptId}
                        src={scriptSrc}
                        data-custom-script="true"
                        data-location={script.location}
                        nonce={nonce}
                        defer={true}
                    />
                );
            } else {
                // 内联脚本
                return (
                    <script
                        key={scriptId}
                        id={scriptId}
                        dangerouslySetInnerHTML={{ __html: scriptContent }}
                        data-custom-script="true"
                        data-location={script.location}
                    />
                );
            }
        } else {
            // 纯内容脚本
            return (
                <script
                    key={scriptId}
                    id={scriptId}
                    dangerouslySetInnerHTML={{ __html: content }}
                    data-custom-script="true"
                    data-location={script.location}
                />
            );
        }
    });
}

// 提取脚本内容
function extractScriptContent(scriptTag: string): string {
    if (scriptTag.trim().startsWith('<script') && scriptTag.trim().endsWith('</script>')) {
        const openTagEnd = scriptTag.indexOf('>');
        const closeTagStart = scriptTag.lastIndexOf('<');

        if (openTagEnd !== -1 && closeTagStart !== -1) {
            return scriptTag.substring(openTagEnd + 1, closeTagStart);
        }
    }

    return scriptTag;
}

// 生成随机ID
function generateRandomId(): string {
    return Math.random().toString(36).substring(2, 9);
}

// 扩展Window接口以支持我们添加的全局变量
declare global {
    interface Window {
        __CUSTOM_SCRIPTS_DEDUPLICATOR_INJECTED__?: boolean;
        __CUSTOM_SCRIPTS_DEDUPLICATOR_RUNNING__?: boolean;
    }
}
