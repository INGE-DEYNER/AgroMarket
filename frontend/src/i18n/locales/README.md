# Idiomas

## Decisión de ASAFRUT: solo español e inglés

La plataforma se publica en **es** y **en**. Es lo que se carga en
`src/i18n/index.js` (`supportedLngs`) y lo que el selector de idioma deja
elegir.

Esto no es que los otros idiomas fallen: es que **están incompletos**, y medio
completos se ven peor que no existir.

## Qué hay en esta carpeta

| Archivo | Estado | Claves |
|---|---|---|
| `es.json` | **se publica** | 1014 / 1014 |
| `en.json` | **se publica** | 1014 / 1014 |
| `pt.json` | borrador | 710 / 1014 |
| `fr.json` | borrador | 710 / 1014 |
| `de.json` | borrador | 710 / 1014 |
| `zh.json` | borrador | 710 / 1014 |
| `ar.json` | borrador | 710 / 1014 |

Los cinco borradores **no se cargan**. Se conservan porque el trabajo de
traducción hecho sirve, pero no deben tocarse esperando que sirvan de algo.

## Por qué no se habilitan tal cual

Las 304 claves que faltan en cada uno **no son texto secundario**. Son la
portada:

```
home.categories.title         Categorías Destacadas
home.categories.passionFruit  Maracuyá
home.categories.coffee        Cacao y Café
home.categories.roots         Tubérculos y Raíces
home.footerUi.howItWorks      Cómo funciona
home.farmers.button           Conoce a los Productores
```

Habilitarlos así daría exactamente esto: el visitante elige alemán, y la
cabecera, los botones y el menú salen en alemán, **mientras los nombres de las
categorías y todo el pie salen en español**. Eso no se lee como "traducción
pendiente": se lee como aplicación rota. Y en una tienda, donde el usuario está
eligiendo qué comprar, una lista de categorías mezcla dos idiomas es el peor
sitio posible para que ese error pase desapercibido.

## Por qué no basta con terminar de traducir

Porque faltaría además revisar con un nativo, y eso no se puede hacer a máquina.

No son palabras genéricas. Son cultivos concretos de la región: maracuyá,
plátanos y banano, tubérculos y raíces, cacao y café. Una traducción automática
puede ser sintácticamente correcta y culturalmente absurda para un agricultor de
Urabá. Nadie lo valida sin un hablante.

**Y el árabe además necesita soporte RTL**, que el proyecto no tiene:
`src/i18n/index.js` tenía `documentElement.dir = "ltr"` fijo (ahora ya calcula el
valor correcto a partir del idioma, pero el resto del layout sigue sin
espejado). Aunque las 304 claves estuvieran perfectas, el árabe se leería mal:
el menú, el carrito y las flechas seguirían orientados a la izquierda. Tailwind
admite `rtl:`, pero no hay ni una regla en el proyecto.

## Si algún día se decide publicarlos

1. Terminar las 304 claves del idioma.
2. Validarlo con un hablante nativo.
3. Si es árabe, invertir en RTL: espejar el layout, el menú, el carrito y las
   flechas.
4. Pasarlo a `supportedLngs` en `src/i18n/index.js`.
5. En `LanguageSwitcher.jsx`, poner `available: true`.
6. `node scripts/revisa-idiomas.cjs` debe pasar. Si no pasa, significa que
   quedan claves sueltas y se verían en español.

## Cómo comprobar el estado

```bat
node scripts\audita-traducciones.cjs   :: informe detallado, con ejemplos
node scripts\revisa-idiomas.cjs        :: falla (codigo 1) si se activa uno incompleto
```

El segundo es el que debería ir en la CI. El primero es para mirar cuando
alguien pregunte cuánto falta.