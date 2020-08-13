import { select } from 'd3-selection';

const paramToggleButtons = document.getElementsByClassName('params-toggle');

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

const WDFNParamFilters = (node, store) => {

};

export const attachToNode = function(store, node) {
  select(node)
    .call(WDFNParamFilters, store);
};
