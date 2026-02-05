/* =========================================
   1. NAVEGACIÓN (Menú Hamburguesa)
   ========================================= */
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if(burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
            burger.classList.toggle('toggle');
        });

        // Cerrar al hacer click en enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if(nav.classList.contains('nav-active')){
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');
                    navLinks.forEach(l => l.style.animation = '');
                }
            });
        });
    }
}
navSlide();

/* =========================================
   2. CARRUSEL 3D CIRCULAR
   ========================================= */
const cards = document.querySelectorAll('.skill-card');
let activeIndex = Math.floor(cards.length / 2); 

function updateCarousel() {
    const total = cards.length;
    if (total === 0) return; // Protección si no hay cartas

    cards.forEach((card, index) => {
        card.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next', 'hidden-card');
        
        let distance = (index - activeIndex) % total;
        if (distance < -Math.floor(total/2)) distance += total;
        if (distance > Math.floor(total/2)) distance -= total;

        if (distance === 0) card.classList.add('active');
        else if (distance === -1) card.classList.add('prev');
        else if (distance === 1) card.classList.add('next');
        else if (distance === -2) card.classList.add('far-prev');
        else if (distance === 2) card.classList.add('far-next');
        else card.classList.add('hidden-card'); 
    });
}

function handleCardClick(clickedIndex) {
    if (clickedIndex === activeIndex) {
        const card = cards[clickedIndex];
        if (card.classList.contains('no-cert')) return;

        const imagesRaw = card.dataset.images; 
        const title = card.dataset.title || "Certificado";
        
        if (imagesRaw) {
            try {
                const images = JSON.parse(imagesRaw);
                openGalleryModal(images, title); // NOMBRE CORREGIDO AQUÍ
            } catch (e) {
                console.error("Error JSON:", e);
                openGalleryModal([imagesRaw], title); // NOMBRE CORREGIDO AQUÍ
            }
        }
    } else {
        activeIndex = clickedIndex;
        updateCarousel();
    }
}

cards.forEach((card, index) => {
    card.addEventListener('click', () => handleCardClick(index));
});
updateCarousel();


/* =========================================
   3. MODAL DE GALERÍA (CERTIFICADOS)
   ========================================= */
const certModal = document.getElementById("certModal");
const modalImg = document.getElementById("img01");
const captionText = document.getElementById("caption");
const closeCertBtn = document.querySelector(".close-modal");

let currentGallery = [];
let galleryIndex = 0;

// Configuración inicial de la galería (Solo si el modal existe)
if (certModal) {
    if (!document.querySelector('.prev-btn')) {
        const prev = document.createElement('span');
        prev.innerHTML = "&#10094;";
        prev.className = "modal-nav prev-btn";
        prev.onclick = (e) => { e.stopPropagation(); changeGalleryImage(-1); };
        certModal.appendChild(prev);

        const next = document.createElement('span');
        next.innerHTML = "&#10095;";
        next.className = "modal-nav next-btn";
        next.onclick = (e) => { e.stopPropagation(); changeGalleryImage(1); };
        certModal.appendChild(next);
    }
}

// Función renombrada para evitar conflictos
function openGalleryModal(images, title) {
    if (!certModal) return;
    certModal.style.display = "flex";
    setTimeout(() => certModal.classList.add('active'), 10);
    
    currentGallery = Array.isArray(images) ? images : [images];
    galleryIndex = 0;
    certModal.dataset.baseTitle = title;
    
    updateGalleryView();
}

function updateGalleryView() {
    if (!modalImg) return;
    modalImg.src = currentGallery[galleryIndex];
    
    const baseTitle = certModal.dataset.baseTitle;
    const prevBtnDOM = document.querySelector('.prev-btn');
    const nextBtnDOM = document.querySelector('.next-btn');

    if (currentGallery.length > 1) {
        captionText.innerHTML = `${baseTitle} (${galleryIndex + 1}/${currentGallery.length})`;
        if(prevBtnDOM) prevBtnDOM.classList.remove('hidden');
        if(nextBtnDOM) nextBtnDOM.classList.remove('hidden');
    } else {
        captionText.innerHTML = baseTitle;
        if(prevBtnDOM) prevBtnDOM.classList.add('hidden');
        if(nextBtnDOM) nextBtnDOM.classList.add('hidden');
    }
}

function changeGalleryImage(direction) {
    galleryIndex += direction;
    if (galleryIndex >= currentGallery.length) galleryIndex = 0;
    if (galleryIndex < 0) galleryIndex = currentGallery.length - 1;
    updateGalleryView();
}

// Cerrar Modal Galería
if (closeCertBtn) {
    closeCertBtn.onclick = () => {
        certModal.classList.remove('active');
        setTimeout(() => certModal.style.display = "none", 300);
    }
}


/* =========================================
   4. SISTEMA DE CONTACTO (MODAL + EMAILJS)
   ========================================= */
// Referencias globales para el contacto
const contactModal = document.getElementById("contactModal");
const btnHeader = document.getElementById("open-modal-header");
const btnFooter = document.getElementById("open-modal-footer");
const contactForm = document.getElementById('contact-form');
const btnSubmit = document.getElementById('btn-submit');

// Buscar la X dentro del modal de contacto específicamente
const closeContactBtn = contactModal ? contactModal.querySelector(".close-btn") : null;

// FUNCIÓN ÚNICA PARA ABRIR CONTACTO
function openContactModal(e) {
    // 1. Detener cualquier navegación o salto de página
    if(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // 2. Mostrar ventana
    if(contactModal) {
        contactModal.style.display = "block"; // Se muestra (CSS maneja z-index 9999)
    } else {
        console.error("Error: No se encontró el modal de contacto en el HTML");
    }
}

// FUNCIÓN PARA CERRAR CONTACTO
function closeContactModal() {
    if(contactModal) contactModal.style.display = "none";
}

// ASIGNACIÓN DE EVENTOS (Blindada)
if(btnHeader) {
    btnHeader.addEventListener("click", openContactModal);
} else {
    console.warn("Aviso: No se encontró el botón de contacto del Header");
}

if(btnFooter) {
    btnFooter.addEventListener("click", openContactModal);
} else {
    console.warn("Aviso: No se encontró el botón de contacto del Footer");
}

if(closeContactBtn) {
    closeContactBtn.addEventListener("click", closeContactModal);
}

// CERRAR AL CLICKEAR FUERA (Manejo global de clicks)
window.onclick = (event) => {
    // Si clickean fuera del modal de Galería
    if (certModal && event.target == certModal) {
        certModal.classList.remove('active');
        setTimeout(() => certModal.style.display = "none", 300);
    }
    // Si clickean fuera del modal de Contacto
    if (contactModal && event.target == contactModal) {
        closeContactModal();
    }
}

// LÓGICA DE ENVÍO (EMAILJS)
if(contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita recarga

        btnSubmit.textContent = 'Enviando...';

        // TUS CREDENCIALES
        const serviceID = 'service_7ywms58';
        const templateID = 'template_5tvbd9b';

        emailjs.sendForm(serviceID, templateID, this)
            .then(() => {
                btnSubmit.textContent = '¡ENVIADO!';
                alert('Mensaje enviado con éxito');
                closeContactModal();
                contactForm.reset();
                setTimeout(() => { btnSubmit.textContent = 'ENVIAR CORREO'; }, 3000);
            }, (err) => {
                btnSubmit.textContent = 'ERROR';
                alert('Error: ' + JSON.stringify(err));
                console.error(err);
            });
    });
}