// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBvp5blL0lt5qjUontHu9-XNZWUhyd-CP8",
    authDomain: "iw01-aka-250730.firebaseapp.com",
    projectId: "iw01-aka-250730",
    storageBucket: "iw01-aka-250730.firebasestorage.app",
    messagingSenderId: "847995505775",
    appId: "1:847995505775:web:bdf1877cbd283a65da919a",
    measurementId: "G-B7LHQEMYKT"
};

// Initialize Firebase
let app, storage;
try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

    // Initialize Storage
    try {
        storage = getStorage(app);
        console.log("Firebase Storage initialized successfully");
        window.fbStorage = storage; // Make storage available globally
    } catch (storageError) {
        console.error("Storage initialization failed:", storageError);
        alert("Firebase storage initialization failed. Upload functionality may not be available.");
    }
} catch (firebaseError) {
    console.error("Firebase initialization failed:", firebaseError);
    alert("Firebase initialization failed. Upload functionality is not available.");
}

// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const testApiKeyBtn = document.getElementById('testApiKeyBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultContainer = document.getElementById('resultContainer');
const generatedImage = document.getElementById('generatedImage');
const errorMessage = document.getElementById('errorMessage');
const imageUploadSection = document.getElementById('imageUploadSection');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const styleSelect = document.getElementById('styleSelect');
const sizeSelect = document.getElementById('sizeSelect');

// Text to Image elements
const characterSelect = document.getElementById('characterSelect');
const actionSelect = document.getElementById('actionSelect');
const settingSelect = document.getElementById('settingSelect');
const generatedPrompt = document.getElementById('generatedPrompt');
const randomizeBtn = document.getElementById('randomizeBtn');
const clearBtn = document.getElementById('clearBtn');
const textToImageSection = document.getElementById('textToImageSection');

// Image to Image elements
const personDescription = document.getElementById('personDescription');
const imageToImagePrompt = document.getElementById('imageToImagePrompt');
const clearStyleBtn = document.getElementById('clearStyleBtn');
const imageToImageSection = document.getElementById('imageToImageSection');

// Function to show error messages
function showError(message, type = 'error') {
    console.log(`${type.toUpperCase()}:`, message);
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        errorMessage.className = `alert alert-${type === 'success' ? 'success' : 'danger'} mt-3`;
    }
}

// Recraft AI Configuration
const RECRAFT_API_KEY = 'LaDYxX96gOXhk3O2cSk7l1yKKFmRAFGywyyCNxXvUyagC6lkQt9D5kasFeTJtG2p';

// Test API Key
testApiKeyBtn.addEventListener('click', async () => {
    try {
        testApiKeyBtn.disabled = true;
        testApiKeyBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Testing...';
        if (errorMessage) errorMessage.classList.add('d-none');

        console.log('Testing API key...');
        const response = await fetch('/api/verify-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: RECRAFT_API_KEY
            })
        });

        console.log('API Response Status:', response.status);
        const data = await response.json();
        console.log('API Response:', data);

        if (response.ok) {
            showError('API key is valid! You can now generate images.', 'success');
            if (generateBtn) generateBtn.disabled = false;
        } else {
            throw new Error(data.details || data.message || 'Invalid API key');
        }
    } catch (error) {
        console.error('API Key Test Error:', error);
        showError(error.message || 'Failed to test API key. Please try again.');
        if (generateBtn) generateBtn.disabled = true;
    } finally {
        testApiKeyBtn.disabled = false;
        testApiKeyBtn.textContent = 'Test API Key';
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Check Firebase initialization
    console.log('DOM loaded, checking Firebase initialization...');
    console.log('window.fbStorage available:', !!window.fbStorage);

    if (!window.fbStorage) {
        console.warn('Firebase storage not available globally, trying to initialize...');
        try {
            const storage = getStorage(app);
            window.fbStorage = storage;
            console.log('Firebase storage initialized in DOMContentLoaded');
        } catch (error) {
            console.error('Failed to initialize Firebase storage in DOMContentLoaded:', error);
        }
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Function to update the text-to-image prompt
    function updateTextToImagePrompt() {
        const character = characterSelect.value;
        const action = actionSelect.value;
        const setting = settingSelect.value;
        const layout = settingSelect && document.getElementById('layoutSelect') ? document.getElementById('layoutSelect').value : '';

        // Try to get layout from a select with id 'layoutSelect' or fallback to actionSelect if not found
        let layoutValue = '';
        if (document.getElementById('layoutSelect')) {
            layoutValue = document.getElementById('layoutSelect').value;
        } else if (actionSelect) {
            layoutValue = actionSelect.value;
        }

        // Compose the prompt in the requested format
        if (character && setting && layoutValue) {
            generatedPrompt.textContent = `A photo of ${character}, ${setting}, ${layoutValue} in animation style.`;
        } else {
            generatedPrompt.textContent = 'Select options to generate a prompt...';
        }
    }

    // Function to generate filename
    function generateFilename(userId, type, prompt) {
        const timestamp = Date.now();
        // Encode the prompt to handle special characters and spaces
        const encodedPrompt = encodeURIComponent(prompt).replace(/%20/g, '_');
        return `${userId}_${timestamp}_${type}_${encodedPrompt}.png`;
    }

    // Function to update the image-to-image prompt
    function updateImageToImagePrompt() {
        const description = personDescription.value.trim();

        if (description) {
            // Create the complete prompt with Pablo Picasso style
            const completePrompt = `${description}, in Pablo Picasso style`;

            // Update the display with the complete prompt
            imageToImagePrompt.textContent = completePrompt;
        } else {
            const emptyPrompt = 'Describe your photo to generate a prompt...';
            imageToImagePrompt.textContent = emptyPrompt;
        }
    }

    // Function to get random option from a select element
    function getRandomOption(selectElement) {
        const options = Array.from(selectElement.options).filter(option => option.value !== '');
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex].value;
    }

    // Function to randomize text-to-image selections
    function randomizeTextToImageSelections() {
        characterSelect.value = getRandomOption(characterSelect);
        actionSelect.value = getRandomOption(actionSelect);
        settingSelect.value = getRandomOption(settingSelect);
        updateTextToImagePrompt();
    }

    // Function to clear text-to-image selections
    function clearTextToImageSelections() {
        characterSelect.value = '';
        actionSelect.value = '';
        settingSelect.value = '';
        updateTextToImagePrompt();
    }

    // Function to clear image-to-image selections
    function clearImageToImageSelections() {
        personDescription.value = '';
        updateImageToImagePrompt();
    }

    // Function to compress and resize image for efficient upload
    async function compressImageForUpload(file, maxSizeMB = 5) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = function () {
                try {
                    // Calculate new dimensions while maintaining aspect ratio
                    const maxDimension = 1024; // Maximum width/height
                    let { width, height } = img;

                    if (width > height) {
                        if (width > maxDimension) {
                            height = (height * maxDimension) / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width = (width * maxDimension) / height;
                            height = maxDimension;
                        }
                    }

                    // Set canvas size
                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob with compression
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const fileSizeMB = blob.size / (1024 * 1024);
                            console.log(`Image compressed: ${fileSizeMB.toFixed(2)}MB (${width}x${height})`);

                            // If still too large, compress more
                            if (fileSizeMB > maxSizeMB) {
                                console.log('Image still too large, compressing further...');
                                canvas.toBlob((compressedBlob) => {
                                    if (compressedBlob) {
                                        const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                                            type: 'image/jpeg',
                                            lastModified: Date.now()
                                        });
                                        resolve(compressedFile);
                                    } else {
                                        reject(new Error('Failed to compress image'));
                                    }
                                }, 'image/jpeg', 0.6); // Higher compression
                            } else {
                                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(compressedFile);
                            }
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, 'image/jpeg', 0.8); // Good quality compression
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = function () {
                reject(new Error('Failed to load image for compression'));
            };

            const reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Function to process and convert image for iOS compatibility
    async function processImageForAPI(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            // Set crossOrigin to handle potential CORS issues
            img.crossOrigin = 'anonymous';

            img.onload = function () {
                try {
                    console.log('Image loaded successfully:', {
                        width: img.width,
                        height: img.height,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight
                    });

                    // Set canvas size to match image dimensions
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;

                    // Clear canvas and draw the image (this strips metadata and converts format)
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Convert to blob with specific format
                    canvas.toBlob((blob) => {
                        if (blob) {
                            console.log('Image processed successfully:', {
                                blobSize: blob.size,
                                blobType: blob.type
                            });

                            // Create a new file with proper name and type
                            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
                                type: 'image/png',
                                lastModified: Date.now()
                            });
                            resolve(processedFile);
                        } else {
                            reject(new Error('Failed to process image - blob creation failed'));
                        }
                    }, 'image/png', 0.9); // Convert to PNG with 90% quality
                } catch (error) {
                    console.error('Error processing image:', error);
                    reject(error);
                }
            };

            img.onerror = function (error) {
                console.error('Failed to load image for processing:', error);
                reject(new Error('Failed to load image for processing'));
            };

            // Load the image from file
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    img.src = e.target.result;
                } catch (error) {
                    console.error('Error setting image source:', error);
                    reject(new Error('Failed to read image file'));
                }
            };
            reader.onerror = function (error) {
                console.error('FileReader error:', error);
                reject(new Error('Failed to read image file'));
            };
            reader.readAsDataURL(file);
        });
    }

    // Function to validate and process image file
    async function validateAndProcessImage(file) {
        console.log('Processing file:', {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });

        // Check file type and extension
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        // Enhanced HEIC/HEIF detection for iOS
        const isHEIC = fileType === 'image/heic' ||
            fileType === 'image/heif' ||
            fileName.endsWith('.heic') ||
            fileName.endsWith('.heif') ||
            fileName.endsWith('.heic') ||
            (fileType === '' && (fileName.includes('heic') || fileName.includes('heif'))) ||
            (fileType === 'image/jpeg' && fileName.includes('heic')); // iOS sometimes reports HEIC as JPEG

        // Handle HEIC/HEIF files (common on iOS)
        if (isHEIC) {
            console.log('Detected HEIC/HEIF file from iOS, converting to PNG...');
            return await processImageForAPI(file);
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('Image file is too large. Please use an image smaller than 10MB.');
        }

        // Process other image types to ensure compatibility
        if (validTypes.includes(fileType) || fileType === '') {
            console.log('Processing image for API compatibility...');
            return await processImageForAPI(file);
        } else {
            throw new Error('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
        }
    }

    // Function to handle image upload with iOS compatibility
    function handleImageUpload(file) {
        if (!file) return;

        console.log('Starting image upload process for:', file.name);
        const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        console.log(`Original file size: ${originalSizeMB}MB`);

        // Show processing message
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Processing...</span>
                    </div>
                    <p class="mt-2 mb-0">Processing image...</p>
                    <p class="text-muted small">Compressing for efficient upload</p>
                </div>
            `;
        }

        // First compress the image, then process for API compatibility
        compressImageForUpload(file, 5) // Compress to max 5MB
            .then(compressedFile => {
                console.log('Image compression completed');
                return validateAndProcessImage(compressedFile);
            })
            .then(processedFile => {
                console.log('Image processing completed successfully');
                // Store the processed file for later use
                window.processedImageFile = processedFile;

                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imagePreview = document.getElementById('imagePreview');
                    const previewContainer = document.getElementById('previewContainer');
                    const uploadArea = document.getElementById('uploadArea');

                    if (imagePreview) imagePreview.src = e.target.result;
                    if (previewContainer) previewContainer.classList.remove('d-none');
                    if (uploadArea) {
                        uploadArea.classList.add('d-none');
                        // Restore original upload area content
                        uploadArea.innerHTML = `
                            <i class="bi bi-cloud-upload fs-1"></i>
                            <p class="mb-0">Click here or drag and drop an image</p>
                            <p class="text-muted small">Supported formats: JPG, PNG, GIF, HEIC</p>
                            <p class="text-muted small">📱 iOS users: Photos are automatically compressed</p>
                        `;
                    }
                };
                reader.readAsDataURL(processedFile);
            })
            .catch(error => {
                console.error('Image processing error:', error);

                // Try fallback: use original file if processing fails
                console.log('Attempting fallback to original file...');
                window.processedImageFile = null; // Clear processed file

                // Show preview with original file
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imagePreview = document.getElementById('imagePreview');
                    const previewContainer = document.getElementById('previewContainer');
                    const uploadArea = document.getElementById('uploadArea');

                    if (imagePreview) imagePreview.src = e.target.result;
                    if (previewContainer) previewContainer.classList.remove('d-none');
                    if (uploadArea) {
                        uploadArea.classList.add('d-none');
                        // Restore original upload area content
                        uploadArea.innerHTML = `
                            <i class="bi bi-cloud-upload fs-1"></i>
                            <p class="mb-0">Click here or drag and drop an image</p>
                            <p class="text-muted small">Supported formats: JPG, PNG, GIF, HEIC</p>
                            <p class="text-muted small">📱 iOS users: Photos are automatically compressed</p>
                        `;
                    }
                };
                reader.readAsDataURL(file);

                // Show warning but don't block the user
                showError('Image processing failed, using original file. If generation fails, try a different image.', 'warning');
            });
    }

    // Add iPad-specific file input fallback
    function createIPadFileInput() {
        const isIPad = /iPad/.test(navigator.userAgent);
        if (isIPad) {
            console.log('iPad detected, creating enhanced file input...');

            // Create a more iPad-friendly file input
            const existingInput = document.getElementById('imageInput');
            if (existingInput) {
                // Remove any capture attribute that might cause issues
                existingInput.removeAttribute('capture');

                // Add multiple accept types for better iPad compatibility
                existingInput.setAttribute('accept', 'image/*,image/jpeg,image/png,image/gif,image/heic,image/heif');

                // Add click handler for better iPad support
                existingInput.addEventListener('click', function (e) {
                    console.log('iPad file input clicked');
                });
            }
        }
    }

    // Function to remove uploaded image
    function removeUploadedImage() {
        imageInput.value = '';
        previewContainer.classList.add('d-none');
        uploadArea.classList.remove('d-none');
        // Clear the processed image file
        window.processedImageFile = null;
    }

    // Make removeUploadedImage available globally
    window.removeUploadedImage = removeUploadedImage;

    // Initialize iPad-specific file input
    createIPadFileInput();

    // Event listeners for text-to-image prompt generation
    if (characterSelect) characterSelect.addEventListener('change', updateTextToImagePrompt);
    if (actionSelect) actionSelect.addEventListener('change', updateTextToImagePrompt);
    if (settingSelect) settingSelect.addEventListener('change', updateTextToImagePrompt);
    if (randomizeBtn) randomizeBtn.addEventListener('click', randomizeTextToImageSelections);
    if (clearBtn) clearBtn.addEventListener('click', clearTextToImageSelections);

    // Event listeners for image-to-image prompt generation
    if (personDescription) personDescription.addEventListener('input', updateImageToImagePrompt);
    if (clearStyleBtn) clearStyleBtn.addEventListener('click', clearImageToImageSelections);

    // Generation type selection
    document.querySelectorAll('input[name="generationType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isImageToImage = e.target.id === 'imageToImage';
            if (textToImageSection) textToImageSection.classList.toggle('d-none', isImageToImage);
            if (imageToImageSection) imageToImageSection.classList.toggle('d-none', !isImageToImage);
            if (imageUploadSection) imageUploadSection.classList.toggle('d-none', !isImageToImage);

            // Reset style and size options based on generation type
            if (styleSelect) styleSelect.value = 'realistic_image';
            if (sizeSelect) sizeSelect.value = '1024x1024';
        });
    });

    // Event listeners for image upload
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-primary');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-primary');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-primary');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file);
            }
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected on device:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    userAgent: navigator.userAgent
                });

                // Check if it's an iOS device
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (isIOS) {
                    console.log('iOS device detected, processing image...');
                }

                handleImageUpload(file);
            } else {
                console.log('No file selected');
            }
        });
    }

    // Generate image using selected AI provider
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const isImageToImage = document.getElementById('imageToImage').checked;
            const prompt = isImageToImage ? imageToImagePrompt.textContent : generatedPrompt.textContent;
            const style = styleSelect ? styleSelect.value : 'realistic_image';
            const size = sizeSelect ? sizeSelect.value : '1024x1024';

            // Get selected AI type from the generation form (default to recraft_ai)
            const aiType = document.querySelector('input[name="aiType"]:checked')?.value || 'recraft_ai';

            if (isImageToImage) {
                if (prompt === 'Describe your photo to generate a prompt...') {
                    showError('Please describe your photo to generate a prompt...');
                    return;
                }
                if (!window.processedImageFile && !imageInput.files[0]) {
                    showError('Please upload an image first');
                    return;
                }
            } else {
                if (prompt === 'Select options to generate a prompt...') {
                    showError('Please select options to generate a prompt');
                    return;
                }
            }

            try {
                // Show loading state
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
                if (resultContainer) resultContainer.classList.add('d-none');
                if (errorMessage) errorMessage.classList.add('d-none');

                let response;
                if (isImageToImage) {
                    const formData = new FormData();
                    // Use processed image file if available, otherwise fall back to original
                    const imageFile = window.processedImageFile || imageInput.files[0];

                    // Debug image file
                    console.log('Image file details:', {
                        name: imageFile.name,
                        type: imageFile.type,
                        size: imageFile.size,
                        lastModified: imageFile.lastModified,
                        isProcessed: !!window.processedImageFile
                    });

                    formData.append('image', imageFile);
                    formData.append('prompt', prompt);
                    formData.append('apiKey', RECRAFT_API_KEY);
                    formData.append('style', style);
                    formData.append('strength', '0.2');
                    formData.append('aiType', aiType);

                    console.log('Sending image-to-image request:', {
                        prompt,
                        style,
                        strength: '0.2',
                        hasImage: true,
                        imageDetails: {
                            name: imageFile.name,
                            type: imageFile.type,
                            size: imageFile.size,
                            isProcessed: !!window.processedImageFile
                        }
                    });

                    response = await fetch('/api/generate-from-image', {
                        method: 'POST',
                        body: formData
                    });
                } else {
                    const requestBody = {
                        prompt: prompt,
                        style: style,
                        size: size,
                        apiKey: RECRAFT_API_KEY,
                        aiType: aiType
                    };

                    console.log('Sending text-to-image request:', requestBody);

                    response = await fetch('/api/generate-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    });
                }

                console.log('API Response Status:', response.status);
                const data = await response.json();
                console.log('API Response:', data);

                if (!response.ok) {
                    throw new Error(data.details || data.error || `API Error: ${response.status} ${response.statusText}`);
                }

                if (!data.imageUrl) {
                    throw new Error('No image URL in response');
                }

                // Save to Firebase Storage
                try {
                    const currentUserId = localStorage.getItem('currentUserId');
                    console.log('Current user ID:', currentUserId);

                    if (!currentUserId) {
                        // Generate a random user ID if not exists
                        const randomId = 'user_' + Math.random().toString(36).substring(2, 8);
                        localStorage.setItem('currentUserId', randomId);
                        console.log('Generated new user ID:', randomId);
                    }

                    // Generate filename
                    const filename = generateFilename(currentUserId || localStorage.getItem('currentUserId'), isImageToImage ? 'image-to-image' : 'text-to-image', prompt);
                    console.log('Generated filename:', filename);

                    // Get Firebase storage instance
                    const storage = window.fbStorage;
                    console.log('Firebase storage instance:', storage);

                    if (!storage) {
                        throw new Error('Firebase storage not initialized');
                    }

                    // Create a reference to the file location
                    const aiGeneratedRef = ref(storage, `ai_generated/${filename}`);
                    console.log('Firebase reference created:', aiGeneratedRef);

                    // Fetch the image from the URL
                    console.log('Fetching image from URL:', data.imageUrl);
                    const imageResponse = await fetch(data.imageUrl);
                    const imageBlob = await imageResponse.blob();
                    console.log('Image blob created, size:', imageBlob.size);

                    // Upload to Firebase
                    console.log('Uploading to Firebase...');
                    await uploadBytes(aiGeneratedRef, imageBlob);
                    console.log('Upload completed successfully');

                    // Get the download URL
                    const downloadURL = await getDownloadURL(aiGeneratedRef);
                    console.log('Image saved to Firebase:', downloadURL);

                    // Display the generated image
                    if (generatedImage) generatedImage.src = downloadURL;
                    if (resultContainer) resultContainer.classList.remove('d-none');
                    showError('Image generated and saved successfully!', 'success');

                } catch (error) {
                    console.error('Error saving to Firebase:', error);
                    console.error('Error details:', {
                        message: error.message,
                        code: error.code,
                        stack: error.stack
                    });

                    // If Firebase save fails, still display the original image
                    if (generatedImage) generatedImage.src = data.imageUrl;
                    if (resultContainer) resultContainer.classList.remove('d-none');
                    showError('Image generated but could not be saved to gallery. ' + error.message, 'warning');
                }
            } catch (error) {
                console.error('Generation Error:', error);
                if (error.message === 'Failed to fetch') {
                    showError('Unable to connect to the image generation service. Please check your internet connection and try again.');
                } else {
                    showError(error.message || 'Failed to generate image. Please try again.');
                }
            } finally {
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.textContent = 'Generate Image';
                }
            }
        });
    }

    // Function to test Firebase storage connection
    window.testFirebaseStorage = async function () {
        try {
            console.log('Testing Firebase storage connection...');
            const storage = window.fbStorage;
            if (!storage) {
                throw new Error('Firebase storage not initialized');
            }

            // Create a test reference
            const testRef = ref(storage, 'test_connection.txt');
            const testBlob = new Blob(['Firebase connection test'], { type: 'text/plain' });

            console.log('Uploading test file...');
            await uploadBytes(testRef, testBlob);
            console.log('Test file uploaded successfully');

            // Get download URL
            const downloadURL = await getDownloadURL(testRef);
            console.log('Test file download URL:', downloadURL);

            // Clean up test file
            // Note: Firebase Storage doesn't have a direct delete method in the client SDK
            // The test file will remain but that's okay for testing purposes

            alert('Firebase storage connection test successful!');
            return true;
        } catch (error) {
            console.error('Firebase storage test failed:', error);
            alert('Firebase storage test failed: ' + error.message);
            return false;
        }
    };

    // Function to save image
    window.saveImage = function () {
        if (generatedImage && generatedImage.src) {
            const link = document.createElement('a');
            link.href = generatedImage.src;
            link.download = 'generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Function to regenerate image
    window.regenerateImage = function () {
        if (generateBtn) generateBtn.click();
    };

    // Quick Upload Modal functionality
    const quickUploadFile = document.getElementById('quickUploadFile');
    const quickUploadPreview = document.getElementById('quickUploadPreview');
    const quickUploadImage = document.getElementById('quickUploadImage');
    const aiTypeSelect = document.getElementById('aiTypeSelect');
    const quickUploadPrompt = document.getElementById('quickUploadPrompt');
    const submitToGalleryBtn = document.getElementById('submitToGalleryBtn');
    const submitSpinner = document.getElementById('submitSpinner');

    // Quick Upload button event listener
    if (quickUploadBtn) {
        quickUploadBtn.addEventListener('click', () => {
            console.log('Quick Upload button clicked');

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('quickUploadModal'));
            modal.show();
        });
    }

    // File selection handler
    if (quickUploadFile) {
        quickUploadFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('Quick upload file selected:', file.name);

                // Show preview
                const reader = new FileReader();
                reader.onload = function (e) {
                    quickUploadImage.src = e.target.result;
                    quickUploadPreview.classList.remove('d-none');
                };
                reader.readAsDataURL(file);

                // Enable submit button if AI type is selected
                updateSubmitButtonState();
            } else {
                quickUploadPreview.classList.add('d-none');
                updateSubmitButtonState();
            }
        });
    }

    // AI type selection handler
    if (aiTypeSelect) {
        aiTypeSelect.addEventListener('change', updateSubmitButtonState);
    }

    // Function to update submit button state
    function updateSubmitButtonState() {
        const hasFile = quickUploadFile && quickUploadFile.files.length > 0;
        const hasAiType = aiTypeSelect && aiTypeSelect.value !== '';

        if (submitToGalleryBtn) {
            submitToGalleryBtn.disabled = !(hasFile && hasAiType);
        }
    }

    // Submit to gallery handler
    if (submitToGalleryBtn) {
        submitToGalleryBtn.addEventListener('click', async () => {
            const file = quickUploadFile.files[0];
            const aiType = aiTypeSelect.value;
            const prompt = quickUploadPrompt.value.trim();

            if (!file || !aiType) {
                showError('Please select an image and AI type');
                return;
            }

            try {
                // Show loading state
                submitToGalleryBtn.disabled = true;
                submitSpinner.classList.remove('d-none');

                // Process and upload the image
                const processedFile = await validateAndProcessImage(file);

                // Create form data
                const formData = new FormData();
                formData.append('image', processedFile);
                formData.append('aiType', aiType);
                formData.append('prompt', prompt);
                formData.append('userId', localStorage.getItem('currentUserId') || 'unknown');

                console.log('Uploading to gallery:', {
                    fileName: file.name,
                    aiType: aiType,
                    prompt: prompt,
                    fileSize: processedFile.size
                });

                // Upload to gallery
                const response = await fetch('/api/upload-to-gallery', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to upload to gallery');
                }

                // Success
                showError('Image uploaded to gallery successfully!', 'success');

                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('quickUploadModal'));
                modal.hide();

                // Reset form
                quickUploadFile.value = '';
                aiTypeSelect.value = '';
                quickUploadPrompt.value = '';
                quickUploadPreview.classList.add('d-none');
                updateSubmitButtonState();

            } catch (error) {
                console.error('Gallery upload error:', error);
                showError(error.message || 'Failed to upload to gallery');
            } finally {
                // Reset loading state
                submitToGalleryBtn.disabled = false;
                submitSpinner.classList.add('d-none');
            }
        });
    }
}); 