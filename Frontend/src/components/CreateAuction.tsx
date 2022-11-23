import React from "react";
import axios from "axios"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { globalContext } from "../Context/globalContext"


const CreateAuction = () => {
	const { globals, setGlobals } = React.useContext(globalContext);
	const navigate = useNavigate();
	const [title, setTitle] = React.useState("")
	const [description, setDescription] = React.useState("")
	const [categoryId, setCategoryId] = React.useState(1)
	const [date, setDate] = React.useState("")
	const [time, setTime] = React.useState("")
	const [image, setImage] = React.useState({} as File)
	const [reserve, setReserve] = React.useState(0)

	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	React.useEffect(() => {
		getCategories()
	}, [])
	const [categories, setCategories] = React.useState<Array<category>>([])
	const getCategories = () => {
		console.log("getting categories")
		const url: string = ('http://localhost:4941/api/v1/auctions/categories')
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setCategories(response.data)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const createAuction = async () : Promise<any> => {
		console.log("creating auction:", title, categoryId, date, description, reserve)
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		const url: string = ('http://localhost:4941/api/v1/auctions')
		const data: any = {}
		if (title.length > 0) data.title = title	
		if (true || categoryId > 0) data.categoryId = categoryId//categoryId must always be set
		if (date.length > 0) data.endDate = date + " " + time
		if (description.length > 0) data.description = description
		if (reserve > 0) data.reserve = reserve
		console.log(JSON.stringify(data))
		let id:number = 0;
		axios.post(url, data)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				console.log(response.data)
				id = response.data.auctionId			
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			}).then(() => {
				if(id > 0) setAuctionImage(id)		
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const [imageFile, setImageFile] = React.useState({} as File)
	const setAuctionImage = async (id: number): Promise<any> => {
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/image')
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		console.log("patching image:", imageFile.name, imageFile.type, id)
		if (imageFile.name === undefined) {
			navigate("/auctions/" + id)
			return
		}
		const data = await imageFile.arrayBuffer()
		axios.put(url, data, { headers: { "content-type": imageFile.type } })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				navigate("/auctions/" + id)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}



	function handleSubmit() {
		createAuction()
		/*
		setTitle("")
		setDescription("")
		setCategory("")
		setDate("")
		setImage("")
		setReserve(0)*/
	}

		return (
			<div className="container-fluid">
				<div style={{ color: "red" }}>
					{errorMessage}
				</div>
				{errorMessage ? <p style={{ color: "red" }}>invalid email or password</p> : false}
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">Title</label>
						</div>
						<div className="col-auto">
							<input onChange={(e) => { setTitle(e.target.value) }} placeholder="title.." type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
						 </div>
						<div className="col-auto">
							<span className="form-text text-danger">
								must not be empty
							</span>
						</div>
					</div>
				</div>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">Category</label>
						</div>
						<div className="col-auto">
							<select onChange={(e) => { setCategoryId(parseInt(e.target.value)) }} className="form-select" aria-label="Default select example">							
								{categories.map((item: category) =>
									<option key={item.categoryId} value={item.categoryId}>{/*item.categoryId+": " +*/item.name}</option>
								)}				
							</select>
						</div>
						<div className="col-auto">
							<span className="form-text text-danger">
								must be one of the existing categories
							</span>
						</div>
					</div>
				</div>
				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">End Date</label>
						</div>
						<div className="col-auto">
							<input onChange={(e) => { setDate(e.target.value) }}  placeholder="23/06/23.." type="date" className="form-control" aria-describedby="passwordHelpInline"></input>
							<input onChange={(e) => { setTime(e.target.value) }}  placeholder="end time" type="time" className="form-control" aria-describedby="passwordHelpInline"></input>
						</div>
						<div className="col-auto">
							<span className="form-text text-danger">
								must be in the future
							</span>
						</div>
					</div>
				</div>

				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">Image</label>
						</div>
						<div className="col-auto">
							<input onChange={(e) => { e.target.files ? setImageFile(e.target.files[0]) : {} as File }} placeholder="image.png.." type="file" accept="image/png, image/jpeg, image/gif" className="form-control" aria-describedby="passwordHelpInline"></input>
						</div>
						<div className="col-auto">
							<span className="form-text">
								Optional, JPEG, PNG, or GIF
							</span>
						</div>
					</div>
				</div>

				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">Description</label>
						</div>
						<div className="col-auto">
							<input onChange={(e) => { setDescription(e.target.value) }} placeholder="description.." type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
						</div>
						<div className="col-auto">
							<span className="form-text text-danger">
								must not be empty
							</span>
						</div>
					</div>
				</div>

				<div className="d-flex justify-content-center">
					<div className="row g-3 align-items-center">
						<div className="col-auto">
							<label className="col-form-label">Reserve Price ($)</label>
						</div>
						<div className="col-auto">
							<input onChange={(e) => { setReserve(parseInt(e.target.value)) }} placeholder="1.." type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
						</div>
						<div className="col-auto">
							<span className="form-text">
								Optional, must be $1 or more
							</span>
						</div>
					</div>
				</div>
				<button className="btn btn-primary" onClick={() => handleSubmit()}> submit </button>


			</div>
		)
	
}
export default CreateAuction;