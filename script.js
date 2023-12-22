document.addEventListener("DOMContentLoaded", async function(){
    const map = createMap();
    const attractions = await loadData("data/attractions.json");
    
    const attractionLayerGroup = L.layerGroup();
    attractionLayerGroup.addTo(map);
    for (let attraction of attractions) {
        const marker = L.marker(
            [attraction.latitude, attraction.longitude], { icon: createMarkerIcon('attraction') }
        );
        marker.bindPopup(`<b>${attraction.name}</b><br>${attraction.description}`);
        marker.on('click', () => {
            selectMarker(attraction);
        });
        marker.addTo(attractionLayerGroup);
    }

    const hawkers = await loadData("data/hawkers.json");
    const hawkerLayerGroup = L.layerGroup();
    hawkerLayerGroup.addTo(map);
    for (let h of hawkers){
        const marker = L.marker(
            [h.latitude, h.longitude], { icon: createMarkerIcon('hawker') }
        )
        marker.bindPopup(`<b>${h.name}</b><br>${h.description}`);
        marker.on('click', () => {
            selectMarker(h);
        });
        marker.addTo(hawkerLayerGroup);
    }

    const controls = L.control.layers({
        "Attractions": attractionLayerGroup,
        "Hawkers": hawkerLayerGroup
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
       
        // Update side panel content
        updateSidePanel(suggestion);
       
        // Clear suggestions
        suggestedLocationsList.innerHTML = '';
    }

    function updateSidePanel(location) {
        const sidePanelContent = document.getElementById("sidePanelContent");
        sidePanelContent.innerHTML = `
            <h2>${location.name}</h2>
            <a href="${location.linkUrl}" target="_blank">
            <img src="${location.image}">
            </a>
            <p>${location.address}</p>
            <p>${location.description}</p>
            <!-- Add more details as needed -->
        `;

        // Open the side panel
        openSidePanel();
    }

    function openSidePanel() {
        const sidePanel = document.getElementById("sidePanel");
        sidePanel.style.width = "300px"; // Set the desired width
    }

    document.getElementById("closeButton").addEventListener("click", function () {
        closeSidePanel();
    });

    function closeSidePanel() {
        const sidePanel = document.getElementById("sidePanel");
        sidePanel.style.width = "0";
    }

    function setupHomeButtonListener() {
        const homeButton = document.querySelector("#home");
        console.log(homeButton);
        if (homeButton) {
            homeButton.addEventListener("click", clearSearchAndRefresh);
        }
    }

    // Use setTimeout to delay execution and ensure DOM elements are ready
    setTimeout(setupHomeButtonListener, 0);

    function clearSearchAndRefresh() {
        document.getElementById("searchInput").value = ''; // Clear the search input
        suggestedLocationsList.innerHTML = ''; // Clear the suggestions list
        location.reload(); // Reload the page
    }

    function selectMarker(location) {
        updateSidePanel(location);
        openSidePanel();
        map.flyTo([location.latitude, location.longitude], 15);
    }

    function createMarkerIcon(type) {
        let iconUrl, iconSize;
    
        if (type === 'attraction') {
            iconUrl = 'images/camera_icon-removebg-preview.png';
            iconSize = [100, 80];
        } else if (type === 'hawker') {
            iconUrl = 'images/food_icon-removebg-preview.png';
            iconSize = [50, 50];
        }
    
        return L.icon({
            iconUrl: iconUrl,
            iconSize: iconSize,
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41],
        });
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
