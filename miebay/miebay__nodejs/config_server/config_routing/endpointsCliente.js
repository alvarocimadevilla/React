//modulo de nodejs q va a exportar un objeto Router de express, necesario para definir middlewares de enruamiento para el servidor express en su pipeline
//para crear este objeto Router, hay un metodo .Router() de express:
const express=require('express');
const routerCliente=express.Router();

const clienteEndPointsController=require('../controllers/clienteEndPointsController')


//configuro endpoints en objeto routerCliente...
routerCliente.post('/RegistroCuenta', clienteEndPointsController.RegistrarCuenta);
routerCliente.post('/LoginCliente', clienteEndPointsController.LoginCliente);
routerCliente.get('/ExisteEmail', clienteEndPointsController.ExisteEmail);



//exporto objeto Router
module.exports=routerCliente;