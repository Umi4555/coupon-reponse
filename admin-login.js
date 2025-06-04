import { LoginUI } from './modules/login-ui.js';
import { DocumentStorage } from './modules/document-storage.js';
import { AdminUtils } from './modules/admin-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Make AdminUtils globally available
    window.AdminUtils = AdminUtils;

    const documentStorage = new DocumentStorage();
    const loginUI = new LoginUI(documentStorage);
    
    // Global method for creating a unified document preview
    function createOrGetDocumentPreviewModal() {
        let previewModal = document.getElementById('global-document-preview-modal');
        
        if (!previewModal) {
            previewModal = document.createElement('div');
            previewModal.id = 'global-document-preview-modal';
            previewModal.classList.add('global-document-preview-modal');
            previewModal.innerHTML = `
                <div class="global-document-preview-content">
                    <span class="global-document-preview-close">×</span>
                    <iframe id="global-document-preview" src="" frameborder="0"></iframe>
                </div>
            `;
            document.body.appendChild(previewModal);

            // Add styles for the global preview modal
            const style = document.createElement('style');
            style.textContent = `
                .global-document-preview-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 3000;
                    justify-content: center;
                    align-items: center;
                }

                .global-document-preview-content {
                    position: relative;
                    width: 90%;
                    max-width: 1200px;
                    height: 90vh;
                    background: var(--dark-accent);
                    border-radius: 15px;
                    padding: 1rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }

                .global-document-preview-close {
                    position: absolute;
                    top: 10px;
                    right: 20px;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }

                .global-document-preview-close:hover {
                    color: var(--primary-highlight);
                }

                #global-document-preview {
                    width: 100%;
                    height: 100%;
                    border: none;
                    border-radius: 10px;
                }
            `;
            document.head.appendChild(style);

            // Close button functionality
            const closeButton = previewModal.querySelector('.global-document-preview-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    previewModal.style.display = 'none';
                });
            }
        }
        
        return previewModal;
    }

    // Centralized document preview method
    window.previewDocument = (documentUrl) => {
        const previewModal = createOrGetDocumentPreviewModal();
        const previewIframe = previewModal.querySelector('#global-document-preview');
        
        if (previewModal && previewIframe) {
            previewIframe.src = documentUrl;
            previewModal.style.display = 'flex';
        }
    };

    // Close document viewer modal
    const closeDocumentViewer = document.querySelector('.document-viewer-close');
    if (closeDocumentViewer) {
        closeDocumentViewer.addEventListener('click', () => {
            const documentViewerModal = document.getElementById('document-viewer-modal');
            documentViewerModal.style.display = 'none';
        });
    }

    // Function to create or retrieve the document preview modal within admin dashboard
    function ensureInlineDocumentPreviewModal() {
        let previewModal = document.querySelector('.admin-inline-document-preview');
        
        if (!previewModal) {
            previewModal = document.createElement('div');
            previewModal.classList.add('admin-inline-document-preview');
            previewModal.innerHTML = `
                <div class="admin-inline-document-preview-content">
                    <span class="admin-inline-preview-close">×</span>
                    <iframe id="admin-inline-document-preview" src="" frameborder="0"></iframe>
                </div>
            `;
            document.querySelector('.admin-content')?.appendChild(previewModal);
        }

        const closeButton = previewModal.querySelector('.admin-inline-preview-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                previewModal.style.display = 'none';
            });
        }
        
        return previewModal;
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

    window.clearDocuments = (filiere) => {
        documentStorage.clearDocuments(filiere);
    };
});