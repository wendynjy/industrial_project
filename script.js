document.addEventListener("DOMContentLoaded", async function(){
    const map = createMap();

    const titleControl = L.control({ position: 'bottomright' });

    titleControl.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'map-title');
        div.innerHTML = '<h1>Top 10 Places In Singapore</h1>';
        return div;
    };

    titleControl.addTo(map);

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

    const shops = await loadData("data/shopping.json");
    const shopLayerGroup = L.layerGroup();
    shopLayerGroup.addTo(map);
    for (let shop of shops){
        const marker = L.marker(
            [shop.latitude, shop.longitude], { icon: createMarkerIcon('shopping') }
        )
        marker.bindPopup(`<b>${shop.name}</b><br>${shop.description}`);
        marker.on('click', () => {
            selectMarker(shop);
        });
        marker.addTo(shopLayerGroup);
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
        "Fine Dinings" : restaurantLayerGroup,
        "Shopping Places": shopLayerGroup
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
        const allLocations = attractions.concat(hawkers, hotels, restaurants, shops);
        const lowercaseInput = input.toLowerCase();

        return allLocations.filter(location => location.name.toLowerCase().includes(lowercaseInput));
    }

    function selectSuggestion(suggestion) {
        document.getElementById("searchInput").value = suggestion.name;
        map.flyTo([suggestion.latitude, suggestion.longitude], 15);
       
        updateSidePanel(suggestion);
       
        suggestedLocationsList.innerHTML = '';
    }

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", saveLocation);

    function updateSidePanel(location) {
        const sidePanelContent = document.getElementById("sidePanelContent");

        sidePanelContent.innerHTML = `
            <h2>${location.name}</h2>
            <img src="${location.image}">
            <p>${location.address}</p>
            <p>${location.description}</p>
            <!-- Add more details as needed -->
        `;

        openSidePanel();

        saveButton.location = location;
    }

    function saveLocation() {
        const location = saveButton.location;
        const savedLocations = JSON.parse(localStorage.getItem("savedLocations")) || [];
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
        }  else if (type === 'shopping') {
            iconUrl = 'images/shopping-removebg-preview.png';
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

    async function fetchAttractions() {
        try {
            const response = await axios.get('data/attractions.json');
            return response.data.locations;
        } catch (error) {
            console.error('Error fetching attractions:', error);
            return [];
        }
    }

    async function fetchHawkers() {
        try {
            const response = await axios.get('data/hawkers.json');
            return response.data.locations;
        } catch (error) {
            console.error('Error fetching hawkers:', error);
            return [];
        }
    }

    async function fetchHotels() {
        try {
            const response = await axios.get('data/hotels.json');
            return response.data.locations;
        } catch (error) {
            console.error('Error fetching hotels:', error);
            return [];
        }
    }

    async function fetchShopping() {
        try {
            const response = await axios.get('data/shopping.json');
            return response.data.locations;
        } catch (error) {
            console.error('Error fetching shoppings:', error);
            return [];
        }
    }

    async function fetchFineDinings() {
        try {
            const response = await axios.get('data/finedinings.json');
            return response.data.locations;
        } catch (error) {
            console.error('Error fetching fine dinings:', error);
            return [];
        }
    }

    document.getElementById('categoryDropdown').addEventListener('change', async function () {

        closeSidePanel();

        const selectedCategory = this.value;

        const sidePanelContent = document.getElementById('sidePanelContent');
        sidePanelContent.innerHTML = '';

        if (selectedCategory === 'attraction') {
            const attractions = await fetchAttractions();
            showAttractionsModal(attractions);
        }
        if (selectedCategory === 'hawker') {
            const hawkers = await fetchHawkers();
            showHawkersModal(hawkers);
        }
        if (selectedCategory === 'hotel') {
            const hotels = await fetchHotels();
            showHotelsModal(hotels);
        }
       
    });

    function showAttractionsModal(attractions) {
        closeExistingModals();
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('custom-popup-container');
    
        const modalContent = document.createElement('div');
        modalContent.classList.add('custom-popup-content');
        modalContent.innerHTML = '<h2>Top 10 Attractions in Singapore</h2>';
    
        const container = document.createElement('div');
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';
    
        attractions.forEach(attraction => {
            const attractionBox = document.createElement('div');
            attractionBox.classList.add('attraction-box');
    
            const nameElement = document.createElement('h3');
            nameElement.textContent = attraction.name;

            const tempElement = document.createElement('div');
            tempElement.innerHTML = attraction.address;

            const cleanAddress = tempElement.textContent || tempElement.innerText;
    
            const addressElement = document.createElement('p');
            addressElement.textContent = cleanAddress;
    
            attractionBox.appendChild(nameElement);
            attractionBox.appendChild(addressElement);

            attractionBox.style.cursor = 'pointer';
            attractionBox.addEventListener('click', function () {
                hideMarkers();
                flyToAttractionMarker(attraction);
                modalContainer.style.display = "none";
            });
    
            container.appendChild(attractionBox);
        });
    
        modalContent.appendChild(container);

        modalContent.addEventListener('wheel', function (event) {
            event.stopPropagation();
        });
    
        const closeButton = document.createElement('span');
        closeButton.classList.add('custom-popup-close');
        closeButton.innerHTML = '&times;'; 
        closeButton.addEventListener('click', closeCustomPopup);
    
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(modalContent);
    
        const modal = L.DomUtil.create('div', 'leaflet-map-popup custom-popup');
        modal.appendChild(modalContainer);
    
        modal.style.position = 'absolute';
    
        map.getPanes().popupPane.appendChild(modal);
    
        function closeCustomPopup() {
            map.getPanes().popupPane.removeChild(modal);
        }

        function flyToAttractionMarker(attraction) {
            hideMarkers();

            const selectedLayerGroup = L.layerGroup().addTo(map);
        
            const marker = L.marker(
                [attraction.latitude, attraction.longitude],
                { icon: createMarkerIcon('attraction') }
            );
        
            marker.bindPopup(`<b>${attraction.name}</b><br>${attraction.description}`);
            marker.addTo(selectedLayerGroup);
        
            map.flyTo([attraction.latitude, attraction.longitude], 15);

            updateSidePanel(attraction);

            openSidePanel();
        }
        

        function hideMarkers() {
            map.eachLayer(layer => {
                if (layer instanceof L.LayerGroup) {
                    layer.clearLayers(); // Clear all markers from the layer group
                }
            });
        }
        
    }  
    
    function showHawkersModal(hawkers) {
        closeExistingModals();
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('custom-popup-container');
    
        const modalContent = document.createElement('div');
        modalContent.classList.add('custom-popup-content');
        modalContent.innerHTML = '<h2>Top 10 Hawkers in Singapore</h2>';
    
        const container = document.createElement('div');
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';
    
        hawkers.forEach(hawker => {
            const attractionBox = document.createElement('div');
            attractionBox.classList.add('attraction-box');
    
            const nameElement = document.createElement('h3');
            nameElement.textContent = hawker.name;

            const tempElement = document.createElement('div');
            tempElement.innerHTML = hawker.address;

            const cleanAddress = tempElement.textContent || tempElement.innerText;
    
            const addressElement = document.createElement('p');
            addressElement.textContent = cleanAddress;
    
            attractionBox.appendChild(nameElement);
            attractionBox.appendChild(addressElement);

            attractionBox.style.cursor = 'pointer';
            attractionBox.addEventListener('click', function () {
                hideMarkers();
                flyToAttractionMarker(hawker);
                modalContainer.style.display = "none";
            });
    
            container.appendChild(attractionBox);
        });
    
        modalContent.appendChild(container);

        modalContent.addEventListener('wheel', function (event) {
            event.stopPropagation();
        });
    
        const closeButton = document.createElement('span');
        closeButton.classList.add('custom-popup-close');
        closeButton.innerHTML = '&times;'; 
        closeButton.addEventListener('click', closeCustomPopup);
    
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(modalContent);
    
        const modal = L.DomUtil.create('div', 'leaflet-map-popup custom-popup');
        modal.appendChild(modalContainer);
    
        modal.style.position = 'absolute';
    
        map.getPanes().popupPane.appendChild(modal);
    
        function closeCustomPopup() {
            map.getPanes().popupPane.removeChild(modal);
        }

        function flyToAttractionMarker(hawker) {
            hideMarkers();

            const selectedLayerGroup = L.layerGroup().addTo(map);
        
            const marker = L.marker(
                [hawker.latitude, hawker.longitude],
                { icon: createMarkerIcon('hawker') }
            );
        
            marker.bindPopup(`<b>${hawker.name}</b><br>${hawker.description}`);
            marker.addTo(selectedLayerGroup);
        
            map.flyTo([hawker.latitude, hawker.longitude], 15);

            updateSidePanel(hawker);

            openSidePanel();
        }
        

        function hideMarkers() {
            map.eachLayer(layer => {
                if (layer instanceof L.LayerGroup) {
                    layer.clearLayers(); // Clear all markers from the layer group
                }
            });
        }
        
    } 

    function showHotelsModal(hotels) {
        closeExistingModals();
        const modalContainer = document.createElement('div');
        modalContainer.classList.add('custom-popup-container');
    
        const modalContent = document.createElement('div');
        modalContent.classList.add('custom-popup-content');
        modalContent.innerHTML = '<h2>Top 10 Hotels in Singapore</h2>';
    
        const container = document.createElement('div');
        container.style.maxHeight = '300px';
        container.style.overflowY = 'auto';
    
        hotels.forEach(hotel => {
            const attractionBox = document.createElement('div');
            attractionBox.classList.add('attraction-box');
    
            const nameElement = document.createElement('h3');
            nameElement.textContent = hotel.name;

            const tempElement = document.createElement('div');
            tempElement.innerHTML = hotel.address;

            const cleanAddress = tempElement.textContent || tempElement.innerText;
    
            const addressElement = document.createElement('p');
            addressElement.textContent = cleanAddress;
    
            attractionBox.appendChild(nameElement);
            attractionBox.appendChild(addressElement);

            attractionBox.style.cursor = 'pointer';
            attractionBox.addEventListener('click', function () {
                hideMarkers();
                flyToAttractionMarker(hotel);
                modalContainer.style.display = "none";
            });
    
            container.appendChild(attractionBox);
        });
    
        modalContent.appendChild(container);

        modalContent.addEventListener('wheel', function (event) {
            event.stopPropagation();
        });
    
        const closeButton = document.createElement('span');
        closeButton.classList.add('custom-popup-close');
        closeButton.innerHTML = '&times;'; 
        closeButton.addEventListener('click', closeCustomPopup);
    
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(modalContent);
    
        const modal = L.DomUtil.create('div', 'leaflet-map-popup custom-popup');
        modal.appendChild(modalContainer);
    
        modal.style.position = 'absolute';
    
        map.getPanes().popupPane.appendChild(modal);
    
        function closeCustomPopup() {
            map.getPanes().popupPane.removeChild(modal);
        }

        function flyToAttractionMarker(hotel) {
            hideMarkers();

            const selectedLayerGroup = L.layerGroup().addTo(map);
        
            const marker = L.marker(
                [hotel.latitude, hotel.longitude],
                { icon: createMarkerIcon('hotel') }
            );
        
            marker.bindPopup(`<b>${hotel.name}</b><br>${hotel.description}`);
            marker.addTo(selectedLayerGroup);
        
            map.flyTo([hotel.latitude, hotel.longitude], 15);

            updateSidePanel(hotel);

            openSidePanel();
        }
        

        function hideMarkers() {
            map.eachLayer(layer => {
                if (layer instanceof L.LayerGroup) {
                    layer.clearLayers(); // Clear all markers from the layer group
                }
            });
        }
        
    } 

    function closeExistingModals() {
        const existingModals = document.querySelectorAll('.leaflet-map-popup.custom-popup');
        existingModals.forEach(modal => {
            map.getPanes().popupPane.removeChild(modal);
        });
    }
    
});

async function loadData(filePath) {
    const response = await axios.get(filePath);
    return response.data.locations;
}

function createMap() {
    const map = L.map('map');

    map.setView([1.4047, 103.7949], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    return map;
}
