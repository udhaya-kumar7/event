const defaultImages = [
  '/images/event1.jpg',
  '/images/event2.jpg',
  '/images/event3.jpg',
  '/images/event4.jpg',
  '/images/event5.jpg',
];

const categoryMap = {
  music: '/images/event1.jpg',
  tech: '/images/event2.jpg',
  food: '/images/event3.jpg',
  sports: '/images/event4.jpg',
  wellness: '/images/event5.jpg',
};

export function getImageForEvent(event) {
  if (!event) return defaultImages[0];
  if (event.image) return event.image;
  if (event.category && categoryMap[event.category]) return categoryMap[event.category];
  // fallback deterministic by id if available
  const id = (event._id || event.id || '').toString();
  if (id) {
    const n = id.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
    return defaultImages[n % defaultImages.length];
  }
  // random fallback
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

export default getImageForEvent;
