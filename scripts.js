const body = document.querySelector('body');
let allCards = [];
let filteredCards = [];

// Card type mapping (based on typical Yu-Gi-Oh FM types)
const CARD_TYPES = {
    0: 'Dragon',
    1: 'Spellcaster',
    2: 'Zombie',
    3: 'Warrior',
    4: 'Beast-Warrior',
    5: 'Beast',
    6: 'Winged Beast',
    7: 'Fiend',
    8: 'Fairy',
    9: 'Insect',
    10: 'Dinosaur',
    11: 'Reptile',
    12: 'Fish',
    13: 'Sea Serpent',
    14: 'Machine',
    15: 'Thunder',
    16: 'Aqua',
    17: 'Pyro',
    18: 'Rock',
    19: 'Plant',
    20: 'Magic',
    21: 'Trap',
    22: 'Ritual'
};

// Helper function to get card image URL
function getCardImageUrl(card) {
    if (card && card.CardCode) {
        return `https://images.ygoprodeck.com/images/cards/${parseInt(card.CardCode)}.jpg`;
    }
    return getPlaceholderImage();
}

// Fallback image for errors
function getPlaceholderImage() {
    return 'https://images.ygoprodeck.com/images/cards/back.jpg';
}

// Load cards from JSON file
async function loadCards() {
    const cards = await fetch('./cards.json').then(response => response.json());
    return cards.filter(card => card.Fusions && card.Fusions.length > 0);
}

function showCards(cards) {
    const cardContainer = document.getElementById('cardContainer');
    const cardCount = document.getElementById('cardCount');
    cardContainer.innerHTML = '';
    
    // Update card count
    cardCount.textContent = `Showing ${cards.length} card${cards.length !== 1 ? 's' : ''}`;

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('yugioh-card');

        cardElement.innerHTML = `
            <div class="card-inner" onclick='showFusions(${JSON.stringify(card).replace(/'/g, "&apos;")})'>  
                <div class="card-name-bar">
                    <h3 class="text-sm font-bold text-yellow-400 truncate" title="${card.Name}">${card.Name}</h3>
                </div>
                <div class="card-image-container group">
                    <img src="${getCardImageUrl(card)}" alt="${card.Name}" 
                         class="w-full h-56 object-cover"
                         onerror="this.onerror=null; this.src='${getPlaceholderImage(card.Name)}'">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                        <span class="text-yellow-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            ${card.Fusions && card.Fusions.length > 0 ? `🔮 ${card.Fusions.length} Fusions` : '❌ No fusions'}
                        </span>
                    </div>
                </div>
                <div class="card-stats-bar">
                    <div class="flex justify-between text-xs text-yellow-300">
                        <span class="font-semibold">ATK/${card.Attack || 0}</span>
                        <span class="font-semibold">DEF/${card.Defense || 0}</span>
                    </div>
                </div>
            </div>
        `;

        cardContainer.appendChild(cardElement);
    });
}

function showFusions(card) {
    const modal = document.getElementById('fusionModal');
    const modalTitle = document.getElementById('fusionModalTitle');
    const fusionContent = document.getElementById('fusionContent');

    modalTitle.textContent = `Fusions of ${card.Name}`;

    if (!card.Fusions || card.Fusions.length === 0) {
        fusionContent.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 text-xl">❌ This card has no available fusions</p>
            </div>
        `;
    } else {
        fusionContent.innerHTML = `
            <div class="mb-6 bg-gray-800 rounded-lg p-4 border border-yellow-600">
                <h3 class="text-yellow-400 font-bold mb-2 text-center">Base Card</h3>
                <div class="flex justify-center">
                    <div class="text-center">
                        <img src="${getCardImageUrl(card)}" alt="${card.Name}" 
                             class="w-40 h-56 object-cover rounded-lg shadow-lg mx-auto"
                             onerror="this.onerror=null; this.src='${getPlaceholderImage(card.Name)}'">
                        <p class="text-white mt-2 font-bold">${card.Name}</p>
                    </div>
                </div>
            </div>
            
            <h3 class="text-2xl font-bold text-yellow-400 mb-4 text-center">⚡ Possible Fusions (${card.Fusions.length})</h3>
            <div class="grid grid-cols-1 gap-4">
                ${card.Fusions.map(fusion => {
            const card1 = allCards.find(c => c.Id === fusion._card1);
            const card2 = allCards.find(c => c.Id === fusion._card2);
            const result = allCards.find(c => c.Id === fusion._result);

            return `
                        <div class="fusion-card bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 border border-purple-500 shadow-xl">
                            <div class="grid grid-cols-5 gap-4 items-center">
                                <!-- Card 1 -->
                                <div class="text-center">
                                    <img src="${getCardImageUrl(card1)}" alt="${card1?.Name || 'Unknown'}" 
                                         class="w-32 h-44 object-cover rounded-lg shadow-lg mx-auto hover:scale-105 transition-transform"
                                         onerror="this.onerror=null; this.src='${getPlaceholderImage(card1?.Name || `Card ${fusion._card1}`)}'">
                                    <p class="text-white mt-2 font-semibold text-sm">${card1?.Name || `Card #${fusion._card1}`}</p>
                                    <p class="text-gray-400 text-xs">ATK: ${card1?.Attack || '?'} / DEF: ${card1?.Defense || '?'}</p>
                                </div>
                                
                                <!-- Plus Sign -->
                                <div class="text-center">
                                    <div class="text-6xl text-yellow-400 font-bold">+</div>
                                </div>
                                
                                <!-- Card 2 -->
                                <div class="text-center">
                                    <img src="${getCardImageUrl(card2)}" alt="${card2?.Name || 'Unknown'}" 
                                         class="w-32 h-44 object-cover rounded-lg shadow-lg mx-auto hover:scale-105 transition-transform"
                                         onerror="this.onerror=null; this.src='${getPlaceholderImage(card2?.Name || `Card ${fusion._card2}`)}'">
                                    <p class="text-white mt-2 font-semibold text-sm">${card2?.Name || `Card #${fusion._card2}`}</p>
                                    <p class="text-gray-400 text-xs">ATK: ${card2?.Attack || '?'} / DEF: ${card2?.Defense || '?'}</p>
                                </div>
                                
                                <!-- Equals Sign -->
                                <div class="text-center">
                                    <div class="text-6xl text-yellow-400 font-bold">=</div>
                                </div>
                                
                                <!-- Result -->
                                <div class="text-center">
                                    <img src="${getCardImageUrl(result)}" alt="${result?.Name || 'Unknown'}" 
                                         class="w-32 h-44 object-cover rounded-lg shadow-lg mx-auto border-2 border-yellow-500 hover:scale-105 transition-transform"
                                         onerror="this.onerror=null; this.src='${getPlaceholderImage(result?.Name || `Card ${fusion._result}`)}'">
                                    <p class="text-white mt-2 font-semibold text-sm">${result?.Name || `Card #${fusion._result}`}</p>
                                    <div class="text-xs mt-1">
                                        <p class="text-gray-400 text-xs">ATK: ${card2?.Attack || '?'} / DEF: ${card2?.Defense || '?'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeFusionModal() {
    const modal = document.getElementById('fusionModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Filter cards based on all active filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const atkFilter = document.getElementById('atkFilter').value;
    const defFilter = document.getElementById('defFilter').value;

    filteredCards = allCards.filter(card => {
        // Search filter
        const matchesSearch = !searchTerm || 
            card.Name.toLowerCase().includes(searchTerm) ||
            (card.Description && card.Description.toLowerCase().includes(searchTerm));
        
        // Level filter
        const matchesLevel = !levelFilter || card.Level == levelFilter;
        
        // Type filter
        const matchesType = !typeFilter || card.Type == typeFilter;
        
        // ATK filter (exact match)
        const matchesAtk = !atkFilter || card.Attack == parseInt(atkFilter);
        
        // DEF filter (exact match)
        const matchesDef = !defFilter || card.Defense == parseInt(defFilter);
        
        return matchesSearch && matchesLevel && matchesType && matchesAtk && matchesDef;
    });
    
    showCards(filteredCards);
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('atkFilter').value = '';
    document.getElementById('defFilter').value = '';
    applyFilters();
}

// Populate type filter dropdown
function populateTypeFilter() {
    const typeFilter = document.getElementById('typeFilter');
    const types = new Set();
    
    allCards.forEach(card => {
        if (card.Type !== null && card.Type !== undefined) {
            types.add(card.Type);
        }
    });
    
    Array.from(types).sort((a, b) => a - b).forEach(typeId => {
        const option = document.createElement('option');
        option.value = typeId;
        option.textContent = CARD_TYPES[typeId] || `Type ${typeId}`;
        typeFilter.appendChild(option);
    });
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('fusionModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFusionModal();
        }
    });

    // Search and filter event listeners
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('levelFilter').addEventListener('change', applyFilters);
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('atkFilter').addEventListener('input', applyFilters);
    document.getElementById('defFilter').addEventListener('input', applyFilters);
});

async function init() {
    allCards = await loadCards();
    filteredCards = allCards;
    populateTypeFilter();
    showCards(allCards);
}

init();