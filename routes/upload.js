var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

app.use(fileUpload());


// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];
    if( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Las colecciones validas son ' + tiposValidos.join(', ')}
        });
    }

    if( !req.files ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selección imagen',
            errors: { message: 'Debe seleccionar una imagen'}
        });
    }

    // Nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado [nombreCortado.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['jpg', 'png', 'jpeg', 'gif'];
    if( extensionesValidas.indexOf(extensionArchivo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ')}
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {
        if( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
            }); 
        }
    })

    subirPorTipo( tipo, id, nombreArchivo, res );
    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente',
    // });
});

function subirPorTipo( tipo, id, nombreArchivo, res ) {
    if( tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if(err){
                res.status(500).json({
                    ok: false,
                    mensaje: 'No existe usuario con ese id ' + id
                });
            }
            if( !usuario ) {
                return res.status(400).json({
                    ok: false,
                    errors: { message: 'No existe un usuario con ese id ' + id }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img; 
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if(err){
                        res.status(500).json({
                            ok: false,
                            mensaje: 'error al eliminar imagen vieja' + err
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado) => {
                if(err){
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario ' + id
                    });
                }
                usuarioActualizado.password = '*************';
                res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                });
            });
        });
    }

    if( tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if(err){
                res.status(500).json({
                    ok: false,
                    mensaje: 'No existe medico con ese id ' + id
                });
            }
            if( !medico ) {
                return res.status(400).json({
                    ok: false,
                    errors: { message: 'No existe un medico con ese id ' + id }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img; 
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if(err){
                        res.status(500).json({
                            ok: false,
                            mensaje: 'error al eliminar imagen vieja' + err
                        });
                    }
                });
            }

            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado) => {
                if(err){
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico ' + id
                    });
                }
                res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                });
            });
        });
    }

    if( tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if( err ){
                res.status(500).json({
                    ok: false,
                    mensaje: 'No existe hospital con ese id ' + id
                });
            }
            if( !hospital ) {
                return res.status(400).json({
                    ok: false,
                    errors: { message: 'No existe un hospital con ese id ' + id }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img; 
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if(err){
                        res.status(500).json({
                            ok: false,
                            mensaje: 'error al eliminar imagen vieja' + err
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado) => {
                if(err){
                    res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital ' + id
                    });
                }
                res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                });
            });
        });
    }

} 
module.exports = app;