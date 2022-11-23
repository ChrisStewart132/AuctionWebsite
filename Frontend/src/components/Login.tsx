import React from "react";
import axios from "axios"
import {Link, useNavigate } from 'react-router-dom'

import { globalContext } from "../Context/globalContext"


const Login = (props: any) => {
	const { globals, setGlobals } = React.useContext(globalContext);
	const navigate = useNavigate();
	const [emailAddress, setEmailAddress] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	function login() {
		console.log("logging in...", emailAddress)
		const url: string = ('http://localhost:4941/api/v1/users/login')
		const data: userLogin = {
			email: emailAddress,
			password: password
		}
		axios.post(url, data)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				try {
					console.log(JSON.stringify(response.data))
					setGlobals({ authToken: response.data.token, userId: response.data.userId })
					navigate('/profile')
				} catch {
					setErrorFlag(true)
					setErrorMessage("error logging in")
				}
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const handleSubmit = () => {
		console.log("handling submit", emailAddress, password);
		login();
	}

	var [hidingPassword, setHidingPassword] = React.useState(true)
	const showPassword = () => {
		const passwordField = document.getElementById("passwordField") as HTMLInputElement
		if (passwordField) {
			if (passwordField.type === "text") {
				passwordField.type = "password"
				setHidingPassword(true)
			} else {
				passwordField.type = "text"
				setHidingPassword(false)
			}
		}
	}

	return (
		<div>
			<div>
				<h1>Login</h1>
				<div style={{ color: "red" }}>
					{errorMessage}
				</div>
				
				{errorMessage ? <p style={{ color: "red" }}>invalid email or password</p> : false }
			</div>
			<div>
				<div className="normal">
					<label>email address:</label>
					<input type='text' className="form-control" placeholder='enter your email...' onChange={(e) => setEmailAddress(e.target.value)}>
						
					</input>
					<div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
				</div>

				<div className="normal">
					<label>password:</label>
					<input type='password' className="form-control"  id="passwordField" placeholder='enter your password...' onChange={(e) => setPassword(e.target.value)}>				
					</input>
					<br></br>
					<button className={hidingPassword ? "btn btn-secondary" : "btn btn-danger"} onClick={() => showPassword()}> {hidingPassword?"show password":"hide password"} </button>
					
				</div>
				<button className="btn btn-primary" onClick={() => handleSubmit()}> submit </button>		
			</div>	
			<p style={{color:"white"}}>.</p>
			<p>don't have an account? </p><Link to="/register">register here</Link>
	</div >
	)
}
export default Login;