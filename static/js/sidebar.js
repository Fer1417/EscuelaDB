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
                    loadMenus(data.menus); 
                    window.location.href = '/principal';
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

function loadMenus(menus) {
    const menuList = document.getElementById('menuList');
    
    if (!menuList) {
        console.error("El elemento menuList no se encontró.");
        return; 
    }
    
    menuList.innerHTML = ''; 

    menus.forEach(menu => {
        const listItem = document.createElement('a');
        listItem.href = menu.MenuUrl || '#'; // Asegúrate de tener una propiedad URL en tu menú si es necesario
        listItem.className = 'list-group-item list-group-item-action bg-dark text-light';
        listItem.innerHTML = `<i class="fa-solid fa-link mr-3"></i>${menu.MenuDescripcion}`; // Ajusta el icono según sea necesario
        menuList.appendChild(listItem);
    });
}