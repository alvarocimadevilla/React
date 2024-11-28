//modulo principal de nuestro proyecto back nodejs

require('dotenv').config(); //<----- una vez instalado paquete dotenv, invocamos a la funcion .config() del objeto q exporta para poder leer el fichero .env y crear variables de entorno

const express=require('express');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const cors=require('cors');
const gmailSender=require('./servicios_internos/gmailSender');

const bcrypt=require('bcrypt'); //<------- paquete npm para control de contraseñas de usuarios.... (hashes)
const {MongoClient, BSON}=require('mongodb');

const generadorJWT=require('./servicios_internos/generadorJWT'); //<--- objeto js para manipular JWT
const stripeService=require('./servicios_internos/stripeService');//<--- objeto js para pago con STRIPE


//levantamos cliente de acceso a MONGODB....
console.log('variable de entorno url mongo y bd...', process.env.URL_MONGODB, process.env.DB_MONGODB);
const clienteMongoDB=new MongoClient(process.env.URL_MONGODB);


//el resultado de la ejecucion de la funcion q exporta el modulo express te crea el objeto SERVER
//esta con valores por defecto, hay q configurarlo: puerto a la escucha, funciones midleware del servidor, lanzarlo
const miServidorWev=express(); 

//TODO ##### ...configuramos las funciones middleware .... ############
// - middleware de procesamiento de http-request de los clientes utiles en EXPRESS (middlewares de software externo)
//    ej:  paquete npm:   
//!         - cookie-parser: crea una funcion middleware q recibe parametros req,res,next ...del parametro req, de sus cabeceras http-headers-request , extrae la cabecera "Cookie"
//!                          y la mete en una propiedad dentro de req, llamada req.cookie. Nada mas extraerla invoca al siguiente middleware con next()
//!                         para incrustarla en la cadena de middlewares de express usar metodo   .use( cookieParser() )
//!         - body-parser:  crea una funcion middleware q recibe parametros req,res,next ...del parametro req extrae los datos DEL BODY
//!                          y la mete en una propiedad dentro de req, llamada req.body. Nada mas extraerla invoca al siguiente middleware con next()
//!                         para incrustarla en la cadena de middlewares de express usar metodo   .use( bodyparser.json()  ) <--- para datos json
//!                                                                                               .use( bodyparser.urlencoded( {extended: false} ) <--- para datos x-form-urlencoded
//!         - cors: crea una funcion middleware q habilita q clientes externos al servidor nodejs le manden datos


miServidorWev.use( cookieParser()); 
// miServidorWev.use( 
//                     function(req,res,next){
//                         console.log('datos extraidos por midleware cookie-parser y metidos en req.cookies...', req.cookies);
//                         next();
//                     } 
//                 );

miServidorWev.use( bodyParser.json());
miServidorWev.use( bodyParser.urlencoded({extended:false}));
// miServidorWev.use( 
//                     function(req,res,next){
//                         console.log('datos extraidos por midleware body-parser y metidos en req.body...', req.body);
//                         next();
//                     } 
//                 );


// - cada endpoint o ruta de acceso de los clientes al servidor tiene q venir definida por una funcion middleware
//    especificando metodo http por el que se accede (get,post,put,...) y la ruta:

miServidorWev.use(cors());

miServidorWev.post('/api/zonaCliente/RegistroCuenta', async function(req,res,next){
    
    try { //<----- try-catch para conexion a bd y apertura de transaccion
            console.log('el cliente de react ha hecho esta solicitud http-request....', req.body); //<--- si no hay mas middlewares previos, req.body es undefined

            let _cuenta={
                ...req.body,
                password: bcrypt.hashSync( req.body.password, 10),
                activada: false
            }
        
            await clienteMongoDB.connect();
            let _sesionTransaccion=clienteMongoDB.startSession();

            try { //<----- try-catch para el commit o rollback de transaccion
                await _sesionTransaccion.withTransaction(
                    async ()=>{
                                //operaciones contra mongodb de la transaccion
                                let _respuestaINSERT=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                                        .collection('cuentas')
                                                                        .insertOne( _cuenta );

                                console.log('respuesta de MONGODB al insertar datos en cuentas....', _respuestaINSERT);

                                if (_respuestaINSERT.insertedId) {
                                    let _respINSERTCli=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                            .collection('clientes')
                                                            .insertOne(
                                                                {
                                                                    listaProductosVender:[],
                                                                    listaProductosComprados: [],
                                                                    listaPujas: [],
                                                                    listaSubastas:[],
                                                                    direcciones: [],
                                                                    metodosPago: [],
                                                                    idCuenta: _respuestaINSERT.insertedId
                                                                }
                                                            );
                                    console.log('respuesta de MONGODB a insertar datos en clientes...', _respINSERTCli)
                                    
                                    //mandar email de activacion de cuenta al emial mandado por cliente o codigo de activacion por SMS al tlfno mandado por cliente
                                    //en la url tiene q ir un JWT de un solo uso (hay q generalo e incrustarlo)
                                    
                                    let _jwt=generadorJWT.generarJWT({ email: req.body.email, idCliente: _respINSERTCli._id  },'5m', false );
                                    let _url=`http://localhost:3000/api/zonaCliente/ActivarCuenta?token=${_jwt}`;

                                    let _htmlbody=`
                                        <div>...aqui logo de ebay....</div>
                                        <div>
                                            <p>Bienvenido a eBay Mr/Mrs: ${req.body.nombre} ${req.body.apellidos}</p>
                                            <p>Activa tu cuenta de eBay si quieres empezar a poder comprar/vender/pujar por productos.</p>
                                        </div>
                                        <div>
                                            <p>Pulsa <a href='${_url}'>AQUI</a> para activar la cuenta, o copia y pega esta direccion en otra pestaña del navegador:</p>
                                            <p>${_url}</p>
                                        </div>
                                    `;
                                    let _resp=await gmailSender.EnviarEmail(
                                        {
                                            nombreCliente: req.body.nombre + " " + req.body.apellidos,
                                            to: req.body.email,
                                            subject: 'Bienvenido a eBay, ACTIVA TU MALDITA CUENTA YAAAA!!!',
                                            htmlbody: _htmlbody
                                        }
                                    );
                                    if(! _resp) throw new Error('error en envio de email para activar cuenta');

                                    res.status(200).send({codigoOperacion: 0, mensajeOperacion: 'datos registrados ok en la bd, consultar emial o sms para activar cuenta'});

                                } else {
                                throw new Error('error en insert "cuentas"...');
                                }

                    }
                );            
            } catch (error) {
                //rollback por errores
                console.log('error en transaccion contra mongodb al insertar clientes y cuentas...', error.message);
                throw new Error(error.message);
            } finally {
                _sesionTransaccion.endSession();
            }

    } catch (error) {
        console.log('error en registrar cuenta...', error);
        res.status(200).send({codigoOperacion: 1, mensajeOperacion: 'fallo en registro de datos, intentar de nuevo---'});
    }

});

miServidorWev.get('/api/zonaCliente/ExisteEmail', function(req,res,next){
    console.log('parametros pasados en la url...', req.query);
    res.status(200).send({codigoOperacion: 0, mensajeOperacion: 'HAS ALCANZADO EL ENDPOINT DEL EXISTE EMAIL...'});
});

miServidorWev.post('/api/zonaCliente/LoginCliente',async function(req,res,next){
    try {
        console.log('el cliente de react ha hecho esta solicitud http-request....', req.body); //<--- si no hay mas middlewares previos, req.body es undefined
        const { email, password }=req.body;

        //1º paso) comprobar si en mongodb existe en coleccion "cuentas" un doc. con ese email y password
        await clienteMongoDB.connect();
        let _datosCuenta=await clienteMongoDB.db(process.env.DB_MONGODB)
                                              .collection('cuentas')
                                              .findOne( { email });
        console.log('datos recuperados de coleccion cuentas...', _datosCuenta);
        if(! _datosCuenta) throw new Error('no existe esa cuenta con ese Email');

        //2º paso) comprobamos si cuenta esta activada (confirmada)
        if( ! _datosCuenta.activada ) throw new Error('cuenta no ACTIVADA...mandar de nuevo enlace invitacion para activarla');

        //3º paso) comprobar si password esta ok....
        if (! bcrypt.compareSync(password, _datosCuenta.password) ) throw new Error('password invalida....');


        //4º paso) si existe generar JWT de acceso:  accessJWT en payload metemos _id del cliente y email/tlfno
        let _jwts=generadorJWT.generarJWT(
            {
                idCliente: _datosCuenta._id,
                email: _datosCuenta.email,
                telefono: _datosCuenta.telefono,
                nombreCompleto: _datosCuenta.apellidos + ', ' + _datosCuenta.nombre 
             },
            '15m'
        );
       
        //5º paso) recuperar de la coleccion "clientes" los datos del mismo (lista productos a vender, lista productos comprados, lista direcciones, metodos de pago,...)
        let _datosCliente=await clienteMongoDB.db(process.env.DB_MONGODB)
                                              .collection('clientes')
                                              .findOne( { idCuenta: _datosCuenta._id });
        
        //se pueda hacer asi, aunque mejor hacer un "join" en query de arriba entre coleccion "clientes" y "cuentas"
        _datosCliente={
            ..._datosCliente,
            cuenta: {
                ..._datosCuenta,
                password: ''
            }
        }

        console.log("datos recuperados de coleccion clientes...", _datosCliente);
        
        res.status(200).send( 
                    { 
                        codigoOperacion: 0,
                        mensajeOperacion: 'inicio de sesion correcto, JWT creado',
                        datos:{
                            accessToken: _jwts[0],
                            refreshToken: _jwts[1],
                            cliente: _datosCliente
                        }
                    }
        );
            
    } catch (error) {
        console.log('error en login....', error);
        res.status(200).send( {codigoOperacion: 2, mensajeOperacion: error.message } );
    }
});

miServidorWev.get('/api/zonaTienda/RecuperarCategorias', async function(req,res,next){
    try {
        //recuperamos categorias si hay valor en parametro pathCategoria recuperamos subcategorias, si no recuperamos categorias principales
        const _pathcatRecup=req.query.pathCategoria;
        const _filtro=_pathcatRecup !=='principales' ? { pathCategoria: { $regex: new RegExp("^"+ _pathcatRecup + "-[0-9]+$") } } 
                                            :
                                           { pathCategoria: { $regex: /^[0-9]+$/ } }


        await clienteMongoDB.connect();
        //OJO!!!! .find() devuelve un CURSOR DE DOCUMENTOS!!!! objeto FindCursor, para obtener el contenido de ese cursos o bien con bucle para ir uno a uno
        //o con metodo .toArray() para recuperar todos los doc.del cursor de golpe
        //https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
        let _catsCursor=await clienteMongoDB.db(process.env.DB_MONGODB)
                                        .collection('categorias')
                                        .find(_filtro);
        
        let _cats=await _catsCursor.toArray();

        //console.log('categorias recuperadas....', _cats);
        res.status(200).send( { codigo:0, mensaje:'categorias recuperadas OK!!!', datos:_cats } );


    } catch (error) {
        console.log('error al intentar recuperar categorias.....', error.message);
        res.status(200).send( { codigo:5, mensaje:`error al intentar recuperar categorias: ${error.message}`, datos:[] } );
    }
});

miServidorWev.get('/api/zonaTienda/RecuperarProductosFromCat', async function(req,res,next){
    try {
        await clienteMongoDB.connect();
        let _prodsCursor=clienteMongoDB.db(process.env.DB_MONGODB)
                                        .collection('productos')
                                        .find({categoría: req.query.catId});

        let _prods=await _prodsCursor.toArray();

        console.log('numero de productos recuperados...', _prods.length);
        res.status(200).send( { codigo:0, mensaje:'productos recuperados OK!!!', datos:_prods } );

    } catch (error) {
        console.log('error al intentar recuperar productos.....', error.message);
        res.status(200).send( { codigo:6, mensaje:`error al intentar recuperar productos: ${error.message}`, datos:[] } );            
    }
} );

miServidorWev.get('/api/zonaTienda/RecuperarProducto',async function(req,res,next){
    try {
        await clienteMongoDB.connect();
        const _idprod=new BSON.ObjectId(req.query.idProd);
        let _producto=await clienteMongoDB.db(process.env.DB_MONGODB)
                                        .collection('productos')
                                        .findOne({_id: _idprod });

        if(! _producto) throw new Error(`no existe ningun producto con este _id: ${req.query.idProd}`);
        res.status(200).send( { codigo:0, mensaje:'productos recuperados OK!!!', datos: _producto } );

    } catch (error) {
        console.log('error al intentar recuperar productos.....', error.message);
        res.status(200).send( { codigo:7, mensaje:`error al intentar recuperar producto: ${error.message}`, datos: {} } );            
    }        
});


miServidorWev.post('/api/zonaTienda/ComprarProductos', async function(req,res,next){
    try {
        /*en el req.body voy a pasar estos datos: 
                    {
                        pedido: { itemsPedido:[...], comprarYa:..., metodosPago:..., subtotal:..,total:..., gastosEnvio:...},
                        cliente: { idCliente, email } //<---- en teoria van en el accessToken q ha tenido q mandar el cliente react (en el payload)
                                                     //comprobar q coincide esos campos del payload con esta info q se manda directamente
                    }
        */
        const { pedido, cliente }=req.body;
        pedido._id=new BSON.ObjectId();

        switch (pedido.metodosPago.tipo) {
            case 'creditcard':
                    //#region....pago con stripe....
                    //1º paso pago con stripe, crear customer(cliente) 
                    let _idCustomer=await stripeService.CrearCustomer(
                        {
                            nombre: cliente.nombre + cliente.apellidos,
                            email: cliente.cuenta.email, //<----- recup. del payload del accessToken
                            telefono: cliente.cuenta.telefono, //<--- recup. del payload del accessToken
                            direccionEnvio: cliente.direcciones.filter( dir=> dir.esPrincipal)[0] //<--- recup. del payload del accessToken (si no esta, con email o _idCliente acceder a BD y recup. direccion principal)
                        }
                    );
                    if(! _idCustomer) throw new Error('error al crear objeto CUSTOMER de STRIPE');

                    //2º paso pago con stripe, crear tarjeta de credito y asociarla al customer(cliente)
                    let _idCard=await stripeService.CrearCardFromCustomer(_idCustomer);
                    if(! _idCard) throw new Error('error al crear objeto CARD de STRIPE');

                    //3º paso pago con stripe, crear cargo debo pasar: idCustomer,idCard,cantidad,idPedido
                    let _objetoCargo=await stripeService.CrearCharge(_idCustomer, _idCard, pedido.total, pedido._id);
                    console.log('pago realizado ....objeto devuelto es:', _objetoCargo);

                    //4º paso:  almacenar en BD mongodb el objeto pedido con el cargo y asociarlo al cliente....
                    //          mandar email con detalles del pedido realizado

                    //#endregion

                break;
            case 'paypal':
                    //pago con paypal....
                break;

            case 'google-pay':
                    //pago con google-pay....

                break;
        }





    } catch (error) {
        console.log('error a la hora de hacer pago....', error.message);
        res.status(200).send( { codigo: 100, mensaje :'error interno al procesar pago, intentelo de nuevo mas tarde'} );
    }


});


// miServidorWev.get('/api/zonaTienda/RecuperarSubCategorias', async function(req,res,next){
//     try {
//         //recuperamos categorias en un principio, categorias principales...
//         const _pathcatRecup=req.query.pathCategoria; //<---si es Electronica: '1', subcats: '1-....
//         await clienteMongoDB.connect();
//         //OJO!!!! .find() devuelve un CURSOR DE DOCUMENTOS!!!! objeto FindCursor, para obtener el contenido de ese cursos o bien con bucle para ir uno a uno
//         //o con metodo .toArray() para recuperar todos los doc.del cursor de golpe
//         //https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
//         let _catsCursor=await clienteMongoDB.db(process.env.DB_MONGODB)
//                                         .collection('categorias')
//                                         .find({ pathCategoria: { $regex: new RegExp("^"+ _pathcatRecup + "-[0-9]+$") } });
        
//         let _cats=await _catsCursor.toArray();

//         console.log('categorias recuperadas....', _cats);
//         res.status(200).send( { codigo:0, mensaje:'categorias recuperadas OK!!!', datos:_cats } );


//     } catch (error) {
//         console.log('error al intentar recuperar categorias.....', error.message);
//         res.status(200).send( { codigo:5, mensaje:`error al intentar recuperar categorias: ${error.message}`, datos:[] } );
//     } 
// });


//levanto el servidor web...
miServidorWev.listen(3003,()=> console.log('...servidor WEB EXPRESS escuchando peticiones en puerto 3003 .....'));


