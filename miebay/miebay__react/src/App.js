import './App.css';


import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Login from './componentes/zonaCliente/loginComponent/Login'
import Registro from './componentes/zonaCliente/registroComponent/Registro'
import Layout from './componentes/zonaPortal/layoutComponent/Layout';
import Productos from './componentes/zonaPortal/productosComponent/Productos';
import MostrarProducto from './componentes/zonaPortal/mostrarProductoComponent/MostrarProducto';
import Principal from './componentes/zonaPortal/principalComponent/Principal';
import ComprarYa from './componentes/zonaPortal/comprarProductoYaComponent/ComprarYa';
import FinPedidoOk from './componentes/zonaPortal/finPedidoOkComponent/FinPedidoOk';

import tiendaRESTService  from './servicios/restTienda';

const _routerObjects=createBrowserRouter(
        [
          {
            element: <Layout></Layout>,
            loader: tiendaRESTService.RecuperarCategorias,
            children:[
              { path:'/', element: <Principal></Principal>},//<Navigate to='/Tienda/Productos'/>}, 
              { path:'/Tienda/Productos/:catId', element: <Productos></Productos>,loader: tiendaRESTService.RecuperarProductosFromCat },
              { path: '/Tienda/MostrarProducto/:idProd', element: <MostrarProducto></MostrarProducto>, loader: tiendaRESTService.RecuperarProducto }
            ]
          },
          //{ path: '/Tienda/ComprarYa/:idProd', element: <ComprarYa></ComprarYa>, loader: tiendaRESTService.RecuperarProducto },
          { path: '/Tienda/FinPedidoOk', element: <FinPedidoOk></FinPedidoOk>},
          { path: '/Tienda/ComprarYa', element: <ComprarYa></ComprarYa> },
          { path:'/Cliente/Login', element: <Login></Login>},
          { path:'/Cliente/Registro', element: <Registro></Registro>},
        ]
);

function App() {

  return (
    <>
      <RouterProvider router={_routerObjects}/>
    </>
  );
}

export default App;
