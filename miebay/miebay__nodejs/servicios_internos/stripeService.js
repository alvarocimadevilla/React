/*
    modulo de nodejs q exporta un objeto js puro con metodos para hacer pago con tarejeta usando STRIPE API
     cliente react
        ComprarProducto.js                          servicio nodejs  (servicio REST-GATEWAY)              servicio API-STRIPE
            ||              accessToken              endpoint:                                                endpoints
            restTienda -------------------------->    /api/zonaTienda/ComprarProducto   ===================>  
                                                      valida accessToken,recupera payload    api-key

  para hacer las solicitudes al servicio APIREST de STripe puedo usar desde nodejs la FETCH-API pq esta basado en javascript,
  sin embargo en NODEJS se emplea muchisimo el paquete:  axios
    - 1º paso para el pago: crear un objeto CUSTOMER de stripe con info del cliente (nombre y apps, email, tlfno contacto,....)
    - 2º paso para el pago: crear un objeto CARD de stripe y asociarlo al objeto CUSTOMER del primer paso, donde defines datos de la tarjeta
                            (tipo tarjeta, numero tarjeta, cvv, fecha expirarcion,...)
    - 3º paso para el pago: crera un objeto CHARGE de stripe q representa el cargo (idCustomer, idCard, cantidad, tipo moneda,....) 

*/
const axios=require('axios');
const _httpFetchAxios=axios.create(
    {
        baseURL:'https://api.stripe.com/v1/',
        headers: {
            'Authorization': `Bearer ${process.env.STRIPE_API_KEY}`
        }
    }
);



module.exports={
    CrearCustomer: async function(datosCliente){
        //llamando a api de stripe para crear objeto Customer...
        //tengo q pasar en formato x-www-form-urlencoded valores del cliente (no admite JSON!!!)
        try {
            const { nombre, email, telefono, direccionEnvio }=datosCliente;

            let _payloadStripe=new URLSearchParams(
                                        {
                                        'name': nombre,
                                        'phone': telefono,
                                        'email': email,
                                        'address[city]': direccionEnvio.municipio,
                                        'address[state]': direccionEnvio.provincia,
                                        'address[country]': direccionEnvio.pais,
                                        'address[postal_code]': direccionEnvio.cp,
                                        'address[line1]': direccionEnvio.calle
                                        }
                                    ).toString();
    
            const _respSTRIPE=await _httpFetchAxios.post('customers', _payloadStripe)
            console.log('respuesta de STRIPE al crear objeto CUSTOMER...', _respSTRIPE.data);

            if( _respSTRIPE.status !== 200) throw new Error('error al crear objeto Customer de Stripe')
            return _respSTRIPE.data.id;


        } catch (error) {
            console.log('erro al crear objeto Customer de STRIPe....', error);
            return null
        }


    },
    CrearCardFromCustomer: async function(idCustomer, datosTarjeta){
        //llamando a api de stripe para crear objeto CARD...
        //tengo q pasar en formato x-www-form-urlencoded valores del cliente (no admite JSON!!!)
        //como parametros habria q meter el num.tarjeta, fecha expiracion, cvv...pero con fines de desarrollo stripe 
        //tiene una tarjeta virtual llamada tok_visa, q se la pasas como parametro y permite hacer cobros en desarrollo
        try {
        //const { numeroTarjeta, fechaExpiracion, cvv }=datosTarjeta;
        let _payloadStripe=new URLSearchParams( { 'source': 'tok_visa'} ).toString();
        let _respSTRIPE=await _httpFetchAxios.post(`customers/${idCustomer}/sources`, _payloadStripe);

        //OJO!!!no preguntar por el status de la respuesta html pq si lo crea bien, no da un status 200, pregunta mejor por id del objeto, u otra propiedad
        //if(! _respSTRIPE.status !== 200) throw new Error('fallo a la hora de crear tarjeta de credito y asociarla al cliente');
        if(! _respSTRIPE.data.id) throw new Error('fallo a la hora de crear tarjeta de credito y asociarla al cliente: ' + _respSTRIPE.status);
       
        console.log('datos de objeto CARD creado por stripe...', _respSTRIPE.data);

        return _respSTRIPE.data.id;
        
        } catch (error) {
            console.log('error a la hora de crear objeto CARD...', error.message);
            return null;
        }
    },
    CrearCharge: async function(idCustomer,idCard,cantidad,idPedido){
        //llamando a api de stripe para crear objeto CHARGE...https://docs.stripe.com/api/charges/create?lang=curl
        //tengo q pasar en formato x-www-form-urlencoded valores de la tarjeta (no admite JSON!!!)
        //como parametros habria q meter el num.tarjeta, fecha expiracion, cvv...pero con fines de desarrollo stripe 
        //tiene una tarjeta virtual llamada tok_visa, q se la pasas como parametro y permite hacer cobros en desarrollo
        try {
            let _payloadStripe=new URLSearchParams( 
                                        { 
                                            'customer': idCustomer,
                                            'source': idCard,
                                            'currency': 'eur',
                                            'amount': (cantidad * 100).toString(),
                                            'description': `pago del pedido en eBay con id: ${idPedido}`
                                        } 
                                    ).toString();
            let _respSTRIPE=await _httpFetchAxios.post(`charges`, _payloadStripe);
            //console.log('datos de objeto CARD creado por stripe...', _respSTRIPE.data);
            
            //OJO!!!no preguntar por el status de la respuesta html pq si lo crea bien, no da un status 200, pregunta mejor por id del objeto, u otra propiedad
            if( _respSTRIPE.data.status !== 'succeeded') throw new Error('fallo a la hora de crear cargo y pasarselo a la tarjega del cliente');
    
            return _respSTRIPE.data; //<---- o bien devuelvo todo el objeto CHARGE (cobro) o las propiedades q te interesen como el id, ....
            
            } catch (error) {
                console.log('error al intentar crear con stripe un objeto CHARGE (pago) asociado al card del customer....', error);
                return null;
            }
    }




}