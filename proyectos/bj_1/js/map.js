/**
 * map.js
 * Módulo encargado del manejo de MapLibre GL JS, capas geográficas, y eventos directos del plano base.
 */
window.AppMap = (function() {
    const PIR_HAI_FILL_COLOR = '#0c0c0c';
    // Definición de Estilos por Tipología
    const tipologiaData = {
        'RP': { nombre: 'Residencial<br>Plus', color: '#e707e7ff', radius: 6 },
        'R':  { nombre: 'Residencial', color: '#004dc0ff', radius: 5 },
        'M':  { nombre: 'Media', color: '#d30707ff', radius: 4.5 }, 
        'E':  { nombre: 'Económica', color: '#eeb303ff', radius: 4 },
    };
    const defaultStyle = { nombre: 'Otro', color: '#ccff00', radius: 5 };

    // Definición de Zonas Núcleo
    const zonasNucleoData = {
        'Principal A': { color: '#8c0000', colonias: { 'Narvarte Oriente': { pct: 8.36, num: 297 } } },
        'Principal B': { color: '#d32f2f', colonias: { 'Portales Oriente': { pct: 2.36, num: 84 } } },
        'Principal C': { color: '#ef5350', colonias: { 'Del Carmen': { pct: 1.13, num: 40 }, 'Zacahuitzco': { pct: 1.01, num: 36 } } },
        'Secundaria A': { color: '#e65100', colonias: { 'Del Valle Centro': { pct: 9.59, num: 341 }, 'Del Valle Norte': { pct: 6.39, num: 227 }, 'Narvarte Poniente': { pct: 7.48, num: 266 } } },
        'Secundaria B': { color: '#ff9800', colonias: { 'Portales Norte': { pct: 5.60, num: 199 }, 'Portales Sur': { pct: 5.35, num: 190 } } },
        'Secundaria C': { color: '#ffb74d', colonias: { 'Napoles': { pct: 5.06, num: 180 }, 'Ampliación Nápoles': { pct: 1.60, num: 57 } } }
    };

    let map = null;

    // Helper setupHoverPopup to reduce duplication
    function setupHoverPopup(layerId, sourceId, delay, getHtmlCallback) {
        let hoveredId = null;
        let hoverTimer = null;
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'marathon-popup' });

        map.on('mousemove', layerId, (e) => {
            if (e.features.length > 0) {
                map.getCanvas().style.cursor = 'pointer';
                popup.remove();
                if (hoverTimer) clearTimeout(hoverTimer);

                const feature = e.features[0];
                const currentId = feature.id || feature.properties.objectid || feature.properties.fid || feature.properties.ID || feature.properties.id || 1;

                if (hoveredId !== null && hoveredId !== currentId) {
                    map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
                }
                hoveredId = currentId;
                map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: true });

                hoverTimer = setTimeout(() => {
                    const html = getHtmlCallback(feature.properties);
                    popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
                }, delay);
            }
        });

        map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
            if (hoverTimer) clearTimeout(hoverTimer);
            popup.remove();
            if (hoveredId !== null) {
                map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
            }
            hoveredId = null;
        });
    }

    function init() {
        return new Promise((resolveInit, rejectInit) => {
            map = new maplibregl.Map({
                container: 'map-container',
                style: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
                center: [-99.165, 19.380],
                zoom: 13,
                pitch: 0,
                bearing: 0,
                dragRotate: false,
                pitchWithRotate: false,
                attributionControl: false
            });
            map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'bottom-left');

            Promise.all([
                new Promise(resolve => map.on('load', resolve)),
                fetch('data/base.geojson').then(res => res.json()),
                fetch('data/colonias.geojson').then(res => res.json()),
                fetch('data/pir_hai.geojson').then(res => res.json())
            ]).then(([_, datosGeoJSON, coloniasGeoJSON, pirHaiGeoJSON]) => {
                
                // Clean props implicitly inside datosGeoJSON
                const tipologias = new Set();
                datosGeoJSON.features.forEach(feature => {
                    const cleanProps = {};
                    for (const key in feature.properties) {
                        const cleanKey = key.replace(/^[\uFEFF\u200B]+/, '').trim();
                        cleanProps[cleanKey] = feature.properties[key];
                    }
                    feature.properties = cleanProps;
                    if (feature.properties.tipologia) {
                        tipologias.add(feature.properties.tipologia);
                    }
                });

                // 1. Fuente y Capa Base
                map.addSource('desarrollos', { type: 'geojson', data: datosGeoJSON });

                const uniqueTipos = Array.from(tipologias);
                let radiusExpr = 5;
                let colorExpr = '#33ff00';
                
                if (uniqueTipos.length > 0) {
                    radiusExpr = ['match', ['get', 'tipologia']];
                    colorExpr = ['match', ['get', 'tipologia']];

                    uniqueTipos.forEach((tipo) => {
                        const style = tipologiaData[tipo] || defaultStyle;
                        radiusExpr.push(tipo, style.radius);
                        colorExpr.push(tipo, style.color);
                    });
                    radiusExpr.push(defaultStyle.radius);
                    colorExpr.push(defaultStyle.color);
                }

                map.addLayer({
                    id: 'desarrollos-layer',
                    type: 'circle',
                    source: 'desarrollos',
                    paint: {
                        'circle-color': colorExpr,
                        'circle-opacity': 0.8,
                        'circle-radius': radiusExpr,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#000000'
                    }
                });

                map.addLayer({
                    id: 'desarrollos-heatmap',
                    type: 'heatmap',
                    source: 'desarrollos',
                    layout: { 'visibility': 'none' },
                    paint: {
                        'heatmap-weight': 1,
                        'heatmap-intensity': [
                            'interpolate', ['linear'], ['zoom'],
                            10, 0.3,
                            14, 0.3, 
                            16, 1.0
                        ],
                        'heatmap-color': [
                            'interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(43, 131, 186, 0)',       
                            0.1, 'rgba(43, 131, 186, 0.8)',   
                            0.3, '#abdda4',                   
                            0.6, '#ffffbf',                   
                            0.85, '#fdae61',                  
                            1, '#d7191c'                      
                        ],
                        'heatmap-radius': [
                            'interpolate', ['exponential', 2], ['zoom'],
                            11, 6.25, 
                            14, 50,  
                            16, 100  
                        ],
                        'heatmap-opacity': 0.85
                    }
                });

                // 2. Colonias
                map.addSource('colonias-source', { type: 'geojson', data: coloniasGeoJSON });

                // Crear polígonos disueltos para bordes exteriores de Zonas Nucleo
                let zonasNucleoFeatures = [];
                coloniasGeoJSON.features.forEach(f => {
                    const colName = f.properties.Colonia || f.properties.colonia || f.properties.nombre || '';
                    let foundZone = null;
                    for (const [zona, data] of Object.entries(zonasNucleoData)) {
                        const matchedKey = Object.keys(data.colonias).find(k => k.toLowerCase() === colName.toLowerCase());
                        if (matchedKey) {
                            foundZone = zona;
                            break;
                        }
                    }
                    if (foundZone) {
                        let newF = JSON.parse(JSON.stringify(f));
                        newF.properties = { nucleo_zona: foundZone, color: zonasNucleoData[foundZone].color };
                        zonasNucleoFeatures.push(newF);
                    }
                });

                let dissolvedZonasGeoJSON = { type: 'FeatureCollection', features: [] };
                if (window.turf && zonasNucleoFeatures.length > 0) {
                    try {
                        dissolvedZonasGeoJSON = window.turf.dissolve({ type: 'FeatureCollection', features: zonasNucleoFeatures }, { propertyName: 'nucleo_zona' });
                        // Calcular y guardar el Bounding Box de cada zona ya disuelta para usarlo en el zoom
                        dissolvedZonasGeoJSON.features.forEach(feat => {
                            const zName = feat.properties.nucleo_zona;
                            if (zonasNucleoData[zName]) {
                                zonasNucleoData[zName].bbox = window.turf.bbox(feat);
                            }
                        });
                    } catch(e) { console.error('Error dissolving', e); }
                }
                map.addSource('zonas-nucleo-bounds-source', { type: 'geojson', data: dissolvedZonasGeoJSON });

                map.addLayer({
                    id: 'colonias-fill-layer',
                    type: 'fill',
                    source: 'colonias-source',
                    paint: {
                        'fill-color': '#ffffff',
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'clicked'], false], 0.25, 
                            ['boolean', ['feature-state', 'hover'], false], 0.15, 
                            0.05  
                        ]
                    }
                });
                map.addLayer({
                    id: 'colonias-layer',
                    type: 'line',
                    source: 'colonias-source',
                    paint: {
                        'line-color': 'rgba(255, 255, 255, 0.8)', 
                        'line-width': 1.5
                    }
                });

                // 3. Pir Hai
                map.addSource('pir_hai-source', { type: 'geojson', data: pirHaiGeoJSON });
                map.addLayer({
                    id: 'pir_hai-layer',
                    type: 'fill',
                    source: 'pir_hai-source',
                    layout: { 'visibility': 'none' },
                    paint: {
                        'fill-color': PIR_HAI_FILL_COLOR,
                        'fill-opacity': 0.3
                    }
                });
                map.addLayer({
                    id: 'pir_hai-line-layer',
                    type: 'line',
                    source: 'pir_hai-source',
                    layout: { 'visibility': 'none' },
                    paint: {
                        'line-color': PIR_HAI_FILL_COLOR,
                        'line-width': 1.5,
                        'line-opacity': 1
                    }
                });

                // 4. Zonas Núcleo
                // Construir la expresión match para colorear las colonias que son zonas núcleo usando downcase
                let matchNameExpr = ['match', ['downcase', ['coalesce', ['get', 'Colonia'], ['get', 'colonia'], ['get', 'nombre'], '']]];
                
                Object.keys(zonasNucleoData).forEach(zona => {
                    const color = zonasNucleoData[zona].color;
                    Object.keys(zonasNucleoData[zona].colonias).forEach(colonia => {
                        // usamos toLowerCase para coincidir con la expresión del mapa
                        matchNameExpr.push(colonia.toLowerCase(), color);
                    });
                });
                matchNameExpr.push('rgba(0,0,0,0)'); // Transparent fallback

                map.addLayer({
                    id: 'zonas-nucleo-layer',
                    type: 'fill',
                    source: 'colonias-source',
                    layout: { 'visibility': 'none' },
                    paint: {
                        'fill-color': matchNameExpr,
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'clicked'], false], 0.8, 
                            ['boolean', ['feature-state', 'hover'], false], 0.6, 
                            0.35  
                        ]
                    }
                });
                
                // Borde exterior disuelto para las zonas nucleo
                map.addLayer({
                    id: 'zonas-nucleo-exterior-line-layer',
                    type: 'line',
                    source: 'zonas-nucleo-bounds-source',
                    layout: { 'visibility': 'none' },
                    paint: {
                        'line-color': ['get', 'color'], 
                        'line-width': 3,
                        'line-opacity': [
                            'step',
                            ['zoom'],
                            0, 10, 1 // Visible when zoom >= 10
                        ]
                    }
                });
                
                // Configurar layer adicional a filtrar 'matchNameExpr' !== transparente
                map.setFilter('zonas-nucleo-layer', ['!=', matchNameExpr, 'rgba(0,0,0,0)']);

                // Eventos de interactividad optimizados (Hovers)
                setupHoverPopup('colonias-fill-layer', 'colonias-source', 450, (props) => {
                    const name = props.Colonia || props.colonia || props.nombre || 'Colonia Desconocida';
                    return name;
                });

                setupHoverPopup('pir_hai-layer', 'pir_hai-source', 450, (props) => {
                    const tipoSelect = document.getElementById('indicador-tipo');
                    const viviendaSelect = document.getElementById('indicador-vivienda');
                    let valName = 'Valor de la Manzana';
                    let val = 'S/D';

                    if (tipoSelect && viviendaSelect && tipoSelect.value !== 'none') {
                        const seleccion = `${tipoSelect.value}_${viviendaSelect.value}`;
                        valName = `${tipoSelect.value.toUpperCase()} ${viviendaSelect.options[viviendaSelect.selectedIndex].text}`;
                        val = props[seleccion] !== undefined && props[seleccion] !== null ? props[seleccion] : 'S/D';
                    }
                    return `
                        <div style="text-align: left; line-height: 1.3;">
                            <strong style="color: var(--color-neon);">${valName}</strong><br>
                            Valor: <span style="font-size:1.1em; color: white;">${val}</span><br>
                        </div>
                    `;
                });

                setupHoverPopup('zonas-nucleo-layer', 'colonias-source', 450, (props) => {
                    const colName = props.Colonia || props.colonia || props.nombre || 'Desconocida';
                    // Find which zone it belongs to (case insensitive)
                    let foundZone = null;
                    let pct = 0;
                    for (const [zona, data] of Object.entries(zonasNucleoData)) {
                        const matchedKey = Object.keys(data.colonias).find(k => k.toLowerCase() === colName.toLowerCase());
                        if (matchedKey) {
                            foundZone = zona;
                            pct = data.colonias[matchedKey].pct;
                            break;
                        }
                    }
                    if (foundZone) {
                        return `
                            <div style="text-align: left; line-height: 1.3;">
                                <strong style="color: ${zonasNucleoData[foundZone].color};">${foundZone}</strong><br>
                                Colonia: <span style="font-size:1.1em; color: white;">${colName}</span><br>
                                Aporte: <span style="color: white;">${pct}%</span>
                            </div>
                        `;
                    }
                    return colName;
                });

                // Clics y selección
                let clickedColoniaId = null;
                map.on('click', 'colonias-fill-layer', (e) => {
                    if (e.features.length > 0) {
                        const feature = e.features[0];
                        const currentId = feature.id || feature.properties.objectid || feature.properties.ID || feature.properties.id || 1;

                        if (clickedColoniaId !== null) {
                            map.setFeatureState({ source: 'colonias-source', id: clickedColoniaId }, { clicked: false });
                        }
                        clickedColoniaId = currentId;
                        map.setFeatureState({ source: 'colonias-source', id: clickedColoniaId }, { clicked: true });

                        try {
                            if (window.turf) {
                                const bbox = turf.bbox(feature);
                                map.fitBounds(bbox, { padding: 50, duration: 800 });
                            } else {
                                map.flyTo({ center: e.lngLat, zoom: 14, duration: 800 });
                            }
                        } catch (err) {
                             map.flyTo({ center: e.lngLat, zoom: 14, duration: 800 });
                        }

                        // Conexión con UI para gráficas
                        if (window.AppUI && window.AppUI.updateChartForColonia) {
                            window.AppUI.updateChartForColonia(feature);
                        }
                    }
                });
                
                map.on('click', 'zonas-nucleo-layer', (e) => {
                    if (e.features.length > 0) {
                        const feature = e.features[0];
                        const colName = feature.properties.Colonia || feature.properties.colonia || feature.properties.nombre || 'Desconocida';
                        const currentId = feature.id || feature.properties.objectid || feature.properties.ID || feature.properties.id || 1;

                        if (clickedColoniaId !== null) {
                            map.setFeatureState({ source: 'colonias-source', id: clickedColoniaId }, { clicked: false });
                        }
                        clickedColoniaId = currentId;
                        map.setFeatureState({ source: 'colonias-source', id: clickedColoniaId }, { clicked: true });

                        // Conexión con UI
                        let foundZoneName = null;
                        for (const [zona, data] of Object.entries(zonasNucleoData)) {
                            const matchedKey = Object.keys(data.colonias).find(k => k.toLowerCase() === colName.toLowerCase());
                            if (matchedKey) {
                                foundZoneName = zona;
                                break;
                            }
                        }

                        // Zoom a la zona completa (bbox precalculado) o a la colonia
                        try {
                            if (foundZoneName && zonasNucleoData[foundZoneName].bbox) {
                                map.fitBounds(zonasNucleoData[foundZoneName].bbox, { padding: 50, duration: 800 });
                            } else if (window.turf) {
                                const bbox = turf.bbox(feature);
                                map.fitBounds(bbox, { padding: 50, duration: 800 });
                            }
                        } catch (err) {}

                        if (window.AppUI && window.AppUI.updateChartForZonaNucleo && foundZoneName) {
                            window.AppUI.updateChartForZonaNucleo(foundZoneName);
                        }
                    }
                });

                map.on('click', (e) => {
                    // Solo resetear si no clicamos en zonas-nucleo-layer o colonias-fill-layer
                    const isZonasNucleoVis = map.getLayoutProperty('zonas-nucleo-layer', 'visibility') === 'visible';
                    const activeLayer = isZonasNucleoVis ? 'zonas-nucleo-layer' : 'colonias-fill-layer';
                    
                    const features = map.queryRenderedFeatures(e.point, { layers: [activeLayer] });
                    if (!features.length) {
                        if (clickedColoniaId !== null) {
                            map.setFeatureState({ source: 'colonias-source', id: clickedColoniaId }, { clicked: false });
                            clickedColoniaId = null;
                        }
                        if (window.AppUI) {
                            if (isZonasNucleoVis && window.AppUI.resetChartToZonasNucleoGlobal) {
                                window.AppUI.resetChartToZonasNucleoGlobal();
                            } else if (!isZonasNucleoVis && window.AppUI.resetChartToAlcaldia) {
                                window.AppUI.resetChartToAlcaldia();
                            }
                        }
                        map.flyTo({ center: [-99.165, 19.380], zoom: 13, duration: 800 });
                    }
                });

                resolveInit({ mapInstance: map, datosGeoJSON });

            }).catch(rejectInit);
        });
    }

    function toggleHeatmap(isVisible) {
        if (!map) return;
        if (map.getLayer('desarrollos-heatmap')) {
            map.setLayoutProperty('desarrollos-heatmap', 'visibility', isVisible ? 'visible' : 'none');
        }
    }

    function toggleZonasNucleoLayer(isVisible) {
        if (!map) return;
        if (map.getLayer('zonas-nucleo-layer')) {
            map.setLayoutProperty('zonas-nucleo-layer', 'visibility', isVisible ? 'visible' : 'none');
        }
        if (map.getLayer('zonas-nucleo-exterior-line-layer')) {
            map.setLayoutProperty('zonas-nucleo-exterior-line-layer', 'visibility', isVisible ? 'visible' : 'none');
        }
    }

    function applyFilters(rule) {
        if (!map) return;
        map.setFilter('desarrollos-layer', rule);
        if (map.getLayer('desarrollos-heatmap')) {
            map.setFilter('desarrollos-heatmap', rule);
        }
    }

    return {
        init,
        toggleHeatmap,
        toggleZonasNucleoLayer,
        applyFilters,
        getMap: () => map,
        tipologiaData,
        zonasNucleoData
    };
})();
