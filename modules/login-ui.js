import { ADMIN_PASSWORD } from './admin-utils.js';

export class LoginUI {
    constructor(documentStorage) {
        this.documentStorage = documentStorage;
        this.initEventListeners();
    }

    initEventListeners() {
        const adminLoginNav = document.getElementById('admin-login-nav');
        const adminLoginModal = document.getElementById('admin-login');
        const loginForm = adminLoginModal.querySelector('.login-form');
        const closeLoginButtons = adminLoginModal.querySelectorAll('.btn-close');

        if (adminLoginNav) {
            adminLoginNav.addEventListener('click', () => {
                adminLoginModal.style.display = 'flex';
                adminLoginModal.classList.add('show');
                
                // Reset password input when modal is opened
                const passwordInput = loginForm.querySelector('input[type="password"]');
                passwordInput.value = ''; // Clear the password
                passwordInput.classList.remove('input-error');
                
                // Remove any existing error message
                const existingError = passwordInput.nextElementSibling;
                if (existingError && existingError.classList.contains('login-error')) {
                    existingError.remove();
                }
            });
        }

        closeLoginButtons.forEach(button => {
            button.addEventListener('click', () => {
                adminLoginModal.style.display = 'none';
                adminLoginModal.classList.remove('show');
                
                // Reset password input when modal is closed
                const passwordInput = loginForm.querySelector('input[type="password"]');
                passwordInput.value = ''; // Clear the password
                passwordInput.classList.remove('input-error');
                
                // Remove any existing error message
                const existingError = passwordInput.nextElementSibling;
                if (existingError && existingError.classList.contains('login-error')) {
                    existingError.remove();
                }
            });
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = loginForm.querySelector('input[type="password"]');
            
            if (this.validateLogin(passwordInput.value)) {
                this.showAdminDashboard();
            } else {
                this.showLoginError(passwordInput);
            }
        });
    }

    validateLogin(password) {
        return password === ADMIN_PASSWORD;
    }

    showLoginError(passwordInput) {
        passwordInput.classList.add('input-error');
        const errorMessage = document.createElement('span');
        errorMessage.classList.add('login-error');
        errorMessage.textContent = 'Mot de passe incorrect';
        
        // Remove any existing error message
        const existingError = passwordInput.nextElementSibling;
        if (existingError && existingError.classList.contains('login-error')) {
            existingError.remove();
        }
        
        passwordInput.parentNode.insertBefore(errorMessage, passwordInput.nextSibling);
        
        setTimeout(() => {
            passwordInput.classList.remove('input-error');
        }, 500);
    }

    showAdminDashboard() {
        // Ensure the admin dashboard is created and added to the document if it doesn't exist
        let adminDashboard = document.querySelector('.admin-dashboard');
        if (!adminDashboard) {
            adminDashboard = this.createAdminDashboard();
        }

        const adminLoginModal = document.getElementById('admin-login');
        const adminDashboardContainer = adminDashboard.querySelector('.admin-dashboard-container');
        
        if (adminLoginModal && adminDashboard && adminDashboardContainer) {
            // Reset password input 
            const passwordInput = adminLoginModal.querySelector('input[type="password"]');
            if (passwordInput) {
                passwordInput.value = ''; // Clear the password
            }

            // Hide login modal
            adminLoginModal.style.display = 'none';
            adminLoginModal.classList.remove('show');
            
            // Show admin dashboard
            adminDashboard.style.display = 'flex';
            adminDashboard.classList.add('show');
            adminDashboardContainer.classList.add('show');
            
            this.populateDashboardContent();
        } else {
            console.error('Unable to show admin dashboard: Elements not found');
        }
    }

    createAdminDashboard() {
        const dashboardHTML = `
        <div class="admin-dashboard">
            <div class="admin-dashboard-container">
                <div class="admin-header">
                    <div class="logo-container">
                        <img src="logo-lycee.png" alt="Logo Lycée Château Blanc" class="lycee-logo">
                        <h1>Espace Administration</h1>
                    </div>
                    <button id="close-dashboard-btn">×</button>
                </div>
                <div class="admin-content"></div>
            </div>
        </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = dashboardHTML.trim();
        const adminDashboard = tempDiv.firstChild;
        
        document.body.appendChild(adminDashboard);

        // Add close dashboard functionality
        const closeDashboardBtn = adminDashboard.querySelector('#close-dashboard-btn');
        if (closeDashboardBtn) {
            closeDashboardBtn.addEventListener('click', () => {
                adminDashboard.style.display = 'none';
                adminDashboard.classList.remove('show');
            });
        }

        return adminDashboard;
    }

    populateDashboardContent() {
        const dashboardContent = document.querySelector('.admin-content');
        if (dashboardContent) {
            dashboardContent.innerHTML = `
                <section class="document-categories-section">
                    ${this.generateFiliereGroups()}
                </section>
            `;
            this.attachDashboardEventListeners();
        }
    }

    createFiliereItem(filiere) {
        const fullName = window.AdminUtils 
            ? window.AdminUtils.getFiliereFullName(filiere) 
            : filiere;
        
        const documents = this.documentStorage 
            ? (this.documentStorage.getDocuments(filiere) || []) 
            : [];
        
        return `
            <div class="category-item" data-filiere="${filiere}">
                <div class="filiere-header">
                    <h3>${fullName}</h3>
                    <div class="document-count">${documents.length} documents</div>
                </div>
                <div class="filiere-actions">
                    <button class="btn btn-upload" onclick="window.openUploadModal('${filiere}')">Déposer</button>
                    <button class="btn btn-delete" onclick="window.clearDocuments('${filiere}')">Supprimer</button>
                </div>
                ${this.generateDocumentList(documents)}
            </div>
        `;
    }

    generateDocumentList(documents) {
        if (!documents || documents.length === 0) {
            return `<div class="no-documents">Aucun document disponible</div>`;
        }

        return `
            <div class="filiere-document-list">
                ${documents.map((doc, index) => `
                    <div class="document-entry" data-index="${index}">
                        <span>${doc.name}</span>
                        <button class="btn btn-preview" onclick="window.previewDocument('${doc.url}')">Aperçu</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateFiliereGroups() {
        const filiereGroups = {
            'Formations Générales et Technologiques': ['2GT', '1ST2S', 'TST2S'],
            'Services et Accompagnement Social': ['ASSP', 'AAGA', 'MC-AD'],
            'Technologies Numériques et Électroniques': ['Famille-TNE', 'CIEL', 'MELEC', 'MEE', 'MFER'],
            'Industrie et Fabrication': ['TRPM-RSP', 'TMA', 'ERA', 'CAP-Ebeniste', 'CAP-MIS', 'BMA-Ebeniste'],
            'Formations Supérieures et Dispositifs Spéciaux': ['BTS-ESF', 'DPR'],
            'Orientation et Préparation': ['3PM']
        };

        return Object.entries(filiereGroups).map(([groupName, filieres]) => `
            <div class="filiere-group">
                <h3>${groupName}</h3>
                <div class="filiere-items">
                    ${filieres.map(filiere => this.createFiliereItem(filiere)).join('')}
                </div>
            </div>
        `).join('');
    }

    attachDashboardEventListeners() {
        const closeDashboardBtn = document.getElementById('close-dashboard-btn');
        const adminDashboard = document.querySelector('.admin-dashboard');
        
        if (closeDashboardBtn && adminDashboard) {
            closeDashboardBtn.addEventListener('click', () => {
                adminDashboard.style.display = 'none';
                adminDashboard.classList.remove('show');
            });
        }
    }
}