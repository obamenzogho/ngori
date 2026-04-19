self.options = {
    "domain": "5gvci.com",
    "zoneId": 10878928
}
self.lary = ""
try {
    importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
} catch (e) {
    // CDN inaccessible ou bloqué — on ignore silencieusement
}
