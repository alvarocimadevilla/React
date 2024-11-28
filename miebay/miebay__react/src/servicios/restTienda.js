//nos creamos un objeto js puro con metodos q usan fetcth-api contra servicios de nodejs para
//llevar operaciones de la tienda (recuperar categorias, recuperar productos de una categoria,
//recuperar detalles de un producto, recuperar productos mas vendidos, mas vistos,....)
//van a ser funciones loaders de objetos Route de REACT ROUTER

let tiendaRESTService={
    RecuperarCategorias: async function( { request,parameters } ){ //<---- metodo para recuperar categorias principales por loader, como subcategorias por Header y otros comp.....
        //si se invoca desde el loader, las props. request y params vienen ya predefinidas por el loader, y params esta undefined(no hay parametros en url objeto Route define este loader)
        //si se invoca desde otro componente, las tengo q crear en dicho componente, en params voy a meter el pathCategoria 
        try {
            console.log('valor de request y params...', request, parameters);

            let _valorparametroPathCategoriaUrl=parameters !== undefined ? parameters.pathCategoria : 'principales';
            console.log('valor de parametro en url al servicio de nodejs para recuperar cats y subcats....', _valorparametroPathCategoriaUrl);

            let _resp=await fetch(`http://localhost:3003/api/zonaTienda/RecuperarCategorias?pathCategoria=${_valorparametroPathCategoriaUrl}`);
            let _bodyResp=await _resp.json(); //<---- recibo objeto del servicio REST { codigo:..., mensaje: ..., datos: .... }
            
            console.log('datos recibidos del server cuando recupero categorias...', _bodyResp);
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al intentar recuperar categorias de productos...', error.message);
            return null;
        }
    },
    RecuperarProductosFromCat: async function( {request, params } ){
        try {
            console.log('parametros del loader de react-router-dom en RECUPERARPRODUCTOS....', request, params);
            let _resp=await fetch(`http://localhost:3003/api/zonaTienda/RecuperarProductosFromCat?catId=${params.catId}`);
            let _bodyResp=await _resp.json(); //<---- un objteto: { codigo: x, mensaje: ..., datos: .... }

            console.log('respuesta del servicio para recup.categorias...', _bodyResp)
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al recuperar categorias...', error.message);
            return null;                        
        }
    },
    RecuperarProducto : async function( {request,params } ){
        try {
            console.log('parametros del loader de react-router-dom en RECUPERARPRODUCTO dese _ID ....', request, params);
            let _resp=await fetch(`http://localhost:3003/api/zonaTienda/RecuperarProducto?idProd=${params.idProd}`);
            let _bodyResp=await _resp.json(); //<---- un objteto: { codigo: x, mensaje: ..., datos: .... }

            console.log('respuesta del servicio para recup.producto...', _bodyResp)
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al recuperar categorias...', error.message);
            return null;                        
        }

    },
    FinalizarPedido: async function(cliente,pedido){
        try {
            /*tengo q invocar a endopoint de nodejs: /api/zonaTienda/ComprarProductos
                y por POST pasarle un objeto asi:
                        {
                            pedido: { itemsPedido:[...], comprarYa:..., metodosPago:..., subtotal:..,total:..., gastosEnvio:...},
                            cliente: { idCliente, email } //<---- en teoria van en el accessToken q ha tenido q mandar el cliente react (en el payload)
                                                        //comprobar q coincide esos campos del payload con esta info q se manda directamente
                        }
            esos datos debes recuperarlos del state-global de zustand
            */
           
           //si mando objeto cliente entero + objeto pedido entero con productos con sus imagenes, etc....pesa demasiado y servicio nos corta
           //selecciono datos a mandar:
            let _resFinalizar=await fetch(
                                            'http://localhost:3003/api/zonaTienda/ComprarProductos',
                                            {
                                                 method:'POST',
                                                 headers:{'Content-Type': 'application/json'},
                                                 body: JSON.stringify( 
                                                                        { 
                                                                            cliente: { 
                                                                                        _id: cliente._id,
                                                                                        cuenta: cliente.cuenta
                                                                                    }, 
                                                                            pedido: {
                                                                                metodoPago: pedido.metodoPago,
                                                                                subtotal: pedido.subtotal,
                                                                                gastosEnvio: pedido.gastosEnvio,
                                                                                total: pedido.total,
                                                                                comprarYa: { 
                                                                                             producto: {
                                                                                                         idProducto: pedido.comprarYa.producto._id,
                                                                                                         nombre: pedido.comprarYa.producto.nombre,
                                                                                                        precio: pedido.comprarYa.producto.precio
                                                                                                    },
                                                                                             cantidad: pedido.comprarYa.cantidad
                                                                                             },
                                                                                itemsPedido: pedido.itemsPedido
                                                                                                    .map( 
                                                                                                        item =>(
                                                                                                                     {
                                                                                                                        producto:{ 
                                                                                                                            idProducto: item.producto._id,
                                                                                                                            nombre: item.producto.nombre,
                                                                                                                            precio: item.producto.precio
                                                                                                                        },
                                                                                                                        cantidad: item.cantidad 
                                                                                                                    }
                                                                                                                )
                                                                                                         )

                                                                            } 
                                                                        } 
                                                                    )
                                            }
                                        );
            let _resdataFinalizar=await _resFinalizar.json();
            console.log('respuesta servicio al comprar productos...', _resdataFinalizar);
            
            return _resdataFinalizar;

        } catch (error) {
            console.log('error al comprar productos....');
            return null;
        }
    }


}

export default tiendaRESTService