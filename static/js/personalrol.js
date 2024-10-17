$(document).ready(function () {
    const apiUrl = '/personalrol'; // Definir la variable apiUrl
    loadPersonalRoles();

    function loadPersonalRoles() {
        $.get('/personalroles', function (data) {
            $('#personalRolTableBody').empty(); 
            data.forEach(function (personalRol) {
                $('#personalRolTableBody').append(`
                    <tr>
                        <td>${personalRol.PersonalRolId}</td>
                        <td>${personalRol.PersonalRolDescripcion}</td>
                        <td>${personalRol.PersonalRolFechaModificacion}</td>
                        <td>${personalRol.PersonalRolEstatus}</td>
                        <td>${personalRol.PersonalRolPersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editPersonalRol(${personalRol.PersonalRolId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deletePersonalRol(${personalRol.PersonalRolId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#personalRolTable').removeClass('d-none'); 
        });
    }

    $('#btnAddPersonalRol').on('click', function () {
        resetForm(); 
        $('#formContainer').removeClass('d-none'); 
    });

    $('#PersonalRolForm').on('submit', function (e) { // Asegúrate que el ID sea correcto
        e.preventDefault(); 
        
        const personalRolId = $('#PersonalRolId').val(); // Asegúrate que el ID sea correcto
        const personalRolData = {
            PersonalRolDescripcion: $('#PersonalRolDescripcion').val()
        };
    
        if (personalRolId) {
            $.ajax({
                url: `/personalrol/${personalRolId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(personalRolData),
                success: function () {
                    loadPersonalRoles();
                    resetForm();
                },
                error: function (xhr) {
                    console.error('Error al actualizar:', xhr.responseText);
                    alert('Error al actualizar el Personal Rol.');
                }
            });
        } else {
            $.ajax({
                url: apiUrl, // Usar apiUrl aquí
                type: 'POST', 
                contentType: 'application/json',
                data: JSON.stringify(personalRolData), // Usar personalRolData aquí
                success: function(response) {
                    alert(response.message);
                    loadPersonalRoles();
                    $('#formContainer').addClass('d-none');
                },
                error: function(xhr, status, error) {
                    console.error("Error:", xhr.responseText);
                    alert("Hubo un problema al guardar los datos.");
                }
            });
        }
    });

    window.editPersonalRol = function (id) {
        $.get(`/personalrol/${id}`, function (data) {
            $('#PersonalRolId').val(data.PersonalRolId);
            $('#PersonalRolDescripcion').val(data.PersonalRolDescripcion);
            $('#formContainer').removeClass('d-none'); 
        }).fail(function () {
            alert('Error al cargar los datos del Personal Rol.');
        });
    };

    window.deletePersonalRol = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este Personal Rol?')) {
            $.ajax({
                url: `/personalrol/${id}`,
                type: 'DELETE',
                success: function () {
                    loadPersonalRoles(); 
                },
                error: function (xhr) {
                    alert('Error al eliminar el Personal Rol.');
                }
            });
        }
    };

    function resetForm() {
        $('#PersonalRolId').val('');
        $('#PersonalRolDescripcion').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);
});