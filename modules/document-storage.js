import { AdminUtils } from './admin-utils.js';

export class DocumentStorage {
    constructor() {
        this.MAX_STORAGE_SIZE = 100 * 1024 * 1024; // Increased to 100MB
        this.storage = this.initializeStorage();
        window.addEventListener('DOMContentLoaded', () => this.updateFiliereDocumentLists());
    }

    initializeStorage() {
        const storedData = localStorage.getItem('documentStorage');
        return storedData ? JSON.parse(storedData) : this.createEmptyStorage();
    }

    createEmptyStorage() {
        const defaultFilieres = [
            '2GT', '1ST2S', 'TST2S', 'ASSP', 'CIEL', 'MELEC', 'TRPM-RSP', 
            'TMA', 'MEE', 'ERA', 'MFER', 'AAGA', 'CAP-Ebeniste', 'CAP-MIS', 
            'BMA-Ebeniste', 'MC-AD', '3PM', 'BTS-ESF', 'DPR', 'Famille-TNE'
        ];

        const emptyStorage = {};
        defaultFilieres.forEach(filiere => {
            emptyStorage[filiere] = [];
        });

        this.safelySetLocalStorage(emptyStorage);
        return emptyStorage;
    }

    safelySetLocalStorage(data) {
        try {
            // Stringify the data first to check size
            const stringifiedData = JSON.stringify(data);
            
            // If data is too large, prune or clear
            if (new Blob([stringifiedData]).size > this.MAX_STORAGE_SIZE) {
                console.warn('Storage limit approaching. Pruning documents.');
                this.pruneOldDocuments(data);
            }
            
            localStorage.setItem('documentStorage', stringifiedData);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            // Handle different types of storage errors
            if (error.name === 'QuotaExceededError' || 
                error.code === 22 || 
                error.message.includes('QuotaExceededError') ||
                error.message.includes('storage quota')) {
                
                // Aggressive pruning if quota is exceeded
                this.clearOldestDocuments(data);
            } else {
                // If pruning doesn't work, reset storage
                this.createEmptyStorage();
            }
        }
    }

    pruneOldDocuments(data, maxDocumentsPerFiliere = 100) {
        // Prune documents, keeping the most recent ones
        Object.keys(data).forEach(filiere => {
            if (data[filiere].length > maxDocumentsPerFiliere) {
                data[filiere] = data[filiere]
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .slice(0, maxDocumentsPerFiliere);
            }
        });
        
        return data;
    }

    clearOldestDocuments(data) {
        // Get all documents across all filieres
        const allDocuments = Object.values(data).flat();
        
        // Sort by timestamp and remove half of the oldest documents
        const sortedDocuments = allDocuments
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        const documentsToRemove = sortedDocuments.slice(0, Math.floor(sortedDocuments.length / 2));
        
        // Remove these documents from their respective filieres
        Object.keys(data).forEach(filiere => {
            data[filiere] = data[filiere].filter(
                doc => !documentsToRemove.some(removeDoc => removeDoc.id === doc.id)
            );
        });
        
        return data;
    }

    addDocument(filiere, documentInfo) {
        // Add timestamp and unique ID
        documentInfo.timestamp = Date.now();
        documentInfo.id = `${documentInfo.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
        
        const normalizedKey = this.getNormalizedKey(filiere);
        
        // Find or create storage for the filiere
        if (!this.storage[normalizedKey]) {
            this.storage[normalizedKey] = [];
        }
        
        // Check for duplicates before adding
        const isDuplicate = this.storage[normalizedKey].some(
            doc => doc.name === documentInfo.name && doc.url === documentInfo.url
        );
        
        if (!isDuplicate) {
            this.storage[normalizedKey].push(documentInfo);
        }
        
        // Safely save to local storage
        this.safelySetLocalStorage(this.storage);
        
        // Update UI
        setTimeout(() => this.updateFiliereDocumentLists(), 100);
    }

    getNormalizedKey(filiere) {
        const normalizations = {
            'Famille de métiers Transitions Numérique et Energétique (TNE)': 'Famille-TNE',
            'BTS - Économie Sociale Familiale (ESF)': 'BTS-ESF',
            'Dispositifs de Prévention et de Remobilisation (DPR)': 'DPR'
        };

        return normalizations[filiere] || filiere;
    }

    getDocuments(filiere) {
        const normalizedKey = this.getNormalizedKey(filiere);
        
        // Collect documents from all possible matching keys
        const matchingDocuments = Object.entries(this.storage)
            .filter(([key]) => 
                key === normalizedKey || 
                key === filiere || 
                key.includes(filiere) || 
                filiere.includes(key)
            )
            .flatMap(([, docs]) => docs);

        // Remove duplicates and return
        return Array.from(new Set(matchingDocuments.map(JSON.stringify)))
            .map(JSON.parse);
    }

    removeDocument(filiere, documentId) {
        const normalizedKey = this.getNormalizedKey(filiere);
        
        // Find keys matching the filiere
        const matchingKeys = Object.keys(this.storage).filter(
            key => key === normalizedKey || 
                   key === filiere || 
                   key.includes(filiere) || 
                   filiere.includes(key)
        );

        // Remove document with matching ID from all matching keys
        matchingKeys.forEach(key => {
            if (this.storage[key]) {
                this.storage[key] = this.storage[key].filter(doc => doc.id !== documentId);
            }
        });
        
        this.safelySetLocalStorage(this.storage);
    }

    clearDocuments(filiere) {
        const normalizedKey = this.getNormalizedKey(filiere);
        
        // Find keys matching the filiere
        const matchingKeys = Object.keys(this.storage).filter(
            key => key === normalizedKey || 
                   key === filiere || 
                   key.includes(filiere) || 
                   filiere.includes(key)
        );

        // Clear documents for all matching keys
        matchingKeys.forEach(key => {
            if (this.storage[key]) {
                this.storage[key] = [];
            }
        });
        
        this.safelySetLocalStorage(this.storage);
    }

    updateFiliereDocumentLists() {
        const categoryItems = document.querySelectorAll('.category-item');
        
        categoryItems.forEach(categoryItem => {
            const filiere = categoryItem.getAttribute('data-filiere');
            const h3Text = categoryItem.querySelector('h3') 
                ? categoryItem.querySelector('h3').textContent.trim() 
                : null;
            
            const documents = this.getDocuments(filiere) || 
                             this.getDocuments(h3Text) || 
                             [];
            
            this.updateFiliereDocumentList(categoryItem, filiere, documents);
        });
    }

    updateFiliereDocumentList(filiereSection, filiere, documents) {
        documents = documents || [];

        let documentList = filiereSection.querySelector('.filiere-document-list');
        if (!documentList) {
            documentList = document.createElement('div');
            documentList.classList.add('filiere-document-list');
            filiereSection.appendChild(documentList);
        }
        
        let documentCount = filiereSection.querySelector('.document-count');
        if (!documentCount) {
            documentCount = document.createElement('div');
            documentCount.classList.add('document-count');
            filiereSection.insertBefore(documentCount, documentList);
        }
        documentCount.textContent = `${documents.length} documents`;

        // Ensure only one "no documents" message
        const existingNoDocMessage = documentList.querySelector('.no-documents');
        
        if (documents.length > 0) {
            // Remove "no documents" message if it exists
            if (existingNoDocMessage) {
                existingNoDocMessage.remove();
            }
            
            documentList.innerHTML = documents.map((doc, index) => `
                <div class="document-entry" data-index="${index}" data-id="${doc.id}">
                    <span>${doc.name}</span>
                    <button class="btn btn-preview" onclick="window.previewDocument('${doc.url}')">Aperçu</button>
                </div>
            `).join('');
        } else {
            // Show "no documents" only if there are truly no documents
            if (!existingNoDocMessage) {
                const noDocMessage = document.createElement('div');
                noDocMessage.classList.add('no-documents');
                noDocMessage.textContent = 'Aucun document disponible';
                documentList.appendChild(noDocMessage);
            }
        }
    }
}