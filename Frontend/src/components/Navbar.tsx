import React from "react";
import { Link, useNavigate } from 'react-router-dom'
import { globalContext } from "../Context/globalContext"
import Logout from "./Logout";

const Navbar = () => {
	const { globals, setGlobals } = React.useContext(globalContext);
    const navigate = useNavigate();
	

	return (
		<div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="">Navbar</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/auctions">Auctions</Link>
                            </li>
                            <li className="nav-item">
                                {!globals.hasOwnProperty("authToken") ? <Link className="nav-link active" aria-current="page" to="/register">Register</Link> : false}                           
                            </li>
                            
                            <li className="nav-item">
                                {globals.hasOwnProperty("authToken") ? <Link className="nav-link active" aria-current="page" to="/profile">Profile</Link> : false}
                            </li>

                            <li className="nav-item">
                                {globals.hasOwnProperty("authToken") ? <Link to="/create" className="nav-link active">Create Auction</Link> : <Link to="" className="nav-link disabled">Create Auction</Link>}
                            </li>

                            <li className="nav-item">
                                {globals.hasOwnProperty("authToken") ? <Link to="/active" className="nav-link active">My Auctions</Link> : <Link to="" className="nav-link disabled">My Auctions</Link>}
                            </li>
                         
                            <li className="nav-item">
                                {globals.hasOwnProperty("authToken") ? <Logout /> : <Link className="nav-link active" aria-current="page" to="/login">Login</Link>}
                            </li>

                            
                        </ul>
                        {false ?
                            <form className="d-flex">
                                <input className="form-control me-2" type="search" placeholder="Search" id="mainSearch" aria-label="Search"></input>
                               <button className="btn btn-outline-success" onClick={() => { navigate("/auctions") }} type="submit">Search</button>
                         
                            </form>
                            : false}
                    </div>
                </div>
            </nav>
		</div>
	)
}
export default Navbar;