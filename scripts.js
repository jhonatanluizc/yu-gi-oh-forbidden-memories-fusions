const body = document.querySelector('body');
let allCards = [];
let filteredCards = [];
let currentFusions = [];
let currentBaseCard = null;

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
                    <h3 class="text-xs sm:text-sm font-bold text-yellow-400 truncate" title="${card.Name}">${card.Name}</h3>
                </div>
                <div class="card-image-container group">
                    <img src="${getCardImageUrl(card)}" alt="${card.Name}" 
                         class="w-full object-cover"
                         onerror="this.onerror=null; this.src='${getPlaceholderImage(card.Name)}'">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                        <span class="text-yellow-400 text-xs sm:text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 text-center">
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
    const fusionControls = document.getElementById('fusionControls');
    
    currentBaseCard = card;
    currentFusions = card.Fusions || [];

    modalTitle.innerHTML = `<span class="text-yellow-300">🔥 Fusions of</span> ${card.Name}`;

    if (!card.Fusions || card.Fusions.length === 0) {
        fusionControls.classList.add('hidden');
        fusionContent.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 text-xl">❌ This card has no available fusions</p>
            </div>
        `;
    } else {
        fusionControls.classList.remove('hidden');
        renderFusions(currentFusions);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function renderFusions(fusions) {
    const fusionContent = document.getElementById('fusionContent');
    const fusionCount = document.getElementById('fusionCount');
    
    fusionCount.textContent = `${fusions.length} fusion${fusions.length !== 1 ? 's' : ''}`;
    
    if (fusions.length === 0) {
        fusionContent.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 text-xl">🔍 No fusions found</p>
            </div>
        `;
        return;
    }
    
    fusionContent.innerHTML = `
        <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4 text-center">⚡ Possible Fusions</h3>
        <div class="space-y-3 sm:space-y-4">
            ${fusions.map((fusion, index) => {
                const card1 = allCards.find(c => c.Id === fusion._card1);
                const card2 = allCards.find(c => c.Id === fusion._card2);
                const result = allCards.find(c => c.Id === fusion._result);

                return `
                    <div class="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-yellow-700 border-opacity-30">
                        <!-- Desktop View -->
                        <div class="hidden lg:grid lg:grid-cols-5 gap-3 xl:gap-4 items-center">
                            <!-- Card 1 -->
                            <div class="text-center">
                                <img src="${getCardImageUrl(card1)}" alt="${card1?.Name || 'Unknown'}" 
                                     class="w-24 h-32 xl:w-32 xl:h-44 object-cover rounded-lg shadow-lg mx-auto card-hover-scale"
                                     onerror="this.onerror=null; this.src='${getPlaceholderImage(card1?.Name || `Card ${fusion._card1}`)}'"
                                     title="${card1?.Name || `Card #${fusion._card1}`}">
                                <p class="text-white mt-2 font-semibold text-xs xl:text-sm truncate px-1" title="${card1?.Name || `Card #${fusion._card1}`}">${card1?.Name || `Card #${fusion._card1}`}</p>
                                <p class="text-gray-400 text-xs">⚔️ ${card1?.Attack || '?'} / 🛡️ ${card1?.Defense || '?'}</p>
                            </div>
                            
                            <!-- Plus Sign -->
                            <div class="text-center">
                                <div class="text-3xl xl:text-5xl text-yellow-400 font-bold animate-pulse">+</div>
                            </div>
                            
                            <!-- Card 2 -->
                            <div class="text-center">
                                <img src="${getCardImageUrl(card2)}" alt="${card2?.Name || 'Unknown'}" 
                                     class="w-24 h-32 xl:w-32 xl:h-44 object-cover rounded-lg shadow-lg mx-auto card-hover-scale"
                                     onerror="this.onerror=null; this.src='${getPlaceholderImage(card2?.Name || `Card ${fusion._card2}`)}'"
                                     title="${card2?.Name || `Card #${fusion._card2}`}">
                                <p class="text-white mt-2 font-semibold text-xs xl:text-sm truncate px-1" title="${card2?.Name || `Card #${fusion._card2}`}">${card2?.Name || `Card #${fusion._card2}`}</p>
                                <p class="text-gray-400 text-xs">⚔️ ${card2?.Attack || '?'} / 🛡️ ${card2?.Defense || '?'}</p>
                            </div>
                            
                            <!-- Equals Sign -->
                            <div class="text-center">
                                <div class="text-3xl xl:text-5xl text-yellow-400 font-bold animate-pulse">=</div>
                            </div>
                            
                            <!-- Result -->
                            <div class="text-center">
                                <img src="${getCardImageUrl(result)}" alt="${result?.Name || 'Unknown'}" 
                                     class="w-24 h-32 xl:w-32 xl:h-44 object-cover rounded-lg shadow-lg mx-auto border-2 border-yellow-500 card-hover-scale"
                                     onerror="this.onerror=null; this.src='${getPlaceholderImage(result?.Name || `Card ${fusion._result}`)}'"
                                     title="${result?.Name || `Card #${fusion._result}`}">
                                <p class="text-white mt-2 font-semibold text-xs xl:text-sm truncate px-1" title="${result?.Name || `Card #${fusion._result}`}">${result?.Name || `Card #${fusion._result}`}</p>
                                <p class="text-yellow-300 text-xs font-bold">⚔️ ${result?.Attack || '?'} / 🛡️ ${result?.Defense || '?'}</p>
                            </div>
                        </div>
                        
                        <!-- Mobile/Tablet View -->
                        <div class="lg:hidden">
                            <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <!-- Card 1 -->
                                <div class="text-center">
                                    <img src="${getCardImageUrl(card1)}" alt="${card1?.Name || 'Unknown'}" 
                                         class="w-20 h-28 sm:w-28 sm:h-40 object-cover rounded-lg shadow-lg mx-auto"
                                         onerror="this.onerror=null; this.src='${getPlaceholderImage(card1?.Name || `Card ${fusion._card1}`)}'">
                                    <p class="text-white mt-1 sm:mt-2 font-semibold text-xs truncate px-1">${card1?.Name || `Card #${fusion._card1}`}</p>
                                    <p class="text-gray-400 text-xs">⚔️ ${card1?.Attack || '?'} / 🛡️ ${card1?.Defense || '?'}</p>
                                </div>
                                
                                <!-- Card 2 -->
                                <div class="text-center ">
                                    <img src="${getCardImageUrl(card2)}" alt="${card2?.Name || 'Unknown'}" 
                                         class="w-20 h-28 sm:w-28 sm:h-40 object-cover rounded-lg shadow-lg mx-auto"
                                         onerror="this.onerror=null; this.src='${getPlaceholderImage(card2?.Name || `Card ${fusion._card2}`)}'">
                                    <p class="text-white mt-1 sm:mt-2 font-semibold text-xs truncate px-1">${card2?.Name || `Card #${fusion._card2}`}</p>
                                    <p class="text-gray-400 text-xs">⚔️ ${card2?.Attack || '?'} / 🛡️ ${card2?.Defense || '?'}</p>
                                </div>
                            </div>
                            
                            <!-- Arrow Down -->
                            <div class="text-center my-1 sm:my-2">
                                <div class="text-2xl sm:text-3xl text-yellow-400 font-bold">⬇️</div>
                            </div>
                            
                            <!-- Result -->
                            <div class="text-center rounded-lg p-2 sm:p-3">
                                <img src="${getCardImageUrl(result)}" alt="${result?.Name || 'Unknown'}" 
                                     class="w-28 h-40 sm:w-36 sm:h-48 object-cover rounded-lg shadow-lg mx-auto border-2 border-yellow-500"
                                     onerror="this.onerror=null; this.src='${getPlaceholderImage(result?.Name || `Card ${fusion._result}`)}'">
                                <p class="text-white mt-1 sm:mt-2 font-bold text-sm px-1">${result?.Name || `Card #${fusion._result}`}</p>
                                <p class="text-yellow-300 text-xs sm:text-sm font-bold mt-1">⚔️ ${result?.Attack || '?'} / 🛡️ ${result?.Defense || '?'}</p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function closeFusionModal() {
    const modal = document.getElementById('fusionModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    
    // Reset search and sort
    document.getElementById('fusionSearchInput').value = '';
    document.getElementById('fusionSortSelect').value = 'default';
}

function closeModalOnBackdrop(event) {
    if (event.target.id === 'fusionModal') {
        closeFusionModal();
    }
}

// Search within fusions
function searchFusions() {
    const searchTerm = document.getElementById('fusionSearchInput').value.toLowerCase();
    
    let filtered = currentFusions.filter(fusion => {
        const card1 = allCards.find(c => c.Id === fusion._card1);
        const card2 = allCards.find(c => c.Id === fusion._card2);
        const result = allCards.find(c => c.Id === fusion._result);
        
        const card1Name = card1?.Name?.toLowerCase() || '';
        const card2Name = card2?.Name?.toLowerCase() || '';
        const resultName = result?.Name?.toLowerCase() || '';
        
        return card1Name.includes(searchTerm) || 
               card2Name.includes(searchTerm) || 
               resultName.includes(searchTerm);
    });
    
    // Apply current sort
    filtered = sortFusions(filtered, document.getElementById('fusionSortSelect').value);
    renderFusions(filtered);
}

// Sort fusions
function sortFusions(fusions, sortType) {
    const sorted = [...fusions];
    
    switch(sortType) {
        case 'atk-high':
            sorted.sort((a, b) => {
                const resultA = allCards.find(c => c.Id === a._result);
                const resultB = allCards.find(c => c.Id === b._result);
                return (resultB?.Attack || 0) - (resultA?.Attack || 0);
            });
            break;
        case 'atk-low':
            sorted.sort((a, b) => {
                const resultA = allCards.find(c => c.Id === a._result);
                const resultB = allCards.find(c => c.Id === b._result);
                return (resultA?.Attack || 0) - (resultB?.Attack || 0);
            });
            break;
        case 'def-high':
            sorted.sort((a, b) => {
                const resultA = allCards.find(c => c.Id === a._result);
                const resultB = allCards.find(c => c.Id === b._result);
                return (resultB?.Defense || 0) - (resultA?.Defense || 0);
            });
            break;
        case 'def-low':
            sorted.sort((a, b) => {
                const resultA = allCards.find(c => c.Id === a._result);
                const resultB = allCards.find(c => c.Id === b._result);
                return (resultA?.Defense || 0) - (resultB?.Defense || 0);
            });
            break;
        case 'name-az':
            sorted.sort((a, b) => {
                const resultA = allCards.find(c => c.Id === a._result);
                const resultB = allCards.find(c => c.Id === b._result);
                return (resultA?.Name || '').localeCompare(resultB?.Name || '');
            });
            break;
        case 'name-za':
            sorted.sort((a, b) => {
                const resultA = allCards.find(c => c.Id === a._result);
                const resultB = allCards.find(c => c.Id === b._result);
                return (resultB?.Name || '').localeCompare(resultA?.Name || '');
            });
            break;
    }
    
    return sorted;
}

function applySortToFusions() {
    searchFusions(); // This will apply both search and sort
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
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeFusionModal();
        }
    });

    // Search and filter event listeners
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('levelFilter').addEventListener('change', applyFilters);
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('atkFilter').addEventListener('input', applyFilters);
    document.getElementById('defFilter').addEventListener('input', applyFilters);
    
    // Fusion modal search and sort
    document.getElementById('fusionSearchInput').addEventListener('input', searchFusions);
    document.getElementById('fusionSortSelect').addEventListener('change', applySortToFusions);
});

async function init() {
    allCards = await loadCards();
    filteredCards = allCards;
    populateTypeFilter();
    showCards(allCards);
}

init();