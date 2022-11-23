import React from "react";
import { globalContext } from '../Context/globalContext'
import axios from "axios"

const Logout = () => {
	const { globals, setGlobals } = React.useContext(globalContext);
	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")


	function logout() {	
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		const url: string = ('http://localhost:4941/api/v1/users/logout')
		console.log("logging out user:", globals.userId)
		axios.post(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			}) 
		axios.defaults.headers.common = {}
		sessionStorage.removeItem("authToken");
		sessionStorage.removeItem("userId");
		setGlobals({})
    }

	return (
	<div>
			{ errorFlag ? <div style={{ color: "red" }} > {errorMessage}</div > : false}
				< button type="button" className="btn btn-primary" onClick={ () => logout()}>Logout</button>
	</div>
	)
}
export default Logout;