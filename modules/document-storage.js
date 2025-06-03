import { AdminUtils } from './admin-utils.js';

export class DocumentStorage {
    constructor() {
        this.storage = this.initializeStorage();
        // Add event listener to update document lists when page loads
        window.addEventListener('DOMContentLoaded', () => this.updateFiliereDocumentLists());
    }

    initializeStorage() {
        const storedData = localStorage.getItem('documentStorage');
        return storedData ? JSON.parse(storedData) : this.createEmptyStorage();
    }

    createEmptyStorage() {
        const emptyStorage = {
            '2GT': [], '1ST2S': [], 'TST2S': [], 'ASSP': [], 'CIEL': [], 
            'MELEC': [], 'TRPM-RSP': [], 'TMA': [], 'MEE': [], 'ERA': [], 
            'MFER': [], 'AAGA': [], 'CAP-Ebeniste': [], 'CAP-MIS': [], 
            'BMA-Ebeniste': [], 'MC-AD': [], '3PM': [], 'BTS-ESF': [], 
            'DPR': [], 
            'Famille-TNE': [],
            'Famille de métiers Transitions Numérique et Energétique (TNE)': [],
            'BTS - Économie Sociale Familiale (ESF)': [],
            'Dispositifs de Prévention et de Remobilisation (DPR)': []
        };
        localStorage.setItem('documentStorage', JSON.stringify(emptyStorage));
        return emptyStorage;
    }

    addDocument(filiere, documentInfo) {
        documentInfo.id = Date.now().toString();
        
        const normalizations = {
            'Famille de métiers Transitions Numérique et Energétique (TNE)': 'Famille-TNE',
            'BTS - Économie Sociale Familiale (ESF)': 'BTS-ESF',
            'Dispositifs de Prévention et de Remobilisation (DPR)': 'DPR'
        };

        let storageKey = normalizations[filiere] || filiere;
        
        if (!this.storage[storageKey]) {
            const matchingKey = Object.keys(this.storage).find(
                key => key === filiere || 
                       key.includes(filiere) || 
                       filiere.includes(key)
            );
            
            storageKey = matchingKey || storageKey;
        }

        if (!this.storage[storageKey]) {
            this.storage[storageKey] = [];
        }
        
        this.storage[storageKey].push(documentInfo);
        
        this.saveToLocalStorage();
    }

    getDocuments(filiere) {
        const normalizations = {
            'Famille de métiers Transitions Numérique et Energétique (TNE)': 'Famille-TNE',
            'BTS - Économie Sociale Familiale (ESF)': 'BTS-ESF',
            'Dispositifs de Prévention et de Remobilisation (DPR)': 'DPR'
        };

        const normalizedKey = normalizations[filiere] || filiere;
        
        // Check if exact key exists
        if (this.storage[normalizedKey]) {
            return this.storage[normalizedKey];
        }

        // Check for partial matches
        const matchingDocuments = Object.entries(this.storage)
            .filter(([key]) => 
                key === filiere || 
                key.includes(filiere) || 
                filiere.includes(key)
            )
            .flatMap(([, docs]) => docs);

        return matchingDocuments;
    }

    removeDocument(filiere, index) {
        const normalizations = {
            'Famille de métiers Transitions Numérique et Energétique (TNE)': 'Famille-TNE',
            'BTS - Économie Sociale Familiale (ESF)': 'BTS-ESF',
            'Dispositifs de Prévention et de Remobilisation (DPR)': 'DPR'
        };

        const normalizedKey = normalizations[filiere] || filiere;
        
        const storageKey = Object.keys(this.storage).find(
            key => key === normalizedKey || 
                   key.includes(normalizedKey) || 
                   normalizedKey.includes(key)
        ) || normalizedKey;

        if (this.storage[storageKey]) {
            this.storage[storageKey].splice(index, 1);
            this.saveToLocalStorage();
        }
    }

    clearDocuments(filiere) {
        const normalizations = {
            'Famille de métiers Transitions Numérique et Energétique (TNE)': 'Famille-TNE',
            'BTS - Économie Sociale Familiale (ESF)': 'BTS-ESF',
            'Dispositifs de Prévention et de Remobilisation (DPR)': 'DPR'
        };

        const normalizedKey = normalizations[filiere] || filiere;
        
        const storageKey = Object.keys(this.storage).find(
            key => key === normalizedKey || 
                   key.includes(normalizedKey) || 
                   normalizedKey.includes(key)
        ) || normalizedKey;

        if (this.storage[storageKey]) {
            this.storage[storageKey] = [];
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('documentStorage', JSON.stringify(this.storage));
        // Delay the update to ensure DOM is fully loaded
        setTimeout(() => this.updateFiliereDocumentLists(), 100);
    }

    updateFiliereDocumentLists() {
        Object.entries(this.storage).forEach(([filiere, documents]) => {
            // Select elements with data-filiere attribute or with matching h3 text
            const filiereElements = Array.from(document.querySelectorAll('.category-item'))
                .filter(element => 
                    element.getAttribute('data-filiere') === filiere || 
                    element.querySelector('h3') && element.querySelector('h3').textContent.trim() === filiere
                );
            
            filiereElements.forEach(element => {
                const categoryItem = element.closest('.category-item') || element;
                this.updateFiliereDocumentList(categoryItem, filiere, documents);
            });
        });
    }

    updateFiliereDocumentList(filiereSection, filiere, documents) {
        // Ensure documents are an array
        documents = documents || [];

        let documentList = filiereSection.querySelector('.filiere-document-list');
        if (!documentList) {
            documentList = document.createElement('div');
            documentList.classList.add('filiere-document-list');
            filiereSection.appendChild(documentList);
        }
        
        // Update document count
        let documentCount = filiereSection.querySelector('.document-count');
        if (!documentCount) {
            documentCount = document.createElement('div');
            documentCount.classList.add('document-count');
            filiereSection.insertBefore(documentCount, documentList);
        }
        documentCount.textContent = `${documents.length} documents`;

        // Populate document list
        if (documents.length > 0) {
            documentList.innerHTML = documents.map((doc, index) => `
                <div class="document-entry" data-index="${index}">
                    <span>${doc.name}</span>
                    <button class="btn btn-preview" onclick="window.previewDocument('${doc.url}')">Aperçu</button>
                </div>
            `).join('');
        } else {
            documentList.innerHTML = '<div class="no-documents">Aucun document disponible</div>';
        }
    }
}