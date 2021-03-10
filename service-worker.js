const APP_PREFIX = 'FoodFest-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    './index.html',
    './events.html',
    './tickets.html',
    './schedule.html',
    './assets/css/style.css',
    './assets/css/bootstrap.css',
    './assets/css/tickets.css',
    './dist/app.bundle.js',
    './dist/events.bundle.js',
    './dist/schedule.bundle.js',
    './dist/tickets.bundle.js'
];

//we use e.waitUntil to tell the browser to wait until the work is complete before terminating the service worker.
//This ensures that the service worker doesn't move on from the installing phase until its finished
//executing all of its code.  We use caches.open to to find the specific cache by name, then add every file
// in the FILES_TO_CACHE array to the cache 
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

// .keys() returns an array of all cache names which we're calling keyList
//keyList is a parameter that contains all cache names under <username>.guthub.io.  Because we might host
// many sites from the sane URL, we should filter out caches that have th app prefix.  We capture the ones
// that have that prefix, stored in APP_PREFIX, and save them to an array called cacheKeeplist using the .filter() method
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if(cacheKeeplist.indexOf(key) === -1 ) {
                    console.log('deleting cache : ' + keyList[i] );
                    return caches.delete(keyList[i]);
                }
            }));
        })        
    );
});

//here we listed for the fetch event, log the URL of the requested resource, and then befin to define
//how we will respond to the request.  If it is stored in the cache, e.respondWIth will deliver the 
//resource directly fom the cache; otherwise the resource will be retrieved normally.  

//we use .match() to determine if the resource already exists in caches.  If it does, we'll log the URL to the console
//with a messsage and then return the cached resource.

//if the resource is not in caches, we allow the resource to be retrieved from the online network as usual

//if the file isnt stored in cache, the service worker will make a normal request for the resource


self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { //if cache is available respond with cache
                console.log('responding with cache : ' + e.request.url)
                return request
            } else { //if there isnt any cache, try fetching request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }

            //you can omit if/else for the console.log & put one line below like this too.
            //return request || fetch(e.request)
        })

    )
})