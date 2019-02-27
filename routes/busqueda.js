var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Rutas

// =======================================
//   Busqueda por tabla
// =======================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla
    var regex = new RegExp( busqueda, 'i');
    var promesa;

    switch(tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        
        default: 
            return res.status(400).json({
                ok: false,
                mensansaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: {message: 'Tipo de tabla no valido'}
            });
    }
    
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
})

// =======================================
//   Busqueda general
// =======================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');

    Promise.all( [buscarHospitales(regex), buscarMedicos(regex), buscarUsuarios(regex)])
        .then( respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
    });

});

function buscarHospitales(regex) {
    return new Promise( (res, rej) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if( err ) {
                    rej('Error al cargar hospitales ', err);
                }else {
                    res(hospitales);
                }
            });  
    });
}

function buscarMedicos(regex) {
    return new Promise( (res, rej) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if( err ) {
                    rej('Error al cargar medicos ', err);
                }else {
                    res(medicos);
                }
        });  
    });
}

function buscarUsuarios(regex) {
    return new Promise( (res, rej) => {
        Usuario.find({}, 'nombre email role' )
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec( (err, usuarios) => {
                if( err ) {
                    rej('Error al cargar usuarios ', err);
                }else {
                    res(usuarios);
                }
            })
    });
}
module.exports = app;