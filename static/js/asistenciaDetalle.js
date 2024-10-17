$(document).ready(function () {
    loadDetalles();

    function loadDetalles() {
        $.get('/asistenciadetalle', function (data) {
            $('#detalleTableBody').empty();
            data.forEach(function (detalle) {
                $('#detalleTableBody').append(`
                    <tr>
                        <td>${detalle.AsistenciaDetalleId}</td>
                        <td>${detalle.AsistenciaDetalleDescripcion}</td>
                        <td>${detalle.AsistenciaDetalleComentario || ''}</td>
                        <td>${detalle.AsistenciaDetalleFechaModificacion}</td>
                        <td>${detalle.AsistenciaDetalleEstatus}</td>
                        <td>${detalle.AsistenciaDetallePersonalModifica}</td>
                        <td>
                            <button class='btn btn-warning' onclick='editDetalle(${detalle.AsistenciaDetalleId})'><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class='btn btn-danger' onclick='deleteDetalle(${detalle.AsistenciaDetalleId})'><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`);
            });
            $('#detalleTable').removeClass('d-none');
        }).fail(function (xhr) {
            console.error('Error al cargar los detalles:', xhr.responseText);
        });
    }

    $('#btnAddDetalle').on('click', function () {
        resetForm();
        $('#formContainer').removeClass('d-none');
    });

    $('#DetalleForm').on('submit', function (e) {
        e.preventDefault();

        const detalleId = $('#AsistenciaDetalleId').val();
        const detalleData = {
            AsistenciaDetalleDescripcion: $('#AsistenciaDetalleDescripcion').val(),
            AsistenciaDetalleComentario: $('#AsistenciaDetalleComentario').val()
        };

        if (detalleId) { // Actualización
            $.ajax({
                url: `/asistenciadetalle/${detalleId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(detalleData),
                success: function () {
                    loadDetalles();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al actualizar el detalle.');
                }
            });
        } else { // Creación
            $.ajax({
                url: '/asistenciadetalle',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(detalleData),
                success: function () {
                    loadDetalles();
                    resetForm();
                },
                error: function (xhr) {
                    alert('Error al crear el detalle.');
                }
            });
        }
    });

    window.editDetalle = function (id) {
        $.get(`/asistenciadetalle/${id}`, function (data) {
            $('#AsistenciaDetalleId').val(data.AsistenciaDetalleId);
            $('#AsistenciaDetalleDescripcion').val(data.AsistenciaDetalleDescripcion);
            $('#AsistenciaDetalleComentario').val(data.AsistenciaDetalleComentario || '');
            $('#formContainer').removeClass('d-none');
        }).fail(function () {
            alert('Error al cargar los datos del detalle.');
        });
    };

    window.deleteDetalle = function (id) {
        if (confirm('¿Estás seguro de que deseas eliminar este detalle?')) {
            $.ajax({
                url: `/asistenciadetalle/${id}`,
                type: 'DELETE',
                success: function () {
                    loadDetalles();
                },
                error: function (xhr) {
                    alert('Error al eliminar el detalle.');
                    console.error('Error:', xhr.responseText);
                }
            });
        }
    };

    function resetForm() {
        $('#AsistenciaDetalleId').val('');
        $('#AsistenciaDetalleDescripcion').val('');
        $('#AsistenciaDetalleComentario').val('');
        $('#formContainer').addClass('d-none');
    }

    $('#btnCancel').on('click', resetForm);
});