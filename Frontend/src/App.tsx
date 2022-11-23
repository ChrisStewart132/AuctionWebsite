import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./components/NotFound";
import Navbar from './components/Navbar';
import Home from './components/Home';
import Auctions from './components/Auctions';
import Auction from './components/Auction';
import Register from './components/Register';
import { globalContext } from './Context/globalContext'
import Login from './components/Login';
import Profile from './components/Profile';
import CreateAuction from './components/CreateAuction';
import MyAuctions from './components/MyAuctions';


function App() {

    //global state
    const [globals, setGlobals] = React.useState({} as any);
    const providerValue = React.useMemo(() => ({ globals, setGlobals}),[globals, setGlobals])
    React.useEffect(() => {

        //test user

        if (sessionStorage.getItem('authToken')) {
            setGlobals({
                authToken: sessionStorage.getItem('authToken'),
                userId: sessionStorage.getItem('userId')
            })
        }
        if (globals.hasOwnProperty('authToken')) {
            sessionStorage.setItem('authToken', globals.authToken);
            sessionStorage.setItem('userId', globals.userId);
        }
    }, [])

    return (
        <globalContext.Provider value={providerValue}>
        <div className="App">
            <Router>              
                <div>
                    <span>{/*JSON.stringify(globals) */}</span>                     
                    <Navbar />       
                    <Routes>                      
                        <Route path="/" element={<Home />} />
                        <Route path="/auctions" element={<Auctions />} />
                        <Route path="/auctions/:id" element={<Auction />} />

                        {!globals.hasOwnProperty("authToken") ? <Route path="/register" element={<Register />} /> : false}
                        {!globals.hasOwnProperty("authToken") ? <Route path="/login" element={<Login />} /> : false}
                            {globals.hasOwnProperty("authToken") ? <Route path="/profile" element={<Profile />} /> : false}
                            {globals.hasOwnProperty("authToken") ? <Route path="/create" element={<CreateAuction />} /> : false}
                            {globals.hasOwnProperty("authToken") ? <Route path="/active" element={<MyAuctions />} /> : false}
                        <Route path="*" element={<NotFound />} />
                    </Routes>               
                </div>                
            </Router>
        </div>
        </globalContext.Provider>
    );
}

export default App
