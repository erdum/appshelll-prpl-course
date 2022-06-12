var staticAssetsCacheName = "todo-assets-v3";
var dynamicCacheName = "todo-dynamic-v3";

self.addEventListener("install", function (event) {
	self.skipWaiting();
	event.waitUntil(
		caches
			.open(staticAssetsCacheName)
			.then(function (cache) {
				cache.addAll([
					"/",
					"chunks/todo.d41d8cd98f00b204e980.js",
					"index.html",
					"main.d41d8cd98f00b204e980.js",
				]);
			})
			.catch((error) => {
				console.log("Error caching static assets:", error);
			})
	);
});

self.addEventListener("activate", function (event) {
	if (self.clients && clients.claim) {
		clients.claim();
	}
	event.waitUntil(
		caches
			.keys()
			.then(function (cacheNames) {
				return Promise.all(
					cacheNames
						.filter(function (cacheName) {
							return (
								cacheName.startsWith("todo-") &&
								cacheName !== staticAssetsCacheName
							);
						})
						.map(function (cacheName) {
							return caches.delete(cacheName);
						})
				).catch((error) => {
					console.log(
						"Some error occurred while removing existing cache:",
						error
					);
				});
			})
			.catch((error) => {
				console.log(
					"Some error occurred while removing existing cache:",
					error
				);
			})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				return (
					response ||
					fetch(event.request)
						.then((fetchResponse) => {
							return cacheDynamicRequestData(
								dynamicCacheName,
								event.request.url,
								fetchResponse.clone()
							);
						})
						.catch((error) => {
							console.log(error);
						})
				);
			})
			.catch((error) => {
				console.log(error);
			})
	);
});

function cacheDynamicRequestData(dynamicCacheName, url, fetchResponse) {
	return caches
		.open(dynamicCacheName)
		.then((cache) => {
			cache.put(url, fetchResponse.clone());
			return fetchResponse;
		})
		.catch((error) => {
			console.log(error);
		});
}
