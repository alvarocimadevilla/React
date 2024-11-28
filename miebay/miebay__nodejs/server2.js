/*
    modulo prinicipal configuracion nodejs con express y mongo...
    este modulo importa una funcion de configuracion de la pipeline con los middleware de express

    modulo principal: server2.js    definida en modulo /config_server/config_pipeline.js
                                        |
    express <----------------- configPipeline(express) <------- los middlewares se configuran aqui en esta funcion
    mongodb                                                     salvo los de enrutamiento (los endpoints)
                                                                q se sacan fuera en ficheros o modulos independientes
                                                                                    |
                                                                ---------------------------------------------
                                                                |                                           |
                                                modulo endpointsCliente.js                      modulo endpointsTienda.js
                                            exporta objeto Router de express                   exporta objeto Router de express
                                            q expone endpoints zonaCliente                      q expone endpoints zonaTienda
                                                        |                                                       |
                                            cada endpoint del objeto Router                         cada endpoint del objeto Router
                                            en vez de poner la funcion middleware               en vez de poner la funcion middleware
                                            a ejecutar, se definen en modulo indep.             a ejecutar, se definen en modulo indep
                                            con nombre: clienteEndPointsController.js           con nombre: tiendaEndPointsController.js
                                                            \-------------------------------------------/
                                                            exportan un objeto JS puro con metodos q ejecutan esas funciones middleware
                                                            de los endpoints            
*/
require('dotenv').config(); //<----- una vez instalado paquete dotenv, invocamos a la funcion .config() del objeto q exporta para poder leer el fichero .env y crear variables de entorno

const express=require('express');
const configPipeLine=require('./config_server/config_pipeline'); //<----- funcion de configuracion de la pipeline de express, exportada en ese modulo

//el resultado de la ejecucion de la funcion q exporta el modulo express te crea el objeto SERVER
//esta con valores por defecto, hay q configurarlo: puerto a la escucha, funciones midleware del servidor, lanzarlo
const miServidorWeb=express(); 
configPipeLine(miServidorWeb);

miServidorWeb.listen(3003,()=> console.log('...servidor WEB EXPRESS escuchando peticiones en puerto 3003 .....'));

