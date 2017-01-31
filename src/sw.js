const staticCache = 'neighborview';
const imgCache = 'neighborview-img';
var allCaches = [staticCache, imgCache];
const fontUrl = 'https://fonts.googleapis.com/css?family=Roboto';
const iconUrl = 'https://fonts.googleapis.com/icon?family=Material+Icons';
const imgUrl = 'http://pbs.twimg.com/media/';
const api = 'https://api.jublo.net/codebird/1.1/search/tweets.json';


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCache).then(cache => {
      return cache.addAll([
      	'/',
      	fontUrl,
      	iconUrl
    	].concat(self.serviceWorkerOption.assets));
    })
  );
})

self.addEventListener('fetch', function(event) {
	if (event.request.url.startsWith(api)) {
  	event.respondWith(
	    caches.open(staticCache).then(cache => {
	    	return cache.match(event.request).then(response => {
	    		//return from cache and update
		      if (response) {
		      	fetch(event.request)
		      	.then(updated => {
		      		cache.put(event.request, updated);
		      	});
		      	return response;
		      }

					//fetch and save
		      return fetch(event.request)
		    	.then(newResponse => {
		        cache.put(event.request, newResponse.clone());
		        return newResponse;
		  		});
		    });
	    })
    );
    return;
  }

  if (event.request.url.startsWith(imgUrl)) {
  	event.respondWith(
	    caches.open(imgCache).then(cache => {
	    	return cache.match(event.request).then(response => {
	    		//no need to update
		      if (response) {
		      	return response;
		      }

		      return fetch(event.request)
		    	.then(newResponse => {
		        cache.put(event.request, newResponse.clone());
		        return newResponse;
		  		});
		    });
	    })
    );
    return;
  }

  event.respondWith(	
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});


self.addEventListener('activate', function(event) {
	//TODO: need to clean periodically besides on activate
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});