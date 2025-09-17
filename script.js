// ==========================
// Configuración y variables
// ==========================
const config = {
  particulas: {
    cantidad: 180,         // cantidad de partículas
    velocidad: 4,          // velocidad más rápida
    color: '#ff6600'       // color naranja intenso
  },
  carrusel: {
    velocidad: 40000,
    pausaAlInteractuar: true
  }
};

// Ajustar cantidad de partículas según el tamaño de pantalla
if (window.innerWidth <= 480) {
  config.particulas.cantidad = 60;   // Celulares
} else if (window.innerWidth <= 1024) {
  config.particulas.cantidad = 100;  // Tablets
} else {
  config.particulas.cantidad = 180;  // PC
}

let estado = {
  autoScrollActivo: true,
  menuAbierto: false,
  tarjetaTecnicoAbierta: false,
  ultimaPosicionScroll: 0
};

// ==========================
// Inicialización
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  inicializarParticulas();
  inicializarNavegacion();
  inicializarObservadores();
  inicializarCarrusel();
  inicializarTarjetaTecnico();
  inicializarEventosGlobales();
  inicializarEfectosEspeciales();
  duplicarProductosCarrusel();
  precargarImagenes(); // llamada temprana; también hay listener al load más abajo
});

// ==========================
// Sistema de partículas
// ==========================
function inicializarParticulas() {
  if (typeof tsParticles !== 'undefined') {
    tsParticles.load('particles-js', {
      particles: {
        number: { 
          value: config.particulas.cantidad, 
          density: { enable: true, value_area: 800 } 
        },
        color: { value: config.particulas.color },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#8a2be2',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: config.particulas.velocidad,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        }
      },
      retina_detect: true
    });
  }
}

// ==========================
// Navegación y menú responsive
// ==========================
function inicializarNavegacion() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (menuToggle && navLinks) {
    // Asegurar estado inicial de aria-expanded
    menuToggle.setAttribute('aria-expanded', 'false');

    menuToggle.addEventListener('click', function() {
      estado.menuAbierto = !estado.menuAbierto;
      this.setAttribute('aria-expanded', String(estado.menuAbierto));
      navLinks.classList.toggle('open');
      
      // Cambiar ícono del menú
      this.textContent = estado.menuAbierto ? '✕' : '☰';
    });

    // Cerrar menú al hacer clic en un enlace (mobile)
    document.querySelectorAll('#nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768 && estado.menuAbierto) {
          // Pulsar el toggle para que ejecute la misma lógica (cambia aria-expanded, texto e .open)
          menuToggle.click();
        }
      });
    });
  }

  // ScrollSpy para resaltar sección actual
  window.addEventListener('scroll', debounce(function() {
    const secciones = document.querySelectorAll('main, section[id]');
    const linksNavegacion = document.querySelectorAll('#nav-links a');
    let seccionActual = '';
    
    secciones.forEach(seccion => {
      const rect = seccion.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        seccionActual = seccion.getAttribute('id') || 'inicio';
      }
    });
    
    linksNavegacion.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === seccionActual) {
        link.classList.add('active');
      }
    });
  }, 100));
}

// ==========================
// Observadores para animaciones al hacer scroll
// ==========================
function inicializarObservadores() {
  const opciones = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        
        // Retardo progresivo para productos
        if (entrada.target.classList.contains('producto')) {
          entrada.target.style.transitionDelay = `${Math.random() * 0.3}s`;
        }
      }
    });
  }, opciones);

  // Observar secciones y productos
  document.querySelectorAll('main, section, .producto').forEach(elemento => {
    observador.observe(elemento);
  });
}

// ==========================
// Carrusel de productos automático
// ==========================
function inicializarCarrusel() {
  const botonToggle = document.getElementById('toggleAutoScroll');
  const trackCompras = document.querySelector('.compras-track');
  
  if (botonToggle && trackCompras) {
    // Control manual del carrusel
    botonToggle.addEventListener('click', function() {
      estado.autoScrollActivo = !estado.autoScrollActivo;
      
      if (estado.autoScrollActivo) {
        trackCompras.style.animationPlayState = 'running';
        this.textContent = '⏸ Pausar';
        this.classList.remove('pausado');
      } else {
        trackCompras.style.animationPlayState = 'paused';
        this.textContent = '▶ Reanudar';
        this.classList.add('pausado');
      }
    });

    // Pausar al interactuar (si está configurado)
    if (config.carrusel.pausaAlInteractuar) {
      trackCompras.addEventListener('mouseenter', () => {
        if (estado.autoScrollActivo) {
          trackCompras.style.animationPlayState = 'paused';
        }
      });

      trackCompras.addEventListener('mouseleave', () => {
        if (estado.autoScrollActivo) {
          trackCompras.style.animationPlayState = 'running';
        }
      });

      // Para dispositivos táctiles
      trackCompras.addEventListener('touchstart', () => {
        if (estado.autoScrollActivo) {
          trackCompras.style.animationPlayState = 'paused';
        }
      });

      trackCompras.addEventListener('touchend', () => {
        if (estado.autoScrollActivo) {
          // Solo reanudar después de un breve retraso
          setTimeout(() => {
            if (estado.autoScrollActivo) {
              trackCompras.style.animationPlayState = 'running';
            }
          }, 1500);
        }
      });
    }
  }
}

// ==========================
// Tarjeta flotante del técnico
// ==========================
function inicializarTarjetaTecnico() {
  const toggleTecnico = document.getElementById('tecnicoToggle');
  const cajaTecnico = document.querySelector('.tecnico-box');
  
  if (toggleTecnico && cajaTecnico) {
    toggleTecnico.addEventListener('click', function(e) {
      e.stopPropagation();
      estado.tarjetaTecnicoAbierta = !estado.tarjetaTecnicoAbierta;
      
      if (estado.tarjetaTecnicoAbierta) {
        cajaTecnico.classList.add('open');
        this.style.transform = 'scale(1.1)';
      } else {
        cajaTecnico.classList.remove('open');
        this.style.transform = 'scale(1)';
      }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
      if (estado.tarjetaTecnicoAbierta && 
          !cajaTecnico.contains(e.target) && 
          !toggleTecnico.contains(e.target)) {
        estado.tarjetaTecnicoAbierta = false;
        cajaTecnico.classList.remove('open');
        toggleTecnico.style.transform = 'scale(1)';
      }
    });

    // Prevenir que el clic en la tarjeta la cierre
    cajaTecnico.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // Mover botón flotante con scroll
  const fabTecnico = document.querySelector('.tecnico-fab');
  if (fabTecnico) {
    window.addEventListener('scroll', debounce(function() {
      const scrollPos = window.scrollY;
      const maxTop = document.body.scrollHeight - 120;
      fabTecnico.style.top = `${Math.min(scrollPos + window.innerHeight - 100, maxTop)}px`;
      
      // Efecto de header al hacer scroll
      const header = document.querySelector('header');
      if (scrollPos > 100) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }, 50));
  }
}

// ==========================
// Efectos especiales e interacciones
// ==========================
function inicializarEfectosEspeciales() {
  // Efecto de levitación para botones
  document.querySelectorAll('.btn-principal, .btn-secundario, .btn-whatsapp').forEach(boton => {
    boton.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
    });
    
    boton.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Efectos para productos
  document.querySelectorAll('.producto').forEach(producto => {
    producto.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    
    producto.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
  });

  // Animación del logo al hacer clic
  const logoBienvenida = document.querySelector('.logo-bienvenida img');
  if (logoBienvenida) {
    logoBienvenida.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('vaiven');
    });

    document.addEventListener('click', function(e) {
      if (!logoBienvenida.contains(e.target) && logoBienvenida.classList.contains('vaiven')) {
        logoBienvenida.classList.remove('vaiven');
      }
    });
  }
}

// ==========================
// Eventos globales y utilidades
// ==========================
function inicializarEventosGlobales() {
  // Scroll suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      if (href === '#' || href === '#inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        e.preventDefault();
        return;
      }
      
      const destino = document.querySelector(href);
      if (destino) {
        e.preventDefault();
        const posicion = destino.offsetTop - 80;
        
        window.scrollTo({
          top: posicion,
          behavior: 'smooth'
        });
      }
    });
  });

  // Optimizar comportamiento en resize
  window.addEventListener('resize', debounce(function() {
    // Cerrar menú y tarjeta técnica en móviles al cambiar orientación
    if (window.innerWidth > 768 && estado.menuAbierto) {
      const menuToggle = document.querySelector('.menu-toggle');
      if (menuToggle) menuToggle.click();
    }
    
    if (window.innerWidth <= 768 && estado.tarjetaTecnicoAbierta) {
      const caja = document.querySelector('.tecnico-box');
      if (caja) caja.classList.remove('open');
      estado.tarjetaTecnicoAbierta = false;
    }
  }, 250));
}

// ==========================
// Utilidades
// ==========================
function debounce(funcion, espera) {
  let timeout;
  return function ejecutada(...args) {
    const later = () => {
      clearTimeout(timeout);
      funcion(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, espera);
  };
}

function duplicarProductosCarrusel() {
  const track = document.querySelector(".compras-track");
  if (track) {
    // Clonar productos para efecto infinito
    const productos = Array.from(track.querySelectorAll('.producto'));
    productos.forEach(producto => {
      const clon = producto.cloneNode(true);
      track.appendChild(clon);
    });
  }
}

// Precarga de imágenes críticas
function precargarImagenes() {
  const imagenes = [
    'img/tecnico.jpg',
    'img/pantalla-samsung-a10.jpg',
    'img/pantalla-iphone11.jpg',
    'img/bateria-xiaomi.jpg',
    'img/cargador-samsung.jpg'
  ];
  
  imagenes.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  // Cargar imágenes lazy (IntersectionObserver)
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // usa data-src si existe, si no mantiene el src actual
          if (img.dataset && img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('cargada');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

// Iniciar precarga después de que cargue lo esencial
window.addEventListener('load', precargarImagenes);
