// ==========================================
// 1. SHOP STATUS SWITCH (Admin & Customer)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateShopStatusDisplay();
});

function toggleShopStatus() {
    let isOpen = localStorage.getItem('shopOpen');
    if (isOpen === null) {
        isOpen = true;
    } else {
        isOpen = JSON.parse(isOpen);
    }

    isOpen = !isOpen;
    localStorage.setItem('shopOpen', JSON.stringify(isOpen));
    updateShopStatusDisplay();
}

function updateShopStatusDisplay() {
    let isOpen = localStorage.getItem('shopOpen');
    if (isOpen === null) {
        isOpen = true;
    } else {
        isOpen = JSON.parse(isOpen);
    }

    // Admin Page status box
    const statusDisplay = document.getElementById('statusDisplay');
    if (statusDisplay) {
        if (isOpen) {
            statusDisplay.textContent = 'Store is OPEN';
            statusDisplay.className = 'status-box open';
        } else {
            statusDisplay.textContent = 'Store is CLOSED';
            statusDisplay.className = 'status-box closed';
        }
    }

    // Customer Page (Index) notice
    const customerNotice = document.getElementById('shopStatusNotice');
    if (customerNotice) {
        if (isOpen) {
            customerNotice.style.display = 'none';
        } else {
            customerNotice.style.display = 'block';
            customerNotice.textContent = '⚠️ Sorry, our store is currently CLOSED. You can still browse our collection!';
        }
    }
}


// ==========================================
// 2. UPLOAD NEW ITEM FROM DEVICE (Admin)
// ==========================================
const itemForm = document.getElementById('itemForm');
if (itemForm) {
    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('itemName').value;
        const price = document.getElementById('itemPrice').value;
        const imageFile = document.getElementById('itemImage').files[0];
        const tag = document.getElementById('itemTag').value;

        if (!imageFile) {
            alert('Please choose an image file!');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

                const newItem = {
                    id: Date.now(),
                    name: name,
                    price: price,
                    image: compressedDataUrl,
                    tag: tag
                };

                try {
                    let items = JSON.parse(localStorage.getItem('jeweleryItems')) || [];
                    items.push(newItem);
                    localStorage.setItem('jeweleryItems', JSON.stringify(items));

                    alert('Item added successfully!');
                    itemForm.reset();
                    loadAdminInventory(); // Refresh admin view if present
                } catch (error) {
                    alert('Storage full! Clear some items or use smaller images.');
                    console.error(error);
                }
            };
        };
        reader.readAsDataURL(imageFile);
    });
}


// ==========================================
// 3. LOAD ITEMS ON CUSTOMER PAGE (Index)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('customerGallery');
    
    if (galleryContainer) {
        const items = JSON.parse(localStorage.getItem('jeweleryItems')) || [];
        
        galleryContainer.innerHTML = '';
        
        if (items.length === 0) {
            galleryContainer.innerHTML = '<p style="color: #D4AF37; font-style: italic;">No new uploaded items available right now.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'product-card';
            itemCard.innerHTML = `
                ${item.tag ? `<span class="badge">${item.tag}</span>` : ''}
                <img src="${item.image}" alt="${item.name}" style="width:100%; height:200px; object-fiit:cover; border-radius: 8px;">
                <div class="product-card-body">
                    <h3>${item.name}</h3>
                    <p style="color: var(--gold-bright); font-weight: bold;">₹${item.price}</p>
                </div>
            `;
            galleryContainer.appendChild(itemCard);
        });
    }

    // Load admin inventory if on admin page
    loadAdminInventory();
});


// ==========================================
// 4. ADMIN INVENTORY MANAGEMENT (Delete & Edit)
// ==========================================
function loadAdminInventory() {
    const adminGallery = document.getElementById('adminGallery');
    if (!adminGallery) return;

    const items = JSON.parse(localStorage.getItem('jeweleryItems')) || [];
    adminGallery.innerHTML = '';

    if (items.length === 0) {
        adminGallery.innerHTML = '<p>No items added yet.</p>';
        return;
    }

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'product-card';
        itemCard.innerHTML = `
            ${item.tag ? `<span class="badge">${item.tag}</span>` : ''}
            <img src="${item.image}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius: 8px;">
            <div class="product-card-body">
                <h3>${item.name}</h3>
                <p style="color: var(--gold-bright);">₹${item.price}</p>
                <button onclick="editItem(${item.id})" class="btn" style="margin-top: 5px; padding: 6px; font-size: 0.9rem;">Edit Price/Name</button>
                <button onclick="deleteItem(${item.id})" class="btn-danger">Delete Item</button>
            </div>
        `;
        adminGallery.appendChild(itemCard);
    });
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        let items = JSON.parse(localStorage.getItem('jeweleryItems')) || [];
        items = items.filter(item => item.id !== id);
        localStorage.setItem('jeweleryItems', JSON.stringify(items));
        loadAdminInventory();
    }
}

function editItem(id) {
    let items = JSON.parse(localStorage.getItem('jeweleryItems')) || [];
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newName = prompt('Edit Item Name:', item.name);
    const newPrice = prompt('Edit Item Price (₹):', item.price);

    if (newName !== null && newName.trim() !== '') {
        item.name = newName.trim();
    }
    if (newPrice !== null && !isNaN(newPrice) && newPrice.trim() !== '') {
        item.price = newPrice.trim();
    }

    localStorage.setItem('jeweleryItems', JSON.stringify(items));
    loadAdminInventory();
    alert('Item updated successfully!');
}


// ==========================================
// 5. SMOOTH SCROLLING FOR NAVIGATION LINKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});