$(document).ready(function () {
    loadMenus();

    function loadMenus() {
        $.get('/menus', function (data) {
            $('#menuTableBody').empty();
            data.forEach(function (menu) {
                $('#menuTableBody').append(`
                    <tr>
                        <td>${menu.MenuId}</td>
                        <td>${menu.MenuDescripcion}</td>
                        <td>${menu.MenuFechaModificacion}</td>
                        <td>${menu.MenuEstatus}</td>
                        <td>${menu.MenuPersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editMenu(${menu.MenuId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteMenu(${menu.MenuId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#menuTable').removeClass('d-none'); 
        });
    }

    $('#btnAddMenu').on('click', function () {
        resetForm(); 
        $('#formContainer').removeClass('d-none'); 
    });

    $('#MenuForm').on('submit', function (e) {
        e.preventDefault();
        
        const menuId = $('#MenuId').val();
        const menuData = {
            MenuDescripcion: $('#MenuDescripcion').val()
        };
    
        if (menuId) {
            $.ajax({
                url: `/menu/${menuId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(menuData),
                success: function () {
                    loadMenus();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar el menú.');
                }
            });
        } else {
            $.ajax({
                url: `/menu`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(menuData),
                success: function () {
                    loadMenus();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear el menú.');
                }
            });
        }
    });

    window.editMenu = function (id) {
        $.get(`/menu/${id}`, function (data) {
            $('#MenuId').val(data.MenuId);
            $('#MenuDescripcion').val(data.MenuDescripcion);
            $('#formContainer').removeClass('d-none'); 
        }).fail(function () {
            alert('Error al cargar los datos del menú.');
        });
    };

    window.deleteMenu = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este menú?')) {
            $.ajax({
                url: `/menu/${id}`,
                type: 'DELETE',
                success: function () {
                    loadMenus(); 
                },
                error: function (xhr) {
                    alert('Error al eliminar el menú.');
                }
            });
        }
    };

    function resetForm() {
        $('#MenuId').val('');
        $('#MenuDescripcion').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);

});