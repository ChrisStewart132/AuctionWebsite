import React from "react";
import { globalContext } from "../Context/globalContext"


const Home = () => {
	const { globals, setGlobals } = React.useContext(globalContext);

    React.useEffect(() => {
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
        <div>
            <h1>Home {/*JSON.stringify(globals)*/}</h1>
            <h5>Welcome to *website name*</h5>
            <h5>Feel free to browse our posted auctions,</h5>
            <h5> or register an account to bid on existing auctions, and create auctions for others to bid on</h5>
        </div>
    )
}
export default Home;