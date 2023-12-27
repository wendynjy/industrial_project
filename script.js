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

    const hotels = await loadData("data/hotels.json");
    const hotelLayerGroup = L.layerGroup();
    hotelLayerGroup.addTo(map);
    for (let hotel of hotels){
        const marker = L.marker(
            [hotel.latitude, hotel.longitude], { icon: createMarkerIcon('hotel') }
        )
        marker.bindPopup(`<b>${hotel.name}</b><br>${hotel.description}`);
        marker.on('click', () => {
            selectMarker(hotel);
        });
        marker.addTo(hotelLayerGroup);
    }

    const restaurants = await loadData("data/finedinings.json");
    const restaurantLayerGroup = L.layerGroup();
    restaurantLayerGroup.addTo(map);
    for (let restaurant of restaurants){
        const marker = L.marker(
            [restaurant.latitude, restaurant.longitude], { icon: createMarkerIcon('restaurant') }
        )
        marker.bindPopup(`<b>${restaurant.name}</b><br>${restaurant.description}`);
        marker.on('click', () => {
            selectMarker(restaurant);
        });
        marker.addTo(restaurantLayerGroup);
    }

    const trains= await loadData("data/mrt.json");
    const mrtLayer = L.layerGroup();
    mrtLayer.addTo(map);

    for (let train of trains){
        const marker = L.marker(
            [train.latitude, train.longitude], { icon: createMarkerIcon('mrt') }
        )
        marker.bindPopup(`<b>${train.station_name}</b><br>${train.type}`);
        marker.addTo(mrtLayer);
    }
      
    const controls = L.control.layers({
        "Attractions": attractionLayerGroup,
        "Hawkers": hawkerLayerGroup,
        "Hotels":hotelLayerGroup,
        "MRT Stations": mrtLayer,
        "Fine Dining" : restaurantLayerGroup
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
        const allLocations = attractions.concat(hawkers, hotels);
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
            <img src="${location.image}">
            <p>${location.address}</p>
            <p>${location.description}</p>
            <!-- Add more details as needed -->
        `;

        // Open the side panel
        openSidePanel();

        // Add event listener for the Save button
        const saveButton = document.getElementById("saveButton");
        saveButton.addEventListener("click", () => {
            saveLocation(location);
        });
    }

    function saveLocation(location) {
        const savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
    
        // Check if the location is already saved
        const isAlreadySaved = savedLocations.some(savedLocation => savedLocation.name === location.name);
    
        if (!isAlreadySaved) {
            savedLocations.push(location);
            localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
            alert("Location saved!");
        } else {
            alert("Location is already saved!");
        }
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
        } else if (type === 'hotel') {
            iconUrl = 'images/hotel_icon-removebg-preview.png';
            iconSize = [62, 62];
        } else if (type === 'restaurant') {
            iconUrl = 'images/restaurant_icon-removebg-preview.png';
            iconSize = [62, 62];
        } else if (type === 'mrt') {
            iconUrl = 'images/train_icon-removebg-preview.png'; 
            iconSize = [32, 32];
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
