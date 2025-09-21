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
  ultimaPosicionScroll: 0,
  timeoutReanudar: null // <-- Para reanudar automáticamente
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
  inicializarModoOscuro(); // <-- Nuevo: inicializar modo claro/oscuro
  duplicarProductosCarrusel();
  precargarImagenes();
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
    menuToggle.setAttribute('aria-expanded', 'false');

    menuToggle.addEventListener('click', function() {
      estado.menuAbierto = !estado.menuAbierto;
      this.setAttribute('aria-expanded', String(estado.menuAbierto));
      navLinks.classList.toggle('open');
      this.textContent = estado.menuAbierto ? '✕' : '☰';
    });

    document.querySelectorAll('#nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768 && estado.menuAbierto) {
          menuToggle.click();
        }
      });
    });
  }

  // ScrollSpy
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
      const href = link.getAttribute('href').substring(1).toLowerCase();
      if (href === seccionActual.toLowerCase()) {
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
        if (entrada.target.classList.contains('producto')) {
          entrada.target.style.transitionDelay = `${Math.random() * 0.3}s`;
        }
      }
    });
  }, opciones);

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
    botonToggle.addEventListener('click', function() {
      estado.autoScrollActivo = !estado.autoScrollActivo;
      
      if (estado.autoScrollActivo) {
        trackCompras.style.animationPlayState = 'running';
        this.textContent = '⏸ Pausar';
        this.classList.remove('pausado');
        if (estado.timeoutReanudar) {
          clearTimeout(estado.timeoutReanudar);
          estado.timeoutReanudar = null;
        }
      } else {
        trackCompras.style.animationPlayState = 'paused';
        this.textContent = '▶ Reanudar';
        this.classList.add('pausado');
      }
    });

    // Flechas de navegación
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const productos = Array.from(trackCompras.querySelectorAll('.producto'));
    let indiceActual = 0;
    let productosVisibles = Math.floor(trackCompras.offsetWidth / productos[0].offsetWidth);

    if (prevBtn && nextBtn) {
      function actualizarBotones() {
        prevBtn.disabled = indiceActual <= 0;
        nextBtn.disabled = indiceActual >= productos.length - productosVisibles;
      }

      prevBtn.addEventListener('click', () => {
        if (indiceActual > 0) {
          trackCompras.style.animation = 'none';
          indiceActual--;
          const desplazamiento = -indiceActual * productos[0].offsetWidth;
          trackCompras.style.transform = `translateX(${desplazamiento}px)`;
          trackCompras.style.transition = 'transform 0.4s ease';
          actualizarBotones();
          if (estado.autoScrollActivo) {
            estado.autoScrollActivo = false;
            trackCompras.style.animationPlayState = 'paused';
            botonToggle.textContent = '▶ Reanudar';
            botonToggle.classList.add('pausado');
            programarReanudacion();
          }
        }
      });

      nextBtn.addEventListener('click', () => {
        if (indiceActual < productos.length - productosVisibles) {
          trackCompras.style.animation = 'none';
          indiceActual++;
          const desplazamiento = -indiceActual * productos[0].offsetWidth;
          trackCompras.style.transform = `translateX(${desplazamiento}px)`;
          trackCompras.style.transition = 'transform 0.4s ease';
          actualizarBotones();
          if (estado.autoScrollActivo) {
            estado.autoScrollActivo = false;
            trackCompras.style.animationPlayState = 'paused';
            botonToggle.textContent = '▶ Reanudar';
            botonToggle.classList.add('pausado');
            programarReanudacion();
          }
        }
      });

      actualizarBotones();

      window.addEventListener('resize', debounce(() => {
        productosVisibles = Math.floor(trackCompras.offsetWidth / productos[0].offsetWidth);
        actualizarBotones();
      }, 250));
    }

    // Indicadores de puntos
    const indicadoresContainer = document.getElementById('indicadoresCarrusel');
    let puntos = [];

    function crearIndicadores() {
      indicadoresContainer.innerHTML = '';
      puntos = [];
      const totalPuntos = Math.ceil(productos.length / productosVisibles);

      for (let i = 0; i < totalPuntos; i++) {
        const punto = document.createElement('div');
        punto.classList.add('punto');
        punto.setAttribute('data-indice', i);
        punto.setAttribute('role', 'button');
        punto.setAttribute('aria-label', `Ir al grupo ${i + 1}`);
        punto.setAttribute('tabindex', '0');

        punto.addEventListener('click', () => irAPunto(i));
        punto.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            irAPunto(i);
          }
        });

        indicadoresContainer.appendChild(punto);
        puntos.push(punto);
      }
      actualizarPuntoActivo();
    }

    function actualizarPuntoActivo() {
      const indicePunto = Math.floor(indiceActual / productosVisibles);
      puntos.forEach((punto, i) => {
        if (i === indicePunto) {
          punto.classList.add('activo');
          punto.setAttribute('aria-current', 'true');
        } else {
          punto.classList.remove('activo');
          punto.removeAttribute('aria-current');
        }
      });
    }

    function irAPunto(indicePunto) {
      const nuevoIndice = indicePunto * productosVisibles;
      indiceActual = Math.min(nuevoIndice, productos.length - productosVisibles);
      trackCompras.style.animation = 'none';
      const desplazamiento = -indiceActual * productos[0].offsetWidth;
      trackCompras.style.transform = `translateX(${desplazamiento}px)`;
      trackCompras.style.transition = 'transform 0.5s ease';
      if (estado.autoScrollActivo) {
        estado.autoScrollActivo = false;
        trackCompras.style.animationPlayState = 'paused';
        botonToggle.textContent = '▶ Reanudar';
        botonToggle.classList.add('pausado');
        programarReanudacion();
      }
      actualizarBotones();
      actualizarPuntoActivo();
    }

    crearIndicadores();

    window.addEventListener('resize', debounce(() => {
      productosVisibles = Math.floor(trackCompras.offsetWidth / productos[0].offsetWidth);
      crearIndicadores();
      actualizarBotones();
    }, 250));

    const actualizarPuntoOriginal = actualizarBotones;
    actualizarBotones = function() {
      actualizarPuntoOriginal();
      actualizarPuntoActivo();
    }

    // Soporte táctil (swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    trackCompras.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    trackCompras.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      const umbral = 50;
      if (Math.abs(diff) < umbral) return;

      trackCompras.style.animation = 'none';
      if (estado.autoScrollActivo) {
        estado.autoScrollActivo = false;
        trackCompras.style.animationPlayState = 'paused';
        botonToggle.textContent = '▶ Reanudar';
        botonToggle.classList.add('pausado');
        programarReanudacion();
      }

      if (diff > 0) {
        if (indiceActual < productos.length - productosVisibles) {
          indiceActual++;
        }
      } else {
        if (indiceActual > 0) {
          indiceActual--;
        }
      }

      const desplazamiento = -indiceActual * productos[0].offsetWidth;
      trackCompras.style.transform = `translateX(${desplazamiento}px)`;
      trackCompras.style.transition = 'transform 0.4s ease';
      actualizarBotones();
    }

    // Función para reanudar automáticamente
    function programarReanudacion() {
      if (estado.timeoutReanudar) clearTimeout(estado.timeoutReanudar);
      estado.timeoutReanudar = setTimeout(() => {
        if (!estado.autoScrollActivo) {
          estado.autoScrollActivo = true;
          trackCompras.style.animation = '';
          trackCompras.style.animationPlayState = 'running';
          botonToggle.textContent = '⏸ Pausar';
          botonToggle.classList.remove('pausado');
        }
        estado.timeoutReanudar = null;
      }, 3000);
    }

    // Pausar al interactuar
    if (config.carrusel.pausaAlInteractuar) {
      trackCompras.addEventListener('mouseenter', () => {
        if (estado.autoScrollActivo) {
          trackCompras.style.animationPlayState = 'paused';
          programarReanudacion();
        }
      });

      trackCompras.addEventListener('mouseleave', () => {
        if (estado.autoScrollActivo) {
          trackCompras.style.animationPlayState = 'running';
          if (estado.timeoutReanudar) {
            clearTimeout(estado.timeoutReanudar);
            estado.timeoutReanudar = null;
          }
        }
      });

      trackCompras.addEventListener('touchstart', () => {
        if (estado.autoScrollActivo) {
          trackCompras.style.animationPlayState = 'paused';
          programarReanudacion();
        }
      });

      trackCompras.addEventListener('touchend', () => {
        if (estado.autoScrollActivo) {
          setTimeout(() => {
            if (estado.autoScrollActivo) {
              trackCompras.style.animationPlayState = 'running';
              if (estado.timeoutReanudar) {
                clearTimeout(estado.timeoutReanudar);
                estado.timeoutReanudar = null;
              }
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
      if (!estado.tarjetaTecnicoAbierta) {
        cajaTecnico.classList.add('open');
        cajaTecnico.classList.remove('closing');
        estado.tarjetaTecnicoAbierta = true;
        this.style.transform = 'scale(1.1)';
      } else {
        cajaTecnico.classList.add('closing');
        cajaTecnico.classList.remove('open');
        setTimeout(() => {
          estado.tarjetaTecnicoAbierta = false;
          toggleTecnico.style.transform = 'scale(1)';
        }, 400);
      }
    });

    document.addEventListener('click', function(e) {
      if (estado.tarjetaTecnicoAbierta && 
          !cajaTecnico.contains(e.target) && 
          !toggleTecnico.contains(e.target)) {
        cajaTecnico.classList.add('closing');
        cajaTecnico.classList.remove('open');
        setTimeout(() => {
          estado.tarjetaTecnicoAbierta = false;
          toggleTecnico.style.transform = 'scale(1)';
        }, 400);
      }
    });

    cajaTecnico.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}

// ==========================
// Efectos especiales e interacciones
// ==========================
function inicializarEfectosEspeciales() {
  // Levitación botones
  document.querySelectorAll('.btn-principal, .btn-secundario, .btn-whatsapp').forEach(boton => {
    boton.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
    });
    boton.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Efectos productos
  document.querySelectorAll('.producto').forEach(producto => {
    producto.addEventListener('mouseenter', function() {
      this.style.zIndex = '10';
    });
    producto.addEventListener('mouseleave', function() {
      this.style.zIndex = '1';
    });
  });

  // Zoom en imagen de producto
  const modalZoom = document.getElementById('modalZoom');
  const imagenZoom = document.getElementById('imagenZoom');
  const cerrarModal = document.querySelector('.cerrar-modal');

  document.querySelectorAll('.producto img').forEach(img => {
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      if (this.dataset.src) {
        imagenZoom.src = this.dataset.src;
      } else {
        imagenZoom.src = this.src;
      }
      modalZoom.classList.add('abierto');
      modalZoom.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  if (cerrarModal) {
    cerrarModal.addEventListener('click', cerrarModalZoom);
  }

  if (modalZoom) {
    modalZoom.addEventListener('click', function(e) {
      if (e.target === modalZoom) {
        cerrarModalZoom();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalZoom && modalZoom.classList.contains('abierto')) {
      cerrarModalZoom();
    }
  });

  function cerrarModalZoom() {
    if (modalZoom) {
      modalZoom.classList.remove('abierto');
      modalZoom.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // Logo bienvenida
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
  // Scroll suave
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

  // Responsive
  window.addEventListener('resize', debounce(function() {
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
// Modo Claro/Oscuro
// ==========================
function inicializarModoOscuro() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const root = document.documentElement;

  // Cargar preferencia guardada
  if (localStorage.getItem('modoOscuro') === 'false') {
    root.classList.add('modo-claro');
    if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else if (localStorage.getItem('modoOscuro') === null) {
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      root.classList.add('modo-claro');
      if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('modoOscuro', 'false');
    }
  }

  // Cambiar modo
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      if (root.classList.contains('modo-claro')) {
        root.classList.remove('modo-claro');
        localStorage.setItem('modoOscuro', 'true');
        this.innerHTML = '<i class="fas fa-moon"></i>';
      } else {
        root.classList.add('modo-claro');
        localStorage.setItem('modoOscuro', 'false');
        this.innerHTML = '<i class="fas fa-sun"></i>';
      }
    });
  }
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
    const productos = Array.from(track.querySelectorAll('.producto'));
    productos.forEach(producto => {
      const clon = producto.cloneNode(true);
      track.appendChild(clon);
    });
  }
}

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
  
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
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

// Efecto de confeti
function dispararConfeti() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [
        '#00d9ff',
        '#8a2be2',
        '#ff6600',
        '#ffde59',
        '#ffffff'
      ],
      angle: 60,
      startVelocity: 30,
      gravity: 0.5,
      scalar: 1.2
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#00d9ff', '#ff6600', '#ffffff'],
        angle: 120,
        startVelocity: 25,
        gravity: 0.5,
        scalar: 1.0
      });
    }, 150);
  }
}

window.addEventListener('load', precargarImagenes);
