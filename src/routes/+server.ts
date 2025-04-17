import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { encrypt } from '$lib/encryption';
import { styles } from '$lib/generation';

export const GET: RequestHandler = ({ url }) => {

    const { searchParams } = url;
    let style = searchParams.get('style') || null;

    /**
     * Validates and sets the art style parameter:
     * - Converts comparison to case-insensitive by lowercasing all options
     * - If no style is provided or the style isn't in the approved list:
     * - Randomly selects a style from the available options
     */
    if (!style || style && !styles.includes(style.toLowerCase())) {
        style = styles[Math.floor(Math.random() * styles.length)];
    }

    const nonce = crypto.randomUUID();
    const now = Date.now();

    const payload = {
        nonce: nonce,
        created: now
    }

    const payloadString = JSON.stringify(payload);
    const encryptedPayload = encrypt(payloadString);
    
	return json({
        payload: encryptedPayload,
        style: style,
    });
};