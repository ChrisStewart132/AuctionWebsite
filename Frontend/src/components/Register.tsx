import React from "react";
import axios from "axios"
import { useNavigate } from 'react-router-dom'

import { globalContext } from "../Context/globalContext"


const Register = (props: any) => {
	const { globals, setGlobals } = React.useContext(globalContext);

	const navigate = useNavigate();
	const [firstName, setFirstName] = React.useState("")
	const [lastName, setLastName] = React.useState("")
	const [emailAddress, setEmailAddress] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	const register = async () : Promise<boolean> => {
		console.log("registering:", emailAddress)
		const url: string = ('http://localhost:4941/api/v1/users/register')
		const data: userRegister = {
			firstName: firstName,
			lastName: lastName,
			email: emailAddress,
			password: password
		}
		
		return axios.post(url, data)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				console.log("registered with userId", response.data.userId)
				return true			
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
				return false
			})
    }


	const [imageFile, setImageFile] = React.useState({} as File)
	const setUserImage = async (id: number, token: string): Promise<boolean> => {
		const url: string = ('http://localhost:4941/api/v1/users/' + id + '/image')
		axios.defaults.headers.common = { 'X-Authorization': token }
		console.log("patching image:", imageFile.name, imageFile.type, id, "otken:", token)
		if(imageFile.name === undefined)return false
		const data = await imageFile.arrayBuffer()
		return await axios.put(url, data, { headers: { "content-type": imageFile.type } })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				return true
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
				return false
			})
	}

	const [user, setUser] = React.useState({} as user)
	const login = async () : Promise<any> => {
		console.log("logging in...", emailAddress)
		const url: string = ('http://localhost:4941/api/v1/users/login')
		const data: userLogin = {
			email: emailAddress,
			password: password
		}
		return axios.post(url, data)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				try {
					console.log(JSON.stringify(response.data))
					setGlobals({ authToken: response.data.token, userId: response.data.userId})				
					return { authToken: response.data.token, userId: response.data.userId }
				} catch {
					setErrorFlag(true)
					setErrorMessage("error logging in after registering")
                }
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})		
    }

	//registers, if succesfull..logs in, than patches profile image (if supplied),
	const handleSubmit = async () : Promise<void> => {
		console.log("handling submit", firstName, lastName, emailAddress, password);
		//console.log("image:", imageFile.toString())


		//password len < 6
		if (password.length <= 6) {
			setErrorFlag(true);
			setErrorMessage("password must contain more than 6 characters");
			return
		}

		if (await register() && !globals.hasOwnProperty("authToken")) {			
			const tokenId: any = await login()
			console.log("login resp:", tokenId)
			if (tokenId) {
				if (await setUserImage(tokenId.userId, tokenId.authToken)) navigate('/Profile')	
				else navigate('/Profile')	
			}
        }
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
			{errorFlag ? <div style={{ color: "red" }}>{ errorMessage }</div> : false}
			{errorFlag ? <div style={{ color: "red" }}>{ "password lengthmust be > 6 than characters" }</div> : false}
			{errorFlag ? <div style={{ color: "red" }}>{ "email must be valid and not in-use" }</div> : false}
			<div>
				<h1>Register</h1>
			</div>

			<div className="container-fluid p-3 m-1" >
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">					
						<div className="col-auto">
							<label className="col-form-label">First Name:</label>
						</div>
						<div className="col-auto">
							<input type='text' placeholder='enter your first name...' onChange={(e) => setFirstName(e.target.value)} className="form-control" aria-describedby="passwordHelpInline">
							</input>
						</div>
						<div className="col-auto">
							<span className="form-text text-danger">
								
							</span>
						</div>
					</div>
				</div>
				<br></br>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">last name:</label>
						</div>
						<div className="col-auto">
							<input type='text' placeholder='enter your last name...' onChange={(e) => setLastName(e.target.value)} className="form-control" aria-describedby="passwordHelpInline">
							</input>
						</div>
						<div className="col-auto">
							<span className="form-text text-danger">
								
							</span>
						</div>
					</div>
				</div>
				<br></br>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">email address:</label>
						</div>
						<div className="col-auto">
							<input type='text' placeholder='enter your email...' onChange={(e) => setEmailAddress(e.target.value)} className="form-control" aria-describedby="passwordHelpInline">
							</input>
						</div>
						<div className="col-auto">
							<span className="form-text text-danger">
								
							</span>
						</div>
					</div>
				</div>
				<br></br>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">password:</label>
						</div>
						<div className="col-auto">
							<input id="passwordField" type='password' placeholder='enter your password...' onChange={(e) => setPassword(e.target.value)} className="form-control" aria-describedby="passwordHelpInline">
							</input>						
						</div>
					</div>
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<button className={hidingPassword ? "btn btn-secondary" : "btn btn-danger"} onClick={() => showPassword()}> {hidingPassword ? "show password" : "hide password"} </button>
						</div>
					</div>
				</div>
				<br></br>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label>optional profile image (JPEG, PNG, or GIF) </label>
							<input type='file' onChange={(e) => { setImageFile(e.target.files ? e.target.files[0] : {} as File) }}></input>
						</div>
					</div>
				</div>
				<br></br>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<button className="btn btn-primary" onClick={() => handleSubmit()}> submit </button>
						</div>
					</div>
				</div>
			</div>		
		</div>
	)
}
export default Register;