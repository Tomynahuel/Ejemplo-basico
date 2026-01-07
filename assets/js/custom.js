(function ($) {
    "use strict";

    // 1. CARGA DE PÁGINA
    $(window).on('load', function () {
        $('#js-preloader').addClass('loaded');
    });

    // 2. HEADER SCROLL (Menú pegajoso)
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        var box = $('.header-text').height();
        var header = $('header').height();

        if (scroll >= box - header) {
            $("header").addClass("background-header");
        } else {
            $("header").removeClass("background-header");
        }
    });

    // 3. CARRUSEL / BANNER (Esto es lo que faltaba o fallaba)
    $('.owl-banner').owlCarousel({
        center: true,
        items: 1,
        loop: true,
        nav: true,
        dots: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        margin: 30,
        responsive: {
            992: { items: 1 },
            1200: { items: 1 }
        }
    });

    // 4. MENU MÓVIL
    if ($('.menu-trigger').length) {
        $(".menu-trigger").on('click', function () {
            $(this).toggleClass('active');
            $('.header-area .nav').slideToggle(200);
        });
    }

    // 5. LÓGICA PRINCIPAL (Document Ready)
    $(document).ready(function () {

        // --- CONFIGURACIÓN DE SEGURIDAD Y CONTACTO ---
        const numeroWhatsapp = "5493757685481"; 
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBNcRXGyolXB--9Eh0_q0FMl83bIguKeoHvfxmFOliVNnGl0qfq7HRyONSM34gpone/exec";
        
        // Token camuflado (Base64)
        const _sys_config_ref = "U1lTVEVNX0FDQ0VTU19HUkFOVEVEXzIwMjY="; 

        function abrirWhatsapp(mensaje) {
            window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(mensaje)}`, '_blank');
        }

        // --- BOTONES DE CONSULTA ---
        $("#whatsapp-consulta").on("click", function(e) {
            e.preventDefault();
            abrirWhatsapp("Hola Taxis Iguazú! Tengo una consulta sobre los traslados.");
        });

        $("#whatsapp-header").on("click", function(e) {
            e.preventDefault();
            abrirWhatsapp("Hola! Me comunico desde la web.");
        });

        // --- SCROLL SUAVE ---
        $("a[href^='#']").on("click", function (e) {
            const href = $(this).attr('href');
            if (href.length > 1 && href !== '#') {
                const target = $(href);
                if (target.length) {
                    e.preventDefault();
                    if ($(window).width() < 991) {
                        $('.menu-trigger').removeClass('active');
                        $('.header-area .nav').slideUp(200);
                    }
                    $('html, body').animate({ scrollTop: target.offset().top - 80 }, 1200);
                }
            }
        });

        // --- CONTROL DE FECHAS (Validación) ---
        const dateInput = document.getElementById('res-date');
        if (dateInput) {
            const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');
            const fechaMinima = `${yyyy}-${mm}-${dd}`;
            
            dateInput.setAttribute('min', fechaMinima);
            
            dateInput.addEventListener('change', function() {
                if (this.value && this.value < fechaMinima) {
                    alert("⚠️ No puedes seleccionar una fecha pasada.");
                    this.value = fechaMinima;
                }
            });
        }

        /* --- PROCESO DE RESERVA (Formulario) --- */
        const reservationForm = document.getElementById('reservation-form');

        if (reservationForm) {
            $(reservationForm).off('submit');

            reservationForm.addEventListener('submit', function (e) {
                e.preventDefault();

                // Captura de datos
                const nombre = document.getElementById('res-name').value;
                const fecha = document.getElementById('res-date').value;
                const hora = document.getElementById('res-time').value;
                const pasajeros = document.getElementById('res-passengers').value;
                const lugarRetiro = document.getElementById('res-pickup').value;
                const destinoSeleccionado = document.getElementById('res-destin').value;
                const lugarDestinoExacto = document.getElementById('res-dropoff').value || "";

                // Validación de hora
                if (fecha && hora) {
                    const fechaObj = new Date(fecha + 'T00:00:00');
                    const hoyObj = new Date();
                    hoyObj.setHours(0,0,0,0);

                    if (fechaObj.getTime() === hoyObj.getTime()) {
                        const ahoraMismo = new Date();
                        const partesHora = hora.split(':');
                        const horaSeleccionada = new Date();
                        horaSeleccionada.setHours(partesHora[0], partesHora[1], 0, 0);
                        const margen = new Date(ahoraMismo.getTime() + 60*60*1000); 

                        if (horaSeleccionada < ahoraMismo) {
                            alert("⚠️ La hora seleccionada ya pasó."); return;
                        }
                        if (horaSeleccionada < margen) {
                            alert("⚠️ Para reservas inmediatas, usa el botón 'Consultas Rápidas'."); return;
                        }
                    }
                }

                // Envío seguro a Google
                const formData = new FormData();
                formData.append("sys_ref_id", _sys_config_ref); // Token
                formData.append("nombre", nombre);
                formData.append("fecha", fecha);
                formData.append("hora", hora);
                formData.append("pasajeros", pasajeros);
                formData.append("origen", lugarRetiro);
                formData.append("destino", destinoSeleccionado);
                formData.append("detalles", lugarDestinoExacto);

                fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    body: formData
                }).then(() => console.log("Backup OK")).catch(err => console.error(err));

                // Abrir WhatsApp
                let mensaje = `Hola Taxis Iguazú!\nSoy ${nombre} y quisiera realizar una reserva:\n\n- Fecha: ${fecha}\n- Hora: ${hora}\n- Pasajeros: ${pasajeros}\n- Origen: ${lugarRetiro}\n- Destino: ${destinoSeleccionado}`;
                if (lugarDestinoExacto) mensaje += `\n- Detalle: ${lugarDestinoExacto}`;
                mensaje += `\n\nAguardo confirmación.`;

                abrirWhatsapp(mensaje);
            });
        }
    });

})(window.jQuery);