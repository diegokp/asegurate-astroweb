export const schemaHogar = `{
  "@context":"https://schema.org",
  "@graph":[
    {
      "@type":"BreadcrumbList",
      "@id":"https://aseguratte.es/seguro-las-palmas/hogar/#breadcrumb",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Inicio","item":"https://aseguratte.es/"},
        {"@type":"ListItem","position":2,"name":"Seguros","item":"https://aseguratte.es/seguros/"},
        {"@type":"ListItem","position":3,"name":"Seguro de Hogar","item":"https://aseguratte.es/seguros/hogar/"}
      ]
    },
    {
      "@type":"Service",
      "@id":"https://aseguratte.es/seguros/hogar/#service",
      "name":"Seguro de Hogar en Las Palmas (Canarias)",
      "serviceType":"Home insurance",
      "category":"Insurance",
      "areaServed":["Las Palmas de Gran Canaria","Gran Canaria","Islas Canarias"],
      "provider":{"@id":"https://aseguratte.es/#agency"},
      "url":"https://aseguratte.es/seguros/hogar/",
      "description":"Asesoramiento y contratación de seguro de hogar para vivienda habitual, segunda residencia o alquiler. Comparativa de coberturas y compañías con atención local en Las Palmas."
    },
    {
      "@type":"FAQPage",
      "@id":"https://aseguratte.es/seguros/hogar/#faq",
      "mainEntity":[
        {
          "@type":"Question",
          "name":"¿Qué cubre normalmente un seguro de hogar?",
          "acceptedAnswer":{"@type":"Answer","text":"Suele incluir daños en el continente (estructura) y/o contenido (mobiliario), responsabilidad civil, asistencia en el hogar y coberturas opcionales según póliza y compañía."}
        },
        {
          "@type":"Question",
          "name":"¿Cuál es la diferencia entre continente y contenido?",
          "acceptedAnswer":{"@type":"Answer","text":"El continente es la estructura de la vivienda (paredes, suelos, instalaciones), y el contenido son los bienes dentro del hogar (muebles, electrodomésticos, objetos personales)."}
        },
        {
          "@type":"Question",
          "name":"¿Necesito seguro de hogar si tengo hipoteca?",
          "acceptedAnswer":{"@type":"Answer","text":"Por ley no siempre es obligatorio, pero la entidad financiera suele exigir cobertura para el continente. Conviene revisar condiciones y comparar opciones fuera del banco."}
        },
        {
          "@type":"Question",
          "name":"¿Se puede asegurar una vivienda en alquiler?",
          "acceptedAnswer":{"@type":"Answer","text":"Sí. El propietario puede asegurar el continente y la responsabilidad civil; el inquilino puede asegurar su contenido y RC como arrendatario, según necesidades."}
        },
        {
          "@type":"Question",
          "name":"¿Cómo se calcula el capital asegurado del contenido?",
          "acceptedAnswer":{"@type":"Answer","text":"Se estima según el valor de reposición de los bienes. Un inventario básico ayuda a evitar infraseguro o sobreseguro."}
        }
      ]
    }
  ]
}`;
