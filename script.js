// Initialize users array and current user
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// script.js (Updated and Working)
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

// Add API configuration
const SPOONACULAR_API_KEY = 'ur_api_key'; // Replace with your API key
const OPENAI_API_KEY = // Replace with your API key
const API_BASE_URL = 'urapikey';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM Elements
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.nav-links');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authForms = document.querySelector('.auth-forms');
    const authSwitch = document.querySelectorAll('.auth-switch a');
    const themeToggle = document.getElementById('themeToggle');
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Navigation Functions
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    }

    // Navigation Event Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showSection(sectionId);
        });
    });

    // Mobile Menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // Get Started Button
    const getStartedBtn = document.querySelector('.hero-section .btn-primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const fridgeLink = document.querySelector('[href="#fridge"]');
            if (fridgeLink) fridgeLink.click();
        });
    }

    // Auth Functions
    function showLoginForm() {
        document.querySelector('#loginForm').classList.add('active');
        document.querySelector('#signupForm').classList.remove('active');
    }

    function showSignupForm() {
        document.querySelector('#signupForm').classList.add('active');
        document.querySelector('#loginForm').classList.remove('active');
    }

    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorElement = document.getElementById('loginError');

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            authModal.style.display = 'none';
            showNotification('Successfully logged in!', 'success');
        } else {
            errorElement.textContent = 'Invalid email or password';
            errorElement.style.display = 'block';
        }
    }

    function handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const errorElement = document.getElementById('signupError');

        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.display = 'block';
            return;
        }

        if (users.some(u => u.email === email)) {
            errorElement.textContent = 'Email already exists';
            errorElement.style.display = 'block';
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        updateAuthUI();
        authModal.style.display = 'none';
        showNotification('Account created successfully!', 'success');
    }

    function updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        if (currentUser) {
            authButtons.innerHTML = `
                <span class="user-name">Welcome, ${currentUser.name}</span>
                <button onclick="handleLogout()" class="btn-auth">Logout</button>
            `;
        } else {
            authButtons.innerHTML = `
                <button id="loginBtn" class="btn-auth">Login</button>
                <button id="signupBtn" class="btn-auth btn-primary">Sign Up</button>
            `;
            // Reattach event listeners
            document.getElementById('loginBtn').addEventListener('click', () => {
                authModal.style.display = 'flex';
                showLoginForm();
            });
            document.getElementById('signupBtn').addEventListener('click', () => {
                authModal.style.display = 'flex';
                showSignupForm();
            });
        }
    }

    // Auth Event Listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            authModal.style.display = 'flex';
            showLoginForm();
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            authModal.style.display = 'flex';
            showSignupForm();
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Switch between login and signup forms
    authSwitch.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.getAttribute('href') === '#signup') {
                showSignupForm();
            } else {
                showLoginForm();
            }
        });
    });

    // Form submissions
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // Initialize Recipe Generation
    const ingredientInput = document.getElementById('ingredientInput');
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    const selectedIngredientsContainer = document.getElementById('selectedIngredients');
    const generateRecipesBtn = document.getElementById('generateRecipesBtn');
    const recipeResults = document.getElementById('recipeResults');
    const recipeModal = document.getElementById('recipeModal');
    const recipeModalContent = document.getElementById('recipeModalContent');
    const loadingState = document.getElementById('loadingState');

    if (ingredientInput && addIngredientBtn) {
        addIngredientBtn.addEventListener('click', addIngredient);
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
            }
        });
    }

    if (generateRecipesBtn) {
        generateRecipesBtn.addEventListener('click', generateRecipes);
    }

    if (recipeModal) {
        recipeModal.addEventListener('click', (e) => {
            if (e.target === recipeModal) {
                recipeModal.style.display = 'none';
            }
        });
    }

    // Fridge Functionality
    const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems')) || [];
    function renderFridgeItems() {
        const grid = document.getElementById('fridgeItems');
        if (!grid) return;

        grid.innerHTML = fridgeItems.map(item => `
            <div class="item-card">
                <h3>${item.name}</h3>
                <p>Category: ${item.category}</p>
                <p>Expiry: ${new Date(item.expiry).toLocaleDateString()}</p>
                <p>Quantity: ${item.quantity}</p>
                <button class="btn-remove" data-id="${item.id}">Remove</button>
            </div>
        `).join('');

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = parseInt(btn.dataset.id);
                const index = fridgeItems.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    fridgeItems.splice(index, 1);
                    localStorage.setItem('fridgeItems', JSON.stringify(fridgeItems));
                    renderFridgeItems();
                    
                    // Dispatch event for analytics update
                    document.dispatchEvent(new Event('fridgeItemsChanged'));
                }
            });
        });
    }

    // Add Item Form
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                id: Date.now(),
                name: document.getElementById('itemName').value,
                category: document.getElementById('itemCategory').value,
                expiry: document.getElementById('itemExpiry').value,
                quantity: document.getElementById('itemQuantity').value
            };
            
            fridgeItems.push(newItem);
            localStorage.setItem('fridgeItems', JSON.stringify(fridgeItems));
            renderFridgeItems();
            addItemModal.style.display = 'none';
            e.target.reset();
            
            // Dispatch event for analytics update
            document.dispatchEvent(new Event('fridgeItemsChanged'));
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const body = document.body;
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    // Initialize UI
    updateAuthUI();
    renderFridgeItems();

    // Initialize Animations
    const animatedElements = document.querySelectorAll('.feature-card, .hero-section, .section');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });
        observer.observe(element);
    });

    // Initialize Stats Counter
    initStatsCounter();

    // Initialize Notifications
    initializeNotifications();
    
    // Initialize Meal Planner
    initializeMealPlanner();
    
    // Initialize Shopping List
    initializeShoppingList();
    
    // Initialize Analytics
    initializeAnalytics();

    // Recipe Generation Functions
    const selectedIngredients = new Set();

    function addIngredient() {
        const ingredient = ingredientInput.value.trim();
        if (!ingredient) return;

        if (selectedIngredients.has(ingredient)) {
            showNotification('Ingredient already added!', 'warning');
            return;
        }

        selectedIngredients.add(ingredient);
        ingredientInput.value = '';

        // Create and append ingredient tag
        const tag = document.createElement('div');
        tag.className = 'ingredient-tag';
        tag.innerHTML = `
            ${ingredient}
            <button class="remove-ingredient" onclick="this.parentElement.remove(); selectedIngredients.delete('${ingredient}');">×</button>
        `;
        selectedIngredientsContainer.appendChild(tag);
    }

    // Add event listener for generate recipes from shopping list
    document.getElementById('generateFromList')?.addEventListener('click', () => {
        const selectedItems = [];
        Object.values(shoppingList).forEach(category => {
            category.forEach(item => {
                if (!item.checked) {
                    selectedItems.push(item.name);
                }
            });
        });

        if (selectedItems.length === 0) {
            showNotification('Please add items to your shopping list first!', 'warning');
            return;
        }

        // Clear existing ingredients
        selectedIngredients.clear();
        if (selectedIngredientsContainer) {
            selectedIngredientsContainer.innerHTML = '';
        }

        // Add shopping list items as ingredients
        selectedItems.forEach(item => {
            selectedIngredients.add(item);
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${item}
                <button class="remove-ingredient" onclick="this.parentElement.remove(); selectedIngredients.delete('${item}');">×</button>
            `;
            if (selectedIngredientsContainer) {
                selectedIngredientsContainer.appendChild(tag);
            }
        });

        // Generate recipes
        generateRecipes();
    });

    function generateRecipes() {
        if (selectedIngredients.size === 0) {
            showNotification('Please add at least one ingredient!', 'warning');
            return;
        }

        const cuisineSelect = document.getElementById('cuisineFilter');
        const dietSelect = document.getElementById('dietFilter');
        
        const selectedCuisine = cuisineSelect ? cuisineSelect.value : 'any';
        const selectedDiet = dietSelect ? dietSelect.value : 'any';

        if (loadingState) loadingState.style.display = 'flex';
        if (recipeResults) recipeResults.innerHTML = '';

        // Simulate API call with setTimeout
        setTimeout(() => {
            try {
                const recipes = generateMockRecipes([...selectedIngredients], selectedCuisine, selectedDiet);
                if (recipes.length === 0) {
                    showNotification('No recipes found with the selected ingredients!', 'warning');
                } else {
                    displayRecipes(recipes);
                }
            } catch (error) {
                showNotification('Error generating recipes. Please try again.', 'error');
            } finally {
                if (loadingState) loadingState.style.display = 'none';
            }
        }, 1500);
    }

    function generateMockRecipes(ingredients, cuisine, diet) {
        const mockRecipes = [];
        const numRecipes = Math.min(6, Math.max(2, ingredients.length));
        const cuisines = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Thai'];
        const difficulties = ['Easy', 'Medium', 'Hard'];
        const recipeTypes = ['Curry', 'Stir Fry', 'Soup', 'Salad', 'Pasta', 'Rice Dish'];

        for (let i = 0; i < numRecipes; i++) {
            const usedIngredients = ingredients
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * ingredients.length) + 1);

            const recipeCuisine = cuisine !== 'any' ? cuisine : cuisines[Math.floor(Math.random() * cuisines.length)];
            const recipeType = recipeTypes[Math.floor(Math.random() * recipeTypes.length)];

            mockRecipes.push({
                id: i + 1,
                title: `${recipeCuisine} ${usedIngredients[0]} ${recipeType}`,
                ingredients: usedIngredients,
                cookingTime: Math.floor(Math.random() * 45) + 15,
                difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
                calories: Math.floor(Math.random() * 500) + 200,
                image: `https://source.unsplash.com/300x200/?${recipeCuisine.toLowerCase()},${usedIngredients[0]}`,
                instructions: [
                    'Prepare all ingredients',
                    'Heat oil in a pan',
                    'Add main ingredients and cook until tender',
                    'Add spices and seasonings',
                    'Cook for additional 5-10 minutes',
                    'Garnish and serve hot'
                ]
            });
        }

        return mockRecipes;
    }

    function displayRecipes(recipes) {
        if (!recipeResults) return;
        
        recipeResults.innerHTML = '';
        
        if (recipes.length === 0) {
            recipeResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>No recipes found with the selected ingredients and filters.</p>
                </div>
            `;
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
                <h3>${recipe.title}</h3>
                <p>🕒 ${recipe.cookingTime} mins | 🔥 ${recipe.difficulty}</p>
                <p>🥗 ${recipe.ingredients.join(', ')}</p>
                <button onclick="showRecipeModal(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">View Recipe</button>
            `;
            recipeResults.appendChild(card);
        });
    }

    window.showRecipeModal = function(recipe) {
        if (!recipeModal || !recipeModalContent) return;
        
        recipeModalContent.innerHTML = `
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-details">
                <p><strong>Cooking Time:</strong> ${recipe.cookingTime} minutes</p>
                <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
                <p><strong>Calories:</strong> ${recipe.calories} kcal</p>
                <h3>Ingredients:</h3>
                <ul>
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
                <h3>Instructions:</h3>
                <ol>
                    ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;
        recipeModal.style.display = 'flex';
    };
});

// Global function for logout (needed because it's called from inline onclick)
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <button id="loginBtn" class="btn-auth">Login</button>
            <button id="signupBtn" class="btn-auth btn-primary">Sign Up</button>
        `;
        // Reattach event listeners
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const authModal = document.getElementById('authModal');
        if (loginBtn && authModal) {
            loginBtn.addEventListener('click', () => {
                authModal.style.display = 'flex';
                document.querySelector('#loginForm').classList.add('active');
                document.querySelector('#signupForm').classList.remove('active');
            });
        }
        if (signupBtn && authModal) {
            signupBtn.addEventListener('click', () => {
                authModal.style.display = 'flex';
                document.querySelector('#signupForm').classList.add('active');
                document.querySelector('#loginForm').classList.remove('active');
            });
        }
    }
    showNotification('Logged out successfully!', 'success');
}

// Global function for notifications (needed for various features)
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let value = Math.floor(progress * (end - start) + start);
        
        // Format the value based on the suffix
        const suffix = obj.dataset.suffix || '';
        if (suffix === 'M+') {
            obj.textContent = value + suffix;
        } else if (suffix === '/7') {
            obj.textContent = '24/7';
        } else {
            obj.textContent = value + suffix;
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize Stats Counter
function initStatsCounter() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = statsSection.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    let text = stat.textContent;
                    if (text.includes('/7')) {
                        stat.dataset.value = '24';
                        stat.dataset.suffix = '/7';
                    } else if (text.includes('%')) {
                        stat.dataset.value = '95';
                        stat.dataset.suffix = '%';
                    } else if (text.includes('M+')) {
                        stat.dataset.value = '1';
                        stat.dataset.suffix = 'M+';
                    }
                    
                    if (stat.dataset.value) {
                        animateValue(stat, 0, parseInt(stat.dataset.value), 2000);
                    }
                });
                observer.unobserve(statsSection);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// Notification Functions
function initializeNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationList = document.getElementById('notificationList');
    const clearNotifications = document.getElementById('clearNotifications');

    updateNotificationCount();
    renderNotifications();

    if (clearNotifications) {
        clearNotifications.addEventListener('click', () => {
            notifications = [];
            localStorage.setItem('notifications', JSON.stringify(notifications));
            updateNotificationCount();
            renderNotifications();
        });
    }

    // Add demo notifications
    if (notifications.length === 0) {
        addNotification('Welcome to FreshGuard!', 'info');
        addNotification('Your milk will expire in 2 days', 'warning');
        addNotification('Temperature alert: Fridge is too warm (8°C)', 'alert');
    }
}

function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationCount();
    renderNotifications();
}

function updateNotificationCount() {
    const count = document.querySelector('.notification-count');
    const unreadCount = notifications.filter(n => !n.read).length;
    if (count) {
        count.textContent = unreadCount;
        count.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    notificationList.innerHTML = notifications.length > 0 
        ? notifications.map(notification => `
            <div class="notification-item ${notification.type} ${notification.read ? '' : 'unread'}"
                 data-id="${notification.id}">
                <p>${notification.message}</p>
                <small>${formatTimestamp(notification.timestamp)}</small>
            </div>
        `).join('')
        : '<div class="notification-item">No notifications</div>';

    // Add click handlers
    document.querySelectorAll('.notification-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            markNotificationAsRead(id);
        });
    });
}

function markNotificationAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateNotificationCount();
        renderNotifications();
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
}

// Meal Planner Functions
function initializeMealPlanner() {
    const mealCalendar = document.getElementById('mealCalendar');
    const currentWeekEl = document.getElementById('currentWeek');
    let currentDate = new Date();

    if (!mealCalendar) return;

    function renderMealCalendar() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        mealCalendar.innerHTML = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - currentDate.getDay() + i);
            
            const dayEl = document.createElement('div');
            dayEl.className = 'meal-day';
            dayEl.innerHTML = `
                <h4>${days[i]}</h4>
                <p class="date">${date.toLocaleDateString()}</p>
                <div class="meal-slots">
                    <div class="meal-slot" data-date="${date.toISOString()}" data-meal="breakfast">
                        <h5>Breakfast</h5>
                        <p>${getMeal(date, 'breakfast') || '+ Add meal'}</p>
                    </div>
                    <div class="meal-slot" data-date="${date.toISOString()}" data-meal="lunch">
                        <h5>Lunch</h5>
                        <p>${getMeal(date, 'lunch') || '+ Add meal'}</p>
                    </div>
                    <div class="meal-slot" data-date="${date.toISOString()}" data-meal="dinner">
                        <h5>Dinner</h5>
                        <p>${getMeal(date, 'dinner') || '+ Add meal'}</p>
                    </div>
                </div>
            `;
            mealCalendar.appendChild(dayEl);
        }

        // Add click handlers for meal slots
        document.querySelectorAll('.meal-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                showAddMealModal(slot.dataset.date, slot.dataset.meal);
            });
        });
    }

    function getMeal(date, mealType) {
        const dateStr = date.toISOString().split('T')[0];
        return mealPlan[dateStr]?.[mealType] || '';
    }

    function showAddMealModal(date, mealType) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Add Meal for ${new Date(date).toLocaleDateString()} - ${mealType}</h3>
                <form id="addMealForm">
                    <div class="form-group">
                        <label>Meal Name</label>
                        <input type="text" id="mealName" required>
                    </div>
                    <button type="submit" class="btn-primary">Save Meal</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const form = modal.querySelector('#addMealForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const mealName = document.getElementById('mealName').value;
            addMealToPlan(date, mealType, mealName);
            modal.remove();
            renderMealCalendar();
        });

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    }

    function addMealToPlan(date, mealType, mealName) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        if (!mealPlan[dateStr]) {
            mealPlan[dateStr] = {};
        }
        mealPlan[dateStr][mealType] = mealName;
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        showNotification('Meal added successfully!', 'success');
        
        // Dispatch event for analytics update
        document.dispatchEvent(new Event('mealPlanChanged'));
    }

    // Initialize calendar
    renderMealCalendar();

    // Add event listeners for navigation
    document.getElementById('prevWeek')?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        currentWeekEl.textContent = `Week of ${currentDate.toLocaleDateString()}`;
        renderMealCalendar();
        
        // Dispatch event for analytics update
        document.dispatchEvent(new Event('mealPlanChanged'));
    });

    document.getElementById('nextWeek')?.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        currentWeekEl.textContent = `Week of ${currentDate.toLocaleDateString()}`;
        renderMealCalendar();
        
        // Dispatch event for analytics update
        document.dispatchEvent(new Event('mealPlanChanged'));
    });
}

// Shopping List Functions
function initializeShoppingList() {
    const categories = ['produce', 'dairy', 'pantry', 'meat', 'other'];
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || {};
    
    // Initialize empty categories
    categories.forEach(category => {
        if (!shoppingList[category]) {
            shoppingList[category] = [];
        }
    });

    function renderShoppingList() {
        categories.forEach(category => {
            const list = document.querySelector(`#${category}List .shopping-items`);
            if (!list) return;

            list.innerHTML = shoppingList[category].map(item => `
                <li class="shopping-item">
                    <input type="checkbox" id="item-${item.id}" ${item.checked ? 'checked' : ''}>
                    <label for="item-${item.id}">${item.name}</label>
                    <span class="quantity">${item.quantity}</span>
                    <button class="remove-item" data-id="${item.id}" data-category="${category}">×</button>
                </li>
            `).join('');
        });

        updateEstimatedTotal();
    }

    function addItem(category, name, quantity) {
        const item = {
            id: Date.now(),
            name,
            quantity,
            checked: false
        };
        shoppingList[category].push(item);
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        renderShoppingList();
        showNotification('Item added to shopping list!', 'success');
        
        // Dispatch event for analytics update
        document.dispatchEvent(new Event('shoppingListChanged'));
    }

    function removeItem(category, id) {
        shoppingList[category] = shoppingList[category].filter(item => item.id !== parseInt(id));
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        renderShoppingList();
        
        // Dispatch event for analytics update
        document.dispatchEvent(new Event('shoppingListChanged'));
    }

    function updateEstimatedTotal() {
        const total = Object.values(shoppingList)
            .flat()
            .reduce((sum, item) => sum + (item.checked ? 0 : 300), 0); // ₹300 per item estimation
        document.getElementById('estimatedTotal').textContent = `₹${total.toFixed(2)}`;
    }

    // Add item button handler
    document.getElementById('addItemToList')?.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Add Item to Shopping List</h3>
                <form id="addShoppingItemForm">
                    <div class="form-group">
                        <label>Item Name</label>
                        <input type="text" id="itemName" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="itemCategory" required>
                            ${categories.map(cat => `
                                <option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="text" id="itemQuantity" placeholder="e.g., 2 lbs" required>
                    </div>
                    <button type="submit" class="btn-primary">Add Item</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const form = modal.querySelector('#addShoppingItemForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('itemName').value;
            const category = document.getElementById('itemCategory').value;
            const quantity = document.getElementById('itemQuantity').value;
            addItem(category, name, quantity);
            modal.remove();
        });

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    });

    // Event delegation for checkboxes and remove buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const { id, category } = e.target.dataset;
            removeItem(category, id);
        } else if (e.target.type === 'checkbox' && e.target.id.startsWith('item-')) {
            const id = parseInt(e.target.id.replace('item-', ''));
            const category = e.target.closest('.category').id.replace('List', '');
            const item = shoppingList[category].find(item => item.id === id);
            if (item) {
                item.checked = e.target.checked;
                localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
                updateEstimatedTotal();
                
                // Dispatch event for analytics update
                document.dispatchEvent(new Event('shoppingListChanged'));
            }
        }
    });

    // Share list
    document.getElementById('shareList')?.addEventListener('click', () => {
        const text = categories
            .map(category => {
                const items = shoppingList[category];
                if (items.length === 0) return '';
                return `${category.toUpperCase()}:\n${items.map(item => `- ${item.name} (${item.quantity})`).join('\n')}`;
            })
            .filter(Boolean)
            .join('\n\n');
        
        if (navigator.share) {
            navigator.share({
                title: 'Shopping List',
                text: text
            }).catch(() => {
                navigator.clipboard.writeText(text)
                    .then(() => showNotification('Shopping list copied to clipboard!', 'success'))
                    .catch(() => showNotification('Failed to copy shopping list', 'error'));
            });
        } else {
            navigator.clipboard.writeText(text)
                .then(() => showNotification('Shopping list copied to clipboard!', 'success'))
                .catch(() => showNotification('Failed to copy shopping list', 'error'));
        }
    });

    // Export list
    document.getElementById('exportList')?.addEventListener('click', () => {
        const text = categories
            .map(category => {
                const items = shoppingList[category];
                if (items.length === 0) return '';
                return `${category.toUpperCase()}:\n${items.map(item => `- ${item.name} (${item.quantity})`).join('\n')}`;
            })
            .filter(Boolean)
            .join('\n\n');
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping-list.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Shopping list downloaded!', 'success');
    });

    // Initial render
    renderShoppingList();
}

// Analytics Functions
function initializeAnalytics() {
    // Load Chart.js if not already loaded
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = renderCharts;
        document.head.appendChild(script);
    } else {
        renderCharts();
    }
}

function renderCharts() {
    // Get data from local storage
    const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems')) || [];
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || {};
    const mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || {};

    // Calculate waste reduction data
    const wasteData = calculateWasteReduction(fridgeItems);
    
    // Calculate spending data
    const spendingData = calculateSpendingData(shoppingList);
    
    // Calculate ingredient usage
    const ingredientData = calculateIngredientUsage(mealPlan);

    // Waste Reduction Chart
    const wasteCtx = document.getElementById('wasteChart')?.getContext('2d');
    if (wasteCtx) {
        new Chart(wasteCtx, {
            type: 'line',
            data: {
                labels: wasteData.labels,
                datasets: [{
                    label: 'Food Waste (kg)',
                    data: wasteData.values,
                    borderColor: '#4CAF50',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // Spending Analysis Chart
    const spendingCtx = document.getElementById('spendingChart')?.getContext('2d');
    if (spendingCtx) {
        new Chart(spendingCtx, {
            type: 'bar',
            data: {
                labels: spendingData.labels,
                datasets: [{
                    label: 'Monthly Spending (₹)',
                    data: spendingData.values,
                    backgroundColor: ['#2196F3', '#FF9800', '#9C27B0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // Most Used Ingredients Chart
    const ingredientsCtx = document.getElementById('ingredientsChart')?.getContext('2d');
    if (ingredientsCtx) {
        new Chart(ingredientsCtx, {
            type: 'doughnut',
            data: {
                labels: ingredientData.labels,
                datasets: [{
                    data: ingredientData.values,
                    backgroundColor: ['#4CAF50', '#F44336', '#FFC107', '#2196F3']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
}

function calculateWasteReduction(fridgeItems) {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const wasteData = {
        labels: months,
        values: Array(6).fill(0)
    };

    fridgeItems.forEach(item => {
        const expiryDate = new Date(item.expiry);
        const monthIndex = expiryDate.getMonth();
        if (expiryDate < now && monthIndex >= 0 && monthIndex < 6) {
            wasteData.values[monthIndex] += parseFloat(item.quantity) || 0;
        }
    });

    return wasteData;
}

function calculateSpendingData(shoppingList) {
    const categories = ['produce', 'dairy', 'pantry', 'meat', 'other'];
    const spendingData = {
        labels: ['Groceries', 'Takeout', 'Dining'],
        values: [0, 0, 0]
    };

    // Calculate grocery spending
    categories.forEach(category => {
        if (shoppingList[category]) {
            shoppingList[category].forEach(item => {
                if (!item.checked) {
                    spendingData.values[0] += 300; // ₹300 per unchecked item
                }
            });
        }
    });

    // Add some random variation for takeout and dining
    spendingData.values[1] = Math.floor(Math.random() * 5000) + 1000;
    spendingData.values[2] = Math.floor(Math.random() * 7000) + 2000;

    return spendingData;
}

function calculateIngredientUsage(mealPlan) {
    const ingredientData = {
        labels: ['Vegetables', 'Proteins', 'Grains', 'Dairy'],
        values: [0, 0, 0, 0]
    };

    Object.values(mealPlan).forEach(day => {
        Object.values(day).forEach(meal => {
            if (meal.toLowerCase().includes('vegetable') || meal.toLowerCase().includes('salad')) {
                ingredientData.values[0]++;
            } else if (meal.toLowerCase().includes('chicken') || meal.toLowerCase().includes('meat') || meal.toLowerCase().includes('fish')) {
                ingredientData.values[1]++;
            } else if (meal.toLowerCase().includes('rice') || meal.toLowerCase().includes('pasta') || meal.toLowerCase().includes('bread')) {
                ingredientData.values[2]++;
            } else if (meal.toLowerCase().includes('milk') || meal.toLowerCase().includes('cheese') || meal.toLowerCase().includes('yogurt')) {
                ingredientData.values[3]++;
            }
        });
    });

    return ingredientData;
}

// Update charts when data changes
function updateCharts() {
    if (window.Chart) {
        Chart.helpers.each(Chart.instances, function(instance) {
            instance.destroy();
        });
        renderCharts();
    }
}

// Add event listeners for data changes
document.addEventListener('DOMContentLoaded', () => {
    // Update charts when fridge items change
    document.addEventListener('fridgeItemsChanged', updateCharts);
    
    // Update charts when shopping list changes
    document.addEventListener('shoppingListChanged', updateCharts);
    
    // Update charts when meal plan changes
    document.addEventListener('mealPlanChanged', updateCharts);
});

