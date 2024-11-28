//#region ...podria ir exportando funciones individuales para hacer el Login, el Registro, ....

// export function RegistrarCliente(datosCuenta){
//     //pet ajax para mandar a servicio REST de nodejs los datos del registro
// }

// export function LoginCliente(email,password){
//     //pet ajax para mandar credenciales al servicio REST de nodejs y hacer el login...
// }
//#endregion
//otra forma es crear un objeto JS q tenga como metodos las pet.ajax q quieres hacer, y exportas todo el objeto

//#region ------------------- 1º forma trabajando op.asincronas con eventos y callbacks -----------------------------------------
// let clienteRESTService = {
//     generaEventos: new EventTarget(), //<------ propiedad del objeto que le permite generar o disparar eventos, y añadir handles o funciones callback a los mismos
//     RegistrarCliente: function(datosCuenta){
//         //hacer pet.ajax usando objeto XMLHttpRequest a endpoint:   http://localhost:3003/api/zonaCliente/RegistroCuenta    por POST en formato JSON
//         //hay q establecer cabecera Content-Type a "application/json" usnado metodo de objeto XMLHttpRequest
//         let _petAjax=new XMLHttpRequest();
//         _petAjax.open('POST', 'http://localhost:3003/api/zonaCliente/RegistroCuenta');
//         _petAjax.setRequestHeader('Content-Type', 'application/json'); 

//         _petAjax.addEventListener('readystatechange', (ev)=>{
//             if(_petAjax.readyState===4 && _petAjax.status === 200){
//                 let _respuestaServer=_petAjax.responseText;
//                 //return JSON.parse(_respuestaServer);

//                 //...cuando finalize la op.asincrona en el servicio REST de nodejs, y obtenga la respuesta DISPARO EVENTO PERSONALIZADO...
//                 //lo disparo para que el COMPONENTE DE REACT q use este objeto pueda interceptarlo y ejecutar la funcion callback q le interese
//                 //al componente:
//                 this.generaEventos.dispatchEvent( new CustomEvent('peticionCompletadaRegistro',{ detail: _respuestaServer }) );
//             }

//         });
//         _petAjax.send( JSON.stringify(datosCuenta)  ); //por lo general, conviene serializar los datos con JSON.stringify(datosCuenta)    <--- pasas el objeto en formato string...
//         //return _respuestaServer
//     },
//     addCallBackEvent: function(nombreEvento, funcionCallback){ //<----- metodo del objeto restService q permite añadir handlers o funciones callback en los componetnes React para escuchar eventos producidos por el mismo
//         this.generaEventos.addEventListener(nombreEvento, funcionCallback);
//     }
// }
//#endregion



//#region ------------------- 2º forma trabajando op.asincronas con PROMISE usando XMLHttpRequest--------------------------------------------------
// let clienteRESTService = {
//     RegistrarCliente: function(datosCuenta){ //<------ metodo q devuelve PROMESA del valor de la respuesta del servicio de NODEJS
//                                 let _opAsincronaRESTService=new Promise(
//                                         (resolve,reject)=>{
//                                                     //hacer pet.ajax usando objeto XMLHttpRequest a endpoint:   http://localhost:3003/api/zonaCliente/RegistroCuenta    por POST en formato JSON
//                                                     //hay q establecer cabecera Content-Type a "application/json" usnado metodo de objeto XMLHttpRequest
//                                                     let _petAjax=new XMLHttpRequest();
//                                                     _petAjax.open('POST', 'http://localhost:3003/api/zonaCliente/RegistroCuenta');
//                                                     _petAjax.setRequestHeader('Content-Type', 'application/json'); 

//                                                     _petAjax.addEventListener('readystatechange', (ev)=>{
//                                                         if(_petAjax.readyState===4 && _petAjax.status === 200){
//                                                             let _respuestaServer=JSON.parse(_petAjax.responseText); //al recibir datos, deserializo el json de respuesta q viene en formato STRING.. con JSON.parse()

//                                                             if (_respuestaServer.codigoOperacion===0) {
//                                                                 resolve(_respuestaServer);                                        
//                                                             } else {
//                                                                 reject(_respuestaServer);
//                                                             }
//                                                         }

//                                                     });
//                                                     _petAjax.send( JSON.stringify(datosCuenta)  ); //por lo general, conviene serializar los datos al mandarlos con JSON.stringify(datosCuenta)    <--- pasas el objeto en formato string...
//                                         }
//                                 );
//                                 return _opAsincronaRESTService;
//     }
// }
//#endregion


//#region ------------------- 2º forma trabajando op.asincronas con PROMISE usando FETCH-API ------------------------------------------
let clienteRESTService = {
    RegistrarCliente: function(datosCuenta){
        //el objeto promesa del fetch es del tipo RESPONSE de la fetch api: https://developer.mozilla.org/en-US/docs/Web/API/Response
        return fetch('http://localhost:3003/api/zonaCliente/RegistroCuenta', { method:'POST', body: JSON.stringify(datosCuenta)});
    },
    ExisteEmail: function(email){
        return fetch(`http://localhost:3003/api/zonaCliente/ExisteEmail?email=${email}`);
    },
    LoginCliente: function(email,password){
        return fetch('http://localhost:3003/api/zonaCliente/LoginCliente',{method: 'POST', headers:{ 'Content-type':'application/json'}, body: JSON.stringify( { email, password } ) });
    }
}
//#endregion

export default clienteRESTService;