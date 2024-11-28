import './FinPedidoOk.css'
import { useSearchParams, Link } from 'react-router-dom'
import useGlobalStore from '../../../hooks_personalizados/hooks_stores_zustand/storeGlobal';

function FinPedidoOk(){
    const pedidoFinalizado=useGlobalStore(state => state.pedido);
    const datosClienteLogged=useGlobalStore(state => state.cliente);

    const [searchParams]=useSearchParams(); //<--- hook de react-router-dom para acceder a parametros en querystring: https://reactrouter.com/en/main/hooks/use-search-params

    return (
        <div className="container">
                <div className="row">
                    <img src="/images/pedidoOK.jpg" style={{width: "200px", height: "200px"}} alt="..."/>
                </div>

                <div className="row">
                    <div className="col">
                        <h5>Pago del pedido con id: {searchParams.get('idPediddo')} realizado correctamente</h5>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <p>Has pagado {pedidoFinalizado.total}€ en fecha: {pedidoFinalizado.fechaPedido} </p>
                        <p>Se te ha mandado un email a <span style={{color:'cyan'}}>{datosClienteLogged.cuenta.email}</span> con la factura del mismo (consulta la bandeja de entrada de tu correo o el spam por si acaso).</p>
                        <br />
                        <p> Accede al panel de tu USUARIO para ver la lista de pedidos que has hecho en la tienda.</p>
                    </div>
                </div>
                
                <div className="row d-flex justify-content-center">
                    <Link className="btn btn-success btn-lg" to="/Cliente/Panel/MieBay">IR A MI PANEL</Link>
                </div>
        </div> 
    )
}

export default FinPedidoOk