import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-79.5);
  const [lat, setLat] = useState(43.75);
  const [zoom, setZoom] = useState(9);

  // Initialize map when component mounts
  /*useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
*/

  useEffect(() => {
    if (map.current) return; // start map once

    // create the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    var searchbar = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    }, 'top-right')

    map.current.addControl(searchbar);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // on map load, load in the lines and markers
    map.current.on('load', () => {
      map.current.addSource('route-data', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        }
      });

      map.current.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route-data',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        'paint': {
          'line-color': '#3b9ddd',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      map.current.addSource('marker-data', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': []
        }
      });

      map.current.addLayer({
        'id': 'markers',
        'type': 'circle',
        'source': 'marker-data',
        'paint': {
          'circle-color': '#6f42c1',
          'circle-radius': 6,
        }
      });

      searchbar.on('result', (e) => {
        const source = map.current.getSource('marker-data');
        
        var updatedFeatures = source._data.features;

        console.log(e);

        const coord = e.result.geometry.coordinates;

        updatedFeatures.push({
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': coord
          }
        });

        console.log(e);

        source.setData({
          "type": "FeatureCollection",
          "features": updatedFeatures,
        });
      })

      /*map.current.addSource('route-data', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'polyline'
          },
      });*/


    });


    // temporary marker image used on symbol layer
    /*map.current.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      (err, image) => {
        if (!err) {
          image = image;
          map.current.addImage('custom-marker', image);
        }
      });*/

    map.current.on('click', (e) => {

      const source = map.current.getSource('marker-data');

      const featureCollection = source._data.features;

      var updatedFeatures = source._data.features;

      updatedFeatures.push({
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [e.lngLat.lng, e.lngLat.lat]
        }
      });

      source.setData({
        "type": "FeatureCollection",
        "features": updatedFeatures,
      });

      //updateCoords([e.lngLat.lng, e.lngLat.lat]);

    });

  }, []);



  /**
   * on update (but not startup) set the layer visibilities according to the markerVisibility,
   * add or remove edit layers according to editing mode variable and add the point handler for adding new markers
   */
  useEffect(() => {
    if (!map.current) return; // wait for map

    /*const layers = ['circles-', 'route-'];

    layers.forEach((layer) => {
      ids.forEach((anID) => {
        if (map.current.getLayer(layer.concat(anID.toString()))) {
          map.current.setLayoutProperty(
            layer.concat(anID.toString()),
            'visibility',
            markerVisibility ? 'visible' : 'none'
          );
        }
      })
    });

    if (editMode) {
      addEditLayer();
    } else {
      map.current.off('mousedown', 'edit', onDown);
      removeEditLayer();
    }*/

  });

  function clicked() {
    console.log('clicked');

    const features = map.current.getSource('marker-data')._data.features;

    const coords = features.map((feature) => {
      return feature.geometry.coordinates;
    })

    console.log('coords:', coords);


    /*
    https://api.mapbox.com/optimized-trips/v1/mapbox/driving/-122.42,37.78;-122.45,37.91;-122.48,37.73?access_token=pk.eyJ1IjoidGwtaG9waW4iLCJhIjoiY2tvaXJsajJ3MHlpbTJvbnh0a3F1ajA4cSJ9.ASixMWrRS7BPWuu2pqX2ww

    */

    var checkbox = document.getElementById('round-trip-button');
    const roundTrip = checkbox.checked ? 'true' : 'false';

    const url = 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' +
      coords.join(';') +
      '?geometries=geojson&source=first&destination=last&roundtrip=' +
      roundTrip +
      '&access_token=' +
      mapboxgl.accessToken;

    console.log(url);

    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log(json);
        return json.trips[0].geometry;
      }).then((geojson) => {
        console.log(geojson.coordinates);
        const routeSource = map.current.getSource('route-data');
        routeSource.setData(geojson);
      });


  }

  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
          <br />
          <button onClick={clicked} style={{ marginTop: "15px", color: "cyan" }}>Generate Route</button>
          <br />
          <label class="form-switch">
            <input type="checkbox" id="round-trip-button" />
            <i></i>
            Round Trip
          </label>
        </div>
      </div>
      <div className='map-container' ref={mapContainer} />
    </div>
  );
};

export default Map;
