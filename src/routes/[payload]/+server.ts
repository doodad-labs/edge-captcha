import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decrypt } from '$lib/encryption';
import generate from '$lib/generation';

export const GET: RequestHandler = ({ params }) => {

    const encryptedPayload = params.payload;

    if (!encryptedPayload) {
        throw error(400, 'ID is required');
    }

    let decryptedPayload

    try {
        decryptedPayload = decrypt(encryptedPayload);
    } catch (error) {
        console.error('Decryption failed');
    }
    
    if (!decryptedPayload) {
        // Generate the PNG image
        const pngBuffer = generate('text', 'Decryption failed!');
        
        // Return as PNG response
        return new Response(pngBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });
    }

    const payload = JSON.parse(decryptedPayload);
    const style = payload.style || null;
    const answer = payload.answer || null;
    
	// Generate the PNG image
    const pngBuffer = generate(style, answer);
    
    // Return as PNG response
    return new Response(pngBuffer, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
    });
}; 