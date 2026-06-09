const body = document.querySelector('body');
let allCards = [];

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
    cardContainer.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('bg-gradient-to-b', 'from-gray-800', 'to-gray-900', 'rounded-xl', 'shadow-lg', 'overflow-hidden', 'border', 'border-gray-700', 'hover:border-yellow-500', 'transition-all', 'duration-300', 'transform', 'hover:-translate-y-2');

        cardElement.innerHTML = `
            <div class="p-4">
                <h3 class="text-lg font-bold text-yellow-400 mb-2 truncate" title="${card.Name}">${card.Name}</h3>
                <div class="flex justify-between text-sm text-gray-400 mb-2">
                    <span>⭐ Lvl ${card.Level || 0}</span>
                    <span>ATK: ${card.Attack || 0}</span>
                </div>
                <div class="text-sm text-gray-400 mb-3">
                    <span>DEF: ${card.Defense || 0}</span>
                </div>
            </div>
            <div class="relative cursor-pointer group" onclick='showFusions(${JSON.stringify(card).replace(/'/g, "&apos;")})'>
                <img src="${getCardImageUrl(card)}" alt="${card.Name}" 
                     class="w-full h-64 object-cover card-image"
                     onerror="this.onerror=null; this.src='${getPlaceholderImage(card.Name)}'">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <span class="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        ${card.Fusions && card.Fusions.length > 0 ? `🔮 ${card.Fusions.length} Fusões` : '❌ Sem fusões'}
                    </span>
                </div>
            </div>
            <div class="p-4 bg-gray-800 bg-opacity-50">
                <p class="text-xs text-gray-300 line-clamp-3">${card.Description || 'No description'}</p>
            </div>
        `;

        cardContainer.appendChild(cardElement);
    });
}

function showFusions(card) {
    const modal = document.getElementById('fusionModal');
    const modalTitle = document.getElementById('fusionModalTitle');
    const fusionContent = document.getElementById('fusionContent');

    modalTitle.textContent = `Fusões de ${card.Name}`;

    if (!card.Fusions || card.Fusions.length === 0) {
        fusionContent.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 text-xl">❌ Esta carta não possui fusões disponíveis</p>
            </div>
        `;
    } else {
        fusionContent.innerHTML = `
            <div class="mb-6 bg-gray-800 rounded-lg p-4 border border-yellow-600">
                <h3 class="text-yellow-400 font-bold mb-2 text-center">Carta Base</h3>
                <div class="flex justify-center">
                    <div class="text-center">
                        <img src="${getCardImageUrl(card)}" alt="${card.Name}" 
                             class="w-40 h-56 object-cover rounded-lg shadow-lg mx-auto"
                             onerror="this.onerror=null; this.src='${getPlaceholderImage(card.Name)}'">
                        <p class="text-white mt-2 font-bold">${card.Name}</p>
                    </div>
                </div>
            </div>
            
            <h3 class="text-2xl font-bold text-yellow-400 mb-4 text-center">⚡ Fusões Possíveis (${card.Fusions.length})</h3>
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

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('fusionModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFusionModal();
        }
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredCards = allCards.filter(card =>
            card.Name.toLowerCase().includes(searchTerm) ||
            (card.Description && card.Description.toLowerCase().includes(searchTerm))
        );
        showCards(filteredCards);
    });
});

async function init() {
    allCards = await loadCards();
    showCards(allCards);
}

init();