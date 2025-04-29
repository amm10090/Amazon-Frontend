import { ObjectId } from 'mongodb';
import Script from 'next/script';
import { cache } from 'react';

import { ScriptLocation } from '@/lib/models/CustomScript';
import clientPromise from '@/lib/mongodb';

// Define script data interface
interface ScriptData {
    _id: string;
    name: string;
    content: string;
    location: ScriptLocation;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Use React cache function to cache database query results
export const getActiveScripts = cache(async (): Promise<ScriptData[]> => {
    try {
        // Connect to database
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'oohunt');
        const collection = db.collection('custom_scripts');

        // Query all enabled scripts
        const scripts = await collection.find({ enabled: true }).toArray();

        // Convert _id to string and return
        return scripts.map(script => ({
            ...script,
            _id: script._id instanceof ObjectId ? script._id.toString() : String(script._id),
        })) as ScriptData[];
    } catch {

        return [];
    }
});

// Head scripts injector component
export function HeadScripts() {
    return getHeadScriptsComponent();
}

// Extract async logic to separate function
async function getHeadScriptsComponent() {
    const scripts = await getActiveScripts();
    const headScripts = scripts.filter(script => script.location === ScriptLocation.HEAD);

    if (headScripts.length === 0) {
        return null;
    }

    return (
        <>
            {headScripts.map(script => {
                // Check if the content is an external script with src attribute
                if (script.content.includes('src=')) {
                    const srcMatch = script.content.match(/src=["'](.*?)["']/);

                    if (srcMatch && srcMatch[1]) {
                        return (
                            <Script
                                key={script._id}
                                id={`custom-script-${script._id}`}
                                src={srcMatch[1]}
                                strategy="afterInteractive"
                            />
                        );
                    }
                }

                // For inline scripts - extract only the JS code without <script> tags
                let content = script.content;

                content = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/i, (match, p1) => p1.trim());

                return (
                    <Script
                        key={script._id}
                        id={`custom-script-${script._id}`}
                        strategy="afterInteractive"
                    >
                        {content}
                    </Script>
                );
            })}
        </>
    );
}

// Body start scripts injector component
export function BodyStartScripts() {
    return getBodyStartScriptsComponent();
}

async function getBodyStartScriptsComponent() {
    const scripts = await getActiveScripts();
    const bodyStartScripts = scripts.filter(script => script.location === ScriptLocation.BODY_START);

    if (bodyStartScripts.length === 0) {
        return null;
    }

    return (
        <>
            {bodyStartScripts.map(script => {
                // Check if the content is an external script with src attribute
                if (script.content.includes('src=')) {
                    const srcMatch = script.content.match(/src=["'](.*?)["']/);

                    if (srcMatch && srcMatch[1]) {
                        return (
                            <Script
                                key={script._id}
                                id={`custom-script-${script._id}`}
                                src={srcMatch[1]}
                                strategy="afterInteractive"
                            />
                        );
                    }
                }

                // For inline scripts - extract only the JS code without <script> tags
                let content = script.content;

                content = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/i, (match, p1) => p1.trim());

                return (
                    <Script
                        key={script._id}
                        id={`custom-script-${script._id}`}
                        strategy="afterInteractive"
                    >
                        {content}
                    </Script>
                );
            })}
        </>
    );
}

// Body end scripts injector component
export function BodyEndScripts() {
    return getBodyEndScriptsComponent();
}

async function getBodyEndScriptsComponent() {
    const scripts = await getActiveScripts();
    const bodyEndScripts = scripts.filter(script => script.location === ScriptLocation.BODY_END);

    if (bodyEndScripts.length === 0) {
        return null;
    }

    return (
        <>
            {bodyEndScripts.map(script => {
                // Check if the content is an external script with src attribute
                if (script.content.includes('src=')) {
                    const srcMatch = script.content.match(/src=["'](.*?)["']/);

                    if (srcMatch && srcMatch[1]) {
                        return (
                            <Script
                                key={script._id}
                                id={`custom-script-${script._id}`}
                                src={srcMatch[1]}
                                strategy="afterInteractive"
                            />
                        );
                    }
                }

                // For inline scripts - extract only the JS code without <script> tags
                let content = script.content;

                content = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/i, (match, p1) => p1.trim());

                return (
                    <Script
                        key={script._id}
                        id={`custom-script-${script._id}`}
                        strategy="afterInteractive"
                    >
                        {content}
                    </Script>
                );
            })}
        </>
    );
}
