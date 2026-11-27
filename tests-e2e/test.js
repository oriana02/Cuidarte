const { Builder, By, until } = require("selenium-webdriver");
const assert = require("chai").assert;

describe("Pruebas E2E - Login CuidartePlus", function () {
  this.timeout(30000); // 30 segundos de espera máximo
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async function () {
    await driver.quit();
  });

  it("Debería cargar la página y mostrar el formulario", async function () {
    // Asumimos que el frontend corre en el puerto 3333
    await driver.get("http://localhost:3333");

    // Esperar a que cargue el título o algún elemento
    const titulo = await driver.getTitle();
    assert.isNotEmpty(titulo, "El título no debe estar vacío");
  });

  it("Debería intentar hacer login", async function () {
    await driver.get("http://localhost:3333/login");

    // Esperar a que el input exista (asegúrate de que estos IDs o nombres coincidan con tu React/Vue)
    let inputUsuario = await driver.wait(
      until.elementLocated(By.name("nombre_usuario")),
      5000,
    );
    let inputPassword = await driver.findElement(By.name("password"));
    let botonLogin = await driver.findElement(By.css('button[type="submit"]'));

    await inputUsuario.sendKeys("admin");
    await inputPassword.sendKeys("admin");
    await botonLogin.click();

    // Esperar a que cambie la URL o aparezca un mensaje (ajústalo a tu frontend)
    await driver.wait(until.urlContains("/dashboard"), 5000);
  });
});
