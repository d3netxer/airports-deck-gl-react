import React, { useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import DeckGL, { GeoJsonLayer, ArcLayer } from 'deck.gl';
import * as turf from '@turf/turf';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const AIR_PORTS = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const NAV_CONTROL_STYLE = {
  position: 'absolute',
  top: 10,
  left: 10
};

function App() {
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [airportBuffer, setAirportBuffer] = useState(null);

  const onClick = info => {
    if (info.object) {
      setSelectedAirport(info.object);
      const buffered = turf.buffer(info.object, 500, { units: 'miles' });
      setAirportBuffer(buffered);
    }
  };

  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
      onClick
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      getSourcePosition: selectedAirport ? selectedAirport.geometry.coordinates : [-0.4531566, 51.4709959], // London or selected
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    }),
    new GeoJsonLayer({
      id: 'buffer-layer',
      data: airportBuffer,
      getFillColor: [255, 0, 0, 50],
      getLineColor: [255, 0, 0],
      getLineWidth: 5,
      opacity: 0.5,
      stroked: true,
      filled: true,
      extruded: false,
      lineWidthMinPixels: 2,
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_ACCESS_TOKEN}>
        <NavigationControl style={NAV_CONTROL_STYLE} />
      </Map>
    </DeckGL>
  );
}

export default App;
