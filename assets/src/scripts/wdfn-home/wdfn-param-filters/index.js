import { select } from 'd3-selection';
import { 
  applySiteTypeFilter 
} from '../store/wdfn-store';

const checkboxes = document.querySelectorAll('#site-type-filters input');
const paramCheckboxes = document.querySelectorAll('#filter-site-params input');
const paramToggleButtons = document.getElementsByClassName('params-toggle');

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
};

export const attachToNode = function(store, node) {
  select(node)
    .call(WDFNParamFilters, store);
};
