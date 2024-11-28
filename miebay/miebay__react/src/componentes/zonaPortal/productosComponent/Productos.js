//import { useState, useEffect } from 'react';
//import { useParams } from 'react-router-dom'
import './Productos.css'
import { useLoaderData, useNavigate } from 'react-router-dom';

function Productos(){
    const productos=useLoaderData();
    const navigate=useNavigate();
    //console.log('productos recuperados desde nodejs...', productos);
    //#region ------ recuperando productos con useEffect y useParams en vez de con loader ----------
    // const { catId }=useParams();
    // const [productos,setProductos]=useState([]);
    // useEffect(
    //     ()=>{
    //             fetch(`http://localhost:3003/api/zonaTienda/RecuperarProductosFromCat?catId=${catId}`)
    //             .then( resp => resp.json() )
    //             .then( body => {
    //                             console.log('respuesta del servicio para recup.categorias...', body)
    //                             setProductos(body.datos); 
    //                             } 
    //                 )
    //             .catch( err => console.log('error al recuperar productos...',err));        
    //            }
   
    //     ,[catId]
    // )
    //#endregion


    return (
    <div className="container mt-4">

        {/* Navbar de filtros */}
        <div className="row">
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <ul className="navbar-nav">
                        
                        {/* filtro por marca */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Marca
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Action</a></li>
                                <li><a className="dropdown-item" href="#">Another action</a></li>
                                <li><a className="dropdown-item" href="#">Something else here</a></li>
                            </ul>
                        </li>

                        {/* filtro por estado */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Estado
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Action</a></li>
                                <li><a className="dropdown-item" href="#">Another action</a></li>
                                <li><a className="dropdown-item" href="#">Something else here</a></li>
                            </ul>
                        </li>

                        {/* filtro por precio */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Precio
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Action</a></li>
                                <li><a className="dropdown-item" href="#">Another action</a></li>
                                <li><a className="dropdown-item" href="#">Something else here</a></li>
                            </ul>
                        </li>

                        {/* filtro por Formato de compra */}
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Formato de compra
                            </a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Action</a></li>
                                <li><a className="dropdown-item" href="#">Another action</a></li>
                                <li><a className="dropdown-item" href="#">Something else here</a></li>
                            </ul>
                        </li>

                    </ul>
                </div>
            </nav>            
        </div>
  
        {/* Listado de productos */}
        <div className="row">
            <div className="col-3">subcats...</div>

            <div className="col-9">
                {
                    productos && productos.map( 
                                            product => (             
                                                            <div key={product._id}  className="card mb-3 shadow-sm d-flex flex-row" onClick={()=>navigate(`/Tienda/MostrarProducto/${product._id}`)}>
                                                                <div className="col-md-4 p-2">
                                                                    <img src={ product.imagenes[0] } className="img-fluid rounded-start" alt={ product.nombre } />
                                                                </div>
                                                                <div className="col-md-8 p-3">
                                                                    <div className="card-body">
                                                                        <h5 className="card-title">{ product.nombre }</h5>
                                                                        <p className="card-text text-muted">{ product.estado } y poner si el vendedor es particular o empresa</p>
                                                                        <h6 className="card-subtitle mb-2 text-primary">{ product.precio} EUR</h6>
                                                                        <p className="card-text text-muted">0 EUR de envío o envio gratis...a hacer</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                      
                                            )   
                                    )   
                }

            </div>
        </div>

      </div>
    )
}
export default Productos;