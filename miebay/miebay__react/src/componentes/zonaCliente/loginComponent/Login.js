import './Login.css'
import { useState} from 'react';

import clienteRESTService from '../../../servicios/restCliente';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useGlobalStore from '../../../hooks_personalizados/hooks_stores_zustand/storeGlobal';

function Login(){

    const navigate=useNavigate(); //<----- hook de react-router-dom q devuelve funcion "navigate" q permite saltar a otro componente poniendo la ruta q lo renderiza

    //----del state global recojo valores q me interesan como: funciones para establer el AccessToken, RefreshToken, CuentaCliente
    const setAccessToken=useGlobalStore(state => state.setAccessToken);
    const setRefreshToken=useGlobalStore(state => state.setRefreshToken);
    const setCliente=useGlobalStore(state => state.setCliente);
    //----------------------------------------------------------------

    const [emailValido, setEmailValildo]=useState(false);
    const [ userEmail, setUserEmail]=useState('');
    const [ password, setPassword]=useState('');
 
    async function HandlerClickButtons(ev){
        let _nombreBoton=ev.target.name;
        //let _cajaEmail=document.getElementById('txtEmail').ariaValueMax; //<---- no hacerlo asi, mejor usar el STATE del componente para recoger el valor del email y asi validarlo
        console.log('has pulsado el boton...', _nombreBoton);

        switch (_nombreBoton) {
            case 'Continuar':
                //comprobamos si existe email, y si existe...pedimos password
                let _respuestaServer=await clienteRESTService.ExisteEmail(userEmail); //<---OJO!!! el resultado de la promesa del fetch al server, es un objeto RESPONSE, hay q leer el body con metodo .json()
                let _bodyRespuestaServer=await _respuestaServer.json();
                console.log('respuesta de EXISTE EMAIL del server...', _bodyRespuestaServer);

                if (_bodyRespuestaServer.codigoOperacion===0) {
                    setEmailValildo(true)
                    //redirijo a componente pedir password ...
                    //si no quieres redireccion para cargar otro componente, ocultas dentro de este todos los botones de continuar...y pides caja de texto con password
                    //usando una variable booleana en el STATE
                } else {
                    
                }
                break;

            case 'google':

                break;

            case 'facebook':

                break;
        
            default:
                break;
        }
    }

    async function FullLogin(){
        let _respuestaServer2=await clienteRESTService.LoginCliente(userEmail, password);
        let _bodyRespuestaServer2=await _respuestaServer2.json();

        console.log('respuesta del FULL LOGIN del server....', _bodyRespuestaServer2);
        if (_bodyRespuestaServer2.codigoOperacion===0) {
            //login ok, metemos valores de cuenta el state global y redirigimos a pag.principal de la tienda...
            setAccessToken(_bodyRespuestaServer2.datos.accessToken);
            setRefreshToken(_bodyRespuestaServer2.datos.refreshToken);
            setCliente( _bodyRespuestaServer2.datos.cliente); 

            navigate('/');
        } else {
            //error a mostrar en vista,...
            console.log('error en login....', _bodyRespuestaServer2.mensaje);
        }
    }


    return (
        <div className="container-fluid">
            <div className="row mt-4">
                <div className='col-2'>
                    <Link to="/Tienda/Productos"><img src='/images/logo_ebay.png' alt='loge Ebay'/> </Link>
                </div>
            </div>
            {
                ! emailValido ? (
                        <>

                            <div className='row mt-4'>
                                <div className="col-4"></div>
                                <div className="col-3 d-flex flex-row justify-content-center"><h2 className='title'>Identificate en tu cuenta</h2></div>
                            </div>   
                            <div className='row'>
                                <div className="col-4"></div>
                                <div className="col-3 d-flex flex-row justify-content-center"><span className="sub-heading">¿Primera vez en eBay?</span>{'  '}<NavLink to='/Cliente/Registro'>Crea una cuenta</NavLink></div>
                            </div>   
                            <div className='row mt-4'>
                                <div className="col-4"></div>
                                <div className="col-3">
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control form-element" id="txtEmail" placeholder="name@example.com" onChange={(ev)=>setUserEmail(ev.target.value)}/>
                                        <label htmlFor="txtEmail" className='floating-label'>Correo electronico o pseudonimo</label>
                                    </div>
                                </div>
                            </div>
                            {
                                /* filas de botones: Continuar, Continuar con Facebook, Continuar con Google, Continuar con Apple*/
                                ["Continuar", "facebook", "google", "apple"].map(
                                    (elemento,posicion,arr) => {
                                            return <div className="row mt-4" key={posicion}>
                                                        <div className="col-4"></div>
                                                        <div className="col-3">
                                                            <button className={`btn externos w-100 ${ elemento==='Continuar' || elemento==='facebook' ? 'btn-primary':'btn-light' }` }
                                                                    name={elemento}
                                                                    onClick={HandlerClickButtons}
                                                            >
                                                                <i className={ `fa-brands fa-${elemento} fa-2xl` }></i>
                                                                {' '}Continuar { elemento !=='Continuar' && `con ${elemento}`}
                                                            </button>
                                                        </div>
                                                    </div>
                                    }
                                )
                            }                        
                        </>
                )
                 :
                 (
                        <>
                            <div className="row mt-4">
                                <div className="col-4"></div>
                                <div className="col-3 d-flex flex-row justify-content-center">
                                    <h2 className='title'>!Hola de nuevo!</h2>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4"></div>
                                <div className="col-3 d-flex flex-row justify-content-center">
                                    <span className='sub-heading'>{userEmail}</span>
                                    {'  '} 
                                    <a href='/'><span className='sub-heading'>Cambiar de cuenta</span></a>
                                </div>
                            </div>
                            <div className='row mt-4'>
                                <div className="col-4"></div>
                                <div className="col-3">
                                    <div className="form-floating mb-3">
                                        <input type="password" className="form-control form-element" id="txtPassword" placeholder="" onChange={(ev)=>setPassword(ev.target.value)}/>
                                        <label htmlFor="txtPassword" className='floating-label'>Contraseña</label>
                                    </div>
                                </div>
                            </div>                            
                            <div className='row'>
                                <div className="col-4"></div>
                                <div className="col-3">
                                    <button className="btn btn-light w-100" onClick={FullLogin}>Identificate</button>
                                </div>
                            </div>
                            <div className='row mt-4'>
                                <div className="col-4"></div>
                                <div className="col-3">
                                    <a href='/'>Reestablecer contraseña</a>
                                </div>
                            </div>                            
                        </>
                 )
            }

        </div>
    )
}

export default Login;
