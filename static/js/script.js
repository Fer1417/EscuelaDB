document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

            const personalId = document.getElementById('personalId').value;
            const personalContrasena = document.getElementById('personalContrasena').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        PersonalId: personalId,
                        PersonalContrasena: personalContrasena
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    loadMenus(data.menus); // Llama a la función loadMenus
                    window.location.href = '/principal'; // Redirigir a otra ruta si es necesario
                } else {
                    const data = await response.json();
                    document.getElementById('error-message').textContent = data.message;
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('error-message').textContent = 'Ocurrió un error al intentar iniciar sesión.';
            }
        });
    } else {
        console.error("El formulario de inicio de sesión no se encontró.");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

            const personalId = document.getElementById('personalId').value;
            const personalContrasena = document.getElementById('personalContrasena').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        PersonalId: personalId,
                        PersonalContrasena: personalContrasena
                    }),
                });

                if (response.ok) {
                    // Llama a la ruta para obtener los menús
                    const menuResponse = await fetch('/get_menus');
                    const menus = await menuResponse.json();
                    loadMenus(menus); // Carga los menús en el sidebar
                    window.location.href = '/principal'; // Redirigir a otra ruta si es necesario
                } else {
                    const data = await response.json();
                    document.getElementById('error-message').textContent = data.message;
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('error-message').textContent = 'Ocurrió un error al intentar iniciar sesión.';
            }
        });
    } else {
        console.error("El formulario de inicio de sesión no se encontró.");
    }
});