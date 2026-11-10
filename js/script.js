// NASA APOD Space Explorer
const API_KEY = 'DEMO_KEY'; // free demo key; get your own at api.nasa.gov if you hit rate limits
const API_URL = 'https://api.nasa.gov/planetary/apod';

const startEl = document.getElementById('startDate');
const endEl = document.getElementById('endDate');
const btn = document.getElementById('getImages');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');

// Let the provided dateRange.js set the valid APOD date range
if (typeof setupDateInputs === 'function') setupDateInputs(startEl, endEl);

// ---------- LevelUp: random space fact ----------
const FACTS = [
  'A day on Venus is longer than its year.',
  'Neutron stars can spin hundreds of times every second.',
  'Light from the Sun takes about 8 minutes to reach Earth.',
  'Saturn is less dense than water, so it would float in a big enough bathtub.',
  'There are more stars in the universe than grains of sand on all of Earth\'s beaches.',
  'Footprints on the Moon can last for millions of years because there is no wind.',
  'Jupiter\'s Great Red Spot is a storm that has raged for centuries.',
  'One teaspoon of a neutron star would weigh about a billion tons.'
];
document.getElementById('spaceFact').textContent = FACTS[Math.floor(Math.random() * FACTS.length)];

// ---------- Helpers ----------
function showMessage(text) {
  gallery.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'placeholder';
  p.textContent = text;
  gallery.appendChild(p);
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ---------- Fetch ----------
async function getImages() {
  if (!startEl.value || !endEl.value) { showMessage('Please choose a start and end date.'); return; }
  showMessage('🔄 Loading space photos…');
  btn.disabled = true;
  try {
    const url = `${API_URL}?api_key=${API_KEY}&start_date=${startEl.value}&end_date=${endEl.value}&thumbs=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('NASA returned status ' + res.status);
    const data = await res.json();
    renderGallery(Array.isArray(data) ? data.reverse() : [data]);
  } catch (err) {
    console.error(err);
    showMessage('Sorry, we couldn\'t load the photos. Check your dates or try again in a moment.');
  } finally {
    btn.disabled = false;
  }
}

// ---------- Gallery ----------
function renderGallery(items) {
  gallery.innerHTML = '';
  if (!items.length) { showMessage('No photos found for those dates.'); return; }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item';
    card.tabIndex = 0;

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const src = item.media_type === 'image' ? item.url : item.thumbnail_url;
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = item.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      thumb.classList.add('no-thumb');
      thumb.textContent = '🎬';
    }
    if (item.media_type === 'video') {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = '▶ Video';
      thumb.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.textContent = item.title;
    const date = document.createElement('p');
    date.className = 'date';
    date.textContent = formatDate(item.date);

    card.append(thumb, title, date);
    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(item); });
    gallery.appendChild(card);
  });
}

// ---------- Modal ----------
function openModal(item) {
  modalMedia.innerHTML = '';
  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    modalMedia.appendChild(img);
  } else if (item.media_type === 'video' && /youtube\.com\/embed|player\.vimeo\.com/.test(item.url)) {
    const frame = document.createElement('iframe');
    frame.src = item.url;
    frame.title = item.title;
    frame.allowFullscreen = true;
    modalMedia.appendChild(frame);
  } else {
    const link = document.createElement('a');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = '▶ Watch on NASA / external site';
    link.className = 'video-link';
    modalMedia.appendChild(link);
  }
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDate').textContent = formatDate(item.date);
  document.getElementById('modalText').textContent = item.explanation;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('hidden');
  modalMedia.innerHTML = ''; // also stops any playing video
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
btn.addEventListener('click', getImages);
