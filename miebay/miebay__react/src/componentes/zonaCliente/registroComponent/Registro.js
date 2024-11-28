import './Registro.css';
import { useState } from 'react';
import  clienteRESTService  from '../../../servicios/restCliente';
import { Link, NavLink } from 'react-router-dom';



//funcion javascript que define componente Registro Portal...
function Registro(){
    //#region ...1º props...
    //console.log('propiedades del componente recibidos como atributos, son INMUTABLES!!!', props);
    //let {username,password}=props;
    //#endregion


    //#region ....2º state ...
    //TODO...meto en el state un OBJETO UNICO para recoger y validar todos los campos del formulario:
    //!     - este objeto tiene como propiedads los CAMPOS DEL FORMULARIO: nombre,apellidos,email y password
    //!     - dentro de cada propiedad tendra su: valor, estado de validacion, validadores y mensajeError en validacion

    let [formData, setFormData]=useState(
        {
            nombre:{
                valor:'', //<---- propiedad a modificar en evento OnChange 
                valido: false, // <---- propiedad a modificar en evento OnBlur, en funcion de validaciones q define prop. validaciones del objeto
                validaciones: { // <------ validaciones a realizar sobre el valor, cada prop. es un array donde 1º posicion def. valor de validacion a cumplir, y 2º posicion mensaje de error si no cumple
                   obligatorio:[ true, '* Nombre obligatorio' ],
                   maximaLongitud: [150,'* Nombre no debe exceder de 150 caracteres'],
                   patron: [ /^([A-Z][a-z]+\s*)+/, '* Formato invalido del nombre, ej: Pedro Pablo']
                   },
                mensajeValidacion:''
            },
            apellidos:{
                valor:'', 
                valido: false,
                validaciones:{ 
                    obligatorio: [ true, '* Apellidos obligatorios'],
                    maximaLongitud: [ 250, '* Apellidos no debe exceder de 250 cars.'],
                    patron: [ /^([A-Z][a-z]+\s*)+/, '* Formato invalido apellidos, ej: Nuria Roca']
                },
                mensajeValidacion:''
            },
            email:{
                valor:'', //<---- propiedad a modificar en evento OnChange 
                valido: false, // <---- propiedad a modificar en evento OnBlur, en funcion de validaciones q define prop. validaciones del objeto
                validaciones: { // <------ validaciones a realizar sobre el valor, cada prop. es un array donde 1º posicion def. valor de validacion a cumplir, y 2º posicion mensaje de error si no cumple
                   obligatorio:[ true, '* Email obligatorio' ],
                   maximaLongitud: [200,'* Email no debe exceder de 200 caracteres'],
                   minimaLongitud: [15, '* Email debe superar los 15 caracteres'],
                   patron: [ /^.+@(hotmail|gmail|yahoo|msn)\.[a-z]{2,3}$/, '* Formato invalido del email, ej: pablo.mr@(hotmail|gmail|yahoo|msn).es'],
                   },
                mensajeValidacion:''               
            },
            password:{
                valor:'', 
                valido: false,
                validaciones:{ 
                    obligatorio: [ true, '* Contraseña obligatoria'],
                    minimaLongitud: [ 8, '* La contraseña debe tener al menos 8 caracteres '],
                    patron: [ /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%*]).{8,}$/ , '* Formato invalido contraseña, una MAYS, una Mins, un digito, un simbolo']
                },
                mensajeValidacion:''
            }
        }
    );
    //#endregion

    //#region ....3º codigo funcionalidad javascript

    async function SubmitForm(ev){
        ev.preventDefault();
        //#region ...este codigo genera por consola UNDEFINED pq la op.asincrona no se completa antes del console.log q muestra los resultados...
        // let _respuestaServer=clienteRESTService.RegistrarCliente( 
        //                                                     { 
        //                                                         nombre: formData.nombre.valor,
        //                                                         apellidos: formData.apellidos.valor,
        //                                                         email: formData.email.valor,
        //                                                         password: formData.password.valor
        //                                                     } 
        //                                                 );
        // console.log('datos recibidos del servidor....', _respuestaServer); //<--- en teoria deberia aparecer el JSON q manda el servidor en la op.de registro
        //#endregion

        //#region ---codigo usando EVENTOS-CALLBACKS en op.asincronas de restService ---
        // invocamos al metodo q genera la op.asincrona del objeto restClient, cuando esta acabe, el objeto restClient disparara evento
        // "peticionCompletadaRegistro" y para q el componente Registro la interecepte, añadimos funcion callback a ejecutar cuando se produzca
        // este evento:
        // clienteRESTService.RegistrarCliente(
        //                                     { 
        //                                         nombre: formData.nombre.valor,
        //                                         apellidos: formData.apellidos.valor,
        //                                         email: formData.email.valor,
        //                                         password: formData.password.valor
        //                                     } 
        //                                 );
        // clienteRESTService.addCallBackEvent("peticionCompletadaRegistro",(ev)=>{
        //             console.log('datos recibidos del servicio REST de nodejs a traves del objeto restService....', ev.detail);
        // });
        //#endregion

        //#region ---codigo usando PROMISE en op.asincrona de restService ---
        // clienteRESTService.RegistrarCliente(
        //                                     { 
        //                                         nombre: formData.nombre.valor,
        //                                         apellidos: formData.apellidos.valor,
        //                                         email: formData.email.valor,
        //                                         password: formData.password.valor
        //                                     } 
        //                     ).then( respuestaServer => console.log('datos recibidos del servicio REST de nodejs desde restSErvice...', respuestaServer))
        //                      .catch( error => console.log('error en servicio REST de nodejs en registro...', error) );
        try {
                let _respuestaServer=await clienteRESTService.RegistrarCliente(
                    { 
                        nombre: formData.nombre.valor,
                        apellidos: formData.apellidos.valor,
                        email: formData.email.valor,
                        password: formData.password.valor
                    } 
                );
                console.log('datos recibidos del servicio ERST de nodejs desde restService...', _respuestaServer);

        } catch (error) {
            console.log('error en servicio REST de nodejs en registro...', error)    
        }
        //#endregion

    }

    function HandlerBlurEventInputs(ev){
        let _estadoNombre=false; //<----- para asignar a campoNombre.valido en funcion de la validacion que se haga...
        let _mensajeError='';   // <----- para asignar a campoNombre.mensajeValidacion en funcion de la validacion que haya fallado
        
        // Object.keys(campoNombre.validaciones)
        //       .forEach( 
        //                 (el,i,ar)=>{
        //                     console.log('validacion de: ',campoNombre.valor, el, campoNombre.validaciones[el]);
        //                     switch (el) {
        //                         case 'obligatorio':
        //                                     console.log('...entrando en validacion obligatorio....');
        //                                     if(campoNombre.valor.trim()!==''){
        //                                             _estadoNombre=true;
        //                                             _mensajeError='';
        //                                     } else {
        //                                         _estadoNombre=false;
        //                                         _mensajeError=campoNombre.validaciones[el][1];
        //                                     }
        //                                     console.log('variables _estadoNombre y _mensajeError...', _estadoNombre, _mensajeError);
        //                                     break;
        //                         case 'patron':
        //                                     console.log('...entrando en validacion patron....');
        //                                     if (campoNombre.validaciones[el][0].test(campoNombre.valor)) {
        //                                         _estadoNombre=true;
        //                                         _mensajeError='';                                            
        //                                     } else {
        //                                         _estadoNombre=false;
        //                                         _mensajeError=campoNombre.validaciones[el][1];                                                
        //                                     }
        //                                     console.log('variables _estadoNombre y _mensajeError...', _estadoNombre, _mensajeError);

        //                                     break;

        //                         case 'maximaLongitud':
        //                                     console.log('...entrando en validacion maximaLongitud....');
        //                                     if( campoNombre.valor.length <= campoNombre.validaciones[el][0] ){
        //                                         _estadoNombre=true;
        //                                         _mensajeError='';                                            
        //                                     } else {
        //                                         _estadoNombre=false;
        //                                         _mensajeError=campoNombre.validaciones[el][1];                                                
        //                                     }
        //                                     console.log('variables _estadoNombre y _mensajeError...', _estadoNombre, _mensajeError);

        //                                     break;

        //                         default:
        //                             break;
        //                     }
        //                }
        //         );

        // setCampoNombre(
        //     {
        //         ...campoNombre,
        //         valido: _estadoNombre,
        //         mensajeValidacion: _mensajeError
        //     }
        // );
    }
    //#endregion


    //4º codigo JSX renderiza vista del componente
    return (
        <>
            <div className='container'>
                { /* fila donde va logo de ebay y link para el Login*/ }
                <div className='row mt-4'>
                    <div className='col-2'>
                        <Link to="/Tienda/Productos"><img src='/images/logo_ebay.png' alt='loge Ebay'/> </Link>
                    </div>
                    <div className='col-6'></div>
                    <div className='col-2'>
                        <span>¿Ya tienes una cuenta?</span>
                    </div>
                    <div className='col-2'>
                        <NavLink to="/Cliente/Login">Identificarse</NavLink>
                    </div>
                </div>

                { /* fila donde va imagen de registro y formulario, depdende tipo de cuenta, si es PERSONAL o EMPRESA*/ }
                <div className='row mt-4'>
                    <div className='col-8'><img src='/images/imagen_registro_personal.jpg' alt='Registro Personal'></img></div>
                    <div className='col-4'>
                        <form  onSubmit={ SubmitForm }>
                            <div className='row'><h1 className='title'>Crear una cuenta</h1></div>
                            <div className="row">
                                <div className="col form-floating">
                                    <input type="text"
                                           id='txtNombre'
                                           className="form-control form-element"
                                           placeholder="Nombre"
                                           onChange={(ev)=>setFormData( { ...formData, nombre: { ...formData.nombre, valor:ev.target.value } } ) }
                                           onBlur={ HandlerBlurEventInputs }
                                    />

                                    {/* ! campoNombre.valido && <span className='text-error'>{campoNombre.mensajeValidacion}</span>*/ }
                                    <label htmlFor='txtNombre' className='floating-label'>Nombre</label>
                                </div>
                                <div className="col mb-3 form-floating">
                                    <input type="text" 
                                           id='txtApellidos'
                                           className="form-control form-element"
                                           placeholder="Apellidos"
                                           onChange={(ev)=>setFormData( { ...formData, apellidos: { ...formData.apellidos, valor:ev.target.value } } ) }
                                           onBlur={ HandlerBlurEventInputs }
                                    /> 
                                    <label  className='floating-label'>Apellidos</label>
                                </div>
                            </div>
                            <div className="mb-3 form-floating">
                                <input type="email"
                                       id='txtEmail'
                                       className="form-control form-element"
                                       placeholder="Correo electrónico"
                                       onChange={(ev)=>setFormData( { ...formData, email: { ...formData.email, valor:ev.target.value } } ) }
                                       onBlur={ HandlerBlurEventInputs }
                                />  
                                <label className='floating-label'>Correo Electronico</label>
                            </div>
                            <div className="mb-3 form-floating">
                                <input type="password"
                                       id='txtPassword'
                                       className="form-control form-element"
                                       placeholder="Contraseña"
                                       onChange={(ev)=>setFormData( { ...formData, password: { ...formData.password, valor:ev.target.value } } ) }
                                       onBlur={ HandlerBlurEventInputs }
                                />
                                <label className='floating-label'>Contraseña</label>
                            </div>
                            <div className="mb-3" style={{ maxWidth: "430px" }}>
                                {/*** minicomponente para desuscribirse */}
                                <p className="text-small">
                                    Te enviaremos correos electrónicos sobre ofertas
                                    relacionadas con nuestros servicios periódicamente. Puedes{" "}
                                    <a href="/" style={{ color: "#007bff", textDecoration: "underline" }}>
                                        cancelar la suscripción
                                    </a>{" "}
                                    en cualquier momento.
                                </p>
                                <p className="text-small">
                                    Al seleccionar Crear cuenta personal, aceptas nuestras
                                    Condiciones de uso y reconoces haber leído nuestro Aviso de
                                    privacidad.
                                </p>
                            </div>
                            <button type="submit" className="btn w-100 mb-3">
                                Crear cuenta personal
                            </button>
                            <div className='row mt-3 d-flex flex-row'>
                                <span className='separator-before'></span>
                                <span className='text-small inseparator'>o continua con</span>
                                <span className='separator-after'></span>
                            </div>
                            <div className='row'>
                                <div className='col'><button className='redes' style={{width: '100%'}}><i className="fa-brands fa-google"></i> Google</button></div>
                                <div className='col'><button className='redes' style={{width: '100%'}}><i className="fa-brands fa-facebook"></i> Facebook</button></div>
                                <div className='col'><button className='redes' style={{width: '100%'}}><i className="fa-brands fa-apple"></i> Apple</button></div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>       
        </>
    );
}

export default Registro;