$(document).ready(function () {
    loadPersonalRol(); // Cambiar el nombre a loadPersonalRol
    loadPersonal(); 

    function loadPersonalRol() {
        $.get('/personalroles', function (data) { 
            const rolSelect = $('#PersonalRolId');
            rolSelect.empty(); 
            rolSelect.append(`<option value="">Selecciona un rol</option>`); // Opción por defecto
            data.forEach(function (rol) {
                rolSelect.append(`<option value="${rol.PersonalRolId}">${rol.PersonalRolDescripcion}</option>`);
            });
        }).fail(function (xhr) {
            console.error('Error al cargar los roles:', xhr.responseText);
        });
    }

    function loadPersonal() {
        $.get('/personal', function (data) {
            $('#personalTableBody').empty(); // Limpiar la tabla existente
            data.forEach(function (personal) {
                $('#personalTableBody').append(`
                    <tr>
                        <td>${personal.PersonalId}</td>
                        <td>${personal.PersonalNombre}</td>
                        <td>${personal.PersonalPrimerApellido}</td>
                        <td>${personal.PersonalSegundoApellido}</td>
                        <td>${personal.PersonalRolDescripcion || 'Sin Rol'}</td>
                        <td>${personal.PersonalFechaModificacion}</td>
                        <td>${personal.PersonalEstatus}</td>
                        <td>${personal.PersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editPersonal(${personal.PersonalId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deletePersonal(${personal.PersonalId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#personalTable').removeClass('d-none'); // Mostrar la tabla
        }).fail(function (xhr) {
            console.error('Error al cargar el personal:', xhr.responseText);
        });
    }

    $('#btnAddPersonal').on('click', function () {
        resetForm(); 
        $('#formContainer').removeClass('d-none'); 
    });

    $('#PersonalForm').on('submit', function (e) {
        e.preventDefault(); 
        
        const personalId = $('#PersonalId').val();
        const personalData = {
            PersonalNombre: $('#PersonalNombre').val(),
            PersonalPrimerApellido: $('#PersonalPrimerApellido').val(),
            PersonalSegundoApellido: $('#PersonalSegundoApellido').val(),
            PersonalContrasena: $('#PersonalContrasena').val(),
            PersonalRolId: $('#PersonalRolId').val()
        };
    
        if (personalId) { // Si existe un ID, es una actualización
            $.ajax({
                url: `/personal/${personalId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(personalData),
                success: function () {
                    loadPersonal();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar el personal.');
                }
            });
        } else { // Si no existe un ID, es una creación
            $.ajax({
                url: '/personal',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(personalData),
                success: function () {
                    loadPersonal();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear el personal.');
                }
            });
        }
    });

    window.editPersonal = function (id) {
        $.get(`/personal/${id}`, function (data) {
            $('#PersonalId').val(data.PersonalId);
            $('#PersonalNombre').val(data.PersonalNombre);
            $('#PersonalPrimerApellido').val(data.PersonalPrimerApellido);
            $('#PersonalSegundoApellido').val(data.PersonalSegundoApellido);
            $('#PersonalContrasena').val(data.PersonalContrasena); 
            $('#PersonalRolId').val(data.PersonalRolId); 
            
            $('#formContainer').removeClass('d-none'); 
        }).fail(function () {
            alert('Error al cargar los datos del personal.');
        });
    };

    window.deletePersonal = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este personal?')) {
            $.ajax({
                url: `/personal/${id}`,
                type: 'DELETE',
                success: function () {
                    loadPersonal(); 
                },
                error: function (xhr) {
                    alert('Error al eliminar el personal.');
                    console.error('Error:', xhr.responseText);
                }
            });
        }
    };

    function resetForm() {
        $('#PersonalId').val('');
        $('#PersonalNombre').val('');
        $('#PersonalPrimerApellido').val('');
        $('#PersonalSegundoApellido').val('');
        $('#PersonalContrasena').val('');
        $('#PersonalRolId').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);
});