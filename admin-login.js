import { LoginUI } from './modules/login-ui.js';
import { DocumentStorage } from './modules/document-storage.js';
import { AdminUtils } from './modules/admin-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Make AdminUtils globally available
    window.AdminUtils = AdminUtils;

    const documentStorage = new DocumentStorage();
    const loginUI = new LoginUI(documentStorage);
    
    // Close document viewer modal
    const closeDocumentViewer = document.querySelector('.document-viewer-close');
    if (closeDocumentViewer) {
        closeDocumentViewer.addEventListener('click', () => {
            const documentViewerModal = document.getElementById('document-viewer-modal');
            documentViewerModal.style.display = 'none';
        });
    }

    // Add or create document upload modal if it doesn't exist
    function ensureDocumentUploadModal() {
        let uploadModal = document.querySelector('.document-upload-modal');
        
        if (!uploadModal) {
            uploadModal = document.createElement('div');
            uploadModal.classList.add('document-upload-modal');
            uploadModal.innerHTML = `
                <div class="document-upload-content">
                    <h2>Téléverser un document</h2>
                    <form class="document-upload-form">
                        <input type="text" placeholder="Nom du document" required>
                        <input type="file" required>
                        <div class="upload-actions">
                            <button type="submit" class="btn btn-upload">Téléverser</button>
                            <button type="button" class="btn btn-cancel">Annuler</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(uploadModal);
        }
        
        return uploadModal;
    }

    // Add global methods for document interactions
    window.openUploadModal = (filiere) => {
        const uploadModal = ensureDocumentUploadModal();
        const uploadForm = uploadModal.querySelector('.document-upload-form');
        
        if (uploadModal) {
            uploadModal.style.display = 'flex';
            uploadModal.dataset.filiere = filiere;
        }

        // Reset previous event listener to prevent multiple bindings
        if (uploadForm) {
            const newUploadForm = uploadForm.cloneNode(true);
            uploadForm.parentNode.replaceChild(newUploadForm, uploadForm);

            newUploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const fileInput = newUploadForm.querySelector('input[type="file"]');
                const nameInput = newUploadForm.querySelector('input[type="text"]');
                const filiere = uploadModal.dataset.filiere;
                
                if (fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        const documentInfo = {
                            name: nameInput.value || file.name,
                            url: event.target.result,
                            type: file.type
                        };
                        
                        documentStorage.addDocument(filiere, documentInfo);
                        
                        // Reset form and hide modal
                        newUploadForm.reset();
                        uploadModal.style.display = 'none';
                    };
                    
                    reader.readAsDataURL(file);
                } else {
                    alert('Veuillez choisir un fichier');
                }
            });
        }

        // Close button functionality
        const cancelButton = uploadModal.querySelector('.btn-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                uploadModal.style.display = 'none';
            });
        }
    };

    // Global method to preview a document
    window.previewDocument = (documentUrl) => {
        const documentViewerModal = document.getElementById('document-viewer-modal');
        const documentPreview = document.getElementById('document-preview');
        
        if (documentViewerModal && documentPreview) {
            documentPreview.src = documentUrl;
            documentViewerModal.style.display = 'flex';
        }
    };

    window.clearDocuments = (filiere) => {
        documentStorage.clearDocuments(filiere);
    };
});