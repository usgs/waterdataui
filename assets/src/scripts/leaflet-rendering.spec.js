

import {createMap} from './leaflet-rendering';

describe('leaflet-rendering', () => {

    describe('createMap', () => {
       let mapDiv;
       const MAP_ID = 'test-map';

       beforeEach(() => {
           mapDiv = document.createElement('div');
           mapDiv.setAttribute('id', MAP_ID);
           document.body.appendChild(mapDiv);
       });

       afterEach(() => {
           mapDiv.remove();
       });

       it('should create a map with the default center and zoom levelss', () => {
           const map = createMap(MAP_ID, {});
           const center = map.getCenter();

           expect(center.lat).toEqual(0);
           expect(center.lng).toEqual(0);
           expect(map.getZoom()).toEqual(1);
       });

       it('should create a map with defined center and zoom level', () => {
           const map = createMap(MAP_ID, {
               center: [-100, 42],
               zoom : 5
           });

           const center = map.getCenter();

           expect(center.lat).toEqual(-100);
           expect(center.lng).toEqual(42);
           expect(map.getZoom()).toEqual(5);
       });
    });
});