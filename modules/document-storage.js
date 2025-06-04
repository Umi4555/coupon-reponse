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
            'BMA-Ebeniste': [], 'MC-AD': [], '3PM': [], 
            'BTS-ESF': [], 
            'DPR': [], 
            'Famille-TNE': [],
            'Famille de métiers Transitions Numérique et Energétique (TNE)': [],
            'BTS - Économie Sociale Familiale (ESF)': [],
            'Dispositifs de Prévention et de Remobilisation (DPR)': []
        };
        localStorage.setItem('documentStorage', JSON.stringify(emptyStorage));
        return emptyStorage;
    }

    getNormalizedKey(filiere) {
        const normalizations = {
            'Famille de métiers Transitions Numérique et Energétique (TNE)': 'Famille-TNE',
            'BTS - Économie Sociale Familiale (ESF)': 'BTS-ESF',
            'Dispositifs de Prévention et de Remobilisation (DPR)': 'DPR'
        };

        return normalizations[filiere] || filiere;
    }

    addDocument(filiere, documentInfo) {
        documentInfo.id = Date.now().toString();
        
        const normalizedKey = this.getNormalizedKey(filiere);
        
        // Ensure all possible variations of the key are populated
        const keys = [
            normalizedKey, 
            filiere,
            ...(Object.keys(this.storage).filter(key => 
                key === filiere || 
                key.includes(filiere) || 
                filiere.includes(key)
            ))
        ];

        const uniqueKeys = [...new Set(keys)];
        
        uniqueKeys.forEach(key => {
            if (!this.storage[key]) {
                this.storage[key] = [];
            }
            
            // Prevent duplicate documents
            const isDuplicate = this.storage[key].some(
                doc => doc.name === documentInfo.name && doc.url === documentInfo.url
            );
            
            if (!isDuplicate) {
                this.storage[key].push(documentInfo);
            }
        });
        
        this.saveToLocalStorage();
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

        // Remove duplicates based on document properties
        return Array.from(new Set(matchingDocuments.map(JSON.stringify)))
            .map(JSON.parse);
    }

    removeDocument(filiere, index) {
        const normalizedKey = this.getNormalizedKey(filiere);
        
        const matchingKeys = Object.keys(this.storage).filter(
            key => key === normalizedKey || 
                   key === filiere || 
                   key.includes(filiere) || 
                   filiere.includes(key)
        );

        matchingKeys.forEach(key => {
            if (this.storage[key] && this.storage[key][index]) {
                this.storage[key].splice(index, 1);
            }
        });
        
        this.saveToLocalStorage();
    }

    clearDocuments(filiere) {
        const normalizedKey = this.getNormalizedKey(filiere);
        
        const matchingKeys = Object.keys(this.storage).filter(
            key => key === normalizedKey || 
                   key === filiere || 
                   key.includes(filiere) || 
                   filiere.includes(key)
        );

        matchingKeys.forEach(key => {
            if (this.storage[key]) {
                this.storage[key] = [];
            }
        });
        
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('documentStorage', JSON.stringify(this.storage));
        // Delay the update to ensure DOM is fully loaded
        setTimeout(() => this.updateFiliereDocumentLists(), 100);
    }

    updateFiliereDocumentLists() {
        const categoryItems = document.querySelectorAll('.category-item');
        
        categoryItems.forEach(categoryItem => {
            const filiere = categoryItem.getAttribute('data-filiere');
            const h3Text = categoryItem.querySelector('h3') 
                ? categoryItem.querySelector('h3').textContent.trim() 
                : null;
            
            // Try multiple ways to identify the filiere
            const documents = this.getDocuments(filiere) || 
                             this.getDocuments(h3Text) || 
                             [];
            
            this.updateFiliereDocumentList(categoryItem, filiere, documents);
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
            
            // Remove "no documents" message if it exists
            const noDocumentsMessage = documentList.querySelector('.no-documents');
            if (noDocumentsMessage) {
                noDocumentsMessage.remove();
            }
        } else {
            // Only show "no documents" if there are truly no documents
            documentList.innerHTML = '<div class="no-documents">Aucun document disponible</div>';
        }
    }
}