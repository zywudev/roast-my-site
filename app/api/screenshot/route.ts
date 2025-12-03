import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Set viewport to a reasonable desktop size
        await page.setViewport({ width: 1280, height: 800 });

        // Go to URL
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Take screenshot
        const screenshotBuffer = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 80 });

        await browser.close();

        return NextResponse.json({
            image: `data:image/jpeg;base64,${screenshotBuffer}`
        });

    } catch (error) {
        console.error('Screenshot error:', error);
        return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
    }
}
