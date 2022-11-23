import React from "react";
import { globalContext } from "../Context/globalContext"
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"
import settings from "../Settings/Settings"

const Profile = () => {
    const { globals, setGlobals } = React.useContext(globalContext);
    
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newFirstName, setNewFirstName] = React.useState("");
    const [newLastName, setNewLastName] = React.useState("");
    const [newEmail, setNewEmail] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [editing, setEditing] = React.useState(false);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [imageFile, setImageFile] = React.useState({} as File)
    const navigate = useNavigate();

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
        getUser()
        getUserImage()
    }, [])
    function getUser() {
        const config = {
            headers: { "X-Authorization": globals.authToken, }
        };
        axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
        console.log("getting user:", globals.userId)
        const url: string = ('http://localhost:4941/api/v1/users/' + globals.userId)
        axios.get(url)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setFirstName(response.data.firstName)
                setLastName(response.data.lastName)
                setEmail(response.data.email)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const [image, setImage] = React.useState("");//img src={image}
    const getUserImage = async() : Promise<any> =>  {
        const config: any = {
            responseType: 'arraybuffer'
        };
        console.log("getting user image:", globals.userId)
        const url: string = ('http://localhost:4941/api/v1/users/' + globals.userId + '/image')
        axios.get(url, config)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                const image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                const imageString = `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
                setImage(imageString);
                //console.log(imageString)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const setUserImage = async () : Promise<any> => {
        const url: string = ('http://localhost:4941/api/v1/users/' + globals.userId + '/image')
        console.log("patching image:", imageFile.name, imageFile.type)
        const data = await imageFile.arrayBuffer()
        axios.put(url, data, { headers: { "content-type": imageFile.type } })
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                getUserImage()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    

    function editUser() {	
        const url: string = ('http://localhost:4941/api/v1/users/' + globals.userId)
        const data: any = {}
        if (newFirstName.length > 0) data.firstName = newFirstName
        if (newLastName.length > 0) data.lastName = newLastName
        if (newEmail.length > 0) {
            if (newEmail.indexOf("@") === -1) {
                setErrorFlag(true)
                setErrorMessage("email must be valid (include an @ symbol)")
                return
            }
            data.email = newEmail
        }
        if (newPassword.length > 0) {
            if (newPassword.length < 6) {
                setErrorFlag(true)
                setErrorMessage("password must have greater than 6 characters")
                return
            }
            data.password = newPassword
        }
        if (currentPassword.length > 0) data.currentPassword = currentPassword
        console.log("editing user:", JSON.stringify(data))
		axios.patch(url, data)
			.then((response) => {
				setErrorFlag(false)
                setErrorMessage("")
                getUser()
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			}) 
    }

    /* sends patch request, sets editing to false (hides edit inputs), and resets cache of new values */
    function handleSubmit() {  
        editUser()//patches user then retrieves updated user from server
        if (removeImage) {
            removeUserImage()
        }
        if (!removeImage && imageFile.name) {
            //console.log(imageFile.name)
            setUserImage()
        }
        setEditing(false)
        //reset all user patch state as when editing toggles the values of the inputs reset also
        setNewFirstName("")
        setNewLastName("")
        setNewEmail("")
        setNewPassword("")
        setCurrentPassword("")
        setRemoveImage(false)
        setImageFile({} as File)
    }

    React.useEffect(() => {
        setNewFirstName("")
        setNewLastName("")
        setNewEmail("")
        setNewPassword("")
        setCurrentPassword("")
        setRemoveImage(false)
        setImageFile({} as File)
    }, [editing])

    const [removeImage, setRemoveImage] = React.useState(false)
    const removeUserImage = async (): Promise<any> => {
        const url: string = ('http://localhost:4941/api/v1/users/' + globals.userId + '/image')
        console.log("deleting image from id: ", globals.userId)
        axios.delete(url)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                window.location.reload()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }


    return (       
        <div>
            {errorFlag ? <div style={{ color: "red" }}>{errorMessage}</div> : false}
            <h1>Profile</h1>
            <p>{/*JSON.stringify(globals)*/}</p>

            <div className="row">
                <div className="col-sm"></div>
                <div className="col-3">
                    <div className="card" >           
                        <div className="card-body">    
                            <img src={image? image : settings.defaultImage} className="card-img-top" alt="profile image" ></img>
                            <p className="card-text">First name: {firstName}</p>
                            <p className="card-text">Last name: {lastName}</p>
                            <p className="card-text">Email: {email}</p>
                            <Link to="" onClick={() => { setEditing(!editing) }} className="btn btn-primary">edit profile</Link>
                        </div>
                    </div>
                </div>
                <div className="col-sm"></div>
            </div>
            {editing ?
                <div>
                    <div className="input-group">
                        <span className="input-group-text">change</span>
                        <input placeholder="first name.." type="text" aria-label="First name" className="form-control" onChange={(e) => setNewFirstName(e.target.value)}></input>
                        <input placeholder="last name.." type="text" aria-label="Last name" className="form-control" onChange={(e) => setNewLastName(e.target.value) }></input>
                        <input placeholder="email.." type="text" aria-label="email" className="form-control" onChange={(e) => setNewEmail(e.target.value)}></input>
                        <input placeholder="current password.." type="password" aria-label="current password" className="form-control" onChange={(e) => setCurrentPassword(e.target.value)}></input>
                        <input placeholder="new password.." type="password" aria-label="new password" className="form-control" onChange={(e) => setNewPassword(e.target.value)}></input>                   
                    </div>   
                    <div className="input-group">
                        <span className="input-group-text">change</span>
                        <input className="btn btn-secondary p-1" type='file' onChange={(e) => { setImageFile(e.target.files ? e.target.files[0] : {} as File) }}></input>
                        <button onClick={() => handleSubmit()} className="btn btn-primary">submit changes</button>
                        <div className="form-check m-1">
                            {removeImage ? <label className="form-check-label">removing image</label> : <label className="form-check-label">remove image?</label>}
                            <input className="form-check-input r-10" type="checkbox" onClick={(e) => { setRemoveImage(!removeImage) }} value="" id="defaultCheck1"></input>
                        </div>
                    </div>     
                </div>
            : false}
        </div>
    )
}
export default Profile;