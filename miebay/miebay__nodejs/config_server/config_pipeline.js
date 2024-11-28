//modulo q exporta una unica funcion q recibe como parametro la instancia del servidor express creado en modulo principal:  server2.js
//y configura su pipeline:
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const cors=require('cors');

const routingCliente=require('./config_routing/endpointsCliente');
const routingTienda=require('./config_routing/endpointsTienda');


module.exports=function(serverExpress){
    
    serverExpress.use( cookieParser()); 

    serverExpress.use( bodyParser.json());
    serverExpress.use( bodyParser.urlencoded({extended:false, limit:'50mb'})); //<---OJO!!!! se pone limit para q los clientes react puedan mandar en el body objetos JSON muy pesados, sino te saldra error: 'PayloadTooLargeError: request entity too large' con un codigo:413 

    serverExpress.use(cors());
    
    //================ configuracion middleware enrutamiento (endpoints escucha) ===================================
    serverExpress.use('/api/zonaCliente', routingCliente); //<---en routingCliente esta el objeto Router de express q define funciones middleware a ejecutar cuando se accede a un endpoint zonaCliente
    serverExpress.use('/api/zonaTienda', routingTienda); //<-----en routingTienda esta el objeto Router de express q define func.middleware a ejecutar cuando se accede a un endpoint de zonaTienda



}