$(document).ready(function () {
    loadAsistencias();
    loadPersonal();
    loadAsistenciaDetalles();

    function loadAsistencias() {
        $.get('/asistenciapersonal', function (data) {
            $('#asistenciaTableBody').empty();
            data.forEach(function (asistencia) {
                $('#asistenciaTableBody').append(`
                    <tr>
                        <td>${asistencia.AsistenciaPersonalId}</td>
                        <td>${asistencia.PersonalId}</td>
                        <td>${new Date(asistencia.AsistenciaPersonalFechaHora).toLocaleString()}</td>
                        <td>${asistencia.AsistenciaDetalleId}</td>
                        <td>${asistencia.AsistenciaPersonalFechaModificacion}</td>
                        <td>${asistencia.AsistenciaPersonalEstatus}</td>
                        <td>${asistencia.AsistenciaPersonalPersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editAsistencia(${asistencia.AsistenciaPersonalId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteAsistencia(${asistencia.AsistenciaPersonalId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#asistenciaTable').removeClass('d-none');
        }).fail(function (xhr) {
            console.error('Error al cargar las asistencias:', xhr.responseText);
        });
    }

    function loadPersonal() {
        $.get('/personal', function (data) {
            const personalSelect = $('#PersonalId');
            personalSelect.empty(); // Limpiar opciones existentes
            data.forEach(function (personal) {
                personalSelect.append(`<option value="${personal.PersonalId}">${personal.PersonalNombre} ${personal.PersonalPrimerApellido}</option>`);
            });
        }).fail(function (xhr) {
            console.error('Error al cargar el personal:', xhr.responseText);
        });
    }

    function loadAsistenciaDetalles() {
        $.get('/asistenciadetalle', function (data) {
            const detalleSelect = $('#AsistenciaDetalleId');
            detalleSelect.empty(); // Limpiar opciones existentes
            data.forEach(function (detalle) {
                detalleSelect.append(`<option value="${detalle.AsistenciaDetalleId}">${detalle.AsistenciaDetalleDescripcion}</option>`);
            });
        }).fail(function (xhr) {
            console.error('Error al cargar los detalles de asistencia:', xhr.responseText);
        });
    }

    $('#btnAddAsistencia').on('click', function () {
        resetForm();
        $('#formContainer').removeClass('d-none');
    });

    $('#AsistenciaForm').on('submit', function (e) {
        e.preventDefault();

        const asistenciaId = $('#AsistenciaId').val();
        const asistenciaData = {
            PersonalId: $('#PersonalId').val(),
            AsistenciaPersonalFechaHora: $('#AsistenciaFechaHora').val(),
            AsistenciaDetalleId: $('#AsistenciaDetalleId').val()
        };

        if (asistenciaId) { // Actualización
            $.ajax({
                url: `/asistenciapersonal/${asistenciaId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(asistenciaData),
                success: function () {
                    loadAsistencias();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar la asistencia.');
                }
            });
        } else { // Creación
            $.ajax({
                url: '/asistenciapersonal',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(asistenciaData),
                success: function () {
                    loadAsistencias();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear la asistencia.');
                }
            });
        }
    });

    window.editAsistencia = function (id) {
        $.get(`/asistenciapersonal/${id}`, function (data) {
            $('#AsistenciaId').val(data.AsistenciaPersonalId);
            $('#PersonalId').val(data.PersonalId);
            $('#AsistenciaFechaHora').val(new Date(data.AsistenciaPersonalFechaHora).toISOString().slice(0, 16));
            $('#AsistenciaDetalleId').val(data.AsistenciaDetalleId);
            $('#formContainer').removeClass('d-none');
        }).fail(function () {
            alert('Error al cargar los datos de la asistencia.');
        });
    };

    window.deleteAsistencia = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta asistencia?')) {
            $.ajax({
                url: `/asistenciapersonal/${id}`,
                type: 'DELETE',
                success: function () {
                    loadAsistencias();
                },
                error: function (xhr) {
                    alert('Error al eliminar la asistencia.');
                    console.error('Error:', xhr.responseText);
                }
            });
        }
    };

    function resetForm() {
        $('#AsistenciaId').val('');
        $('#PersonalId').val('');
        $('#AsistenteFechaHora').val('');
        $('#AsistenteDetalleId').val('');
        $('#formContainer').addClass('d-none');
    }

    $('#btnCancel').on('click', resetForm);
});