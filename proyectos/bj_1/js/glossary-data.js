/**
 * Datos maestros del Glosario de Términos Inmobiliarios.
 * Se pueden añadir nuevos términos siguiendo la estructura: { term: 'Título', def: 'Definición' }
 */
const glossaryData = [
    {
        term: "Absorción",
        def: "Este termino hace referencia a la velocidad con la que los inmuebles son vendidos en un periodo de tiempo determinado para este caso meses, es decir, la rapidez con la que se absorben por el mercado."
    },
    {
        term: "Tipologías",
        def: "Clasificación de los inmuebles basada en características comunes como los metros cuadrados construidos, el nivel de acabados y las amenidades incluidas, en este caso se clasificaon por su rango de precio.\n<span style='color: #eeb303ff; font-weight: bold;'>Economica:</span> De $410,001 a $800,000 pesos.\n<span style='color: #d30707ff; font-weight: bold;'>Media:</span> De $800,001 a $2,000,000 de pesos.\n<span style='color: #004dc0ff; font-weight: bold;'>Residencial:</span> De $2,000,001 a $4,200,000 de pesos.\n<span style='color: #e707e7ff; font-weight: bold;'>Residencial Plus:</span> Más de $4,200,000 de pesos."
    },
    {
        term: "Zona Núcleo",
        def: "Zona de alta densidad de desarrollos inmobiliarios habitacionales, se definen por su alta concentracion de desarrollos en una misma area. Estas zonas se pueden conformar por una o más colonias."
    },
    {
        term: "Indicadores de Vivienda",
        def: "Compuesto por dos indicadores en materia habitacional PIR y HAI. \nPIR (Price-to-Income Ratio o Relación Precio-Ingreso): Mide la capacidad de compra de una vivienda considerando el total de los ingresos anuales, determina el esfuerzo económico que representa adquirir una vivienda. Se representa en cuantos años de ingresos totales son necesarios para pagar la vivienda. \nHAI (Housing Affordability Index o Índice de Accesibilidad a la Vivienda): Mide la capacidad real que tiene un hogar promedio de acceder a una vivienda mediante un crédito hipotecario estándar. Representa cuantos hogares pueden pagar la vivienda mediante una hipoteca destinando el 40% de su ingreso al crédito hipotecario."
    }, 
    {
        term: "Mapa de Calor (Heatmap)",
        def: "Un Mapa de calor o Heatmap es una representación gráfica de la intensidad de un conjunto datos en distintos puntos geográficos, destacando areas o zonas donde existe una mayor concentracion de valores en el territorio, en este estudio se utilizo para la definicion de las zonas nucleo. "
    }
];

// Exportación global para que ui.js pueda consumirlo
window.AppGlossary_Data = glossaryData;
