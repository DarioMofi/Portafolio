/**
 * Datos maestros del Glosario de Términos Inmobiliarios.
 * Se pueden añadir nuevos términos siguiendo la estructura: { term: 'Título', def: 'Definición' }
 */
const glossaryData = [
    {
        term: "Absorción",
        def: "Este término hace referencia a la velocidad con la que los inmuebles son vendidos en un periodo de tiempo determinado para este caso, meses; es decir, la rapidez con la que se absorben por el mercado."
    },
    {
        term: "Tipologías",
        def: "Clasificación de los inmuebles basada en características comunes como los metros cuadrados construidos, el nivel de acabados y las amenidades incluidas; en este caso se clasificaron por su rango de precio.\n<span style='color: #eeb303ff; font-weight: bold;'>Económica:</span> De $410,001 a $800,000 pesos.\n<span style='color: #d30707ff; font-weight: bold;'>Media:</span> De $800,001 a $2,000,000 de pesos.\n<span style='color: #004dc0ff; font-weight: bold;'>Residencial:</span> De $2,000,001 a $4,200,000 de pesos.\n<span style='color: #e707e7ff; font-weight: bold;'>Residencial Plus:</span> Más de $4,200,000 de pesos."
    },
    {
        term: "Zona Núcleo",
        def: "Zona de alta densidad de desarrollos inmobiliarios habitacionales, se definen por su alta concentración de desarrollos en una misma área. Estas zonas se pueden conformar por una o más colonias."
    },
    {
        term: "Indicadores de Vivienda",
        def: "Compuesto por dos indicadores en materia habitacional: PIR y HAI. \nPIR (Price-to-Income Ratio o Relación Precio-Ingreso): Mide la capacidad de compra de una vivienda considerando el total de los ingresos anuales; determina el esfuerzo económico que representa adquirir una vivienda. Se representa en cuántos años de ingresos totales son necesarios para pagar la vivienda. \nHAI (Housing Affordability Index o Índice de Accesibilidad a la Vivienda): Mide la capacidad real que tiene un hogar promedio de acceder a una vivienda mediante un crédito hipotecario estándar. Representa cuántos hogares pueden pagar la vivienda mediante una hipoteca destinando el 40% de su ingreso al crédito hipotecario."
    }, 
    {
        term: "Mapa de Calor (Heatmap)",
        def: "Un Mapa de calor o Heatmap es una representación gráfica de la intensidad de un conjunto de datos en distintos puntos geográficos, destacando áreas o zonas donde existe una mayor concentración de valores en el territorio; en este estudio se utilizó para la definición de las zonas núcleo."
    },
    {
        term: "Tasa de Crecimiento",
        def: "Representa el ritmo de incremento o decremento porcentual de los desarrollos inmobiliarios en un periodo determinado. Permite identificar tendencias de expansión o contracción del mercado habitacional mediante la comparación de datos históricos."
    }
];

// Exportación global para que ui.js pueda consumirlo
window.AppGlossary_Data = glossaryData;
