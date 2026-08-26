const map = L.map('map', {
  center: [38.9, -77.5],
  zoom: 8,
  maxZoom: 19
});

L.maplibreGL({
  style: 'https://tiles.openfreemap.org/styles/positron',
  maxZoom: 19,
  attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map);

fetch('assets/data/maryland.geojson')
  .then(response => response.json())
  .then(geoData => {
    L.geoJSON(geoData).addTo(map);
  })
  .catch(err => console.error('GeoJSON error:', err));

fetch('assets/data/LCA-24-25.json')
  .then(response => response.json())
  .then(employerData => {
    const markers = L.markerClusterGroup();

    Object.entries(employerData).forEach(([employer, years]) => {
      const yearKeys = Object.keys(years);
      if (yearKeys.length === 0) return;

      const firstRecords = years[yearKeys[0]];
      const first = firstRecords[0];
      if (!first || first.lat == null || first.lng == null) return;

      const address = [
        first.EMPLOYER_ADDRESS1,
        first.EMPLOYER_CITY,
        first.EMPLOYER_STATE,
        first.EMPLOYER_POSTAL_CODE
      ].filter(Boolean).join(', ');

      let popupContent = `
        <h3>${employer}</h3>
        <p id="em-address">${address}</p>
        <table>
          <tbody>
            <tr id="tbl-header">
              <th>FY</th>
              <th>Applied</th>
              <th>Approved</th>
              <th>Denied</th>
              <th>Withdrawn</th>
            </tr>
      `;

      yearKeys.forEach(year => {
        const records = years[year];
        let approved = 0;
        let denied = 0;
        let withdrawn = 0;

        records.forEach(record => {
          const status = (record.CASE_STATUS || '').toUpperCase();
          const workers = Number(record.TOTAL_WORKER_POSITIONS) || 0;

          if (status === 'APPROVED' || status === 'CERTIFIED') {
            approved += workers;
          } else if (status === 'DENIED') {
            denied += workers;
          } else {
            withdrawn += workers;
          }
        });

        popupContent += `
          <tr>
            <td>${year}</td>
            <td>${approved + denied + withdrawn}</td>
            <td>${approved}</td>
            <td>${denied}</td>
            <td>${withdrawn}</td>
          </tr>
        `;
      });

      popupContent += '</tbody></table>';

      const marker = L.marker([first.lat, first.lng], { title: employer });
      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    });

    map.addLayer(markers);
  })
  .catch(err => console.error('Employer data error:', err));