function attachToNode(node, {latitude, longitude}) {
    // Create map on node
    const map = L.map(node, {
        center: [latitude, longitude],
        zoom: 8
    });

    // Use OpenStreetMap layers
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        zoom: 8,
        maxZoom: 18
    }).addTo(map);

    // Add a marker at the site location
    L.marker([latitude, longitude]).addTo(map);
}


module.exports = {attachToNode};
