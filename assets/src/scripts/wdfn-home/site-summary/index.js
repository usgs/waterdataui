import { select } from 'd3-selection';
import { link } from '../../lib/d3-redux';
import { Sites } from '../selectors/wdfn-selector';

const SiteSummaries = (node, store) => {
    const siteSummaryTmpl = (siteName, siteId) => {
      return `<li>
                <h3>${siteName}</h3>
                <p class="site-id">${siteId}</p>
              </li>`;
    };

    const populateSiteSummaries = (node, sites) => {
      const mapContainer = document.getElementById('wdfn-map-container');
      const siteSummariesList = document.querySelector('#site-summaries ul');

      if (sites && sites.length > 0) {
        mapContainer.dataset.summariesVisible = 'true';

        const siteListMarkup = sites.map(s => {
          return siteSummaryTmpl(s.properties.MonitoringLocationName, 
            s.properties.MonitoringLocationIdentifier);
        });

        siteSummariesList.innerHTML = siteListMarkup.join('');
      }
    };

    node
        .call(link(store, populateSiteSummaries, Sites));
};

export const attachToNode = function(store, node) {
  select(node)
    .call(SiteSummaries, store);
};
