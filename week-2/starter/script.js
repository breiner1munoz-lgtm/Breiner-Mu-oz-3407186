// ============================================
// ESTADO GLOBAL
// ============================================

let items = [];
let editingItemId = null;

// ============================================
// CATEGORÍAS DEL DOMINIO - TAREAS
// ============================================

const CATEGORIES = {
  work: { name: 'Trabajo', emoji: '💼' },
  study: { name: 'Estudio', emoji: '📚' },
  personal: { name: 'Personal', emoji: '👤' },
  home: { name: 'Hogar', emoji: '🏠' },
};

const PRIORITIES = {
  high: { name: 'Alta', color: '#ef4444' },
  medium: { name: 'Media', color: '#f59e0b' },
  low: { name: 'Baja', color: '#22c55e' },
};

// ============================================
// PERSISTENCIA
// ============================================

const loadItems = () => {
  return JSON.parse(localStorage.getItem('tasks') ?? '[]');
};

const saveItems = itemsToSave => {
  localStorage.setItem('tasks', JSON.stringify(itemsToSave));
};

// ============================================
// CRUD - CREAR
// ============================================

const createItem = (itemData = {}) => {
  const newItem = {
    id: Date.now(),
    name: itemData.name ?? '',
    description: itemData.description ?? '',
    category: itemData.category ?? 'personal',
    priority: itemData.priority ?? 'medium',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };

  const newItems = [...items, newItem];
  saveItems(newItems);
  return newItems;
};

// ============================================
// CRUD - ACTUALIZAR
// ============================================

const updateItem = (id, updates) => {
  const updatedItems = items.map(item =>
    item.id === id
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item
  );

  saveItems(updatedItems);
  return updatedItems;
};

// ============================================
// CRUD - ELIMINAR
// ============================================

const deleteItem = id => {
  const filteredItems = items.filter(item => item.id !== id);
  saveItems(filteredItems);
  return filteredItems;
};

// ============================================
// TOGGLE ACTIVO
// ============================================

const toggleItemActive = id => {
  const updatedItems = items.map(item =>
    item.id === id
      ? { ...item, active: !item.active, updatedAt: new Date().toISOString() }
      : item
  );

  saveItems(updatedItems);
  return updatedItems;
};

const clearInactive = () => {
  const activeItems = items.filter(item => item.active);
  saveItems(activeItems);
  return activeItems;
};

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

const filterByStatus = (itemsToFilter, status = 'all') => {
  if (status === 'active') return itemsToFilter.filter(item => item.active);
  if (status === 'inactive') return itemsToFilter.filter(item => !item.active);
  return itemsToFilter;
};

const filterByCategory = (itemsToFilter, category = 'all') => {
  if (category === 'all') return itemsToFilter;
  return itemsToFilter.filter(item => item.category === category);
};

const filterByPriority = (itemsToFilter, priority = 'all') => {
  if (priority === 'all') return itemsToFilter;
  return itemsToFilter.filter(item => item.priority === priority);
};

const searchItems = (itemsToFilter, query = '') => {
  if (!query.trim()) return itemsToFilter;

  const searchTerm = query.toLowerCase();
  return itemsToFilter.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );
};

const applyFilters = (itemsToFilter, filters = {}) => {
  const {
    status = 'all',
    category = 'all',
    priority = 'all',
    search = '',
  } = filters;

  return searchItems(
    filterByPriority(
      filterByCategory(
        filterByStatus(itemsToFilter, status),
        category
      ),
      priority
    ),
    search
  );
};

// ============================================
// ESTADÍSTICAS
// ============================================

const getStats = (itemsToAnalyze = []) => {
  const total = itemsToAnalyze.length;
  const active = itemsToAnalyze.filter(item => item.active).length;
  const inactive = total - active;

  const byCategory = itemsToAnalyze.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const byPriority = itemsToAnalyze.reduce((acc, item) => {
    acc[item.priority] = (acc[item.priority] ?? 0) + 1;
    return acc;
  }, {});

  return { total, active, inactive, byCategory, byPriority };
};

// ============================================
// RENDERIZADO
// ============================================

const getCategoryEmoji = category =>
  CATEGORIES[category]?.emoji ?? '📌';

const formatDate = dateString =>
  new Date(dateString).toLocaleDateString('es-ES');

const renderItem = item => {
  const { id, name, description, category, priority, active, createdAt } = item;

  return `
    <div class="item ${active ? '' : 'inactive'} priority-${priority}" data-item-id="${id}">
      <input type="checkbox" class="item-checkbox" ${active ? 'checked' : ''}>
      <div class="item-content">
        <h3>${name}</h3>
        ${description ? `<p>${description}</p>` : ''}
        <small>
          ${getCategoryEmoji(category)} ${CATEGORIES[category].name} |
          ${PRIORITIES[priority].name} |
          📅 ${formatDate(createdAt)}
        </small>
      </div>
      <div class="item-actions">
        <button class="btn-edit">✏️</button>
        <button class="btn-delete">🗑️</button>
      </div>
    </div>
  `;
};

const renderItems = itemsToRender => {
  const list = document.getElementById('item-list');
  const empty = document.getElementById('empty-state');

  if (itemsToRender.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = itemsToRender.map(renderItem).join('');
};

const renderStats = stats => {
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-active').textContent = stats.active;
  document.getElementById('stat-inactive').textContent = stats.inactive;
};

// ============================================
// EVENTOS
// ============================================

const handleFormSubmit = e => {
  e.preventDefault();

  const name = document.getElementById('item-name').value.trim();
  const description = document.getElementById('item-description').value.trim();
  const category = document.getElementById('item-category').value;
  const priority = document.getElementById('item-priority').value;

  if (!name) {
    alert('El nombre es obligatorio');
    return;
  }

  const itemData = { name, description, category, priority };

  items = editingItemId
    ? updateItem(editingItemId, itemData)
    : createItem(itemData);

  resetForm();
  renderItems(applyCurrentFilters());
  renderStats(getStats(items));
};

const handleItemToggle = id => {
  items = toggleItemActive(id);
  renderItems(applyCurrentFilters());
  renderStats(getStats(items));
};

const handleItemEdit = id => {
  const item = items.find(i => i.id === id);
  if (!item) return;

  document.getElementById('item-name').value = item.name;
  document.getElementById('item-description').value = item.description;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-priority').value = item.priority;

  editingItemId = id;
};

const handleItemDelete = id => {
  if (!confirm('¿Eliminar esta tarea?')) return;
  items = deleteItem(id);
  renderItems(applyCurrentFilters());
  renderStats(getStats(items));
};

const getCurrentFilters = () => ({
  status: document.getElementById('filter-status').value,
  category: document.getElementById('filter-category').value,
  priority: document.getElementById('filter-priority').value,
  search: document.getElementById('search-input').value,
});

const applyCurrentFilters = () =>
  applyFilters(items, getCurrentFilters());

// ============================================
// INICIALIZACIÓN
// ============================================

const init = () => {
  items = loadItems();
  renderItems(items);
  renderStats(getStats(items));
  document.getElementById('item-form')
    .addEventListener('submit', handleFormSubmit);

  document.getElementById('item-list')
    .addEventListener('click', e => {
      const itemEl = e.target.closest('.item');
      if (!itemEl) return;

      const id = Number(itemEl.dataset.itemId);

      if (e.target.classList.contains('item-checkbox')) handleItemToggle(id);
      if (e.target.classList.contains('btn-edit')) handleItemEdit(id);
      if (e.target.classList.contains('btn-delete')) handleItemDelete(id);
    });

  console.log('✅ Gestor de tareas iniciado');
};

document.addEventListener('DOMContentLoaded', init);