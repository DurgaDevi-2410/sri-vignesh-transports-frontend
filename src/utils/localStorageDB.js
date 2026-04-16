/**
 * A simple utility to manage data in localStorage with a CRUD interface.
 * This can be used as a replacement for a backend API or for local caching.
 */

const getItems = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const setItems = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

export const localStorageDB = {
  // Read all items
  getAll: (key) => getItems(key),

  // Save an item (Create or Update)
  save: (key, data) => {
    const items = getItems(key);
    let updatedItems;

    if (data.id) {
      // Update existing
      updatedItems = items.map(item => item.id === data.id ? { ...item, ...data } : item);
      // If item with id didn't exist (e.g. manually set id), push it
      if (!items.find(item => item.id === data.id)) {
        updatedItems.push(data);
      }
    } else {
      // Create new with unique ID
      const newItem = { ...data, id: Date.now().toString() };
      updatedItems = [...items, newItem];
    }

    setItems(key, updatedItems);
    return updatedItems;
  },

  // Delete an item
  delete: (key, id) => {
    const items = getItems(key);
    const filtered = items.filter(item => item.id !== id);
    setItems(key, filtered);
    return filtered;
  },

  // Batch save (overwrite)
  saveAll: (key, items) => {
    setItems(key, items);
  }
};

// Example usage:
// localStorageDB.save('bookings', { customerName: 'John Doe', pickup: 'A', drop: 'B' });
// const allBookings = localStorageDB.getAll('bookings');
