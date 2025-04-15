// script.js (Updated and Working)
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Handling
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.nav-links');

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) section.classList.add('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.hash.substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showSection(sectionId);
        });
    });

    // Mobile Menu
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    // Get Started Button
    document.querySelector('.hero-section .btn-primary').addEventListener('click', () => {
        document.querySelector('[href="#fridge"]').click();
    });

    // Fridge Functionality
    const fridgeItems = JSON.parse(localStorage.getItem('fridgeItems')) || [];
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemModal = document.getElementById('addItemModal');
    const closeModals = document.querySelectorAll('.close-modal');

    // Modal Handling
    addItemBtn.addEventListener('click', () => addItemModal.style.display = 'flex');
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Add Item Form
    document.getElementById('addItemForm').addEventListener('submit', (e) => {
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
    });

    function renderFridgeItems() {
        const grid = document.getElementById('fridgeItems');
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
                fridgeItems.splice(index, 1);
                localStorage.setItem('fridgeItems', JSON.stringify(fridgeItems));
                renderFridgeItems();
            });
        });
    }

    // Initial Load
    renderFridgeItems();
});

// Section Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.querySelector(targetId).classList.add('active');
        
        // Update active nav link
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Add to script.js
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Check saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Optional: System preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
prefersDark.addEventListener('change', e => {
    if(!localStorage.getItem('theme')) {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// Update notification count dynamically
function updateNotificationCount() {
    const notificationItems = document.querySelectorAll('.notification-item');
    const countElement = document.querySelector('.notification-count');
    countElement.textContent = notificationItems.length;
  }
  
  // Initialize count
  updateNotificationCount();