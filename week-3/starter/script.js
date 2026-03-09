/**
 * ============================================
 * PROYECTO SEMANA 03 - SISTEMA DE GESTIÓN CON POO
 * Dominio: instrumentos musicales
 * ============================================
 *
 * Este archivo contiene la implementación completa adaptada
 * al dominio de instrumentos musicales. Se utilizan todas las
 * características de ES2023 requeridas por la guía.
 */

// ============================================
// CLASE BASE - Instrument
// ============================================
/**
 * Clase base abstracta para cualquier instrumento del sistema
 */
class Instrument {
  #id;
  #name;
  #active;
  #location;
  #dateCreated;

  constructor(name, location = '') {
    this.#id = crypto.randomUUID();
    this.#name = name;
    this.#location = location;
    this.#active = true;
    this.#dateCreated = new Date().toISOString();
  }

  // Getters
  get id() { return this.#id; }
  get name() { return this.#name; }
  get isActive() { return this.#active; }
  get location() { return this.#location; }
  get dateCreated() { return this.#dateCreated; }

  // Setter con validación
  set location(value) {
    // la ubicación puede quedar vacía en este dominio
    this.#location = value ? value.trim() : '';
  }

  // Métodos de instancia
  activate() {
    if (this.#active) {
      return { success: false, message: 'El instrumento ya está activo' };
    }
    this.#active = true;
    return { success: true, message: 'Instrumento activado correctamente' };
  }

  deactivate() {
    if (!this.#active) {
      return { success: false, message: 'El instrumento ya está inactivo' };
    }
    this.#active = false;
    return { success: true, message: 'Instrumento desactivado correctamente' };
  }

  getInfo() {
    throw new Error('El método getInfo() debe ser implementado en la clase hija');
  }

  getType() {
    return this.constructor.name;
  }
}

// ============================================
// CLASES DERIVADAS - Tipos de instrumentos
// ============================================

class StringInstrument extends Instrument {
  #numberOfStrings;
  #material;

  constructor(name, location = '', numberOfStrings = 0, material = '') {
    super(name, location);
    this.#numberOfStrings = numberOfStrings;
    this.#material = material;
  }

  get numberOfStrings() { return this.#numberOfStrings; }
  get material() { return this.#material; }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.getType(),
      numberOfStrings: this.#numberOfStrings,
      material: this.#material,
      active: this.isActive
    };
  }
}

class PercussionInstrument extends Instrument {
  #size;
  #isTuned;

  constructor(name, location = '', size = '', isTuned = false) {
    super(name, location);
    this.#size = size;
    this.#isTuned = isTuned;
  }

  get size() { return this.#size; }
  get isTuned() { return this.#isTuned; }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.getType(),
      size: this.#size,
      isTuned: this.#isTuned,
      active: this.isActive
    };
  }
}

class WindInstrument extends Instrument {
  #key;
  #material;

  constructor(name, location = '', key = '', material = '') {
    super(name, location);
    this.#key = key;
    this.#material = material;
  }
  get key() { return this.#key; }
  get material() { return this.#material; }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.getType(),
      key: this.#key,
      material: this.#material,
      active: this.isActive
    };
  }
}

// ============================================
// CLASE PERSON - Base para usuarios
// ============================================
class Person {
  #id;
  #name;
  #email;
  #registrationDate;

  constructor(name, email) {
    this.#id = crypto.randomUUID();
    this.#name = name;
    this.email = email;
    this.#registrationDate = new Date().toISOString();
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get email() { return this.#email; }
  get registrationDate() { return this.#registrationDate; }

  set email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Formato de email inválido');
    }
    this.#email = value;
  }

  getInfo() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      registrationDate: this.#registrationDate
    };
  }
}

// ============================================
// CLASES DE ROLES - Usuarios especializados
// ============================================
class Musician extends Person {
  #instrument;
  #experienceYears;

  constructor(name, email, instrument, experienceYears) {
    super(name, email);
    this.#instrument = instrument;
    this.#experienceYears = experienceYears;
  }

  get instrument() { return this.#instrument; }
  get experienceYears() { return this.#experienceYears; }

  addExperience(years) {
    this.#experienceYears += years;
  }
}

class Instructor extends Person {
  #specialty;
  #students = [];

  constructor(name, email, specialty) {
    super(name, email);
    this.#specialty = specialty;
  }

  get specialty() { return this.#specialty; }
  get students() { return [...this.#students]; }

  addStudent(student) {
    if (student instanceof Musician) {
      this.#students.push(student);
    } else {
      throw new Error('Solo se pueden añadir músicos como alumnos');
    }
  }
}

// ============================================
// CLASE PRINCIPAL DEL SISTEMA
// ============================================
class MusicInventory {
  #items = [];
  #users = [];
  #transactions = [];

  static {
    this.VERSION = '1.0.0';
    this.MAX_ITEMS = 1000;
    this.SYSTEM_NAME = 'Music Inventory';
    console.log(`Sistema ${this.SYSTEM_NAME} v${this.VERSION} cargado`);
  }

  static isValidId(id) {
    return typeof id === 'string' && id.length > 0;
  }

  static generateId() {
    return crypto.randomUUID();
  }

  addItem(item) {
    if (!(item instanceof Instrument)) {
      return { success: false, message: 'El item debe ser instancia de Instrument' };
    }
    if (this.#items.length >= MusicInventory.MAX_ITEMS) {
      return { success: false, message: 'Límite de items alcanzado' };
    }
    this.#items.push(item);
    return { success: true, message: 'Item agregado correctamente', item };
  }

  removeItem(id) {
    const index = this.#items.findIndex(item => item.id === id);
    if (index === -1) {
      return { success: false, message: 'Item no encontrado' };
    }
    const removed = this.#items.splice(index, 1)[0];
    return { success: true, message: 'Item eliminado', item: removed };
  }

  findItem(id) {
    return this.#items.find(item => item.id === id) ?? null;
  }

  getAllItems() {
    return [...this.#items];
  }

  searchByName(query) {
    const searchTerm = query.toLowerCase();
    return this.#items.filter(item =>
      item.name.toLowerCase().includes(searchTerm)
    );
  }

  filterByType(type) {
    return this.#items.filter(item => item.getType() === type);
  }

  filterByStatus(active) {
    return this.#items.filter(item => item.isActive === active);
  }

  getStats() {
    const total = this.#items.length;
    const active = this.#items.filter(item => item.isActive).length;
    const inactive = total - active;

    const byType = this.#items.reduce((acc, item) => {
      const type = item.getType();
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byType,
      users: this.#users.length
    };
  }

  addUser(user) {
    if (!(user instanceof Person)) {
      return { success: false, message: 'Debe ser instancia de Person' };
    }
    this.#users.push(user);
    return { success: true, message: 'Usuario registrado' };
  }

  findUserByEmail(email) {
    return this.#users.find(user => user.email === email) ?? null;
  }

  getAllUsers() {
    return [...this.#users];
  }
}

// ============================================
// INSTANCIA Y DATOS DE PRUEBA
// ============================================
const system = new MusicInventory();
const guitar = new StringInstrument('Guitarra acústica', 'Estudio A', 6, 'Madera');
const drum = new PercussionInstrument('Batería', 'Escenario', 'Grande', true);
const flute = new WindInstrument('Flauta', 'Sala de ensayo', 'C', 'Metal');
system.addItem(guitar);
system.addItem(drum);
system.addItem(flute);

// ============================================
// REFERENCIAS AL DOM
// ============================================
const itemForm = document.getElementById('item-form');
const itemList = document.getElementById('item-list');
const statsContainer = document.getElementById('stats');
const filterType = document.getElementById('filter-type');
const filterStatus = document.getElementById('filter-status');
const searchInput = document.getElementById('search-input');

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================
const renderItem = item => {
  const info = item.getInfo();
  return `
    <div class="item ${item.isActive ? '' : 'inactive'}" data-id="${item.id}">
      <div class="item-header">
        <h3>${item.name}</h3>
        <span class="badge">${item.getType()}</span>
      </div>
      <div class="item-details">
        <p>Estado: ${item.isActive ? 'Activo' : 'Inactivo'}</p>
      </div>
      <div class="item-actions">
        <button class="btn-toggle" data-id="${item.id}">
          ${item.isActive ? 'Desactivar' : 'Activar'}
        </button>
        <button class="btn-delete" data-id="${item.id}">Eliminar</button>
      </div>
    </div>
  `;
};

const renderItems = (items = []) => {
  if (items.length === 0) {
    itemList.innerHTML = '<p class="empty">No hay instrumentos</p>';
    return;
  }
  itemList.innerHTML = items.map(renderItem).join('');
};

const renderStats = stats => {
  statsContainer.innerHTML = `
    <div class="stat">Total: ${stats.total}</div>
    <div class="stat">Activos: ${stats.active}</div>
    <div class="stat">Inactivos: ${stats.inactive}</div>
  `;
};

// ============================================
// EVENT HANDLERS
// ============================================
const handleFormSubmit = e => {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const type = document.getElementById('item-type').value;
  const location = ''; // no se solicita en el formulario
  let item;

  if (type === 'StringInstrument') {
    item = new StringInstrument(name, location);
  } else if (type === 'PercussionInstrument') {
    item = new PercussionInstrument(name, location);
  } else if (type === 'WindInstrument') {
    item = new WindInstrument(name, location);
  }

  if (item) {
    system.addItem(item);
    handleFilterChange();
    renderStats(system.getStats());
    hideModal();
  }
};

const handleFilterChange = () => {
  let filtered = system.getAllItems();
  const typeVal = filterType.value;
  const statusVal = filterStatus.value;
  const searchVal = searchInput.value;

  if (typeVal !== 'all') {
    filtered = filtered.filter(i => i.getType() === typeVal);
  }
  if (statusVal !== 'all') {
    filtered = filtered.filter(i =>
      statusVal === 'active' ? i.isActive : !i.isActive
    );
  }
  if (searchVal) {
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(searchVal.toLowerCase())
    );
  }

  renderItems(filtered);
};

const handleItemAction = e => {
  const target = e.target;
  const itemId = target.dataset.id;
  if (!itemId) return;

  const item = system.findItem(itemId);
  if (!item) return;

  if (target.classList.contains('btn-toggle')) {
    if (item.isActive) item.deactivate();
    else item.activate();
  }

  if (target.classList.contains('btn-delete')) {
    if (confirm('¿Eliminar este instrumento?')) {
      system.removeItem(itemId);
    }
  }

  handleFilterChange();
  renderStats(system.getStats());
};

// ============================================
// EVENT LISTENERS
// ============================================
if (itemForm) itemForm.addEventListener('submit', handleFormSubmit);
if (filterType) filterType.addEventListener('change', handleFilterChange);
if (filterStatus) filterStatus.addEventListener('change', handleFilterChange);
if (searchInput) searchInput.addEventListener('input', handleFilterChange);
if (itemList) itemList.addEventListener('click', handleItemAction);

// pestañas de navegación
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // cambiar clase active en botones
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const target = btn.dataset.tab;
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');
  });
});

// modal de instrumentos y campos dinámicos
const addItemBtn = document.getElementById('add-item-btn');
const itemModal = document.getElementById('item-modal');
const closeModal = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');

function showModal() {
  if (itemModal) itemModal.style.display = 'block';
}
function hideModal() {
  if (itemModal) itemModal.style.display = 'none';
  if (itemForm) itemForm.reset();
}

// abrir/cerrar
if (addItemBtn) addItemBtn.addEventListener('click', showModal);
if (closeModal) closeModal.addEventListener('click', hideModal);
if (cancelBtn) cancelBtn.addEventListener('click', hideModal);


// ============================================
// INICIALIZACIÓN
// ============================================
const init = () => {
  renderItems(system.getAllItems());
  renderStats(system.getStats());
  console.log('✅ Sistema inicializado correctamente');
};

document.addEventListener('DOMContentLoaded', init);
