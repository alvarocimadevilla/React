//modulo de codigo q va a exportar un OBJETO JS puro con metodos q definen las funciones middleware de acceso a los endpoints de zonaCliente
const gmailSender=require('../../servicios_internos/gmailSender');
const generadorJWT=require('../../servicios_internos/generadorJWT'); //<--- objeto js para manipular JWT


const bcrypt=require('bcrypt'); //<------- paquete npm para control de contraseñas de usuarios.... (hashes)
const {MongoClient, BSON}=require('mongodb');

//levantamos cliente de acceso a MONGODB....
console.log('variable de entorno url mongo y bd...', process.env.URL_MONGODB, process.env.DB_MONGODB);
const clienteMongoDB=new MongoClient(process.env.URL_MONGODB);


//-----------------------------------------------------------------------------------------------------------
//objeto a exportar con funciones middleware para los endpoints definidos en fichero:  endpointsCliente.js
//-----------------------------------------------------------------------------------------------------------
module.exports={
    RegistrarCuenta: async function(req,res,next){
    
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
    
    },
    LoginCliente: async function(req,res,next){
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
    },
    ExisteEmail: function(req,res,next){
        console.log('parametros pasados en la url...', req.query);
        res.status(200).send({codigoOperacion: 0, mensajeOperacion: 'HAS ALCANZADO EL ENDPOINT DEL EXISTE EMAIL...'});
    }
}