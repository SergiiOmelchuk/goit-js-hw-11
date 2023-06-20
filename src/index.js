import { fetchImages } from './js/fetch-images.js';
import { markup } from './js/markup-gallery.js';
import { onScroll, onToTopBtn } from './js/scroll.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formEl: document.getElementById('search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.btn-load-more'),
};

let query = '';
let page = 1;
let simpleLightBox;
const PER_PAGE = 40;

refs.formEl.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtn);

onScroll();
onToTopBtn();

function onSearch(e) {
  console.log(e.target);
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  refs.galleryEl.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');

  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }

  fetchImages(query, page, PER_PAGE)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound();
      } else {
        markup(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

        if (data.totalHits > PER_PAGE) {
          refs.loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      refs.formEl.reset();
    });
}

function onLoadMoreBtn() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, PER_PAGE)
    .then(({ data }) => {
      markup(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error));
}

function alertNoImagesFound() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}
