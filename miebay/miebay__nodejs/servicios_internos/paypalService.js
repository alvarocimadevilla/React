/*
    modulo de codigo de nodejs q exporta un objeto js con metodos para hacer el pago con paypal: comprarYa + itemsPedido de cesta
    
    - cada vez que quieras hacer una operacion contra la api de paypal tienes q generar un accessToken de paypal
    - las operaciones q hay q hacer:
    -1º operacion: crear un objeto ORDER de paypal <---- al recibirlo nodejs, tiene en su interior: idOrder, url_conexion cliente React
    -2º operacion: (una vez q el cliente react aprueba el pago en la pasarela paypal, esta pasarela se pone en contacto con nuestro servicio mediante url q le indicaremos
        diciendo si ha ido bien el pago o no): chekcout del ORDER (pago realizado)
*/
const axios=require('axios');
async function _getAccessTokenPAYPAL(){
    try {
        //como obtener accessToken Paypal: https://developer.paypal.com/api/rest/#link-getaccesstoken
        //tenemos que pasar en cabecera authorization el clientId y clientSecret serializados en base64
        let _base64ClientIdClientSecret=Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        let _respToken=await axios(
                                    {
                                        url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                            'Authorization': `Basic ${_base64ClientIdClientSecret}`
                                        },
                                        data: 'grant_type=client_credentials' //<---tb se puede usar objeto URLSearchParams como en stripe
                                    }
                                );
        console.log('respuesta de paypal a la peticion de accessToken de acceso a API...', _respToken.data);
        
        if (_respToken.status===200) {
            return _respToken.data.access_token;
        } else {
            throw new Error('error de paypal, accessToken no generado');
        }
    } catch (error) {
        console.log('error al intentar crear accessToken de paypal...sin esto no puedes hacer NADA:', error);
        return null;
    }

}

module.exports={
    CrearPagoPayPal: async function(idCliente,pedido){
        try {
            //antes de nada necesito accessToken de paypal...
            let _accessToken=await _getAccessTokenPAYPAL();
            if (! _accessToken) throw new Error('no hay accessToken a la API de paypal, no puedo crear objeto ORDER');

            //1º operacion: crear un objeto ORDER de paypal...  https://developer.paypal.com/docs/api/orders/v2/#orders_create
            //en items del pedido tengo: la propiedad .comprarYa q es un objeto { producto: ..., cantidad: ... } 
            //                           la propiedad .itemsPedido q es un array de objetos: [ { producto: ..., cantidad: ... }, { producto: ..., cantidad: ... }, ... ]
            let _itemsPedido=pedido.comprarYa.producto ? [ { ...pedido.comprarYa } ] : pedido.itemsPedido;

            let _payloadOrder={
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        items: _itemsPedido.map( //<---- array de items del pedido a cobrar, cada item paypal exige props: { name:..., quantity: ....., unit_amount:{ currency_code:..., value: ... } }
                            elem => (
                                {
                                    name: elem.producto.nombre,
                                    quantity: elem.cantidad.toString(), //<--- OJO!!! cantidad en formato string
                                    unit_amount:{ currency_code: 'EUR', value: elem.producto.precio.toString() }
                                }
                            )
                        ), 
                        amount: { //<----resumen con subtotal del pedido, gastos envio y total del pedido 
                            currency_code: 'EUR',
                            value: pedido.total.toString(),
                            breakdown: { //objeto para indicar subtotal y gastos de envio, NO ES OBLIGATORIO
                                item_total: { currency_code: 'EUR', value: pedido.subtotal.toString() },
                                shipping:   { currency_code: 'EUR', value: pedido.gastosEnvio.toString() }
                            }
                        } 
                    }
                ],
                //esta propiedad del objeto ORDER no es REQUERIDA pero para un servicio GATEWAY es necesaria si o si...
                application_context: { //<---------------- URLS de callback desde paypal al servicio de nodejs cuando el cliente en REACT ha aprobado/rechazado el pago
                    return_url: `http://localhost:3003/api/zonaTienda/PayPalCallback?idCliente=${idCliente}&idPedido=${pedido._id}`,
                    cancel_url: `http://localhost:3003/api/zonaTienda/PayPalCallback?idCliente=${idCliente}&idPedido=${pedido._id}&Cancel=true`
                }
            }

            let _respOrder=await axios(
                {
                    method:'POST',
                    url:'https://api-m.sandbox.paypal.com/v2/checkout/orders',
                    headers:{
                        'Content-Type':'application/json',
                        'Authorization': `Bearer ${_accessToken}`
                    },
                    data: JSON.stringify(_payloadOrder)
                }
            );
            console.log('respuesta recibida de PAYPAL al crear objeto ORDER....', _respOrder.data);
            return _respOrder.data; //<---- en realidad solo me interesa el id del objeto Order creado, pero devuevlo todo por si queremos almacenarlo en mongo....


        } catch (error) {
            console.log('error en 1º paso del pago de paypal, a la hora de crear el objeto ORDER...', error);
            return null;
        }
    },
    FinalizarPagoPayPal: async function(orderId){
        try {
            //antes de nada necesito accessToken de paypal...
            let _accessToken=await _getAccessTokenPAYPAL();
            if (! _accessToken) throw new Error('no hay accessToken a la API de paypal, no puedo crear objeto ORDER');

            //2º operacion: ckechout ORDER          
            let _respuesta=await axios(
                {
                    method: 'POST',
                    url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
                    headers:{
                        'Authorization': `Bearer ${_accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('objeto respuesta de paypal al finalizar pago....', _respuesta);


            if (_respuesta.status===201){ //<--- OJO!! el .status 200 de codigo de respuesta no tiene porque ser siempre asociado a resp.ok, en paypal usa tb el 201
                    return true;
            } else {
                throw new Error('error a la hora de finalizar el pago por paypal....');
            }

        } catch (error) {
            console.log('error en 2º paso del pago de paypal, a la hora de FINALIZAR pago (checkout ORDER) ...', error);
            return null;
            
        }
    }
}