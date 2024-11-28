//modulo de codigo q va a exportar un OBJETO JS puro con metodos q definen las funciones middleware de acceso a los endpoints de zonaCliente

const stripeService=require('../../servicios_internos/stripeService');//<--- objeto js para pago con STRIPE
const paypalService=require('../../servicios_internos/paypalService'); //<--- objeto js para pago con PAYPAL
const {MongoClient, BSON}=require('mongodb');

//levantamos cliente de acceso a MONGODB....
console.log('variable de entorno url mongo y bd...', process.env.URL_MONGODB, process.env.DB_MONGODB);
const clienteMongoDB=new MongoClient(process.env.URL_MONGODB);

//-----------------------------------------------------------------------------------------------------------
//objeto a exportar con funciones middleware para los endpoints definidos en fichero:  endpointsTienda.js
//-----------------------------------------------------------------------------------------------------------
module.exports={
    RecuperarCategorias: async function(req,res,next){
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
    },
    RecuperarProductosFromCat: async function(req,res,next){
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
    },
    RecuperarProducto: async function(req,res,next){
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
    },
    ComprarProductos: async function(req,res,next){
        try {
            /*en el req.body voy a pasar estos datos: 
                        {
                            pedido: { itemsPedido:[...], comprarYa:..., metodosPago:..., subtotal:..,total:..., gastosEnvio:...},
                            cliente: { idCliente, email } //<---- en teoria van en el accessToken q ha tenido q mandar el cliente react (en el payload)
                                                         //comprobar q coincide esos campos del payload con esta info q se manda directamente
                        }
            */
            console.log('datos mandados en el body al COMPRAR-PRODUCTOS desde react...', req.body);
            
            const { pedido, cliente }=req.body;
            pedido._id=new BSON.ObjectId(); //<---- esto NO ES UN STRING !!!!  es un objeto mongodb, para almacenar el ObjectId
    
            switch (pedido.metodoPago.tipo) {
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
                        let _respOrder=await paypalService.CrearPagoPayPal(cliente._id, pedido);
                        if(! _respOrder) throw new Error('error al generar objeto ORDER en paypal, mandar respuesta a react para q lo intente de nuevo mas tarde...')

                        //si obtengo respuesta solo me interesa el id del objeto Order:
                        // deberia almacenarlo en mongodb como datos persistentes en una coleccion "paypalOrders": idCliente, idPedido, idOrder
                        let _idOrder=_respOrder.id; 
                        let _insertOrder=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                            .collection('paypalOrders')
                                                            .insertOne( 
                                                                        { 
                                                                            idCliente: cliente._id, 
                                                                            idPedido: pedido._id.toString(),
                                                                            idOrder: _idOrder 
                                                                        } 
                                                                    );
                        
                        if (!_insertOrder.insertedId) throw Error('Error en insert en MONGODB en coleccion PayPalOrders');
                        //ha ido OK la crearcion del ORDER en paypal, mando al cliente de react la url para q proceda al pago...
                        //seleccion de prop. links del order la q tenga rel: 'approve' y se la mandas al cliente de REACT
                        let _url=_respOrder.links.filter( link=>link.rel==='approve')[0].href;
                        res.status(200).send({ codigo:0, mensaje:'1º paso pago por paypal ok, ORDER creado', datos: { urlPayPal: _url } })

                    break;
    
                case 'google-pay':
                        //pago con google-pay....
    
                    break;
            }
    

    
        } catch (error) {
            console.log('error a la hora de hacer pago....', error.message);
            res.status(200).send( { codigo: 100, mensaje :'error interno al procesar pago, intentelo de nuevo mas tarde'} );
        }
    
    
    },
    PayPalCallback: async function(req,res,next){
        try {
            //funcion llamada por servicio de PAYPAL cuando el cliente aprueba/cancela pago del pedido...
            //en la URL como parametros GET van dentro de req.query:  idCliente, idPedido, Cancel=true (si cancela) 
            console.log('parametros pasados en la URL desde PAYPAL....', req.query);
            const { idCliente, idPedido, Cancel }=req.query;

            //1º recupero de mongodb el orderId asociado a ese idCliente y idPedido:
            let _docOrder=await clienteMongoDB.db(process.env.DB_MONGODB)
                                            .collection('paypalOrders')
                                            .findOne( { idCliente, idPedido } );
            if (! _docOrder) throw new Error(`no hemos conseguido recuperar el id del objeto ORDER para  cliente: ${idCliente}, y el pedido: ${idPedido}`);

            let _finPagoOk=await paypalService.FinalizarPagoPayPal(_docOrder.idOrder);
            if (! _finPagoOk) throw new Error('error al finalizar el cobro del pedido en paypal, intentalo de nuevo mas tarde...');

            res.status(200).redirect(`http://localhost:3000/Tienda/FinalizarPedidoOK?idPedido=${idPedido}&opCodePago=0`);

        } catch (error) {
            console.log('error al finalizar pago en metodo PayPalCallback...', error);
            res.status(200).redirect(`http://localhost:3000/Tienda/FinalizarPedidoOK?idPedido=${idPedido}&opCodePago=100`);

        }
    }

}