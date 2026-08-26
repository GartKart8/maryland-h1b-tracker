var map = L.map('map', {
    center: [38.9, -77.5],
    maxZoom: 19,
    zoom: 8
});

L.maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/positron',
    maxZoom: 19,
    attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(map);

fetch('data/maryland.geojson')
  .then(response => response.json())
  .then(geoData => {
    L.geoJSON(geoData).addTo(map);
  })
  .catch(err => console.error('GeoJSON error:', err));
    
fetch('assets/data/LCA-24-25.json')
  .then(response => response.json())
  .then(employerData => {

    var markers = new L.MarkerClusterGroup();
    var markerList = [];

    Object.entries(employerData).forEach(([employer, years]) => {
      // let pullyear = 0;
      let addresshtml = ``;
      let lat_lng = [];
      Object.entries(years).forEach(([year, records]) => {pullyear = year;addresshtml =`<p id="em-address">${records[0].EMPLOYER_ADDRESS1}, ${records[0].EMPLOYER_CITY}, ${records[0].EMPLOYER_STATE}, ${records[0].EMPLOYER_POSTAL_CODE}</p>`;city = records[0].EMPLOYER_CITY.toUpperCase();});
      let popupContent = `<h3>${employer}</h3>${addresshtml}<table><tbody><tr id="tbl-header"><th>FY</th><th>Applied</th><th>Approved</th><th>Denied</th><th>Withdrawn</th></tr>`;

      Object.entries(years).forEach(([year, records]) => {
          let approved = 0;
          let denied = 0;
          let withdrawn = 0;
          // let deniedhtml = "";
          let deniedtable = "";
          // let withdrawnhtml = "";
          let withdrawntable = "";
          records.forEach((record) => {
            if (record.CASE_STATUS.toUpperCase() == "APPROVED") {
                approved+=1;
            } else if (record.CASE_STATUS.toUpperCase() == "DENIED") {
                denied+=1;
            } else {
                withdrawn+=1;
            }
          });

          //deniedhtml = denied > 0 ? "<th>Denied</th>" : "";
          deniedtable = denied > 0 ? `<td>${denied}</td>` : "";
          //withdrawnhtml = withdrawn > 0 ? "<th>Withdrawn</th>" : "";
          withdrawntable = withdrawn > 0 ? `<td>${withdrawn}<td>` : "";

          popupContent += `<tr><td>${year}</td><td>${records.length}</td><td>${approved}</td>${deniedtable}${withdrawntable}</tr>`

          if (lat_lng.length == 0) {
            lat_lng = [records[0].lat, records[0].lng];
          }
      });
      popupContent += `</tbody></table>`

      var marker = L.marker(L.latLng(lat_lng), { title: popupContent });
      marker.bindPopup(popupContent);
      markers.addLayer(marker);
      markerList.push(marker);

      map.addLayer(markers);
    });
  })
  .catch(err => console.error('Employer data error:', err));
