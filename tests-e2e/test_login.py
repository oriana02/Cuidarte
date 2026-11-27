import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # COMENTADO: Descomenta esto solo para GitHub Actions
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()

def test_login_flujo_exitoso(driver):
    # 1. Ir a la página de login (lo cambiamos a 3333 porque me dijiste que ahí corre)
    driver.get("http://localhost:3333/login")
    wait = WebDriverWait(driver, 10)

    # 2. Escribir en el campo de usuario y contraseña
    input_usuario = wait.until(EC.presence_of_element_located((By.NAME, "nombre_usuario")))
    input_password = driver.find_element(By.NAME, "password")
    
    input_usuario.send_keys("admin")
    input_password.send_keys("admin")

    # 3. Hacer clic en el botón de login (buscándolo por su tipo "submit")
    btn_login = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    btn_login.click()

    # 4. Hacer una pausa de 2 segundos para que la petición al backend responda
    time.sleep(2) 

    # 5. Verificar que redirige al Home (o que la URL cambió)
    assert "login" not in driver.current_url.lower(), f"Fallo: Seguimos en el login. URL actual: {driver.current_url}"