const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // Cambia el puerto si tu servidor usa otro
    setupNodeEvents(on, config) {
      // Puedes agregar aquí listeners personalizados si los necesitas
      // Ejemplo: on('before:browser:launch', () => { ... })
    },
    specPattern: "cypress/e2e/**/*.cy.js", // Ruta donde están los test E2E
    supportFile: "cypress/support/e2e.js", // Archivo de configuración global
    screenshotsFolder: "cypress/screenshots", // Carpeta de screenshots
    videosFolder: "cypress/videos", // Carpeta de videos
    downloadsFolder: "cypress/downloads", // Carpeta de descargas (si se usa)
    chromeWebSecurity: false, // Desactiva restricciones para localhost
    viewportWidth: 1280,
    viewportHeight: 800
  },
  reporter: "spec", // Formato de reporte
  retries: {
    runMode: 1,
    openMode: 0
  },
  video: true, // Graba los tests en ejecución
});
