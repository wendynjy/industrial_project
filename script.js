document.addEventListener("DOMContentLoaded", async function(){
    const map = createMap();
    const attractions = await loadData("data/attractions.json");
    
    const attractionLayerGroup = L.layerGroup();
    attractionLayerGroup.addTo(map);
    for (let attraction of attractions) {
        const marker = L.marker(
            [attraction.latitude, attraction.longitude]
        );
        marker.bindPopup(`<b>${attraction.name}</b><br>${attraction.description}`);
        marker.addTo(attractionLayerGroup);
    }

    const hawkers = await loadData("data/hawkers.json");
    const hawkerLayerGroup = L.layerGroup();
    hawkerLayerGroup.addTo(map);
    for (let h of hawkers){
        const marker = L.marker(
            [h.latitude, h.longitude]
        )
        marker.bindPopup(`<b>${h.name}</b><br>${h.description}`);
        marker.addTo(hawkerLayerGroup);
    }

    const controls = L.control.layers({
        "Singapore's Key Attractions": attractionLayerGroup,
        "Singapore's Popular Hawkers": hawkerLayerGroup
    });
    controls.addTo(map);

    const suggestedLocationsList = document.getElementById("suggestedLocationsList");

    document.getElementById("searchInput").addEventListener("input", function () {
        initiateSearch();
    });

    function initiateSearch() {
        const searchInput = document.getElementById("searchInput").value.trim();
        suggestedLocationsList.innerHTML = '';

        if (searchInput !== "") {
            const suggestions = findSuggestions(searchInput);

            // Display suggestions
            suggestions.forEach(suggestion => {
                const listItem = document.createElement("li");
                listItem.textContent = suggestion.name;
                listItem.addEventListener("click", () => {
                    selectSuggestion(suggestion);
                });
                suggestedLocationsList.appendChild(listItem);
            });
        }
    }

    document.getElementById("searchButton").addEventListener("click", function () {
        initiateSearch();
    });

    function findSuggestions(input) {
        const allLocations = attractions.concat(hawkers);
        const lowercaseInput = input.toLowerCase();

        return allLocations.filter(location => location.name.toLowerCase().includes(lowercaseInput));
    }

    function selectSuggestion(suggestion) {
        document.getElementById("searchInput").value = suggestion.name;
        map.flyTo([suggestion.latitude, suggestion.longitude], 15);
        // Clear suggestions
        suggestedLocationsList.innerHTML = '';
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
