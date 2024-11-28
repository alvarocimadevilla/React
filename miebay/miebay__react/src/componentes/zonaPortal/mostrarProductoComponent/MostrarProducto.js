import './MostrarProducto.css'
import { useState } from 'react';
import { useLoaderData,useNavigate  } from 'react-router-dom'
import useGlobalStore from '../../../hooks_personalizados/hooks_stores_zustand/storeGlobal';

function MostrarProducto(){
    const producto=useLoaderData();
    const setPedido=useGlobalStore(state=>state.setPedido);

    const navigate=useNavigate();
    
    const [activeTab, setActiveTab] = useState('specs');

    console.log('producto recuperado del loader...', producto);

    function handleTabClick(tab) {
      setActiveTab(tab);
    };

    function HandlerComprarYaButton(){
        setPedido(
            {
                comprarYa: { producto, cantidad: 1 },
                subtotal: producto.precio,
                gastosEnvio: 0,
                total: producto.precio
            }
        )
        navigate('/Tienda/ComprarYa');
        //navigate(`/Tienda/ComprarYa/${producto._id}`)
    }


    return (
        <div className="container mt-5">
            <div className="row">
            {/* Sección de imagenes */}
            <div className="col-md-5">
                <div id="productImagesCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {
                        producto.imagenes.length > 0 ? 
                        (
                            producto.imagenes.map(
                                (imagen,pos) => {
                                    return (
                                            <div className={`carousel-item ${pos === 0 ? 'active' : ''} `} key={pos}>
                                                <img src={imagen} className="d-block w-100" alt="Producto" />
                                            </div>                    
                                    )
                                }
                            )
                        )
                        :
                        (
                            //sin imagenes
                            <div className="carousel-item active">
                                <img src="https://via.placeholder.com/500" className="d-block w-100" alt="Product" />
                            </div>        
                        )
                    }
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#productImagesCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#productImagesCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
                </div>
            </div>

            {/* Sección de detalles del producto */}
            <div className="col-md-7">
                <h3>{producto.nombre}</h3>
                <p>Vendido por <a href="/">...nombre vendedor...</a> | <a href="/">Contactar con el vendedor</a></p>
                <h4 className="text-success">{producto.precio} EUR</h4>
                <p>Estado: <strong>{producto.estado}</strong></p>
                <div className="d-grid gap-2 my-3">
                <button className="btn btn-primary btn-lg" type="button" onClick={ HandlerComprarYaButton }>¡Cómpralo ya!</button>
                <button className="btn btn-outline-secondary btn-lg" type="button">Añadir a la cesta</button>
                <button className="btn btn-link" type="button">Añadir a la lista de seguimiento</button>
                </div>
            </div>
            </div>
    

            <div className="row">
                {/* Tabs para Caracteristicas producto e informacion del vendedor */}
                <ul className="nav nav-tabs mt-4" role="tablist">
                    <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'specs' ? 'active' : ''}`}
                        onClick={() => handleTabClick('specs')}
                        type="button"
                    >
                        Características del producto
                    </button>
                    </li>
                    <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'seller' ? 'active' : ''}`}
                        onClick={() => handleTabClick('seller')}
                        type="button"
                    >
                        Información del vendedor
                    </button>
                    </li>
                </ul>

                <div className="tab-content mt-3">
                    {/* Tab de Características del producto */}
                    <div className={`tab-pane fade ${activeTab === 'specs' ? 'show active' : ''}`}>
                    <h5>Características del artículo</h5>
                    <ul>
                        {
                            producto.caracteristicas.split('$').map(
                                (car,pos) => (
                                    <li key={pos}> {car} </li>
                                )
                            )
                        }

                    </ul>
                    <h6>Descripción del artículo:</h6>
                    {
                        producto.descripcion.split('$').map(
                            (des,pos)=>(<p key={pos}>{des}</p> )
                        )
                    }
                    </div>

                    {/* Tab de Información del vendedor */}
                    <div className={`tab-pane fade ${activeTab === 'seller' ? 'show active' : ''}`}>
                    <h5>Información del vendedor</h5>
                    <p>Vendedor: <strong>...nombre vendedor...</strong></p>
                    <p>Valoraciones: 4.9/5 (380 valoraciones)</p>
                    <div>
                        <button className="btn btn-outline-primary">Visitar tienda</button>
                        <button className="btn btn-outline-secondary ms-2">Contactar</button>
                    </div>
                    </div>
                </div>
            </div>
        
            {/* Productos relacionados */}
            <div className="mt-5">
                <h5>Artículos similares</h5>
                <div className="row">
                <div className="col-md-3">
                    <div className="card">
                    <img src="https://via.placeholder.com/150" className="card-img-top" alt="Related Product" />
                    <div className="card-body">
                        <h6 className="card-title">Producto relacionado 1</h6>
                        <p className="card-text">1,000 EUR</p>
                    </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                    <img src="https://via.placeholder.com/150" className="card-img-top" alt="Related Product" />
                    <div className="card-body">
                        <h6 className="card-title">Producto relacionado 2</h6>
                        <p className="card-text">1,200 EUR</p>
                    </div>
                    </div>
                </div>
                {/* Añadir más productos relacionados */}
                </div>
            </div>    

        </div>
      );

}

export default MostrarProducto;