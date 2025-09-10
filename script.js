document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentDate = new Date();
    let selectedDate = null;
    let events = loadEvents();
    let filteredEvents = [...events];
    let isLoggedIn = false;
    let currentUser = null;

    // Elementos del DOM
    const calendarEl = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventsListEl = document.getElementById('events-list');
    const noEventsEl = document.getElementById('no-events');
    const selectedDateEl = document.getElementById('selected-date');
    const upcomingEventsListEl = document.getElementById('upcoming-events-list');
    const eventTypeFilter = document.getElementById('event-type');
    const municipalityFilter = document.getElementById('municipality');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const showLoginBtn = document.getElementById('show-login');
    const showAddEventBtn = document.getElementById('show-add-event');
    const loginFormModal = document.getElementById('login-form');
    const addEventFormModal = document.getElementById('add-event-form');
    const loginFormEl = document.getElementById('login-form-element');
    const eventFormEl = document.getElementById('event-form-element');

    // Usuarios y contraseñas (normalmente esto estaría en un servidor)
    const users = [
        { username: 'meoqui', password: 'meoqui2025', municipality: 'meoqui' },
        { username: 'delicias', password: 'delicias2025', municipality: 'delicias' },
        { username: 'saucillo', password: 'saucillo2025', municipality: 'saucillo' },
        { username: 'rosales', password: 'rosales2025', municipality: 'rosales' },
        { username: 'julimes', password: 'julimes2025', municipality: 'julimes' },
        { username: 'admin', password: 'admin2025', municipality: 'todos' }
    ];

    // Datos de muestra (solo para empezar)
    function getInitialEvents() {
        return [
            {
                id: 1,
                name: 'Festival Gastronómico Regional',
                date: '2025-10-15',
                type: 'gastronomico',
                municipality: 'meoqui',
                location: 'Plaza Principal de Meoqui',
                description: 'Degustación de platillos típicos de la región con los mejores chefs locales.',
                image: 'https://via.placeholder.com/800x400?text=Festival+Gastronómico'
            },
            {
                id: 2,
                name: 'Maratón del Desierto',
                date: '2025-10-22',
                type: 'deportivo',
                municipality: 'delicias',
                location: 'Parque Central de Delicias',
                description: 'Carrera de 42km a través de los paisajes más impresionantes de la región.',
                image: 'https://via.placeholder.com/800x400?text=Maratón+del+Desierto'
            },
            {
                id: 3,
                name: 'Feria del Vino Artesanal',
                date: '2025-11-05',
                type: 'vinos',
                municipality: 'saucillo',
                location: 'Viñedos El Cóncavo',
                description: 'Exposición de vinos artesanales producidos en la región con catas guiadas.',
                image: 'https://via.placeholder.com/800x400?text=Feria+del+Vino'
            }
        ];
    }

    // Cargar eventos desde localStorage o usar datos de muestra
    function loadEvents() {
        const storedEvents = localStorage.getItem('calendarEvents');
        if (storedEvents) {
            return JSON.parse(storedEvents);
        } else {
            const initialEvents = getInitialEvents();
            localStorage.setItem('calendarEvents', JSON.stringify(initialEvents));
            return initialEvents;
        }
    }

    // Guardar eventos en localStorage
    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }

    // Renderizar calendario
    function renderCalendar() {
        // Limpiar días existentes (manteniendo los días de la semana)
        const dayElements = calendarEl.querySelectorAll('.day');
        dayElements.forEach(day => day.remove());

        // Configurar mes y año actual en el encabezado
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        // Obtener primer día del mes
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Obtener día de la semana del primer día (0 = Domingo, 6 = Sábado)
        let dayOfWeek = firstDay.getDay();
        
        // Añadir días del mes anterior para completar la primera semana
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        for (let i = dayOfWeek - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.classList.add('day', 'other-month');
            day.textContent = prevMonthLastDay - i;
            calendarEl.appendChild(day);
        }
        
        // Añadir días del mes actual
        const today = new Date();
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.textContent = i;
            day.dataset.date = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            
            // Marcar el día actual
            if (currentDate.getFullYear() === today.getFullYear() && 
                currentDate.getMonth() === today.getMonth() && 
                i === today.getDate()) {
                day.classList.add('today');
            }
            
            // Marcar si hay eventos en este día
            const dateStr = day.dataset.date;
            if (events.some(event => event.date === dateStr)) {
                day.classList.add('has-events');
            }
            
            // Marcar día seleccionado si existe
            if (selectedDate && dateStr === selectedDate) {
                day.classList.add('selected');
            }
            
            // Evento click para mostrar eventos del día
            day.addEventListener('click', function() {
                // Desmarcar día seleccionado anterior
                document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
                
                // Marcar nuevo día seleccionado
                day.classList.add('selected');
                selectedDate = dateStr;
                
                // Formatear la fecha para mostrarla
                const dateParts = dateStr.split('-');
                const formattedDate = `${dateParts[2]} de ${monthNames[parseInt(dateParts[1]) - 1]} de ${dateParts[0]}`;
                selectedDateEl.textContent = formattedDate;
                
                // Mostrar eventos del día
                showEventsForDate(dateStr);
            });
            
            calendarEl.appendChild(day);
        }
        
        // Añadir días del mes siguiente para completar la última semana
        const totalDaysShown = dayOfWeek + lastDay.getDate();
        const remainingCells = 42 - totalDaysShown; // 6 filas x 7 días = 42 celdas en total
        
        for (let i = 1; i <= remainingCells; i++) {
            const day = document.createElement('div');
            day.classList.add('day', 'other-month');
            day.textContent = i;
            calendarEl.appendChild(day);
        }
        
        // Mostrar eventos próximos
        showUpcomingEvents();
    }

    // Mostrar eventos para una fecha específica
    function showEventsForDate(dateStr) {
        // Filtrar eventos por fecha y luego aplicar filtros adicionales
        let dateEvents = events.filter(event => event.date === dateStr);
        
        // Aplicar filtros adicionales si están activos
        const eventType = eventTypeFilter.value;
        const municipality = municipalityFilter.value;
        
        if (eventType !== 'todos') {
            dateEvents = dateEvents.filter(event => event.type === eventType);
        }
        
        if (municipality !== 'todos') {
            dateEvents = dateEvents.filter(event => event.municipality === municipality);
        }
        
        // Mostrar eventos o mensaje de "no hay eventos"
        if (dateEvents.length === 0) {
            noEventsEl.style.display = 'block';
            eventsListEl.innerHTML = '';
        } else {
            noEventsEl.style.display = 'none';
            eventsListEl.innerHTML = '';
            
            dateEvents.forEach(event => {
                const eventCard = createEventCard(event);
                eventsListEl.appendChild(eventCard);
            });
        }
    }

    // Mostrar próximos eventos
    function showUpcomingEvents() {
        // Obtener fecha actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filtrar eventos futuros (próximos 30 días)
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 30);
        
        let upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= futureDate;
        });
        
        // Aplicar filtros adicionales si están activos
        const eventType = eventTypeFilter.value;
        const municipality = municipalityFilter.value;
        
        if (eventType !== 'todos') {
            upcomingEvents = upcomingEvents.filter(event => event.type === eventType);
        }
        
        if (municipality !== 'todos') {
            upcomingEvents = upcomingEvents.filter(event => event.municipality === municipality);
        }
        
        // Ordenar por fecha
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Mostrar solo los primeros 5 eventos
        upcomingEvents = upcomingEvents.slice(0, 5);
        
        // Mostrar eventos
        upcomingEventsListEl.innerHTML = '';
        
        if (upcomingEvents.length === 0) {
            upcomingEventsListEl.innerHTML = '<p class="no-events">No hay próximos eventos programados.</p>';
        } else {
            upcomingEvents.forEach(event => {
                const eventCard = createEventCard(event);
                upcomingEventsListEl.appendChild(eventCard);
            });
        }
    }

    // Crear tarjeta de evento
    function createEventCard(event) {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        // Formatear fecha
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Formatear tipo de evento
        const eventTypes = {
            'gastronomico': 'Gastronómico',
            'deportivo': 'Deportivo',
            'cultural': 'Cultural',
            'vinos': 'Vinos',
            'aventura': 'Aventura'
        };
        
        // Formatear municipio
        const municipalities = {
            'meoqui': 'Meoqui',
            'delicias': 'Delicias',
            'saucillo': 'Saucillo',
            'rosales': 'Rosales',
            'julimes': 'Julimes'
        };
        
        eventCard.innerHTML = `
            <div class="event-header">
                <h4 class="event-title">${event.name}</h4>
                <span class="event-date">${formattedDate}</span>
            </div>
            <div class="event-details">
                <p>${event.description}</p>
                <p><strong>Lugar:</strong> ${event.location}</p>
                <div class="event-tags">
                    <span class="event-type">${eventTypes[event.type] || event.type}</span>
                    <span class="event-municipality">${municipalities[event.municipality] || event.municipality}</span>
                </div>
            </div>
        `;
        
        // Si el usuario está logueado y es administrador o del mismo municipio, mostrar botones de edición
        if (isLoggedIn && (currentUser.municipality === 'todos' || currentUser.municipality === event.municipality)) {
            const actionButtons = document.createElement('div');
            actionButtons.className = 'event-actions';
            actionButtons.innerHTML = `
                <button class="edit-btn" data-id="${event.id}">Editar</button>
                <button class="delete-btn" data-id="${event.id}">Eliminar</button>
            `;
            eventCard.appendChild(actionButtons);
            
            // Añadir eventos a los botones
            actionButtons.querySelector('.edit-btn').addEventListener('click', function() {
                editEvent(event.id);
            });
            
            actionButtons.querySelector('.delete-btn').addEventListener('click', function() {
                deleteEvent(event.id);
            });
        }
        
        return eventCard;
    }

    // Función para editar evento
    function editEvent(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        // Rellenar formulario con datos del evento
        document.getElementById('event-name').value = event.name;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-type-select').value = event.type;
        document.getElementById('event-municipality').value = event.municipality;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-description').value = event.description;
        document.getElementById('event-image').value = event.image || '';
        
        // Guardar ID del evento en edición
        eventFormEl.dataset.editId = eventId;
        
        // Mostrar formulario
        showModal(addEventFormModal);
    }

    // Función para eliminar evento
    function deleteEvent(eventId) {
        if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            events = events.filter(e => e.id !== eventId);
            saveEvents();
            
            // Actualizar vista
            if (selectedDate) {
                showEventsForDate(selectedDate);
            }
            
            renderCalendar();
        }
    }

    // Función para añadir o actualizar evento
    function addOrUpdateEvent(formData) {
        const editId = parseInt(eventFormEl.dataset.editId);
        
        if (editId) {
            // Actualizar evento existente
            const index = events.findIndex(e => e.id === editId);
            if (index !== -1) {
                events[index] = { 
                    id: editId,
                    ...formData
                };
            }
        } else {
            // Añadir nuevo evento
            const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
            events.push({
                id: newId,
                ...formData
            });
        }
        
        saveEvents();
        renderCalendar();
        
        if (selectedDate) {
            showEventsForDate(selectedDate);
        }
    }

    // Función para mostrar modal (nueva función)
    function showModal(modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }

    // Función para ocultar modal (nueva función)
    function hideModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Navegación entre meses
    prevMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Filtrar eventos
    applyFiltersBtn.addEventListener('click', function() {
        if (selectedDate) {
            showEventsForDate(selectedDate);
        }
        showUpcomingEvents();
    });
    
    // Manejo de modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal);
        });
    });
    
    // Botón de login (MODIFICADO)
    showLoginBtn.addEventListener('click', function() {
        console.log("Botón de login clickeado"); // Añadido para depuración
        
        if (isLoggedIn) {
            // Hacer logout
            isLoggedIn = false;
            currentUser = null;
            showLoginBtn.textContent = 'Iniciar Sesión';
            showAddEventBtn.classList.add('hidden');
            
            // Ocultar botones de edición
            document.querySelectorAll('.event-actions').forEach(el => el.remove());
            
            alert('Has cerrado sesión correctamente.');
        } else {
            // Mostrar formulario de login (MODIFICADO)
            showModal(loginFormModal);
        }
    });
    
    // Botón de añadir evento (MODIFICADO)
    showAddEventBtn.addEventListener('click', function() {
        // Limpiar formulario
        eventFormEl.reset();
        delete eventFormEl.dataset.editId;
        
        // Mostrar formulario
        showModal(addEventFormModal);
    });
    
    // Formulario de login
    loginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            isLoggedIn = true;
            currentUser = user;
            showLoginBtn.textContent = 'Cerrar Sesión';
            showAddEventBtn.classList.remove('hidden');
            hideModal(loginFormModal);
            
            // Actualizar vista para mostrar botones de edición
            if (selectedDate) {
                showEventsForDate(selectedDate);
            }
            showUpcomingEvents();
            
            alert(`¡Bienvenido, ${username}! Ya puedes gestionar los eventos de tu municipio.`);
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
    
    // Formulario de evento
    eventFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('event-name').value,
            date: document.getElementById('event-date').value,
            type: document.getElementById('event-type-select').value,
            municipality: document.getElementById('event-municipality').value,
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value,
            image: document.getElementById('event-image').value
        };
        
        // Validar que el usuario solo pueda agregar eventos de su municipio (excepto admin)
        if (currentUser.municipality !== 'todos' && formData.municipality !== currentUser.municipality) {
            alert('Solo puedes agregar eventos para tu municipio');
            return;
        }
        
        addOrUpdateEvent(formData);
        hideModal(addEventFormModal);
    });
    
    // Inicializar calendario
    renderCalendar();
    
    // Seleccionar día actual
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    selectedDate = todayStr;
    
    // Formatear la fecha actual para mostrarla
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const formattedToday = `${today.getDate()} de ${monthNames[today.getMonth()]} de ${today.getFullYear()}`;
    selectedDateEl.textContent = formattedToday;
    
    // Mostrar eventos del día actual
    showEventsForDate(todayStr);

    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target);
        }
    });
});
