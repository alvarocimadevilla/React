import './Layout.css'
import { Outlet } from 'react-router-dom'
import Header from './headerComponent/Header'
import Footer from './footerComponent/Footer'

import { useLoaderData } from 'react-router-dom'

function Layout(){
    //para recuperar los datos de categorias devueltos por el loader del objeto Route: usamos hook useLoaderData()
    const _categorias=useLoaderData();

    return (
        <>
            <Header cats={_categorias} ></Header>
            <div className="container-fluid">
                <div className="row">
                    <div className="col">
                        <Outlet></Outlet>
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </>
    )
}

export default Layout;