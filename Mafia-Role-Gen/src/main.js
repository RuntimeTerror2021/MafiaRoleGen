/*
==============================================
MAFIA ROLE ASSIGNMENT APP JAVASCRIPT
==============================================
Random role generator for Mafia party games

TABLE OF CONTENTS:
1. Application State
2. DOM Elements
3. Event Listeners
4. Player Management
5. Role Management
6. Game Logic
7. UI Updates
8. Modal Management
9. Preset Management
10. Utility Functions
==============================================
*/

// =========== 1. Application State ===========
const gameState = {
    players: [],
    roles: {
        mafia: 1,
        doctor: 1,
        cop: 1,
        narrator: 1,
        innocent: 2
    },
    assignments: [],
    revealedCards: new Set()
};

// Role definitions with descriptions and colors
const roleDefinitions = {
    mafia: {
        name: 'Mafia',
        description: 'Eliminate townspeople at night',
        icon: 'fas fa-user-secret',
        color: 'mafia'
    },
    doctor: {
        name: 'Doctor',
        description: 'Protect someone each night',
        icon: 'fas fa-user-md',
        color: 'doctor'
    },
    cop: {
        name: 'Cop',
        description: 'Investigate players each night',
        icon: 'fas fa-shield-alt',
        color: 'cop'
    },
    narrator: {
        name: 'Narrator',
        description: 'Moderates the game',
        icon: 'fas fa-microphone',
        color: 'narrator'
    },
    innocent: {
        name: 'Innocent',
        description: 'Regular townspeople',
        icon: 'fas fa-user',
        color: 'innocent'
    }
};

// Preset configurations
const presets = {
    classic: {
        name: 'Classic (6 players)',
        roles: { mafia: 2, doctor: 1, cop: 1, narrator: 0, innocent: 2 },
        players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6']
    },
    large: {
        name: 'Large Game (10 players)',
        roles: { mafia: 3, doctor: 1, cop: 1, narrator: 1, innocent: 4 },
        players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10']
    },
    balanced: {
        name: 'Balanced (8 players)',
        roles: { mafia: 2, doctor: 1, cop: 1, narrator: 1, innocent: 3 },
        players: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8']
    }
};

// =========== 2. DOM Elements ===========
let elements = {};

// =========== 3. Event Listeners ===========
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateUI();

    console.log('Mafia Role Assignment App initialized successfully');
});

function initializeApp() {
    // Cache DOM elements
    elements = {
        // Player management
        playerNameInput: document.getElementById('playerNameInput'),
        addPlayerBtn: document.getElementById('addPlayerBtn'),
        quickAddNumber: document.getElementById('quickAddNumber'),
        quickAddBtn: document.getElementById('quickAddBtn'),
        clearPlayersBtn: document.getElementById('clearPlayersBtn'),
        playersList: document.getElementById('playersList'),
        playerCount: document.getElementById('playerCount'),

        // Role management
        roleCounters: {
            mafia: document.getElementById('mafia-count'),
            doctor: document.getElementById('doctor-count'),
            cop: document.getElementById('cop-count'),
            narrator: document.getElementById('narrator-count'),
            innocent: document.getElementById('innocent-count')
        },

        // Summary
        totalRoles: document.getElementById('totalRoles'),
        totalPlayers: document.getElementById('totalPlayers'),
        summaryStatus: document.getElementById('summaryStatus'),

        // Actions
        assignRolesBtn: document.getElementById('assignRolesBtn'),
        presetBtn: document.getElementById('presetBtn'),

        // Results
        setupSection: document.getElementById('setupSection'),
        resultsSection: document.getElementById('resultsSection'),
        assignmentsGrid: document.getElementById('assignmentsGrid'),
        gameSummary: document.getElementById('gameSummary'),
        revealAllBtn: document.getElementById('revealAllBtn'),
        newGameBtn: document.getElementById('newGameBtn'),

        // Modal
        presetModal: document.getElementById('presetModal')
    };
}

function setupEventListeners() {
    // Player management
    elements.addPlayerBtn.addEventListener('click', addPlayer);
    elements.playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
    elements.quickAddBtn.addEventListener('click', quickAddPlayers);
    elements.clearPlayersBtn.addEventListener('click', clearAllPlayers);

    // Game actions
    elements.assignRolesBtn.addEventListener('click', assignRoles);
    elements.presetBtn.addEventListener('click', openPresetModal);
    elements.revealAllBtn.addEventListener('click', revealAllRoles);
    elements.newGameBtn.addEventListener('click', startNewGame);

    // Modal events
    elements.presetModal.addEventListener('click', function(e) {
        if (e.target === elements.presetModal) {
            closePresetModal();
        }
    });

    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePresetModal();
        }
    });

    // Auto-focus on player input
    elements.playerNameInput.focus();
}

// =========== 4. Player Management ===========
function addPlayer() {
    const nameInput = elements.playerNameInput;
    const playerName = nameInput.value.trim();

    if (!playerName) {
        showNotification('Please enter a player name', 'error');
        nameInput.focus();
        return;
    }

    if (gameState.players.includes(playerName)) {
        showNotification('Player name already exists', 'error');
        nameInput.focus();
        return;
    }

    if (gameState.players.length >= 20) {
        showNotification('Maximum 20 players allowed', 'error');
        return;
    }

    gameState.players.push(playerName);
    nameInput.value = '';
    nameInput.focus();

    updatePlayersDisplay();
    updateUI();

    // Add animation to new player
    setTimeout(() => {
        const newPlayerElement = elements.playersList.lastElementChild;
        if (newPlayerElement) {
            newPlayerElement.classList.add('slide-in-right');
        }
    }, 10);

    announceToScreenReader(`Added player: ${playerName}`);
}

function removePlayer(playerName) {
    const index = gameState.players.indexOf(playerName);
    if (index > -1) {
        gameState.players.splice(index, 1);
        updatePlayersDisplay();
        updateUI();
        announceToScreenReader(`Removed player: ${playerName}`);
    }
}

function quickAddPlayers() {
    const count = parseInt(elements.quickAddNumber.value) || 0;

    if (count < 1 || count > 20) {
        showNotification('Please enter a number between 1 and 20', 'error');
        return;
    }

    if (gameState.players.length + count > 20) {
        showNotification('This would exceed the maximum of 20 players', 'error');
        return;
    }

    for (let i = 1; i <= count; i++) {
        const playerName = `Player ${gameState.players.length + 1}`;
        if (!gameState.players.includes(playerName)) {
            gameState.players.push(playerName);
        }
    }

    elements.quickAddNumber.value = '';
    updatePlayersDisplay();
    updateUI();

    announceToScreenReader(`Added ${count} players`);
}

function clearAllPlayers() {
    if (gameState.players.length === 0) return;

    if (confirm('Are you sure you want to remove all players?')) {
        gameState.players = [];
        updatePlayersDisplay();
        updateUI();
        elements.playerNameInput.focus();
        announceToScreenReader('All players removed');
    }
}

function updatePlayersDisplay() {
    const playersList = elements.playersList;
    const playerCount = elements.playerCount;
    const clearBtn = elements.clearPlayersBtn;

    // Update count
    playerCount.textContent = gameState.players.length;

    // Show/hide clear button
    clearBtn.style.display = gameState.players.length > 0 ? 'flex' : 'none';

    // Update players list
    playersList.innerHTML = '';

    gameState.players.forEach(playerName => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <span class="player-name">${escapeHtml(playerName)}</span>
            <button 
                type="button" 
                class="remove-player" 
                onclick="removePlayer('${escapeHtml(playerName)}')"
                aria-label="Remove ${escapeHtml(playerName)}"
            >
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;
        playersList.appendChild(li);
    });
}

// =========== 5. Role Management ===========
function changeRoleQuantity(role, change) {
    const currentValue = gameState.roles[role];
    const newValue = Math.max(0, Math.min(20, currentValue + change));

    gameState.roles[role] = newValue;
    elements.roleCounters[role].textContent = newValue;

    updateUI();
    announceToScreenReader(`${roleDefinitions[role].name} count: ${newValue}`);
}

function getTotalRoles() {
    return Object.values(gameState.roles).reduce((sum, count) => sum + count, 0);
}

// =========== 6. Game Logic ===========
function assignRoles() {
    if (!validateGameSetup()) {
        return;
    }

    // Create role array
    const roleArray = [];
    Object.entries(gameState.roles).forEach(([role, count]) => {
        for (let i = 0; i < count; i++) {
            roleArray.push(role);
        }
    });

    // Shuffle roles
    const shuffledRoles = shuffleArray([...roleArray]);

    // Create assignments
    gameState.assignments = gameState.players.map((player, index) => ({
        player: player,
        role: shuffledRoles[index],
        revealed: false
    }));

    // Reset revealed cards
    gameState.revealedCards.clear();

    // Show results
    showResults();

    announceToScreenReader('Roles have been assigned randomly');
}

function validateGameSetup() {
    const totalPlayers = gameState.players.length;
    const totalRoles = getTotalRoles();

    if (totalPlayers === 0) {
        showNotification('Please add at least one player', 'error');
        return false;
    }

    if (totalRoles === 0) {
        showNotification('Please select at least one role', 'error');
        return false;
    }

    if (totalPlayers !== totalRoles) {
        showNotification(`Number of players (${totalPlayers}) must match number of roles (${totalRoles})`, 'error');
        return false;
    }

    return true;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// =========== 7. UI Updates ===========
function updateUI() {
    const totalPlayers = gameState.players.length;
    const totalRoles = getTotalRoles();

    // Update summary
    elements.totalPlayers.textContent = totalPlayers;
    elements.totalRoles.textContent = totalRoles;

    // Update status
    const statusElement = elements.summaryStatus;
    const assignButton = elements.assignRolesBtn;

    if (totalPlayers === 0) {
        statusElement.innerHTML = '<i class="fas fa-info-circle" aria-hidden="true"></i> Add players to continue';
        statusElement.className = 'summary-status info';
        assignButton.disabled = true;
    } else if (totalPlayers !== totalRoles) {
        const difference = Math.abs(totalPlayers - totalRoles);
        const message = totalPlayers > totalRoles
            ? `Need ${difference} more role${difference !== 1 ? 's' : ''}`
            : `Remove ${difference} role${difference !== 1 ? 's' : ''}`;
        statusElement.innerHTML = `<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> ${message}`;
        statusElement.className = 'summary-status invalid';
        assignButton.disabled = true;
    } else {
        statusElement.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Ready to assign roles';
        statusElement.className = 'summary-status valid';
        assignButton.disabled = false;
    }
}

function showResults() {
    elements.setupSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });

    displayAssignments();
    displayGameSummary();
}

function displayAssignments() {
    const grid = elements.assignmentsGrid;
    grid.innerHTML = '';

    gameState.assignments.forEach((assignment, index) => {
        const card = document.createElement('div');
        card.className = `assignment-card ${assignment.role}`;
        card.onclick = () => toggleRoleReveal(index);

        const roleInfo = roleDefinitions[assignment.role];

        card.innerHTML = `
            <div class="player-name-large">${escapeHtml(assignment.player)}</div>
            <div class="role-reveal" style="display: none;">
                <div class="role-icon-large ${roleInfo.color}">
                    <i class="${roleInfo.icon}" aria-hidden="true"></i>
                </div>
                <div class="role-name">${roleInfo.name}</div>
                <p class="role-description">${roleInfo.description}</p>
            </div>
            <div class="click-to-reveal">
                <i class="fas fa-eye" aria-hidden="true"></i>
                Click to reveal role
            </div>
        `;

        grid.appendChild(card);

        // Add entrance animation
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 100);
    });
}

function displayGameSummary() {
    const summary = elements.gameSummary;
    summary.innerHTML = '';

    Object.entries(gameState.roles).forEach(([role, count]) => {
        if (count > 0) {
            const roleInfo = roleDefinitions[role];
            const summaryItem = document.createElement('div');
            summaryItem.className = `summary-role ${role}`;
            summaryItem.innerHTML = `
                <div class="summary-role-count">${count}</div>
                <div class="summary-role-name">${roleInfo.name}${count !== 1 ? 's' : ''}</div>
            `;
            summary.appendChild(summaryItem);
        }
    });
}

function toggleRoleReveal(index) {
    const assignment = gameState.assignments[index];
    const card = elements.assignmentsGrid.children[index];
    const roleReveal = card.querySelector('.role-reveal');
    const clickToReveal = card.querySelector('.click-to-reveal');

    if (gameState.revealedCards.has(index)) {
        // Hide role
        gameState.revealedCards.delete(index);
        card.classList.remove('revealed');
        roleReveal.style.display = 'none';
        clickToReveal.style.display = 'block';
        announceToScreenReader(`Hidden role for ${assignment.player}`);
    } else {
        // Reveal role
        gameState.revealedCards.add(index);
        card.classList.add('revealed');
        roleReveal.style.display = 'flex';
        clickToReveal.style.display = 'none';
        announceToScreenReader(`${assignment.player} is the ${roleDefinitions[assignment.role].name}`);
    }
}

function revealAllRoles() {
    gameState.assignments.forEach((_, index) => {
        if (!gameState.revealedCards.has(index)) {
            gameState.revealedCards.add(index);
            const card = elements.assignmentsGrid.children[index];
            const roleReveal = card.querySelector('.role-reveal');
            const clickToReveal = card.querySelector('.click-to-reveal');

            card.classList.add('revealed');
            roleReveal.style.display = 'flex';
            clickToReveal.style.display = 'none';
        }
    });

    announceToScreenReader('All roles revealed');
}

function startNewGame() {
    if (confirm('Start a new game? This will clear all current assignments.')) {
        // Reset state
        gameState.assignments = [];
        gameState.revealedCards.clear();

        // Show setup section
        elements.setupSection.style.display = 'block';
        elements.resultsSection.style.display = 'none';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Focus on player input
        elements.playerNameInput.focus();

        announceToScreenReader('Started new game');
    }
}

// =========== 8. Modal Management ===========
function openPresetModal() {
    elements.presetModal.classList.add('active');
    elements.presetModal.setAttribute('aria-hidden', 'false');

    // Focus management
    const firstPreset = elements.presetModal.querySelector('.preset-card');
    if (firstPreset) {
        firstPreset.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closePresetModal() {
    elements.presetModal.classList.remove('active');
    elements.presetModal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus
    elements.presetBtn.focus();
}

// =========== 9. Preset Management ===========
function applyPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) return;

    // Apply roles
    gameState.roles = { ...preset.roles };
    Object.entries(gameState.roles).forEach(([role, count]) => {
        elements.roleCounters[role].textContent = count;
    });

    // Apply players
    gameState.players = [...preset.players];
    updatePlayersDisplay();

    // Update UI
    updateUI();

    // Close modal
    closePresetModal();

    showNotification(`Applied ${preset.name} preset`, 'success');
    announceToScreenReader(`Applied ${preset.name} preset`);
}

// =========== 10. Utility Functions ===========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}" aria-hidden="true"></i>
            <span>${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close notification">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        </div>
    `;

    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                animation: slideInRight 0.3s ease-out;
                border-left: 4px solid var(--primary-color);
            }
            .notification-success { border-left-color: var(--secondary-color); }
            .notification-error { border-left-color: var(--danger-color); }
            .notification-info { border-left-color: var(--primary-color); }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: auto;
                color: var(--neutral-400);
                padding: 4px;
                border-radius: 4px;
                transition: color 0.15s ease;
            }
            .notification-close:hover {
                color: var(--neutral-600);
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Announce to screen readers
    announceToScreenReader(message);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        if (announcement.parentElement) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

// Global functions for onclick handlers
window.changeRoleQuantity = changeRoleQuantity;
window.removePlayer = removePlayer;
window.applyPreset = applyPreset;
window.closePresetModal = closePresetModal;

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        roleDefinitions,
        presets,
        assignRoles,
        validateGameSetup,
        shuffleArray
    };
}

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Analytics tracking (replace with your analytics code)
function trackEvent(category, action, label) {
    // Example: Google Analytics 4
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label
    // });

    console.log(`Analytics: ${category} - ${action} - ${label}`);
}

// Track important user interactions
document.addEventListener('click', function(e) {
    const target = e.target.closest('button, .preset-card, .assignment-card');
    if (target) {
        if (target.id === 'assignRolesBtn') {
            trackEvent('Game', 'assign_roles', `${gameState.players.length}_players`);
        } else if (target.classList.contains('preset-card')) {
            trackEvent('Preset', 'apply', target.querySelector('h4').textContent);
        } else if (target.classList.contains('assignment-card')) {
            trackEvent('Role', 'reveal', 'individual');
        } else if (target.id === 'revealAllBtn') {
            trackEvent('Role', 'reveal', 'all');
        }
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    // Log performance metrics
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        trackEvent('Performance', 'page_load', loadTime);
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to assign roles
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!elements.assignRolesBtn.disabled) {
            assignRoles();
        }
    }
});

console.log('App loaded :O');