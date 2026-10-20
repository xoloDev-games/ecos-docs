# Ecos — Documentación

Sitio público de documentación de **Ecos**, el motor de propagación y degradación de
rumores para NPCs de Unity.

- Sitio: <https://xolodev-games.github.io/ecos-docs/>
- Asset: `com.xolodev.ecos` v1.1.0
- Unity mínimo: **6.3 LTS (6000.3)**
- Modelo semántico: **opcional, no incluido**

## Contenido

La documentación cubre:

- instalación UPM, sample y primera escena;
- conceptos, configuración, biblioteca, cantidades, emisión y escucha;
- NPCs, perfiles, memoria y reacciones;
- descarga del modelo recomendado, exportación ONNX FP16 e integración en Unity;
- recetas, referencia de API y solución de problemas;
- arquitectura interna, decisiones de diseño, licencias y soporte.

Los textos viven en `src/content/docs/`. El índice, los títulos, las secciones y las
descripciones de navegación se declaran en `src/docs.js`.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite. El sitio usa `BrowserRouter`; en producción se sirve bajo
`/ecos-docs/`.

## Build

```bash
npm run build
npm run preview
```

Genera `dist/` con el sitio estático. El workflow de GitHub Pages lo publica en cada push
a `main`.

## Añadir o editar una página

1. Crea o edita el Markdown en `src/content/docs/`.
2. Añade la importación `?raw` y la entrada en `src/docs.js`.
3. Asigna `slug`, `title`, `description`, `section`, `icon` y `file`.
4. Si la página enlaza a otros `.md`, el renderizador los convierte a rutas `/docs/...`
   usando `slugByFile`.
5. Ejecuta `npm run build` para comprobar que no hay errores.

## Enlaces e imágenes

- Las imágenes relativas se sirven desde `public/images/`.
- Los archivos descargables viven en `public/downloads/`.
- El script de exportación FP16 está en
  `public/downloads/exportar_fp16.py`.

## Licencia

El contenido de documentación y el código de este sitio son © 2026 xoloDev. El asset Ecos
se rige por su licencia comercial. El modelo recomendado conserva su licencia Apache 2.0 y
no se distribuye en este repositorio.

## Soporte

- Email: <xoloDev.games@gmail.com>
- Documentación: <https://xolodev-games.github.io/ecos-docs/>
- Repositorio: <https://github.com/xoloDev-games/ecos-docs>
