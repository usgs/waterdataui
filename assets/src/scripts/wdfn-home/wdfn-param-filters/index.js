import { select } from 'd3-selection';
import { link } from '../../lib/d3-redux';
import { Filters, Count } from '../selectors/wdfn-selector';
import { 
  applySiteTypeFilter,
  retrieveWdfnData 
} from '../store/wdfn-store';

const checkboxes = document.querySelectorAll('#site-type-filters input');
const paramCheckboxes = document.querySelectorAll('#filter-site-params input');
const paramToggleButtons = document.getElementsByClassName('params-toggle');
const filterForm = document.getElementById('monitoring-location-search');

const WDFNParamFilters = (node, store) => {
  const toggleFilterVisibility = e => {
    e.preventDefault();

    let btn = e.target;
    if (btn.tagName == 'SPAN') btn = btn.parentNode;

    const expandedState = btn.getAttribute('aria-expanded') == 'true' ?
      'false' : 'true';
    const controlledId = btn.getAttribute('aria-controls');
    const controlledEl = document.getElementById(controlledId);
    const openState = controlledEl.dataset.openState;

    btn.setAttribute('aria-expanded', expandedState);
    controlledEl.dataset.openState = openState == 'closed' ? 'open' : 'closed';
  };

  Array.from(paramToggleButtons)
    .forEach(btn => btn.addEventListener('click', toggleFilterVisibility));

  // Parent checkboxes should control the state of their children
  const toggleChildCheckboxes = (checkbox) => {
      const checked = checkbox.checked;
      const li = checkbox.parentNode.parentNode;
      const childBoxes = li.querySelectorAll('li li input[type=checkbox]');

      Array.from(childBoxes).forEach(b => {
          b.checked = checked;
      });
  };

  paramCheckboxes.forEach(b => b.addEventListener('change', e => toggleChildCheckboxes(e.target)));

  const setSiteTypeFilter = (filter, store) => {
      const siteType = filter.name.replace('site-type-','');
      store.dispatch(applySiteTypeFilter(siteType, filter.checked));
  };

  checkboxes.forEach(b => b.addEventListener('change', e => setSiteTypeFilter(e.target, store)));

  // Dispatch redux action that will fetch sites from API
  const fetchMatchingSites = (filters) => {
      if (Object.keys(filters).length === 0) return;

      const hasSiteType = Object.values(filters.siteTypes).some(el => el);
      const hasBbox = Object.values(filters.bBox).every(el => el);

      if (hasSiteType && hasBbox)
          store.dispatch(retrieveWdfnData(filters));
  };

  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    fetchMatchingSites(Filters(store.getState()));
  });

  // Updates the count of sites matching the selected filters
  const setCount = (count) => {
      if (typeof count !== 'number') return 0;
      document.querySelector('#result-count span').textContent = count;
  };

  node
      .call(link(store, setCount, Count));
};

export const attachToNode = function(store, node) {
  select(node)
    .call(WDFNParamFilters, store);
};
