/**
 * graficas.js
 * Módulo encargado de gestionar y actualizar Chart.js y la gráfica de desglose.
 */

window.AppCharts_Logic = (function() {

    // Helper to convert HEX to RGBA (for slice differentiation inside a Zone)
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Alias map: zonasNucleoData name → base.geojson id_colonia value
    const coloniaAliases = {
        'Ampliación Nápoles': 'Ampl. Napoles'
    };

    /**
     * Devuelve un Set con todos los id_colonia que pertenecen a zonas núcleo.
     * Resuelve aliases para coincidir con los nombres del GeoJSON.
     */
    function getZonasNucleoColoniaNames(zonaName) {
        const names = new Set();
        if (!window.AppMap || !window.AppMap.zonasNucleoData) return names;
        const zonasData = window.AppMap.zonasNucleoData;
        
        if (zonaName && zonasData[zonaName]) {
            for (const colName in zonasData[zonaName].colonias) {
                const resolved = coloniaAliases[colName] || colName;
                names.add(resolved);
            }
        } else {
            for (const zona in zonasData) {
                for (const colName in zonasData[zona].colonias) {
                    const resolved = coloniaAliases[colName] || colName;
                    names.add(resolved);
                }
            }
        }
        return names;
    }

    /**
     * Filtra los features del GeoJSON dejando solo los que pertenecen a zonas núcleo.
     */
    function filterFeaturesForZonasNucleo(allFeatures, zonaName) {
        const colNames = getZonasNucleoColoniaNames(zonaName);
        return allFeatures.filter(f => {
            const col = f.properties && f.properties.id_colonia;
            return col && colNames.has(col);
        });
    }

    function initChart(baseCounts, mapInstance) {
        const ctx = document.getElementById('main-pie-chart').getContext('2d');
        
        const backgroundColors = [
            window.AppMap.tipologiaData['RP'].color,
            window.AppMap.tipologiaData['R'].color,
            window.AppMap.tipologiaData['M'].color,
            window.AppMap.tipologiaData['E'].color
        ];

        const data = [baseCounts['RP'], baseCounts['R'], baseCounts['M'], baseCounts['E']];

        const getOrCreateTooltip = (chart) => {
            let tooltipEl = chart.canvas.parentNode.querySelector('div#chartjs-tooltip');
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.innerHTML = '<table></table>';
                chart.canvas.parentNode.appendChild(tooltipEl);
            }
            return tooltipEl;
        };

        const externalTooltipHandler = (context) => {
            const {chart, tooltip} = context;
            const tooltipEl = getOrCreateTooltip(chart);

            if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
            }

            if (tooltip.body) {
                const tableRoot = tooltipEl.querySelector('table');
                tableRoot.innerHTML = ''; 

                if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
                    const dp = tooltip.dataPoints[0];
                    const colorTipologia = dp.dataset.backgroundColor[dp.dataIndex];
                    const nombreTipologia = chart.data.labels[dp.dataIndex];
                    
                    const trTitle = document.createElement('tr');
                    trTitle.innerHTML = `<th class="custom-tooltip-title" style="color: ${colorTipologia};">${nombreTipologia}</th>`;
                    tableRoot.appendChild(trTitle);

                    const value = dp.parsed;
                    let textSuffix = 'desarrollos';

                    const subtitleContainer = document.getElementById('chart-subtitle');
                    if (subtitleContainer) {
                        const txt = subtitleContainer.innerText;
                        if (txt.includes('Zonas Núcleo') || txt.includes('Zona')) {
                            textSuffix = 'desarrollos';
                        }
                    }

                    const trBody = document.createElement('tr');
                    trBody.innerHTML = `<td class="custom-tooltip-body">${value} ${textSuffix}</td>`;
                    tableRoot.appendChild(trBody);
                }
            }

            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = tooltip.caretX + 'px';
            tooltipEl.style.top = (tooltip.caretY + 20) + 'px'; 
            tooltipEl.style.font = tooltip.options.bodyFont.string;
            tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
        };

        const drawPercentagesPlugin = {
            id: 'drawPercentages',
            afterDraw(chart) {
                const { ctx, data } = chart;
                ctx.save();
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                if (total === 0) {
                    ctx.restore();
                    return;
                }

                chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
                    const value = data.datasets[0].data[index];
                    if (value === 0) return;
                    
                    const percentage = Math.round((value / total) * 100);
                    if (percentage === 0) return;
                    
                    const position = datapoint.tooltipPosition();
                    
                    let displayValue = percentage + '%';
                    const customPcts = chart.data.datasets[0].customPcts;
                    if (customPcts && customPcts[index] !== undefined) {
                        if (customPcts[index] === -1) return; // Ocultar render para slice "Resto"
                        displayValue = customPcts[index] + '%';
                    }
                    
                    if (displayValue === '0%') return;
                    
                    ctx.font = 'bold 12px "Space Mono", sans-serif';
                    ctx.fillStyle = '#c7bebeff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 4;

                    ctx.fillText(displayValue, position.x, position.y);
                });
                ctx.restore();
            }
        };

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Residencial Plus', 'Residencial', 'Media', 'Económica'],
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            plugins: [drawPercentagesPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
                onClick: (event, activeElements, chart) => {
                    if (activeElements.length === 0) return;
                    
                    const subtitleContainer = document.getElementById('chart-subtitle');
                    if (subtitleContainer) {
                        const txt = subtitleContainer.innerText;
                        if (txt.includes('Zonas Núcleo') || txt.includes('Zona')) {
                            return; 
                        }
                    }

                    const index = activeElements[0].index;
                    const label = chart.data.labels[index];
                    
                    const tipologiaMap = {
                        'Residencial Plus': 'RP',
                        'Residencial': 'R',
                        'Media': 'M',
                        'Económica': 'E'
                    };
                    
                    if (tipologiaMap[label]) {
                        const targetVal = tipologiaMap[label];
                        const checkboxes = document.querySelectorAll('#layer-controls input[type="checkbox"]');
                        const chkTodas = document.getElementById('chk-todas');
                        
                        let activeCount = 0;
                        let activeVal = null;
                        checkboxes.forEach(chk => {
                            if (chk.id !== 'chk-todas' && chk.checked) {
                                activeCount++;
                                activeVal = chk.value;
                            }
                        });
                        
                        if (activeCount === 1 && activeVal === targetVal) {
                            if (chkTodas) {
                                chkTodas.checked = true;
                                chkTodas.dispatchEvent(new Event('change'));
                            }
                        } else {
                            if (chkTodas) chkTodas.checked = false;
                            
                            checkboxes.forEach(chk => {
                                if (chk.id !== 'chk-todas') {
                                    chk.checked = (chk.value === targetVal);
                                }
                            });
                            // Instead of calling filterMap directly, fire change event
                            const anyChk = document.querySelector('#layer-controls .tipologia-checkbox');
                            if (anyChk) {
                                anyChk.dispatchEvent(new Event('change'));
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false, position: 'nearest', external: externalTooltipHandler }
                }
            }
        });
    }

    function updateChartFromFilters() {
        if (!window.AppUI || !window.AppUI.datosGeoJSON) return;

        const subtitleContainer = document.getElementById('chart-subtitle');
        const isZonasActiveOnMap = document.getElementById('toggle-zonas-nucleo')?.checked;
        const activeZonaName = window.AppUI?.currentZonaNucleo;
        const isColoniaSelected = window.AppUI?.currentColoniaFeature;
        const isZonasGeneralMode = isZonasActiveOnMap && !activeZonaName && !isColoniaSelected;

        // Fase 1: Identificar qué features contar para el Doughnut y las analíticas
        let featuresToCount = window.AppUI.datosGeoJSON.features;
        
        if (activeZonaName) {
            // Drill-down de Zona: Filtramos solo los desarrollos dentro de esa zona
            featuresToCount = filterFeaturesForZonasNucleo(featuresToCount, activeZonaName);
            if (subtitleContainer) subtitleContainer.innerText = 'Zona: ' + activeZonaName;
        } else if (isColoniaSelected && window.turf) {
            // Drill-down de Colonia: Filtramos por polígono de colonia
            try {
                const ptsWithin = turf.pointsWithinPolygon(window.AppUI.datosGeoJSON, isColoniaSelected);
                featuresToCount = ptsWithin.features;
                const colName = isColoniaSelected.properties.Colonia || isColoniaSelected.properties.colonia || isColoniaSelected.properties.nombre || 'Desconocida';
                if (subtitleContainer) subtitleContainer.innerText = 'Col. ' + colName;
            } catch (err) {}
        } else if (isZonasActiveOnMap) {
            if (subtitleContainer) subtitleContainer.innerText = 'Impacto Zonas Núcleo (General)';
        } else {
            if (subtitleContainer) subtitleContainer.innerText = 'Total Alcaldía';
        }

        // Fase 2: Actualizar Gráfica de Pastel (Doughnut)
        if (isZonasGeneralMode) {
            renderZonasGeneralPieChart();
        } else {
            renderTipologiaPieChart(featuresToCount);
        }

        // Fase 3: Actualizar Gráficas Analíticas (Lineal y Cascada)
        const actives = Array.from(document.querySelectorAll('#layer-controls .control-item input.tipologia-checkbox:checked')).map(cb => cb.value);
        const activesAbsorcion = Array.from(document.querySelectorAll('#layer-controls-absorcion .control-item input.absorcion-checkbox:checked')).map(cb => cb.value);
        
        let startYear = 2000, startMonth = 1, endYear = 2023, endMonth = 12;
        const elSY = document.getElementById('year-start'), elSM = document.getElementById('month-start');
        const elEY = document.getElementById('year-end'), elEM = document.getElementById('month-end');
        if (elSY && elSM) { startYear = parseInt(elSY.value, 10); startMonth = parseInt(elSM.value, 10); }
        if (elEY && elEM) { endYear = parseInt(elEY.value, 10); endMonth = parseInt(elEM.value, 10); }

        let chartFeatures = featuresToCount;
        if (isZonasGeneralMode) {
            chartFeatures = filterFeaturesForZonasNucleo(window.AppUI.datosGeoJSON.features, null);
        }

        updateLineChartData(chartFeatures, actives, activesAbsorcion, startYear, startMonth, endYear, endMonth, isZonasGeneralMode, activeZonaName);
        updateWaterfallChartData(chartFeatures, actives, activesAbsorcion, startYear, startMonth, endYear, endMonth);
    }

    function renderZonasGeneralPieChart() {
        if (!window.mainChart || !window.AppMap || !window.AppMap.zonasNucleoData) return;
        
        let totalZonasNucleoNum = 0;
        let totalZonasNucleoPct = 0;
        const zonasData = window.AppMap.zonasNucleoData;
        
        for (const zona in zonasData) {
            for (const col in zonasData[zona].colonias) {
                totalZonasNucleoPct += zonasData[zona].colonias[col].pct;
                totalZonasNucleoNum += zonasData[zona].colonias[col].num;
            }
        }
        
        let restoNum = window.AppUI.totalAlcaldiaNum - totalZonasNucleoNum;
        const restoPct = Math.round((100 - totalZonasNucleoPct) * 100) / 100;
        totalZonasNucleoPct = Math.round(totalZonasNucleoPct * 100) / 100;

        window.mainChart.data.labels = ['Total Zonas Núcleo', 'Resto Alcaldía'];
        window.mainChart.data.datasets[0].backgroundColor = ['#D32F2F', '#555555'];
        window.mainChart.data.datasets[0].data = [totalZonasNucleoNum, restoNum];
        window.mainChart.data.datasets[0].customPcts = [totalZonasNucleoPct, restoPct];
        window.mainChart.update();
    }

    function renderTipologiaPieChart(features) {
        if (!window.mainChart) return;

        const actives = Array.from(document.querySelectorAll('#layer-controls .control-item input.tipologia-checkbox:checked')).map(cb => cb.value);
        const activesAbsorcion = Array.from(document.querySelectorAll('#layer-controls-absorcion .control-item input.absorcion-checkbox:checked')).map(cb => cb.value);
        
        let startYear = 2000, startMonth = 1, endYear = 2023, endMonth = 12;
        const elSY = document.getElementById('year-start'), elSM = document.getElementById('month-start');
        const elEY = document.getElementById('year-end'), elEM = document.getElementById('month-end');
        if (elSY && elSM) { startYear = parseInt(elSY.value, 10); startMonth = parseInt(elSM.value, 10); }
        if (elEY && elEM) { endYear = parseInt(elEY.value, 10); endMonth = parseInt(elEM.value, 10); }

        const baseCounts = { 'RP': 0, 'R': 0, 'M': 0, 'E': 0 };
        const filteredCounts = { 'RP': 0, 'R': 0, 'M': 0, 'E': 0 };

        features.forEach(feature => {
            const props = feature.properties;
            if (!props) return;
            if (!actives.includes(props.tipologia)) return;

            if (props.fecha_in) {
                const parts = props.fecha_in.split('-');
                if (parts.length >= 2) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    const fVal = y * 12 + m;
                    const startVal = startYear * 12 + startMonth;
                    const endVal = endYear * 12 + endMonth;
                    if (fVal < startVal || fVal > endVal) return;
                }
            }
            if (baseCounts[props.tipologia] !== undefined) baseCounts[props.tipologia]++;
            if (!activesAbsorcion.includes(props.rango_absor)) return;
            if (filteredCounts[props.tipologia] !== undefined) filteredCounts[props.tipologia]++;
        });

        const dataArr = [filteredCounts['RP'], filteredCounts['R'], filteredCounts['M'], filteredCounts['E']];
        const baseArr = [baseCounts['RP'], baseCounts['R'], baseCounts['M'], baseCounts['E']];
        const totalBase = baseArr.reduce((a, b) => a + b, 0);
        const totalFiltered = dataArr.reduce((a, b) => a + b, 0);

        let finalDataArr = [...dataArr];
        let finalLabels = ['Residencial Plus', 'Residencial', 'Media', 'Económica'];
        let finalColors = [
            window.AppMap.tipologiaData['RP'].color,
            window.AppMap.tipologiaData['R'].color,
            window.AppMap.tipologiaData['M'].color,
            window.AppMap.tipologiaData['E'].color
        ];

        let customPcts = totalBase > 0 ? dataArr.map(val => Math.round((val / totalBase) * 100)) : [];
        const diff = totalBase - totalFiltered;
        if (totalBase > 0 && diff > 0) {
            finalDataArr.push(diff);
            finalLabels.push('Otros');
            finalColors.push('#333333');
            customPcts.push(-1);
        }

        window.mainChart.data.labels = finalLabels;
        window.mainChart.data.datasets[0].backgroundColor = finalColors;
        window.mainChart.data.datasets[0].data = finalDataArr;
        window.mainChart.data.datasets[0].customPcts = customPcts;
        window.mainChart.update();
    }

    function updateChartForColonia(coloniaFeature, allPointsGeoJSON) {
        if (window.AppUI) {
            window.AppUI.currentColoniaFeature = coloniaFeature;
            window.AppUI.currentZonaNucleo = null;
        }
        updateChartFromFilters();
    }

    function resetChartToAlcaldia(baseCounts) {
        if (window.AppUI) {
            window.AppUI.currentColoniaFeature = null;
            window.AppUI.currentZonaNucleo = null;
        }
        updateChartFromFilters();
    }

    function resetChartToZonasNucleoGlobal() {
        if (window.AppUI) {
            window.AppUI.currentColoniaFeature = null;
            window.AppUI.currentZonaNucleo = null;
        }
        updateChartFromFilters();
    }

    function updateChartForZonaNucleo(zonaName) {
        if (window.AppUI) {
            window.AppUI.currentZonaNucleo = zonaName;
            window.AppUI.currentColoniaFeature = null;
        }
        updateChartFromFilters();
    }

    let internalLineChart = null;

    function initLineChart() {
        const ctx = document.getElementById('line-chart-canvas');
        if (!ctx) return;

        internalLineChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Residencial Plus', data: [], borderColor: window.AppMap.tipologiaData['RP'].color, backgroundColor: window.AppMap.tipologiaData['RP'].color, tension: 0.1, fill: false, pointRadius: 1.5 },
                    { label: 'Residencial', data: [], borderColor: window.AppMap.tipologiaData['R'].color, backgroundColor: window.AppMap.tipologiaData['R'].color, tension: 0.1, fill: false, pointRadius: 1.5 },
                    { label: 'Media', data: [], borderColor: window.AppMap.tipologiaData['M'].color, backgroundColor: window.AppMap.tipologiaData['M'].color, tension: 0.1, fill: false, pointRadius: 1.5 },
                    { label: 'Económica', data: [], borderColor: window.AppMap.tipologiaData['E'].color, backgroundColor: window.AppMap.tipologiaData['E'].color, tension: 0.1, fill: false, pointRadius: 1.5 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: { family: "'Space Mono', monospace", size: 10 },
                            color: '#c7bebe',
                            padding: 8,
                            generateLabels: function(chart) {
                                return chart.data.datasets.map((ds, i) => {
                                    const meta = chart.getDatasetMeta(i);
                                    return {
                                        text: ds.label,
                                        fillStyle: meta.hidden ? 'rgba(199,190,190,0.2)' : ds.borderColor,
                                        strokeStyle: meta.hidden ? 'rgba(199,190,190,0.2)' : ds.borderColor,
                                        fontColor: meta.hidden ? 'rgba(199,190,190,0.3)' : '#c7bebe',
                                        hidden: false,
                                        datasetIndex: i
                                    };
                                });
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.datasetIndex;
                            const meta = legend.chart.getDatasetMeta(index);
                            meta.hidden = !meta.hidden;
                            legend.chart.update();
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        titleFont: { family: "'Space Mono', monospace", size: 10 },
                        bodyFont: { family: "'Space Mono', monospace", size: 10 },
                        padding: 6
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Año', font: { family: "'Space Mono', monospace", size: 10 }, color: '#c7bebe' },
                        ticks: { font: { family: "'Space Mono', monospace", size: 9 }, color: '#c7bebe', maxRotation: 45 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        title: { display: false },
                        ticks: { font: { family: "'Space Mono', monospace", size: 9 }, color: '#c7bebe' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateLineChartData(featuresToCount, actives, activesAbsorcion, startYear, startMonth, endYear, endMonth, isZonasMode = false, activeZonaName = null) {
        if (!window.AppCharts_Logic.lineChartInstance) return;

        const years = [];
        for (let y = startYear; y <= endYear; y++) {
            years.push(y);
        }

        const countsByYearAndGroup = {};
        
        // Define groups and colors depending on mode
        let groups = [];
        let groupColors = {};
        let colToGroupMap = {}; // Maps id_colonia to its corresponding line group

        // En el modo drill-down (una Zona o una Colonia) se muestran las 4 líneas clásicas por tipología.
        const showZonasLines = isZonasMode;

        if (showZonasLines) {
            const zonasData = window.AppMap.zonasNucleoData;
            for (const zona in zonasData) {
                groups.push(zona);
                groupColors[zona] = zonasData[zona].color;
                for (const colName in zonasData[zona].colonias) {
                    const resolvedCol = coloniaAliases[colName] || colName;
                    colToGroupMap[resolvedCol] = zona;
                }
            }
        } else {
            // Classic mode or Drill-Down specific zona mode
            groups = ['RP', 'R', 'M', 'E'];
            groups.forEach(g => {
                const tData = window.AppMap.tipologiaData[g];
                groupColors[g] = tData ? tData.color : '#ffffff';
            });
        }

        years.forEach(y => {
            countsByYearAndGroup[y] = {};
            groups.forEach(g => { countsByYearAndGroup[y][g] = 0; });
        });

        featuresToCount.forEach(feature => {
            const props = feature.properties;
            if (!props) return;
            if (!actives.includes(props.tipologia)) return;
            if (!activesAbsorcion.includes(props.rango_absor)) return;

            if (props.fecha_in) {
                const parts = props.fecha_in.split('-');
                if (parts.length >= 2) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    const fVal = y * 12 + m;
                    const startVal = startYear * 12 + startMonth;
                    const endVal = endYear * 12 + endMonth;
                    
                    if (fVal >= startVal && fVal <= endVal) {
                        if (countsByYearAndGroup[y]) {
                            let targetGroup = null;
                            if (showZonasLines) {
                                const col = props.id_colonia;
                                if (colToGroupMap[col]) {
                                    targetGroup = colToGroupMap[col];
                                }
                            } else {
                                targetGroup = props.tipologia;
                            }
                            
                            if (targetGroup && countsByYearAndGroup[y][targetGroup] !== undefined) {
                                countsByYearAndGroup[y][targetGroup]++;
                            }
                        }
                    }
                }
            }
        });

        const chart = internalLineChart;
        if (!chart) return;
        chart.data.labels = years;
        
        const newDatasets = [];
        groups.forEach((g) => {
            const dataPts = years.map(y => countsByYearAndGroup[y][g]);
            let labelName = g;
            let isHidden = false;

            if (!showZonasLines) {
                const mapNames = { 'RP': 'Residencial Plus', 'R': 'Residencial', 'M': 'Media', 'E': 'Económica' };
                labelName = mapNames[g] || g;
                isHidden = !actives.includes(g);
            }

            newDatasets.push({
                label: labelName,
                data: dataPts,
                borderColor: groupColors[g],
                backgroundColor: groupColors[g],
                tension: 0.1,
                fill: false,
                pointRadius: 1.5,
                hidden: isHidden
            });
        });

        chart.data.datasets = newDatasets;
        chart.update();
    }

    // ===== WATERFALL (CASCADA) CHART =====

    let internalWaterfallChart = null;

    function initWaterfallChart() {
        const ctx = document.getElementById('waterfall-chart-canvas');
        if (!ctx) return;

        internalWaterfallChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                    barPercentage: 0.7,
                    customPcts: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: { family: "'Space Mono', monospace", size: 9 },
                            color: '#c7bebe',
                            padding: 8,
                            generateLabels: function() {
                                return [
                                    { text: 'Aumento', fillStyle: '#166534', strokeStyle: '#166534', fontColor: '#c7bebe' },
                                    { text: 'Disminuci\u00f3n', fillStyle: '#991b1b', strokeStyle: '#991b1b', fontColor: '#c7bebe' }
                                ];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const pct = ctx.dataset.customPcts ? ctx.dataset.customPcts[ctx.dataIndex] : 0;
                                return pct >= 0 ? 'Crecimiento: +' + pct.toFixed(1) + '%' : 'Crecimiento: ' + pct.toFixed(1) + '%';
                            }
                        },
                        titleFont: { family: "'Space Mono', monospace", size: 10 },
                        bodyFont: { family: "'Space Mono', monospace", size: 10 },
                        padding: 6
                    }
                },
                scales: {
                    x: {
                        ticks: { font: { family: "'Space Mono', monospace", size: 9 }, color: '#c7bebe', maxRotation: 45 },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        title: { display: false },
                        ticks: {
                            font: { family: "'Space Mono', monospace", size: 9 },
                            color: '#c7bebe',
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    }

    /**
     * Ya no se usa de forma directa, updateChartFromFilters() se encarga de orquestar el flujo.
     */

    function updateWaterfallChartData(featuresToCount, actives, activesAbsorcion, startYear, startMonth, endYear, endMonth) {
        if (!internalWaterfallChart) return;

        const years = [];
        for (let y = startYear; y <= endYear; y++) {
            years.push(y);
        }

        const totalsByYear = {};
        years.forEach(y => { totalsByYear[y] = 0; });

        featuresToCount.forEach(feature => {
            const props = feature.properties;
            if (!props) return;
            if (!actives.includes(props.tipologia)) return;
            if (!activesAbsorcion.includes(props.rango_absor)) return;

            if (props.fecha_in) {
                const parts = props.fecha_in.split('-');
                if (parts.length >= 2) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    const fVal = y * 12 + m;
                    const startVal = startYear * 12 + startMonth;
                    const endVal = endYear * 12 + endMonth;

                    if (fVal >= startVal && fVal <= endVal) {
                        if (totalsByYear[y] !== undefined) {
                            totalsByYear[y]++;
                        }
                    }
                }
            }
        });

        const growthRates = [];
        const floatingBars = [];
        const bgColors = [];
        let cumulative = 0;

        years.forEach((y, i) => {
            if (i === 0) {
                growthRates.push(0);
                floatingBars.push([0, 0]);
                bgColors.push('rgba(128,128,128,0.3)');
            } else {
                const prev = totalsByYear[years[i - 1]];
                const curr = totalsByYear[y];
                let rate = 0;
                if (prev > 0) {
                    rate = ((curr - prev) / prev) * 100;
                }
                growthRates.push(rate);

                const bottom = cumulative;
                cumulative += rate;
                const top = cumulative;

                if (rate >= 0) {
                    floatingBars.push([bottom, top]);
                    bgColors.push('#166534');
                } else {
                    floatingBars.push([top, bottom]);
                    bgColors.push('#991b1b');
                }
            }
        });

        const chart = internalWaterfallChart;
        chart.data.labels = years;
        chart.data.datasets[0].data = floatingBars;
        chart.data.datasets[0].backgroundColor = bgColors;
        chart.data.datasets[0].customPcts = growthRates;
        chart.update();
    }

    return {
        initChart,
        updateChartFromFilters,
        updateChartForColonia,
        resetChartToAlcaldia,
        resetChartToZonasNucleoGlobal,
        updateChartForZonaNucleo,
        initLineChart,
        initWaterfallChart,
        get lineChartInstance() { return internalLineChart; },
        get waterfallChartInstance() { return internalWaterfallChart; }
    };
})();
