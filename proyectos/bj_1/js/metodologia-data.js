/**
 * Datos maestros de la Metodología.
 * Se procesarán de manera secuencial, sin reordenar alfabéticamente.
 */
const metodologiaData = [
    {
        term: "Origen de los Datos",
        def: "Los datos provienen de la base de datos de Softec, una empresa especializada en la consultoría e investigación inmobiliaria en México, detallando características de desarrollos inmobiliarios en la Alcaldía Benito Juárez desde el año 2000 al segundo trimestre de 2023."
    },
    {
        term: "Tasa de Crecimiento",
        def: `Este indicador analiza la variación porcentual anual de la oferta inmobiliaria. Permite cuantificar el dinamismo del sector, identificando momentos de auge o saturación mediante el cálculo de la diferencia relativa entre el volumen de desarrollos de un periodo frente a su antecesor inmediato.
        <div style="display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', Times, serif; font-size: 1.3rem; font-style: italic; margin-top: 30px; color: #eee;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="border-bottom: 1px solid rgba(255,255,255,0.7); padding: 0 15px 4px 15px;">Valor Final &minus; Valor Inicial</span>
                <span style="padding: 4px 15px 0 15px;">Valor Inicial</span>
            </div>
            <span style="margin-left: 15px; font-style: normal;">&times; 100</span>
        </div>`
    },
    {
        term: "Clasificación de rangos de absorción",
        def: `Para el análisis de la absorción se clasificó este valor en 10 rangos mediante una agrupación en intervalos de amplitud variable, ya que los datos no se distribuyen de forma uniforme (distribución normal); se puede notar una distribución asimétrica positiva (sesgada a la derecha). Lo cual significa que la gran mayoría de las unidades de análisis se concentran en los valores bajos del ritmo de absorción (0.5 y 1 departamento vendido al mes), mientras que los valores altos son más escasos.
        <table style="width: 40%; border-collapse: collapse; margin-top: 15px; margin-left: auto; margin-right: auto; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2);">
            <thead>
                <tr style="border-bottom: 2px solid rgba(255, 255, 255, 0.2); background-color: rgba(255, 255, 255, 0.05);">
                    <th style="padding: 10px; border-right: 1px solid rgba(255, 255, 255, 0.2);">Intervalo</th>
                    <th style="padding: 10px;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">0 - 0.49</td><td style="padding: 8px;">1,491</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">0.5 - 0.99</td><td style="padding: 8px;">999</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">1 - 1.9</td><td style="padding: 8px;">630</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">2 - 2.9</td><td style="padding: 8px;">202</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">3 - 3.9</td><td style="padding: 8px;">88</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">4 - 4.9</td><td style="padding: 8px;">47</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">5 - 5.9</td><td style="padding: 8px;">21</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">6 - 6.9</td><td style="padding: 8px;">28</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">7 - 7.9</td><td style="padding: 8px;">15</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">>8</td><td style="padding: 8px;">33</td></tr>
            </tbody>
        </table>`
    },
    {
        term: "Mapa de calor (Heatmap)",
        def: "El mapa de calor se creó utilizando el algoritmo de Estimación de Densidad Kernel (Kernel Density Estimation - KDE), un método no paramétrico para estimar la función de densidad de probabilidad de una variable aleatoria sin asumir una distribución subyacente, el cual se aplicó sobre la capa de puntos que representaban los desarrollos inmobiliarios totales con un radio de 400 metros previamente definido. "
    },
    {
        term: "Zonas Núcleo",
        def: "Mediante los resultados obtenidos por el mapa de calor, se identifican 6 zonas núcleo: 3 principales y 3 secundarias; dentro de las principales, 2 se encuentran contenidas dentro de colonias individuales, este es el caso de la colonia Narvarte Oriente (Zona núcleo principal A) y Portales Oriente (Zona núcleo principal B); la última se ubica entre la colonia Del Carmen y la colonia Zacahuitzco, abarcando ambas (Zona núcleo principal C). Las 3 zonas núcleo secundarias cuentan con una menor densidad de desarrollos inmobiliarios y también están compuestas por más de una colonia: la primera, ubicada en la parte norte, conformada por las colonias Del Valle Norte, Del Valle Centro y Narvarte Poniente (Zona núcleo secundaria A); la segunda en la parte suroriente, conformada por las colonias Portales Norte y Portales Sur (Zona núcleo secundaria B); y por último se encuentra la tercera en la parte norponiente de la Alcaldía, conformada por las colonias Nápoles y Ampliación Nápoles (Zona núcleo secundaria C). "
    },
    {
        term: "Estimación de ingresos",
        def: `Para desarrollar la estimación de ingresos por manzana se utilizaron los datos de la Encuesta Nacional de Ingreso y Gasto de los Hogares <a href="https://www.inegi.org.mx/programas/enigh/nc/2020/#documentacion" target="_blank" style="color: var(--color-accent); text-decoration: none;">(ENIGH 2020)</a>, junto con la variable de escolaridad obtenida en el Sistema de Consulta de Información Censal <a href="https://gaia.inegi.org.mx/scince2020/" target="_blank" style="color: var(--color-accent); text-decoration: none;">(SCINCE 2020)</a>. El cruce de ambas variables resultó en la obtención de los ingresos trimestrales nominales por grado de escolaridad, resultando en los ingresos mensuales aproximados a nivel de manzana. Posteriormente, se clasificaron las manzanas por deciles; a continuación la tabla de deciles:
        <table style="width: 40%; border-collapse: collapse; margin-top: 15px; margin-left: auto; margin-right: auto; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2);">
            <thead>
                <tr style="border-bottom: 2px solid rgba(255, 255, 255, 0.2); background-color: rgba(255, 255, 255, 0.05);">
                    <th style="padding: 10px; border-right: 1px solid rgba(255, 255, 255, 0.2);">Decil</th>
                    <th style="padding: 10px;">Ingreso Mensual (MXN)</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">I</td><td style="padding: 8px;">5,036</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">II</td><td style="padding: 8px;">7,911</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">III</td><td style="padding: 8px;">10,074</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">IV</td><td style="padding: 8px;">12,598</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">V</td><td style="padding: 8px;">15,606</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">VI</td><td style="padding: 8px;">18,680</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">VII</td><td style="padding: 8px;">22,683</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">VIII</td><td style="padding: 8px;">27,995</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">IX</td><td style="padding: 8px;">36,743</td></tr>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"><td style="padding: 8px; border-right: 1px solid rgba(255, 255, 255, 0.1);">X</td><td style="padding: 8px;">67,195</td></tr>
            </tbody>
        </table>`
    },
    {
        term: "Indicadores de Vivienda",
        def: `Una vez obtenidos los ingresos por manzana se calculó el ingreso promedio anual y mensual por manzana, lo que permitió el desarrollo de los indicadores PIR y HAI:
        
        <div style="display: flex; flex-direction: column; align-items: center; margin-top: 30px; gap: 30px; color: #eee;">
            <!-- Formula PIR -->
            <div style="display: flex; align-items: center; font-family: 'Times New Roman', Times, serif; font-size: 1.3rem; font-style: italic;">
                <span style="margin-right: 15px; font-style: normal; font-weight: bold; font-family: var(--font-primary, sans-serif);">PIR =</span>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <span style="border-bottom: 1px solid rgba(255,255,255,0.7); padding: 0 15px 4px 15px;">Precio promedio de vivienda</span>
                    <span style="padding: 4px 15px 0 15px;">Ingreso anual</span>
                </div>
            </div>

            <!-- Formula HAI -->
            <div style="display: flex; align-items: center; font-family: 'Times New Roman', Times, serif; font-size: 1.3rem; font-style: italic;">
                <span style="margin-right: 15px; font-style: normal; font-weight: bold; font-family: var(--font-primary, sans-serif);">HAI =</span>
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <span style="border-bottom: 1px solid rgba(255,255,255,0.7); padding: 0 15px 4px 15px;">Pago mensual de hipoteca</span>
                    <span style="padding: 4px 15px 0 15px;">40% del ingreso del hogar</span>
                </div>
                <span style="margin-left: 15px; font-style: normal;">&times; 100</span>
            </div>
        </div>`
    }
];

// Exportación global para que ui.js pueda consumirlo
window.AppMetodologia_Data = metodologiaData;
