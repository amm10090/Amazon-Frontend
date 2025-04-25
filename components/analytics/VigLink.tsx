'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function VigLink() {
    // 仅在生产环境中加载VigLink脚本
    const [isProduction, setIsProduction] = useState(false);

    useEffect(() => {
        // 客户端组件中检查环境
        setIsProduction(process.env.NODE_ENV === 'production');
    }, []);

    // 从环境变量获取VigLink密钥
    const VIGLINK_KEY = process.env.NEXT_PUBLIC_VIGLINK_KEY || '';

    // 如果不是生产环境，则不显示VigLink
    if (!isProduction) {
        return null;
    }

    return (
        <Script
            id="viglink-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
                    var vglnk = {key: '${VIGLINK_KEY}'};
                    (function(d, t) {
                        var s = d.createElement(t);
                        s.type = 'text/javascript';
                        s.async = true;
                        s.src = '//cdn.viglink.com/api/vglnk.js';
                        var r = d.getElementsByTagName(t)[0];
                        r.parentNode.insertBefore(s, r);
                    }(document, 'script'));
                `,
            }}
        />
    );
} 