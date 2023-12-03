document.addEventListener("DOMContentLoaded", async function(){
    const map = createMap();
    const attractions = await loadData("data/attractions.json");
    
    const attractionLayerGroup = L.layerGroup();
    attractionLayerGroup.addTo(map);
    for (let attraction of attractions) {
        const marker = L.marker(
            [attraction.latitude, attraction.longitude]
        );
        marker.addTo(attractionLayerGroup);
    }

    const hawkers = await loadData("data/hawkers.json");
    const hawkerLayerGroup = L.layerGroup();
    hawkerLayerGroup.addTo(map);
    for (let h of hawkers){
        const marker = L.marker(
            [h.latitude, h.longitude]
        )
        marker.addTo(hawkerLayerGroup);
    }

    const controls = L.control.layers({
        "Attraction": attractionLayerGroup,
        "Hawkers": hawkerLayerGroup
    });
    controls.addTo(map);

    // Search functionality
    document.getElementById("searchInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });

    function performSearch() {
        const searchInput = document.getElementById("searchInput").value;
        if (searchInput.trim() !== "") {
            const searchResult = findLocation(searchInput);

            if (searchResult) {
                map.flyTo([searchResult.latitude, searchResult.longitude], 15);
            } else {
                alert("Location not found.");
            }
        }
    }

    function findLocation(locationName) {
        const allLocations = attractions.concat(hawkers);
        return allLocations.find(location => location.name.toLowerCase() === locationName.toLowerCase());
    }

});

async function loadData(filePath) {
    const response = await axios.get(filePath);
    return response.data.locations;
}




function createMap() {
    const map = L.map('map');

    // Set the center point at Zoo
    // 1.4047, 103.7949
    map.setView([1.4047, 103.7949], 15);
    
    // Need a tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    return map;
}