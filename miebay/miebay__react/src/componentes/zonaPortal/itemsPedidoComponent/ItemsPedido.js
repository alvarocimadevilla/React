import './ItemsPedido.css'
import {useLocation, useNavigate } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import restTienda from '../../../servicios/restTienda'


function ItemsPedido( { pedido, cliente } ){
    const _path=useLocation();
    const navigate=useNavigate(); //<---hook de react-router-dom que salta a la url que quieras y carga componente asociado...

    //referencia a variables q no cambian entre renderizados del componente (por eso no se meten en el state), su valor va a ser fijo <=== hook useRef
    const windowPayPal=useRef(null); //<--- para acceder/modificar al contenido "actual" de la variable:  windowPayPal.current
    const intervalCheck=useRef(null); //<--- varible ref.para acceder al setInterval de comprobacion del popup de paypal
    const botonComprar=useRef(null); //<--- variable ref. para acceder al boton COMPRAR del DOM

    //---------efecto con un intervalo creado nada mas cargar componente para que vaya testeando cada cierto intervalo de tiempo la url del popup de pago de paypal----
    //cuando en este popup la url cambie de paypal...  ==> /Tienda/FinalizarPedidoOK ? idPedido=.... & opCodePago=...
    //                                                                               |--------------------------------| window.location.search (en formato string)
    useEffect(
        ()=>{
                intervalCheck.current=setInterval(
                                                    ()=>{
                                                        try {
                                                            if(windowPayPal.current){
                                                                console.log('url popup de paypal....', windowPayPal.current.location.href);
                                                                
                                                                let _queryParams=new URLSearchParams(windowPayPal.current.location.search);
                                                                let _opCode=_queryParams.get('opCodePago');   
                                                                
                                                                if(parseInt(_opCode) === 0){
                                                                    console.log('saltando a FinPedidoOK');
                                                                    navigate(`/Tienda/FinPedidoOk?idPedido=${_queryParams.get('idPedido')}`); 
                                                                } else {
                                                                    windowPayPal.current.close();
                                                                    //mostrar mensaje de error en vista ComprarYa....
                                                                }
                                                            }                                                                
                                                        } catch (error) {
                                                            console.log('error setinterval funcion...', error);
                                                        }
                                                    },
                                             6000 );
                //esta funcion se va a ejecutar cuando el comp. se elimine
                return ()=>{
                    //limpio interval y cierro popup`de paypal por si acaso ha quedado abierto...
                    if(windowPayPal.current) windowPayPal.current.close();
                    clearInterval(intervalCheck.current);
                }
        },
        [navigate]
    )

    async function HandlerClickComprar(){
       //deshabilito boton comprar...para evitar q el usuario clickee sucesivas veces y lance n-peticiones al servicio....
       //document.getElementById('btnComprar').setAttribute('disabled',true); <--------- NO HACER ASI, ACCEDER AL DOM DIRECTAMENTE....
       botonComprar.current.setAttribute('disabled',true);
       botonComprar.current.setAttribute('style','cursor: wait;')

        console.log('en FINALIZAR COMPRA de items pedidos....pedido valoe:', pedido);
       let respServicio=await restTienda.FinalizarPedido(cliente,pedido);

       if(respServicio.datos.urlPayPal) {
        // hay q ir a paypal a pagar:
        //    window.location.href=respServicio.datos.urlPayPal;
            windowPayPal.current=window.open(respServicio.datos.urlPayPal,'pago PayPal', 'popup')
       }
    }


    return (
        <div className="card">
            <div className="card-body">
                <div className="container">
                    
                    <div className="row">
                        <div className="col-8"><p className="card-text">Articulo ({ _path.pathname.includes('ComprarYa') ? pedido.comprarYa.cantidad : pedido.itemsPedido.length.toString() })</p></div>
                        <div className="col-4"><p className="card-text">{pedido.subtotal} EUR</p></div>
                    </div>

                    <div className="row">
                        <div className="col-8"><p className="card-text">Envio ({ _path.pathname.includes('ComprarYa') ? pedido.comprarYa.cantidad : pedido.itemsPedido.length.toString() })</p></div>
                        <div className="col-4"><p className="card-text">{pedido.gastosEnvio} EUR</p></div>
                    </div>
                    <hr></hr>
                    <div className="row">
                        <div className="col-8"><p className="card-text"><strong>Total del pedido</strong></p></div>
                        <div className="col-4"><p className="card-text"><strong>{pedido.total} EUR</strong></p></div>
                    </div>

                    <div className="row mt-4">
                        <div className="col">
                            <button className="btn btn-primary w-100"
                                    id='btnComprar'
                                    ref={botonComprar}
                                    onClick={ HandlerClickComprar }
                            >
                                { _path.pathname.includes('ComprarYa') ? 'Confirmar y pagar': 'Completar Compra'}
                            </button>
                        </div>
                    </div>


                </div>
                
            </div>
        </div>
    )
}

export default ItemsPedido;