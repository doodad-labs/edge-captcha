import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decrypt } from '$lib/encryption';

export const GET: RequestHandler = ({ params }) => {

    const payload = params.payload;


    if (!payload) {
        throw error(400, 'ID is required');
    }

    let decryptedPayload

    try {
        decryptedPayload = decrypt(payload);
    } catch (error) {
        console.error('Decryption failed');
    }
    
    if (!decryptedPayload) {
        throw error(400, 'Decryption failed');
    }
    
	return new Response(decryptedPayload);
}; 