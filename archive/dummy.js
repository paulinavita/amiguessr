<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom TimeGuessr</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .tabs {
            display: flex;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }

        .tab {
            flex: 1;
            padding: 15px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .tab.active {
            background: rgba(255,255,255,0.2);
            font-weight: bold;
        }

        .tab:hover {
            background: rgba(255,255,255,0.1);
        }

        .tab-content {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }

        .hidden {
            display: none;
        }

        /* Admin Panel Styles */
        .admin-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            background: #f8f9fa;
        }

        .admin-section h3 {
            color: #5a67d8;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #4a5568;
        }

        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #5a67d8;
        }

        .btn {
            background: linear-gradient(135deg, #5a67d8, #667eea);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-right: 10px;
            margin-bottom: 10px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(90, 103, 216, 0.3);
        }

        .btn-danger {
            background: linear-gradient(135deg, #e53e3e, #fc8181);
        }

        .btn-success {
            background: linear-gradient(135deg, #38a169, #68d391);
        }

        .picture-list {
            margin-top: 20px;
        }

        .picture-item {
            display: flex;
            align-items: center;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 10px;
            background: white;
        }

        .picture-preview {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 15px;
        }

        .picture-info {
            flex: 1;
        }

        .picture-info strong {
            color: #5a67d8;
        }

        /* Game Styles */
        .game-container {
            text-align: center;
        }

        .round-info {
            background: #5a67d8;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 1.2rem;
            font-weight: bold;
        }

        .game-image {
            max-width: 100%;
            max-height: 400px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .guess-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .year-guess, .location-guess {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
        }

        .year-guess h4, .location-guess h4 {
            color: #5a67d8;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }

        #map {
            height: 300px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
        }

        .score-display {
            background: linear-gradient(135deg, #38a169, #68d391);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 1.3rem;
            font-weight: bold;
        }

        .results {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            border: 2px solid #e2e8f0;
        }

        .result-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }

        .result-item:last-child {
            border-bottom: none;
        }

        .game-set-item {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .game-set-item:hover {
            border-color: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .game-set-item h4 {
            color: #5a67d8;
            margin-bottom: 10px;
        }

        @media (max-width: 768px) {
            .guess-container {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .tabs {
                flex-direction: column;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📸 Custom TimeGuessr</h1>
            <p>Upload photos, set locations & years, then challenge yourself!</p>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="showTab('admin')">📋 Admin Panel</button>
            <button class="tab" onclick="showTab('play')">🎮 Play Game</button>
            <button class="tab" onclick="showTab('sets')">📚 Game Sets</button>
        </div>

        <!-- Admin Panel -->
        <div id="admin" class="tab-content">
            <div class="admin-section">
                <h3>📷 Add New Picture</h3>
                <div class="form-group">
                    <label for="imageUpload">Upload Image:</label>
                    <input type="file" id="imageUpload" accept="image/*">
                </div>
                <div class="form-group">
                    <label for="imageYear">Year (1900-2024):</label>
                    <input type="number" id="imageYear" min="1900" max="2024" placeholder="e.g., 1995">
                </div>
                <div class="form-group">
                    <label for="imageTitle">Title/Description:</label>
                    <input type="text" id="imageTitle" placeholder="e.g., Times Square in the 90s">
                </div>
                <div class="form-group">
                    <label>Click on the map to set location:</label>
                    <div id="adminMap" style="height: 300px; border-radius: 8px; border: 2px solid #e2e8f0;"></div>
                </div>
                <div style="margin-top: 15px;">
                    <span id="coordsDisplay">Coordinates: Click on map to select</span>
                </div>
                <button class="btn" onclick="addPicture()">➕ Add Picture</button>
            </div>

            <div class="admin-section">
                <h3>💾 Save Game Set</h3>
                <div class="form-group">
                    <label for="gameSetName">Game Set Name:</label>
                    <input type="text" id="gameSetName" placeholder="e.g., Vintage Cities">
                </div>
                <div class="form-group">
                    <label for="gameSetPictures">Select 5 Pictures for Game Set:</label>
                    <select id="gameSetPictures" multiple size="5">
                        <!-- Will be populated dynamically -->
                    </select>
                    <small style="color: #666;">Hold Ctrl/Cmd to select multiple. Select exactly 5 pictures.</small>
                </div>
                <button class="btn btn-success" onclick="saveGameSet()">💾 Save Game Set</button>
            </div>

            <div class="admin-section">
                <h3>📸 Current Pictures</h3>
                <div id="picturesList" class="picture-list">
                    <!-- Pictures will be displayed here -->
                </div>
            </div>
        </div>

        <!-- Play Game -->
        <div id="play" class="tab-content hidden">
            <div class="game-container">
                <div id="gameStart">
                    <h3>🎯 Start New Game</h3>
                    <p>Select 5 pictures to create a random game, or choose a saved game set.</p>
                    <button class="btn" onclick="startRandomGame()">🎲 Random Game (5 pictures)</button>
                </div>

                <div id="gamePlay" class="hidden">
                    <div class="round-info">
                        <span id="roundCounter">Round 1 of 5</span>
                        <span id="totalScore" style="float: right;">Total Score: 0</span>
                    </div>
                    
                    <img id="gameImage" class="game-image" alt="Guess this location and year!">
                    
                    <div class="guess-container">
                        <div class="year-guess">
                            <h4>📅 Guess the Year</h4>
                            <input type="number" id="yearGuess" min="1900" max="2024" placeholder="Enter year">
                        </div>
                        
                        <div class="location-guess">
                            <h4>🗺️ Guess the Location</h4>
                            <div id="map"></div>
                            <p style="margin-top: 10px; color: #666;">Click on the map to make your guess</p>
                        </div>
                    </div>
                    
                    <button class="btn" onclick="submitGuess()" id="submitBtn">✅ Submit Guess</button>
                    
                    <div id="roundResults" class="results hidden">
                        <h4>📊 Round Results</h4>
                        <div id="roundScore"></div>
                        <div id="roundDetails"></div>
                        <button class="btn" onclick="nextRound()" id="nextBtn">➡️ Next Round</button>
                    </div>
                </div>

                <div id="gameEnd" class="hidden">
                    <div class="score-display">
                        🏆 Final Score: <span id="finalScore">0</span> / 50000
                    </div>
                    <div class="results">
                        <h4>📈 Game Summary</h4>
                        <div id="gameSummary"></div>
                    </div>
                    <button class="btn" onclick="restartGame()">🔄 Play Again</button>
                </div>
            </div>
        </div>

        <!-- Game Sets -->
        <div id="sets" class="tab-content hidden">
            <h3>📚 Saved Game Sets</h3>
            <div id="gameSetsList">
                <!-- Game sets will be displayed here -->
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Global variables
        let pictures = [];
        let gameSets = [];
        let currentGame = null;
        let currentRound = 0;
        let totalScore = 0;
        let gameResults = [];
        let adminMap, gameMap;
        let selectedCoords = null;
        let guessMarker = null;

        // Initialize the app
        function init() {
            loadData();
            initMaps();
            updatePicturesList();
            updateGameSetsList();
            updateGameSetPictures();
        }

        // Data persistence
        function saveData() {
            const data = {
                pictures: pictures,
                gameSets: gameSets
            };
            // In a real app, you'd save to a server or local file
            // For demo purposes, we'll use localStorage
            localStorage.setItem('timeguessr_data', JSON.stringify(data));
        }

        function loadData() {
            const saved = localStorage.getItem('timeguessr_data');
            if (saved) {
                const data = JSON.parse(saved);
                pictures = data.pictures || [];
                gameSets = data.gameSets || [];
            }
        }

        // Initialize maps
        function initMaps() {
            // Admin map
            adminMap = L.map('adminMap').setView([40.7128, -74.0060], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(adminMap);

            adminMap.on('click', function(e) {
                selectedCoords = e.latlng;
                document.getElementById('coordsDisplay').textContent = 
                    `Coordinates: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
                
                if (adminMap.marker) {
                    adminMap.removeLayer(adminMap.marker);
                }
                adminMap.marker = L.marker(e.latlng).addTo(adminMap);
            });

            // Game map
            gameMap = L.map('map').setView([40.7128, -74.0060], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(gameMap);

            gameMap.on('click', function(e) {
                if (guessMarker) {
                    gameMap.removeLayer(guessMarker);
                }
                guessMarker = L.marker(e.latlng).addTo(gameMap);
            });
        }

        // Tab functionality
        function showTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            
            event.target.classList.add('active');
            document.getElementById(tabName).classList.remove('hidden');

            // Refresh maps when switching tabs
            setTimeout(() => {
                if (tabName === 'admin') {
                    adminMap.invalidateSize();
                } else if (tabName === 'play') {
                    gameMap.invalidateSize();
                }
            }, 100);
        }

        // Picture management
        function addPicture() {
            const fileInput = document.getElementById('imageUpload');
            const year = parseInt(document.getElementById('imageYear').value);
            const title = document.getElementById('imageTitle').value;

            if (!fileInput.files[0] || !year || !title || !selectedCoords) {
                alert('Please fill all fields and select a location on the map.');
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const picture = {
                    id: Date.now(),
                    title: title,
                    year: year,
                    lat: selectedCoords.lat,
                    lng: selectedCoords.lng,
                    image: e.target.result
                };

                pictures.push(picture);
                saveData();
                updatePicturesList();
                updateGameSetPictures();

                // Clear form
                fileInput.value = '';
                document.getElementById('imageYear').value = '';
                document.getElementById('imageTitle').value = '';
                selectedCoords = null;
                document.getElementById('coordsDisplay').textContent = 'Coordinates: Click on map to select';
                if (adminMap.marker) {
                    adminMap.removeLayer(adminMap.marker);
                }

                alert('Picture added successfully!');
            };

            reader.readAsDataURL(file);
        }

        function deletePicture(id) {
            if (confirm('Are you sure you want to delete this picture?')) {
                pictures = pictures.filter(p => p.id !== id);
                saveData();
                updatePicturesList();
                updateGameSetPictures();
            }
        }

        function updatePicturesList() {
            const container = document.getElementById('picturesList');
            container.innerHTML = '';

            if (pictures.length === 0) {
                container.innerHTML = '<p style="color: #666; text-align: center;">No pictures added yet.</p>';
                return;
            }

            pictures.forEach(picture => {
                const item = document.createElement('div');
                item.className = 'picture-item';
                item.innerHTML = `
                    <img src="${picture.image}" alt="${picture.title}" class="picture-preview">
                    <div class="picture-info">
                        <strong>${picture.title}</strong><br>
                        Year: ${picture.year}<br>
                        Location: ${picture.lat.toFixed(4)}, ${picture.lng.toFixed(4)}
                    </div>
                    <button class="btn btn-danger" onclick="deletePicture(${picture.id})">🗑️ Delete</button>
                `;
                container.appendChild(item);
            });
        }

        function updateGameSetPictures() {
            const select = document.getElementById('gameSetPictures');
            select.innerHTML = '';

            pictures.forEach(picture => {
                const option = document.createElement('option');
                option.value = picture.id;
                option.textContent = `${picture.title} (${picture.year})`;
                select.appendChild(option);
            });
        }

        // Game Set management
        function saveGameSet() {
            const name = document.getElementById('gameSetName').value;
            const selectedPictures = Array.from(document.getElementById('gameSetPictures').selectedOptions);

            if (!name || selectedPictures.length !== 5) {
                alert('Please enter a name and select exactly 5 pictures.');
                return;
            }

            const gameSet = {
                id: Date.now(),
                name: name,
                pictureIds: selectedPictures.map(option => parseInt(option.value))
            };

            gameSets.push(gameSet);
            saveData();
            updateGameSetsList();

            document.getElementById('gameSetName').value = '';
            document.getElementById('gameSetPictures').selectedIndex = -1;

            alert('Game set saved successfully!');
        }

        function deleteGameSet(id) {
            if (confirm('Are you sure you want to delete this game set?')) {
                gameSets = gameSets.filter(gs => gs.id !== id);
                saveData();
                updateGameSetsList();
            }
        }

        function updateGameSetsList() {
            const container = document.getElementById('gameSetsList');
            container.innerHTML = '';

            if (gameSets.length === 0) {
                container.innerHTML = '<p style="color: #666; text-align: center;">No game sets saved yet.</p>';
                return;
            }

            gameSets.forEach(gameSet => {
                const item = document.createElement('div');
                item.className = 'game-set-item';
                item.innerHTML = `
                    <h4>${gameSet.name}</h4>
                    <p>5 pictures • Click to play</p>
                    <div style="margin-top: 10px;">
                        <button class="btn" onclick="playGameSet(${gameSet.id})">🎮 Play</button>
                        <button class="btn btn-danger" onclick="deleteGameSet(${gameSet.id})">🗑️ Delete</button>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        // Game logic
        function startRandomGame() {
            if (pictures.length < 5) {
                alert('You need at least 5 pictures to start a game.');
                return;
            }

            const shuffled = [...pictures].sort(() => 0.5 - Math.random());
            currentGame = shuffled.slice(0, 5);
            initGame();
        }

        function playGameSet(gameSetId) {
            const gameSet = gameSets.find(gs => gs.id === gameSetId);
            if (!gameSet) return;

            currentGame = gameSet.pictureIds.map(id => pictures.find(p => p.id === id)).filter(p => p);
            
            if (currentGame.length !== 5) {
                alert('Some pictures in this game set are missing. Please recreate the game set.');
                return;
            }

            showTab('play');
            setTimeout(() => gameMap.invalidateSize(), 100);
            initGame();
        }

        function initGame() {
            currentRound = 0;
            totalScore = 0;
            gameResults = [];
            
            document.getElementById('gameStart').classList.add('hidden');
            document.getElementById('gamePlay').classList.remove('hidden');
            document.getElementById('gameEnd').classList.add('hidden');
            
            loadRound();
        }

        function loadRound() {
            const picture = currentGame[currentRound];
            
            document.getElementById('roundCounter').textContent = `Round ${currentRound + 1} of 5`;
            document.getElementById('totalScore').textContent = `Total Score: ${totalScore}`;
            document.getElementById('gameImage').src = picture.image;
            document.getElementById('yearGuess').value = '';
            
            // Clear previous guess marker
            if (guessMarker) {
                gameMap.removeLayer(guessMarker);
                guessMarker = null;
            }
            
            // Reset game map view
            gameMap.setView([40.7128, -74.0060], 2);
            
            document.getElementById('roundResults').classList.add('hidden');
            document.getElementById('submitBtn').style.display = 'inline-block';
        }

        function submitGuess() {
            const yearGuess = parseInt(document.getElementById('yearGuess').value);
            
            if (!yearGuess || !guessMarker) {
                alert('Please enter a year and click on the map to make your location guess.');
                return;
            }

            const picture = currentGame[currentRound];
            const guessCoords = guessMarker.getLatLng();
            
            // Calculate scores
            const yearDiff = Math.abs(yearGuess - picture.year);
            const yearScore = Math.max(0, 5000 - (yearDiff * 50)); // 50 points per year off
            
            const distance = calculateDistance(picture.lat, picture.lng, guessCoords.lat, guessCoords.lng);
            const distanceScore = Math.max(0, 5000 - (distance / 10)); // Lose points based on distance
            
            const roundScore = Math.round(yearScore + distanceScore);
            totalScore += roundScore;

            // Store round result
            gameResults.push({
                picture: picture,
                yearGuess: yearGuess,
                locationGuess: guessCoords,
                yearScore: Math.round(yearScore),
                distanceScore: Math.round(distanceScore),
                roundScore: roundScore,
                distance: distance,
                yearDiff: yearDiff
            });

            // Show results
            showRoundResults(picture, guessCoords, yearGuess, roundScore, yearScore, distanceScore, distance, yearDiff);
        }

        function showRoundResults(picture, guessCoords, yearGuess, roundScore, yearScore, distanceScore, distance, yearDiff) {
            document.getElementById('submitBtn').style.display = 'none';
            
            // Add actual location marker
            const actualMarker = L.marker([picture.lat, picture.lng], {
                icon: L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjRkYwMDAwIi8+Cjwvc3ZnPgo=',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                })
            }).addTo(gameMap);

            // Fit map to show both markers
            const group = L.featureGroup([guessMarker, actualMarker]);
            gameMap.fitBounds(group.getBounds(), { padding: [50, 50] });

            const resultsHtml = `
                <div class="score-display">Round Score: ${roundScore} / 10000</div>
                <div class="result-item">
                    <span><strong>Your Year Guess:</strong> ${yearGuess}</span>
                    <span><strong>Actual Year:</strong> ${picture.year}</span>
                </div>
                <div class="result-item">
                    <span><strong>Year Difference:</strong> ${yearDiff} years</span>
                    <span><strong>Year Score:</strong> ${Math.round(yearScore)} / 5000</span>
                </div>
                <div class="result-item">
                    <span><strong>Distance:</strong> ${distance.toFixed(0)} km</span>
                    <span><strong>Distance Score:</strong> ${Math.round(distanceScore)} / 5000</span>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #e6f7ff; border-radius: 5px;">
                    <strong>${picture.title}</strong><br>
                    Year: ${picture.year} | Location: ${picture.lat.toFixed(4)}, ${picture.lng.toFixed(4)}
                </div>
            `;

            document.getElementById('roundScore').innerHTML = resultsHtml;
            document.getElementById('roundResults').classList.remove('hidden');

            if (currentRound === 4) {
                document.getElementById('nextBtn').textContent = '🏁 Finish Game';
            }
        }

        function nextRound() {
            // Remove the actual location marker
            gameMap.eachLayer(layer => {
                if (layer instanceof L.Marker && layer !== guessMarker) {
                    gameMap.removeLayer(layer);
                }
            });

            currentRound++;
            
            if (currentRound >= 5) {
                endGame();
            } else remixed-9e751809.html{
                loadRound();
            }
        }

        function endGame() {
            document.getElementById('gamePlay').classList.add('hidden');
            document.getElementById('gameEnd').classList.remove('hidden');
            
            document.getElementById('finalScore').textContent = totalScore;
            
            let summaryHtml = '';
            gameResults.forEach((result, index) => {
                summaryHtml += `