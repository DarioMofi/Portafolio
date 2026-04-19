document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Componentes de Texto Interactivos
    if (typeof initGlossary === 'function') {
        initGlossary();
    }
    if (typeof initMetodologia === 'function') {
        initMetodologia();
    }
    if (typeof initInfoButtons === 'function') {
        initInfoButtons();
    }

    const toggleBtn = document.getElementById('toggle-panel-btn');
    const dataPanel = document.getElementById('data-panel');
    const extraChartsBox = document.getElementById('extra-charts-box');
    const navLinks = document.querySelector('.nav-links');

    // --- Lógica de Navegación (Tabs) ---
    const navMapa = document.getElementById('nav-mapa');
    const navMetodos = document.getElementById('nav-metodos');
    const navGlosario = document.getElementById('nav-glosario');
    const viewMetodos = document.getElementById('view-metodos');
    const viewGlosario = document.getElementById('view-glosario');
    const mapSourceLegend = document.getElementById('map-source-legend');

    function switchTab(activeTabId) {
        [navMapa, navMetodos, navGlosario].forEach(nav => {
            if(nav) nav.classList.remove('active');
        });
        if(viewMetodos) viewMetodos.classList.add('section-hidden');
        if(viewGlosario) viewGlosario.classList.add('section-hidden');

        const mobilePullHandle = document.getElementById('mobile-pull-handle');
        const leftPanels = document.querySelector('.left-panels-container');

        if (activeTabId === 'nav-mapa') {
            if(navMapa) navMapa.classList.add('active');
            if(mapSourceLegend) mapSourceLegend.style.display = 'flex';
            if(leftPanels) leftPanels.style.setProperty('display', 'flex', 'important');
            if(toggleBtn) toggleBtn.style.setProperty('display', 'flex', 'important');
            if(extraChartsBox) {
                // Restaurar el display original (flex/none) basado en si hay gráficas activas
                const linePanel = document.getElementById('line-chart-panel');
                const waterfallPanel = document.getElementById('waterfall-chart-panel');
                const anyVisible = (linePanel && linePanel.style.display !== 'none') || 
                                   (waterfallPanel && waterfallPanel.style.display !== 'none');
                extraChartsBox.style.display = anyVisible ? 'flex' : 'none';
            }
        } else {
            if(navMetodos && activeTabId === 'nav-metodos') navMetodos.classList.add('active');
            if(viewMetodos && activeTabId === 'nav-metodos') viewMetodos.classList.remove('section-hidden');
            
            if(navGlosario && activeTabId === 'nav-glosario') navGlosario.classList.add('active');
            if(viewGlosario && activeTabId === 'nav-glosario') viewGlosario.classList.remove('section-hidden');
            
            if(mapSourceLegend) mapSourceLegend.style.display = 'none';
            if(leftPanels) {
                leftPanels.classList.remove('panel-collapsed'); // Reset
                leftPanels.style.setProperty('display', 'none', 'important');
            }
            if(toggleBtn) toggleBtn.style.setProperty('display', 'none', 'important');
            if(extraChartsBox) {
                extraChartsBox.style.display = 'none';
            }
        }
    }

    // --- Lógica del Tirador (Handle) de Datos Móviles ---
    const mobilePullHandle = document.getElementById('mobile-pull-handle');
    const appWrapper = document.querySelector('.app-wrapper');
    if (mobilePullHandle && appWrapper) {
        mobilePullHandle.addEventListener('click', () => {
            appWrapper.classList.toggle('split-active');
            
            // Re-ajustar mapa después de que termine la animación de CSS (400ms)
            setTimeout(() => {
                const mapInstance = window.AppMap ? window.AppMap.getMap() : null;
                if (mapInstance) {
                    mapInstance.resize();
                }
            }, 450);
        });
    }

    // --- Lógica de Colapso para Paneles Inferiores (Móvil Split-Screen) ---
    const leftPanelsContainer = document.querySelector('.left-panels-container');
    if (leftPanelsContainer) {
        leftPanelsContainer.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const header = e.target.closest('.legend-title, #chart-title');
                if (header) {
                    const panel = header.closest('.legend-panel, .chart-panel');
                    if (panel) {
                        panel.classList.toggle('panel-collapsed');
                    }
                }
            }
        });
    }

    if (navMapa) navMapa.addEventListener('click', (e) => { e.preventDefault(); switchTab('nav-mapa'); });
    if (navMetodos) navMetodos.addEventListener('click', (e) => { e.preventDefault(); switchTab('nav-metodos'); });
    if (navGlosario) navGlosario.addEventListener('click', (e) => { e.preventDefault(); switchTab('nav-glosario'); });

    // Panel Toggle
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isOpening = !dataPanel.classList.contains('panel-active');
            
            if (dataPanel) dataPanel.classList.toggle('panel-active');
            toggleBtn.classList.toggle('is-open');
            if (navLinks) navLinks.classList.toggle('shifted'); 
            
            // EN PC: Si abrimos filtros, cerramos gráficas para evitar encimado
            if (isOpening && window.innerWidth > 768) {
                const linePanel = document.getElementById('line-chart-panel');
                const waterfallPanel = document.getElementById('waterfall-chart-panel');
                if (linePanel && linePanel.style.display !== 'none') toggleChartPanel('lineal');
                if (waterfallPanel && waterfallPanel.style.display !== 'none') toggleChartPanel('waterfall');
            }
            
            if (window.AppUI_Logic && typeof window.AppUI_Logic.updateLegend === 'function') {
                window.AppUI_Logic.updateLegend();
            }
        });
    }

    window.currentChartMode = null;

    function ensureChartsInitialized(mode) {
        if (!window.AppCharts_Logic) return;
        if (mode === 'lineal' && !window.AppCharts_Logic.lineChartInstance) {
            window.AppCharts_Logic.initLineChart();
        }
        if (mode === 'waterfall' && !window.AppCharts_Logic.waterfallChartInstance) {
            window.AppCharts_Logic.initWaterfallChart();
        }
        window.AppCharts_Logic.updateChartFromFilters();
    }

    function updateContainerVisibility() {
        if (!extraChartsBox) return;
        const linePanel = document.getElementById('line-chart-panel');
        const waterfallPanel = document.getElementById('waterfall-chart-panel');
        const lineVisible = linePanel && linePanel.style.display !== 'none';
        const waterfallVisible = waterfallPanel && waterfallPanel.style.display !== 'none';

        if (lineVisible || waterfallVisible) {
            extraChartsBox.classList.add('open-panel');
        } else {
            extraChartsBox.classList.remove('open-panel');
        }
    }

    function toggleChartPanel(mode) {
        if (!extraChartsBox) return;

        const linePanel = document.getElementById('line-chart-panel');
        const waterfallPanel = document.getElementById('waterfall-chart-panel');
        const panel = mode === 'lineal' ? linePanel : waterfallPanel;
        const otherPanel = mode === 'lineal' ? waterfallPanel : linePanel;
        if (!panel) return;

        const isVisible = panel.style.display !== 'none';

        // EN PC: Cerramos los filtros automáticamente SOLO si vamos a abrir una gráfica
        if (window.innerWidth > 768 && !isVisible) {
            if (dataPanel && dataPanel.classList.contains('panel-active')) {
                dataPanel.classList.remove('panel-active');
                if(toggleBtn) toggleBtn.classList.remove('is-open');
                if(navLinks) navLinks.classList.remove('shifted');
            }
        }

        panel.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            // Activando: si el otro ya está visible, el nuevo va abajo
            const otherVisible = otherPanel && otherPanel.style.display !== 'none';
            if (otherVisible) {
                panel.style.order = '1';
            } else {
                panel.style.order = '0';
            }
            ensureChartsInitialized(mode);
        }

        updateContainerVisibility();
    }

    // Chart Buttons
    const btnShowLinechart = document.getElementById('btn-show-linechart');
    const btnShowWaterfall = document.getElementById('btn-show-waterfall');
    const btnCloseLineChart = document.getElementById('btn-close-line-chart');
    const btnCloseWaterfallChart = document.getElementById('btn-close-waterfall-chart');

    if (btnShowLinechart) {
        btnShowLinechart.addEventListener('click', () => toggleChartPanel('lineal'));
    }

    if (btnShowWaterfall) {
        btnShowWaterfall.addEventListener('click', () => toggleChartPanel('waterfall'));
    }

    if (btnCloseLineChart) {
        btnCloseLineChart.addEventListener('click', () => toggleChartPanel('lineal'));
    }

    if (btnCloseWaterfallChart) {
        btnCloseWaterfallChart.addEventListener('click', () => toggleChartPanel('waterfall'));
    }

    // Colapsables
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const chevron = header.querySelector('.chevron');
            if (content.style.display === 'block' || content.classList.contains('open')) {
                content.style.display = 'none';
                content.classList.remove('open');
                chevron.classList.remove('up');
            } else {
                content.style.display = 'block';
                content.classList.add('open');
                chevron.classList.add('up');
            }
        });
    });

    window.AppUI = window.AppUI || {};
    
    // --- Lógica Principal del Coordinador (Map + UI + Chart) ---
    if (window.AppMap && window.AppUI_Logic && window.AppCharts_Logic) {
        window.AppMap.init().then(({ mapInstance, datosGeoJSON }) => {
            window.AppUI.datosGeoJSON = datosGeoJSON;
            const tipologias = new Set();
            const tipologiaCountsBase = { 'RP': 0, 'R': 0, 'M': 0, 'E': 0 };
            
            datosGeoJSON.features.forEach(feature => {
                if (feature.properties.tipologia) {
                    const tipo = feature.properties.tipologia;
                    tipologias.add(tipo);
                    if(tipologiaCountsBase[tipo] !== undefined) {
                        tipologiaCountsBase[tipo]++;
                    }
                }
            });

            // 1. Inicializar Gráfica
            window.mainChart = window.AppCharts_Logic.initChart(tipologiaCountsBase, mapInstance);
            
            let totalDev = 0;
            for (let t in tipologiaCountsBase) { totalDev += tipologiaCountsBase[t]; }
            window.AppUI.totalAlcaldiaNum = totalDev;

            // 2. Inicializar Controles (Pasando trigger al filtro global)
            const uniqueTipos = Array.from(tipologias);
            window.AppUI_Logic.initUI(uniqueTipos, mapInstance, () => filterMap(mapInstance));
            window.AppUI_Logic.initIndicadoresUI(mapInstance, () => filterMap(mapInstance));
            window.AppUI_Logic.initAbsorcionUI(mapInstance, () => filterMap(mapInstance));

            const filterElements = ['year-start', 'month-start', 'year-end', 'month-end'];
            filterElements.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.addEventListener('change', () => filterMap(mapInstance));
            });

            // Listeners de Capas Extra
            const toggleHeatmap = document.getElementById('toggle-heatmap');
            if (toggleHeatmap) {
                toggleHeatmap.addEventListener('change', (e) => {
                    const isVisible = e.target.checked;
                    if (isVisible) {
                        const tipoSelect = document.getElementById('indicador-tipo');
                        if (tipoSelect && tipoSelect.value !== 'none') {
                            tipoSelect.value = 'none';
                            tipoSelect.dispatchEvent(new Event('change'));
                        }
                    }
                    window.AppMap.toggleHeatmap(isVisible);
                    window.AppUI_Logic.updateLegend();
                });
            }

            const toggleZonasNucleo = document.getElementById('toggle-zonas-nucleo');
            if (toggleZonasNucleo) {
                toggleZonasNucleo.addEventListener('change', (e) => {
                    const isVisible = e.target.checked;
                    if (isVisible) {
                        const tipoSelect = document.getElementById('indicador-tipo');
                        if (tipoSelect && tipoSelect.value !== 'none') {
                            tipoSelect.value = 'none';
                            tipoSelect.dispatchEvent(new Event('change'));
                        }
                        window.AppMap.toggleZonasNucleoLayer(true);
                        
                        // Apertura automática de paneles SOLO en Desktop
                        if (window.innerWidth > 768) {
                            const linePanel = document.getElementById('line-chart-panel');
                            const waterfallPanel = document.getElementById('waterfall-chart-panel');
                            if (linePanel && linePanel.style.display === 'none') toggleChartPanel('lineal');
                            if (waterfallPanel && waterfallPanel.style.display === 'none') toggleChartPanel('waterfall');
                        }
                        
                        // Asegurar modo Alcaldía (sin colonia seleccionada) para ver las 6 líneas
                        if (window.AppUI) window.AppUI.currentColoniaFeature = null;

                        window.AppCharts_Logic.resetChartToZonasNucleoGlobal();
                    } else {
                        window.AppMap.toggleZonasNucleoLayer(false);
                        window.AppCharts_Logic.resetChartToAlcaldia(tipologiaCountsBase);
                    }
                    window.AppUI_Logic.updateLegend();
                });
            }

            // Integración Inversa Map -> Chart via AppUI
            window.AppUI.updateChartForColonia = (feature) => window.AppCharts_Logic.updateChartForColonia(feature, datosGeoJSON);
            window.AppUI.resetChartToAlcaldia = () => window.AppCharts_Logic.resetChartToAlcaldia(tipologiaCountsBase);
            window.AppUI.updateChartForZonaNucleo = window.AppCharts_Logic.updateChartForZonaNucleo;
            window.AppUI.resetChartToZonasNucleoGlobal = window.AppCharts_Logic.resetChartToZonasNucleoGlobal;

            // Inicialización Final
            setTimeout(() => {
                window.AppUI_Logic.updateLegend();
            }, 100);

        }).catch(error => console.error('Error inicializando mapa:', error));
    } else {
        console.error("Faltan módulos base (AppMap, AppUI_Logic o AppCharts_Logic). Revisa index.html.");
    }

    // El Controlador de Filtros maestro (Orquestador)
    function filterMap(mapInstance) {
        if (!mapInstance) return;
        const currentActiveInfoView = mapInstance.getLayoutProperty('desarrollos-layer', 'visibility');
        if (currentActiveInfoView === 'none') return;

        const actives = Array.from(document.querySelectorAll('#layer-controls .control-item input.tipologia-checkbox:checked')).map(cb => cb.value);
        let tipologiaFilter;
        if (actives.length === 0) {
            tipologiaFilter = ['==', 'tipologia', '___NONE___'];
        } else {
            tipologiaFilter = ['in', ['get', 'tipologia'], ['literal', actives]];
        }

        const activesAbsorcion = Array.from(document.querySelectorAll('#layer-controls-absorcion .control-item input.absorcion-checkbox:checked')).map(cb => cb.value);
        let absorcionFilter;
        if (activesAbsorcion.length === 0) {
            absorcionFilter = ['==', 'rango_absor', '___NONE___'];
        } else {
            absorcionFilter = ['in', ['get', 'rango_absor'], ['literal', activesAbsorcion]];
        }

        const startYear = document.getElementById('year-start').value;
        const startMonth = document.getElementById('month-start').value;
        const endYear = document.getElementById('year-end').value;
        const endMonth = document.getElementById('month-end').value;

        const dateFilters = [];
        if (startYear && startMonth) {
            dateFilters.push(['>=', ['get', 'fecha_in'], `${startYear}-${startMonth}`]);
        }
        if (endYear && endMonth) {
            dateFilters.push(['<=', ['get', 'fecha_in'], `${endYear}-${endMonth}`]);
        }

        let filterRule;
        if (actives.length === 0 || activesAbsorcion.length === 0) {
            filterRule = ['==', 'tipologia', '___NONE___'];
        } else {
            filterRule = ['all', tipologiaFilter, absorcionFilter, ...dateFilters];
        }
        
        // Delegamos a MAP.JS la regla de filtrado visual nativa
        if (window.AppMap.applyFilters) {
            window.AppMap.applyFilters(filterRule);
        }

        // Delegamos a GRAFICAS.JS la orden de recálculo estadístico
        if (window.AppCharts_Logic && typeof window.AppCharts_Logic.updateChartFromFilters === 'function') {
            window.AppCharts_Logic.updateChartFromFilters();
        }
    }
});