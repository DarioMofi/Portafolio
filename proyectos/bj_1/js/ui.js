/**
 * ui.js
 * Módulo encargado de la generación y actualización del DOM (Paneles, Checkboxes, Leyendas).
 */

window.AppUI_Logic = (function() {

    function updateLegend() {
        if (typeof window.AppUI_Logic.updateAbsorcionLegend === 'function') {
            window.AppUI_Logic.updateAbsorcionLegend();
        }

        const legendPanel = document.getElementById('dynamic-legend');
        if (!legendPanel) return;

        const legendTitle = document.getElementById('legend-title');
        const legendContent = document.getElementById('legend-content');

        const tipoSelect = document.getElementById('indicador-tipo');
        const toggleHeatmap = document.getElementById('toggle-heatmap');
        const toggleZonasNucleo = document.getElementById('toggle-zonas-nucleo');
        const dataPanel = document.getElementById('data-panel');

        const isIndicadoresActive = tipoSelect && tipoSelect.value !== 'none';
        const isHeatmapActive = toggleHeatmap && toggleHeatmap.checked;
        const isZonasNucleoActive = toggleZonasNucleo && toggleZonasNucleo.checked;
        const isPanelOpen = dataPanel && dataPanel.classList.contains('panel-active');
        
        const chartPanel = document.getElementById('dynamic-chart-panel');

        // EN PC: Ocultamos leyendas si el panel está abierto para evitar redundancias, 
        // EXCEPTO si el Mapa de Calor, Indicadores o Zonas Núcleo están activos.
        if (window.innerWidth > 768 && isPanelOpen && !isHeatmapActive && !isIndicadoresActive && !isZonasNucleoActive) {
            legendPanel.classList.add('hidden');
            legendPanel.style.display = 'none';
            if (chartPanel) {
                chartPanel.classList.add('hidden');
                chartPanel.style.display = 'none';
            }
            return;
        }

        legendPanel.style.display = 'block';
        setTimeout(() => legendPanel.classList.remove('hidden'), 10);

        if(chartPanel && (!isIndicadoresActive && !isHeatmapActive && !isZonasNucleoActive || isZonasNucleoActive)) {
            chartPanel.style.display = 'block';
            setTimeout(() => chartPanel.classList.remove('hidden'), 10);
        } else if (chartPanel) {
            chartPanel.classList.add('hidden');
            chartPanel.style.display = 'none';
        }

        legendContent.innerHTML = '';

        if (isHeatmapActive) {
            legendTitle.innerText = "Densidad Desarrollo";
            
            const gradientDiv = document.createElement('div');
            gradientDiv.className = 'legend-gradient';
            gradientDiv.style.background = 'linear-gradient(to right, rgba(43, 131, 186, 0.8), #abdda4, #ffffbf, #fdae61, #d7191c)';
            
            const labelsDiv = document.createElement('div');
            labelsDiv.className = 'legend-labels';
            labelsDiv.innerHTML = `<span>Baja</span><span>Alta</span>`;
            
            legendContent.appendChild(gradientDiv);
            legendContent.appendChild(labelsDiv);
        } else if (isIndicadoresActive) {
            const viviendaSelect = document.getElementById('indicador-vivienda');
            const tipo = tipoSelect.value;
            const vivienda = viviendaSelect ? viviendaSelect.value : 'total';
            
            legendTitle.innerText = `${tipoSelect.options[tipoSelect.selectedIndex].text}`;
            
            let stopsArray = [];
            if (tipo === 'hai') {
                if (vivienda === 'resp') {
                    stopsArray = [ {val: 'S/D', col: '#B5B5B5'}, {val: '0 - 10', col: '#57338A'}, {val: '11 - 15', col: '#933A92'}, {val: '16 - 20', col: '#E2496D'}, {val: '21 - 30', col: '#F6966E'}, {val: '> 30', col: '#FCF4C3'}];
                } else {
                    stopsArray = [ {val: 'S/D', col: '#B5B5B5'}, {val: '0 - 20', col: '#57338A'}, {val: '21 - 30', col: '#933A92'}, {val: '31 - 40', col: '#E2496D'}, {val: '41 - 50', col: '#F6966E'}, {val: '> 50', col: '#FCF4C3'}];
                }
            } else if (tipo === 'pir') {
                if (vivienda === 'resp') {
                    stopsArray = [ {val: 'S/D', col: '#B5B5B5'}, {val: '0 - 10', col: '#468A48'}, {val: '11 - 20', col: '#75C686'}, {val: '21 - 30', col: '#C2E4B7'}, {val: '31 - 40', col: '#FAD9AE'}, {val: '41 - 50', col: '#EEA076'}, {val: '> 50', col: '#DA2128'}];
                } else {
                    stopsArray = [ {val: 'S/D', col: '#B5B5B5'}, {val: '1 - 10', col: '#468A48'}, {val: '11 - 20', col: '#75C686'}, {val: '21 - 30', col: '#C2E4B7'}, {val: '31 - 40', col: '#FAD9AE'}, {val: '41 - 50', col: '#EEA076'}, {val: '> 50', col: '#DA2128'}];
                }
            }
            
            stopsArray.forEach(item => {
                const row = document.createElement('div');
                row.className = 'legend-item';
                row.innerHTML = `<div class="legend-color-box" style="background-color: ${item.col}"></div><span>${item.val}</span>`;
                legendContent.appendChild(row);
            });
        } else if (isZonasNucleoActive && window.AppMap && window.AppMap.zonasNucleoData) {
            legendTitle.innerText = "Zonas Núcleo";
            const zonasData = window.AppMap.zonasNucleoData;
            
            Object.keys(zonasData).forEach(zona => {
                const row = document.createElement('div');
                row.className = 'legend-item';
                const col = zonasData[zona].color;
                row.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${col}; box-shadow: 0 0 5px ${col}; margin-left: 2px; margin-right: 4px; flex-shrink: 0;"></span><span>${zona}</span>`;
                legendContent.appendChild(row);
            });
        } else {
            legendTitle.innerText = "Tipología";
            const items = [
                { nombre: 'Residencial Plus', color: '#e707e7ff', val: 'RP' },
                { nombre: 'Residencial', color: '#004dc0ff', val: 'R' },
                { nombre: 'Media', color: '#d30707ff', val: 'M' },
                { nombre: 'Económica', color: '#eeb303ff', val: 'E' }
            ];
            
            const activeTipologias = Array.from(document.querySelectorAll('#layer-controls .tipologia-checkbox:checked')).map(cb => cb.value);
            const existCheckboxes = document.querySelectorAll('#layer-controls .tipologia-checkbox').length > 0;
            
            items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'legend-item';
                
                const isActive = !existCheckboxes || activeTipologias.includes(item.val);
                row.style.opacity = isActive ? '1' : '0.3';
                row.style.filter = isActive ? 'none' : 'grayscale(100%)';
                row.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
                row.style.cursor = 'pointer';

                row.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${item.color}; box-shadow: 0 0 5px ${item.color}; margin-left: 2px; margin-right: 4px; flex-shrink: 0;"></span><span>${item.nombre}</span>`;
                
                row.addEventListener('click', () => {
                    const cb = document.querySelector(`#layer-controls input.tipologia-checkbox[value="${item.val}"]`);
                    if (cb) {
                        cb.checked = !cb.checked;
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });

                legendContent.appendChild(row);
            });
        }
    }

    function updateAbsorcionLegend() {
        const legendPanel = document.getElementById('absorcion-legend');
        const legendContent = document.getElementById('absorcion-legend-content');
        if (!legendPanel || !legendContent) return;

        const isIndicadoresActive = document.getElementById('indicador-tipo') && document.getElementById('indicador-tipo').value !== 'none';
        const isHeatmapActive = document.getElementById('toggle-heatmap') && document.getElementById('toggle-heatmap').checked;
        const isZonasNucleoActive = document.getElementById('toggle-zonas-nucleo') && document.getElementById('toggle-zonas-nucleo').checked;
        const dataPanel = document.getElementById('data-panel');
        const isPanelOpen = dataPanel && dataPanel.classList.contains('panel-active');

        // EN PC: Ocultar esta leyenda si el panel derecho está abierto, si Zonas Núcleo está activo,
        // o si Mapa de Calor / Indicadores de vivienda están activos.
        if (window.innerWidth > 768) {
            if (isPanelOpen || isZonasNucleoActive || isHeatmapActive || isIndicadoresActive) {
                legendPanel.classList.add('hidden');
                legendPanel.style.display = 'none';
                return;
            }
        }

        const checkedBoxes = Array.from(document.querySelectorAll('#layer-controls-absorcion input.absorcion-checkbox:checked'));
        if (checkedBoxes.length === 0) {
            legendPanel.classList.add('hidden');
            legendPanel.style.display = 'none';
            return;
        }

        legendPanel.style.display = 'block';
        // Dar un frame pequeño para que actúe la transición CSS si es que no estaba en display block antes
        setTimeout(() => legendPanel.classList.remove('hidden'), 10);
        legendContent.innerHTML = '';
        
        checkedBoxes.forEach(chk => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.fontSize = '0.9rem';
            div.innerHTML = `<span>${chk.dataset.label}</span>`;
            legendContent.appendChild(div);
        });
    }

    function initUI(tipologias, mapInstance, onFilterChange) {
        const container = document.getElementById('layer-controls');
        if (!container) return;
        
        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gap = '15px 40px';
        
        const order = [
            { tipo: 'todas' }, { empty: true },
            { tipo: 'RP' }, { tipo: 'M' },
            { tipo: 'R' }, { tipo: 'E' }
        ];
        
        let tipologiaCheckboxes = [];
        let todasCheckbox = null;

        order.forEach(item => {
            if (item.empty) {
                container.appendChild(document.createElement('div'));
                return;
            }

            const tipoVal = item.tipo;
            const label = document.createElement('label');
            label.className = 'control-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tipoVal;
            checkbox.checked = true;
            
            if (tipoVal === 'todas') {
                checkbox.id = 'chk-todas';
                checkbox.classList.add('todas-checkbox');
                todasCheckbox = checkbox;
                const span = document.createElement('span');
                span.innerHTML = `Todas`;
                label.append(checkbox, span);
                
                checkbox.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    tipologiaCheckboxes.forEach(chk => chk.checked = isChecked);
                    
                    const tipoSelect = document.getElementById('indicador-tipo');
                    if (isChecked && tipoSelect && tipoSelect.value !== 'none') {
                        tipoSelect.value = 'none';
                        tipoSelect.dispatchEvent(new Event('change'));
                    }
                    updateLegend();
                    if (onFilterChange) onFilterChange();
                });
            } else {
                if (!tipologias.includes(tipoVal)) return;
                
                checkbox.classList.add('tipologia-checkbox');
                const style = window.AppMap.tipologiaData[tipoVal] || { nombre: 'Otro', color: '#ccff00', radius: 5 };
                const span = document.createElement('span');
                span.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${style.color}; margin-right:8px; margin-top:3px; box-shadow: 0 0 5px ${style.color};"></span>${style.nombre}`;
                label.append(checkbox, span);
                
                tipologiaCheckboxes.push(checkbox);
                
                checkbox.addEventListener('change', () => {
                    if (todasCheckbox) {
                        todasCheckbox.checked = tipologiaCheckboxes.every(c => c.checked);
                    }
                    const tipoSelect = document.getElementById('indicador-tipo');
                    if (checkbox.checked && tipoSelect && tipoSelect.value !== 'none') {
                        tipoSelect.value = 'none';
                        tipoSelect.dispatchEvent(new Event('change'));
                    }
                    updateLegend();
                    if (onFilterChange) onFilterChange();
                });
            }
            container.appendChild(label);
        });
    }

    function initAbsorcionUI(mapInstance, onFilterChange) {
        const container = document.getElementById('layer-controls-absorcion');
        if (!container) return;
        
        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gap = '15px 40px'; 
        
        const absorcionMapping = [
            { key: 'J', label: '0.5' }, { key: 'I', label: '1' },
            { key: 'H', label: '2' }, { key: 'G', label: '3' },
            { key: 'F', label: '4' }, { key: 'E', label: '5' },
            { key: 'D', label: '6' }, { key: 'C', label: '7' },
            { key: 'B', label: '8' }, { key: 'A', label: '>8' }
        ];

        let absorcionCheckboxes = [];
        let todasCheckbox = null;

        const labelTodas = document.createElement('label');
        labelTodas.className = 'control-item';
        const chkTodas = document.createElement('input');
        chkTodas.type = 'checkbox';
        chkTodas.value = 'todas';
        chkTodas.checked = true;
        chkTodas.id = 'chk-todas-absorcion';
        todasCheckbox = chkTodas;
        
        const spanTodas = document.createElement('span');
        spanTodas.innerHTML = 'Todas';
        labelTodas.append(chkTodas, spanTodas);
        
        chkTodas.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            absorcionCheckboxes.forEach(chk => chk.checked = isChecked);
            updateAbsorcionLegend();
            if (onFilterChange) onFilterChange();
        });
        
        container.appendChild(labelTodas);
        container.appendChild(document.createElement('div'));

        absorcionMapping.forEach(item => {
            const label = document.createElement('label');
            label.className = 'control-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.key;
            checkbox.checked = true;
            checkbox.classList.add('absorcion-checkbox');
            checkbox.dataset.label = item.label;
            
            const span = document.createElement('span');
            span.innerHTML = `${item.label}`;
            label.append(checkbox, span);
            
            absorcionCheckboxes.push(checkbox);
            
            checkbox.addEventListener('change', () => {
                if (todasCheckbox) {
                    todasCheckbox.checked = absorcionCheckboxes.every(c => c.checked);
                }
                updateAbsorcionLegend();
                if (onFilterChange) onFilterChange();
            });
            container.appendChild(label);
        });
        
        updateAbsorcionLegend();
    }

    function initIndicadoresUI(mapInstance, onFilterChange) {
        const tipoSelect = document.getElementById('indicador-tipo');
        const viviendaSelect = document.getElementById('indicador-vivienda');
        const viviendaGroup = document.getElementById('vivienda-group');

        if (!tipoSelect || !viviendaSelect) return;

        const updateIndicadores = () => {
            const tipo = tipoSelect.value;
            const vivienda = viviendaSelect.value; 
            const headerTipologia = document.getElementById('header-tipologia');
            const contentTipologia = document.getElementById('content-tipologia');
            const chevronTipologia = headerTipologia ? headerTipologia.querySelector('.chevron') : null;

            if (tipo === 'none') {
                viviendaGroup.style.opacity = '0.5';
                viviendaSelect.disabled = true;
                viviendaGroup.style.pointerEvents = 'none';

                mapInstance.setLayoutProperty('pir_hai-layer', 'visibility', 'none');
                if (mapInstance.getLayer('pir_hai-line-layer')) {
                    mapInstance.setLayoutProperty('pir_hai-line-layer', 'visibility', 'none');
                }
                mapInstance.setLayoutProperty('desarrollos-layer', 'visibility', 'visible');
                
                if(contentTipologia && chevronTipologia) {
                    contentTipologia.style.display = 'block';
                    contentTipologia.classList.add('open');
                    chevronTipologia.classList.add('up');
                }
                if (onFilterChange) onFilterChange(); 
            } else {
                viviendaGroup.style.opacity = '1';
                viviendaSelect.disabled = false;
                viviendaGroup.style.pointerEvents = 'auto';

                const chkZonas = document.getElementById('toggle-zonas-nucleo');
                if (chkZonas && chkZonas.checked) {
                    chkZonas.checked = false;
                    chkZonas.dispatchEvent(new Event('change'));
                }

                mapInstance.setLayoutProperty('desarrollos-layer', 'visibility', 'none');
                mapInstance.setLayoutProperty('pir_hai-layer', 'visibility', 'visible');
                if (mapInstance.getLayer('pir_hai-line-layer')) {
                    mapInstance.setLayoutProperty('pir_hai-line-layer', 'visibility', 'visible');
                }
                
                if(contentTipologia && chevronTipologia) {
                    contentTipologia.style.display = 'none';
                    contentTipologia.classList.remove('open');
                    chevronTipologia.classList.remove('up');
                }

                const toggleHeatmap = document.getElementById('toggle-heatmap');
                if (toggleHeatmap && toggleHeatmap.checked) {
                    toggleHeatmap.checked = false;
                    toggleHeatmap.dispatchEvent(new Event('change'));
                }

                const variableSeleccionada = `${tipo}_${vivienda}`;
                let stopsArray = [];
                if (tipo === 'hai') {
                    if (vivienda === 'resp') stopsArray = [0, '#57338A', 10, '#933A92', 15, '#E2496D', 20, '#F6966E', 30, '#FCF4C3'];
                    else stopsArray = [0, '#57338A', 20, '#933A92', 30, '#E2496D', 40, '#F6966E', 50, '#FCF4C3'];
                } else if (tipo === 'pir') {
                    if (vivienda === 'resp') stopsArray = [0, '#468A48', 10, '#75C686', 20, '#C2E4B7', 30, '#FAD9AE', 40, '#EEA076', 50, '#DA2128'];
                    else stopsArray = [1, '#468A48', 10, '#75C686', 20, '#C2E4B7', 30, '#FAD9AE', 40, '#EEA076', 50, '#DA2128'];
                }

                const paintExpression = [
                    'step',
                    ['coalesce', ['get', variableSeleccionada], -1], 
                    '#B5B5B5', 
                    ...stopsArray
                ];

                mapInstance.setPaintProperty('pir_hai-layer', 'fill-color', paintExpression);
                if (mapInstance.getLayer('pir_hai-line-layer')) {
                    mapInstance.setPaintProperty('pir_hai-line-layer', 'line-color', paintExpression);
                }
            }
            updateLegend();
        };

        tipoSelect.addEventListener('change', updateIndicadores);
        viviendaSelect.addEventListener('change', updateIndicadores);
    }

    return {
        updateLegend,
        updateAbsorcionLegend,
        initUI,
        initAbsorcionUI,
        initIndicadoresUI,
        initGlossary,
        initMetodologia,
        initInfoButtons
    };
})();

/**
 * Inicializa los botones de información en los encabezados de los filtros.
 */
function initInfoButtons() {
    const infoButtons = document.querySelectorAll('.header-info-btn');
    const modal = document.getElementById('header-info-modal');
    const closeBtn = document.getElementById('close-info-modal');
    const titleEl = document.getElementById('info-modal-title');
    const bodyEl = document.getElementById('info-modal-body');

    if (!modal || !infoButtons.length) return;

    infoButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que colapse/expanda el encabezado
            
            // MÓVIL: Cerrar el panel de filtros si se abre un modal de info
            if (window.innerWidth <= 768) {
                const dataPanel = document.getElementById('data-panel');
                const toggleBtn = document.getElementById('toggle-panel-btn');
                const navLinks = document.querySelector('.nav-links');
                if (dataPanel && dataPanel.classList.contains('panel-active')) {
                    dataPanel.classList.remove('panel-active');
                    if (toggleBtn) toggleBtn.classList.remove('is-open');
                    if (navLinks) navLinks.classList.remove('shifted');
                }
            }
            
            const termName = btn.getAttribute('data-term');
            const data = window.AppGlossary_Data || [];
            const entry = data.find(item => item.term === termName);

            if (entry) {
                const isOpen = !modal.classList.contains('hidden');
                const currentTerm = modal.getAttribute('data-active-term');

                if (isOpen && currentTerm === termName) {
                    modal.classList.add('hidden');
                    modal.removeAttribute('data-active-term'); // Limpiamos el estado
                } else {
                    titleEl.innerText = entry.term;
                    bodyEl.innerHTML = entry.def; // Cambiado de innerText a innerHTML
                    
                    // Remover botón previo si existe para evitar duplicados
                    const oldBtn = bodyEl.querySelector('.link-metodo-btn');
                    if(oldBtn) oldBtn.remove();
                    
                    // Mapeo de términos de Glosario a términos de Metodología
                    const metodosMapping = {
                        'Absorción': 'Clasificación de rangos de absobción',
                        'Mapa de Calor (Heatmap)': 'Mapa de calor (Heatmap)',
                        'Zona Núcleo': 'Zonas Núcleo',
                        'Indicadores de Vivienda': 'Indicadores de Vivienda'
                    };
                    
                    if (metodosMapping[termName]) {
                        const btnContainer = document.createElement('div');
                        btnContainer.className = 'link-metodo-btn';
                        btnContainer.style.marginTop = '15px';
                        btnContainer.style.textAlign = 'right';
                        
                        const btn = document.createElement('button');
                        btn.innerText = 'Ver Metodología';
                        btn.style.background = 'none';
                        btn.style.border = 'none';
                        btn.style.color = 'var(--color-accent, #ccff00)';
                        btn.style.fontFamily = 'var(--font-primary)';
                        btn.style.fontSize = '0.9rem';
                        btn.style.cursor = 'pointer';
                        btn.style.padding = '0';
                        btn.style.fontWeight = 'bold';
                        btn.style.textDecoration = 'none';
                        btn.style.opacity = '0.65'; // Transparente por defecto
                        btn.style.transition = 'opacity 0.3s ease';
                        
                        // Efecto hover invertido (brilla al pasar el ratón)
                        btn.addEventListener('mouseover', () => btn.style.opacity = '1');
                        btn.addEventListener('mouseout', () => btn.style.opacity = '0.65');
                        
                        btn.addEventListener('click', () => {
                            // Cierra el modal
                            modal.classList.add('hidden');
                            modal.removeAttribute('data-active-term');
                            
                            // Activa la sección de Metodología
                            const navMetodos = document.getElementById('nav-metodos');
                            if(navMetodos) navMetodos.click();
                            
                            // Scroll a la sección correspondiente asegurando el centrado
                            setTimeout(() => {
                                const targetTerm = metodosMapping[termName].toLowerCase();
                                const headers = document.querySelectorAll('.metodologia-term');
                                for (let h of headers) {
                                    if (h.textContent.trim().toLowerCase() === targetTerm) {
                                        // Centrar exactamente el bloque en la vista
                                        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        
                                        // Efecto visual sutil para indicar la sección
                                        const parent = h.parentElement;
                                        const originalGlow = parent.style.boxShadow;
                                        parent.style.boxShadow = '0 0 15px rgba(204, 255, 0, 0.3)';
                                        parent.style.borderRadius = '8px';
                                        parent.style.transition = 'box-shadow 0.8s ease';
                                        
                                        setTimeout(() => { 
                                            parent.style.boxShadow = originalGlow; 
                                        }, 2500);
                                        break;
                                    }
                                }
                            }, 450); // Tiempo extendido (450ms) para garantizar que el panel haya abierto completamente antes de calcular el centro
                        });
                        
                        btnContainer.appendChild(btn);
                        bodyEl.appendChild(btnContainer);
                    }

                    modal.classList.remove('hidden');
                    modal.setAttribute('data-active-term', termName);
                }
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.removeAttribute('data-active-term');
        });
    }

    // Cerrar al hacer clic fuera del contenido del modal
    window.addEventListener('click', (e) => {
        if (!modal.classList.contains('hidden') && !modal.querySelector('.header-info-content').contains(e.target)) {
            // Solo cerrar si el clic no es en uno de los botones de info
            if (!Array.from(infoButtons).some(btn => btn.contains(e.target))) {
                modal.classList.add('hidden');
                modal.removeAttribute('data-active-term');
            }
        }
    });

    // También cerrar con la tecla Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            modal.removeAttribute('data-active-term');
        }
    });

    initModalObserver();
}

/**
 * Función independiente para inicializar el Glosario.
 */
function initGlossary() {
    const container = document.getElementById('glossary-content-target');
    const data = window.AppGlossary_Data;

    if (!container || !data) return;

    // 1. Ordenar alfabéticamente
    const sortedData = [...data].sort((a, b) => a.term.localeCompare(b.term));

    // 2. Generar HTML
    container.innerHTML = sortedData.map((item, index) => `
        <div class="glossary-item" data-index="${index}">
            <button class="glossary-header">
                <h3 class="glossary-term">${item.term}</h3>
                <span class="glossary-arrow">▼</span>
            </button>
            <div class="glossary-content">
                <p class="glossary-definition">${item.def}</p>
            </div>
        </div>
    `).join('');

    // 3. Agregar Eventos (Acordeón)
    const items = container.querySelectorAll('.glossary-item');
    items.forEach(item => {
        const header = item.querySelector('.glossary-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Cerrar otros
            items.forEach(i => i.classList.remove('active'));
            
            // Alternar actual
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Función independiente para inicializar la Metodología.
 * Renderiza los términos como encabezados fijos (sin comportamiento de acordeón).
 */
function initMetodologia() {
    const container = document.getElementById('metodologia-content-target');
    const data = window.AppMetodologia_Data;

    if (!container || !data) return;

    container.innerHTML = data.map((item) => `
        <div class="metodologia-item" style="margin-bottom: 25px;">
            <h3 class="metodologia-term">
                ${item.term}
            </h3>
            <div class="metodologia-definition">${item.def.trim()}</div>
        </div>
    `).join('');
}

/**
 * Observador para desplazar dinámicamente el modal a la derecha
 * cuando hay paneles (leyendas, gráficas) activos a la izquierda.
 */
function initModalObserver() {
    const modal = document.getElementById('header-info-modal');
    const leftContainer = document.querySelector('.left-panels-container');
    if (!modal || !leftContainer) return;

    const checkShift = () => {
        const panels = leftContainer.querySelectorAll('.legend-panel, .chart-panel');
        let isAnyVisible = Array.from(panels).some(p => !p.classList.contains('hidden') && p.style.display !== 'none');
        if (isAnyVisible) {
            modal.classList.add('shifted');
        } else {
            modal.classList.remove('shifted');
        }
    };

    const observer = new MutationObserver(() => {
        checkShift();
    });

    observer.observe(leftContainer, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
    
    // Initial check
    checkShift();
}
