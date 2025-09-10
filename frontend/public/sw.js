self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

const BG_SYNC_TAG = 'weather-search-sync';

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	// Only handle our API weather search GETs
	if (url.pathname.endsWith('/api/weather') && event.request.method === 'GET') {
		// Let network proceed; Background Sync will be used via message API for retries
		return;
	}
});

self.addEventListener('sync', (event) => {
	if (event.tag === BG_SYNC_TAG) {
		event.waitUntil(processQueuedSearches());
	}
});

async function processQueuedSearches() {
	try {
		const cache = await caches.open('weather-search-queue');
		const requests = await cache.keys();
		for (const request of requests) {
			try {
				await fetch(request, { credentials: 'include' });
				await cache.delete(request);
			} catch {}
		}
	} catch {}
}

self.addEventListener('message', async (event) => {
	const { type, payload } = event.data || {};
	if (type === 'QUEUE_SEARCH') {
		try {
			const { url } = payload;
			const cache = await caches.open('weather-search-queue');
			await cache.add(url);
			if ('sync' in self.registration) {
				await self.registration.sync.register(BG_SYNC_TAG);
			}
		} catch {}
	}
});
