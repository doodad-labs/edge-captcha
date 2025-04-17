import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { key } from '$lib/constants';

export const GET: RequestHandler = () => {
	return new Response(String(key.toString('hex')));
};