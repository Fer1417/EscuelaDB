$(document).ready(function () {
    loadDocentes();

    function loadDocentes() {
        $.get('/docentes', function (data) {
            $('#docentesTableBody').empty();
            data.forEach(function (docente) {
                $('#docentesTableBody').append(`
                    <tr>
                        <td>${docente.DocenteId}</td>
                        <td>${docente.DocenteNombre}</td>
                        <td>${docente.DocentePrimerApellido}</td>
                        <td>${docente.DocenteSegundoApellido}</td>
                        <td>${docente.DocenteFechaModificacion}</td>
                        <td>${docente.DocenteEstatus}</td>
                        <td>${docente.DocentePersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editDocente(${docente.DocenteId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteDocente(${docente.DocenteId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#docentesTable').removeClass('d-none');
        });
    }

    $('#btnAddDocente').on('click', function () {
        resetForm(); 
        $('#formContainer').removeClass('d-none'); 
    });

    $('#docenteForm').on('submit', function (e) {
        e.preventDefault(); 
        
        const docenteId = $('#docenteId').val();
        const docenteData = {
            DocenteNombre: $('#DocenteNombre').val(),
            DocentePrimerApellido: $('#DocentePrimerApellido').val(),
            DocenteSegundoApellido: $('#DocenteSegundoApellido').val()
        };

        if (docenteId) {
            $.ajax({
                url: `/docente/${docenteId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(docenteData),
                success: function () {
                    loadDocentes();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar el docente.');
                }
            });
        } else {
            $.ajax({
                url: '/docente',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(docenteData),
                success: function () {
                    loadDocentes();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear el docente.');
                }
            });
        }
    });


    window.editDocente = function (id) {
        $.get(`/docente/${id}`, function (data) {
            $('#docenteId').val(data.DocenteId);
            $('#DocenteNombre').val(data.DocenteNombre);
            $('#DocentePrimerApellido').val(data.DocentePrimerApellido);
            $('#DocenteSegundoApellido').val(data.DocenteSegundoApellido);
            $('#formContainer').removeClass('d-none'); 
        }).fail(function () {
            alert('Error al cargar los datos del docente.');
        });
    };

    window.deleteDocente = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este docente?')) {
            $.ajax({
                url: `/docente/${id}`,
                type: 'DELETE',
                success: function () {
                    loadDocentes();
                }
            });
        }
    };

    function resetForm() {
        $('#docenteId').val('');
        $('#DocenteNombre').val('');
        $('#DocentePrimerApellido').val('');
        $('#DocenteSegundoApellido').val('');
        $('#formContainer').addClass('d-none'); 
    }

    $('#btnCancel').on('click', resetForm);
});