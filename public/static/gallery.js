// Gallery management for teacher dashboard
let galleryImages = [];

async function loadGalleryImages() {
    try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        galleryImages = data.images;
        displayGalleryImages();
    } catch (error) {
        console.error('Failed to load gallery images:', error);
        // Fallback to static images if API fails
        loadStaticImages();
    }
}

function displayGalleryImages() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    if (galleryImages.length === 0) {
        galleryContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No images in gallery yet.
                    <br>Images will appear here once they are approved by an admin.
                </div>
            </div>
        `;
        return;
    }

    galleryContainer.innerHTML = galleryImages.map((img, index) => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 gallery-card" onclick="openImageModal(${index})">
                <img src="${img.url}" class="card-img-top" alt="Generated Image" 
                     style="height: 200px; object-fit: cover;"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5NT
</rewritten_file> 