import { select } from 'd3-selection';
import { link } from '../../lib/d3-redux';
import { Filters, Count, getLoadingState } from '../selectors/wdfn-selector';
import { 
  applySiteTypeFilter,
  applyParamFilter,
  applyPeriodFilter,
  retrieveWdfnData,
  applyLoadingState
} from '../store/wdfn-store';

const getDateRanges = () => {
  const now = new Date();

  const day = `${now.getDate()}`.padStart(2, '0');
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const year = now.getFullYear();

  return {
    '5': `${month}-${day}-${year - 5}`,
    '10': `${month}-${day}-${year - 10}`,
    '20': `${month}-${day}-${year - 20}`,
    '50': `${month}-${day}-${year - 50}`
  };
};

const WDFNParamFilters = (node, store) => {

  // Expand/Collapse param filter dropdowns
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

  const paramToggleButtons = document.getElementsByClassName('params-toggle');
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

  const paramCheckboxes = document.querySelectorAll('#filter-site-params input');

  const setParamsFilter = () => {
    const checkedParams = document.querySelectorAll('#filter-site-params input:checked');
    const checkedParamsValues = Array.from(checkedParams).map(checkbox => {
      const value = checkbox.value;
      if (value != '/') return value;
    }).filter(el => {
      if (typeof el != 'undefined') return el;
    });

    store.dispatch(applyParamFilter(checkedParamsValues));
  };

  paramCheckboxes.forEach(b => b.addEventListener('change', e => {
    toggleChildCheckboxes(e.target);
    setParamsFilter();
  }));

  const setSiteTypeFilter = (filter, store) => {
      const siteType = filter.name.replace('site-type-','');
      store.dispatch(applySiteTypeFilter(siteType, filter.checked));
  };

  const checkboxes = document.querySelectorAll('#site-type-filters input');
  checkboxes.forEach(b => b.addEventListener('change', e => setSiteTypeFilter(e.target, store)));

  const periodRadioBtns = document.querySelectorAll('input[type=radio][name=period]');
  const setPeriodFilter = e => {
    const period = getDateRanges()[e.target.value];
    store.dispatch(applyPeriodFilter(period));
  };
  periodRadioBtns.forEach(b => b.addEventListener('change', setPeriodFilter));

  // Dispatch redux action that will fetch sites from API
  const fetchMatchingSites = (filters) => {
      if (Object.keys(filters).length === 0) return;

      const hasSiteType = Object.values(filters.siteTypes).some(el => el);

      if (hasSiteType)
          store.dispatch(retrieveWdfnData(filters));
      
      store.dispatch(applyLoadingState('loading'));
  };

  const filterForm = document.getElementById('monitoring-location-search');
  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    fetchMatchingSites(Filters(store.getState()));
  });

  // Updates the count of sites matching the selected filters
  const setCount = (_, count) => {
      if (typeof count !== 'number') return 0;
      document.querySelector('#result-count span').textContent = count;
      store.dispatch(applyLoadingState('loaded'));
  };

  const setLoadingState = (_, loadingState) => {
    const mapContainerEl = document.getElementById('wdfn-map-container');
    mapContainerEl.dataset.loadingState = loadingState;
  };

  const toggleSearchEnabled = (_, filters) => {
    let activeFilters = 0;

    const submitBtn = document.getElementById('wdfn-search-submit');

    const siteTypeFilters = Object.values(filters.siteTypes);
    if (siteTypeFilters.some(v => v)) activeFilters += 1;

    if (filters.timePeriod) activeFilters += 1;

    const bboxFilters = Object.values(filters.bBox);
    if (bboxFilters.every(v => v)) activeFilters += 1;

    if (filters.parameters.length > 0) activeFilters += 1;

    const isDisabled = activeFilters < 2;
    submitBtn.ariaDisabled = isDisabled;
    submitBtn.disabled = isDisabled;
  };

  node
      .call(link(store, setCount, Count));
  node
      .call(link(store, setLoadingState, getLoadingState));
  node
      .call(link(store, toggleSearchEnabled, Filters));
};

export const attachToNode = function(store, node) {
  select(node)
    .call(WDFNParamFilters, store);
};
