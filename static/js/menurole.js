$(document).ready(function () {
    loadMenuRoles();

    function getDataForSelectOptions(callback) {
        Promise.all([
            fetch('/personalroles'), // Obtener personal roles
            fetch('/menus') // Obtener menús
        ])
        .then(([response1, response2]) => {
            return Promise.all([response1.json(), response2.json()]);
        })
        .then(([personalRolesJson, menusJson]) => {
            const personalRolesArray = personalRolesJson.map(role => ({
                label: role.PersonalRolDescripcion,
                value: role.PersonalRolId
            }));

            const menusArray = menusJson.map(menu => ({
                label: menu.MenuDescripcion,
                value: menu.MenuId
            }));

            callback({ personalRolesArray, menusArray });
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            alert("Ha habido un problema al obtener los datos");
        });
    }
    
    function loadMenuRoles() {
        $.get('/menuroles', function (data) {
            $('#menuRolTableBody').empty();
            data.forEach(function (menuRole) {
                $('#menuRolTableBody').append(`
                    <tr>
                        <td>${menuRole.MenuRolId}</td>
                        <td>${menuRole.PersonalRolDescripcion}</td>
                        <td>${menuRole.MenuDescripcion}</td>
                        <td>${menuRole.MenuRolFechaModificacion}</td>
                        <td>${menuRole.MenuRolEstatus}</td>
                        <td>${menuRole.MenuRolPersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editMenuRole(${menuRole.MenuRolId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteMenuRole(${menuRole.MenuRolId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#menuRolTable').removeClass('d-none'); 
        }).fail(function (xhr) {
            console.error('Error al cargar los menús roles:', xhr.responseText);
        });
    }

    $('#btnAddMenuRol').on('click', function () {
        resetForm(); 
        getDataForSelectOptions(function(selectOptions) {
            // Cargar opciones en los select
            const personalRoleSelect = $('#PersonalRolId');
            const menuSelect = $('#MenuId');

            personalRoleSelect.empty();
            menuSelect.empty();

            selectOptions.personalRolesArray.forEach(option => {
                personalRoleSelect.append(`<option value="${option.value}">${option.label}</option>`);
            });

            selectOptions.menusArray.forEach(option => {
                menuSelect.append(`<option value="${option.value}">${option.label}</option>`);
            });

            $('#formContainer').removeClass('d-none'); 
        });
    });

    $('#MenuRolForm').on('submit', function (e) {
        e.preventDefault(); 
        
        const menuRolId = $('#MenuRolId').val();
        const menuRoleData = {
            PersonalRolId: $('#PersonalRolId').val(),
            MenuId: $('#MenuId').val()
        };
    
        if (menuRolId) {
            // Actualizar menú rol
            $.ajax({
                url: `/menurole/${menuRolId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(menuRoleData),
                success: function () {
                    loadMenuRoles();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar el menú rol.');
                    console.error('Error:', xhr.responseText);
                }
            });
        } else {
            // Crear nuevo menú rol
            $.ajax({
                url: '/menurole',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(menuRoleData),
                success: function () {
                    loadMenuRoles(); 
                    resetForm();
                },
                error: function (xhr) {
                    console.error('Error al crear el menú rol:', xhr.responseText);
                    alert('Error al crear el menú rol.');
                }
            });
        }
    });

    window.editMenuRole = function (id) {
        $.get(`/menurole/${id}`, function (data) {
            $('#MenuRolId').val(data.MenuRolId);
            $('#PersonalRolId').val(data.PersonalRolId);
            $('#MenuId').val(data.MenuId);
            
            // Cargar nuevamente las opciones en caso de editar
            getDataForSelectOptions(function(selectOptions) {
                const personalRoleSelect = $('#PersonalRolId');
                const menuSelect = $('#MenuId');

                personalRoleSelect.empty();
                menuSelect.empty();

                selectOptions.personalRolesArray.forEach(option => {
                    personalRoleSelect.append(`<option value="${option.value}">${option.label}</option>`);
                });

                selectOptions.menusArray.forEach(option => {
                    menuSelect.append(`<option value="${option.value}">${option.label}</option>`);
                });

                $('#formContainer').removeClass('d-none'); 
                
                // Establecer el valor seleccionado en el formulario
                personalRoleSelect.val(data.PersonalRolId);
                menuSelect.val(data.MenuId);
                
            });
            
        }).fail(function () {
            alert('Error al cargar los datos del menú rol.');
        });
    };

    window.deleteMenuRole = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este menú rol?')) {
            $.ajax({
                url: `/menurole/${id}`,
                type: 'DELETE',
                success: function () {
                    loadMenuRoles(); 
                },
                error: function (xhr) {
                    alert('Error al eliminar el menú rol.');
                    console.error('Error:', xhr.responseText);
                }
            });
        }
    };

    function resetForm() {
        $('#MenuRolId').val('');
        $('#PersonalRolId').val('');
        $('#MenuId').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);
});