//modulo de nodejs q va a exportar un objeto Router de express, necesario para definir middlewares de enruamiento para el servidor express en su pipeline
//para crear este objeto Router, hay un metodo .Router() de express:
const express=require('express');
const routerTienda=express.Router();

const  tiendaEndPointsController=require('../controllers/tiendaEndPointsController');

//configuro endponins en objeto routerTienda...
routerTienda.get('/RecuperarCategorias', tiendaEndPointsController.RecuperarCategorias);
routerTienda.get('/RecuperarProductosFromCat', tiendaEndPointsController.RecuperarProductosFromCat);
routerTienda.get('/RecuperarProducto', tiendaEndPointsController.RecuperarProducto);
routerTienda.post('/ComprarProductos', tiendaEndPointsController.ComprarProductos);
routerTienda.get('/PayPalCallback', tiendaEndPointsController.PayPalCallback);

//exporto objeto Router
module.exports=routerTienda;