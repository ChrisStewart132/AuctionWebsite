import React from "react";
import axios from "axios"
import { Link, useNavigate } from 'react-router-dom'
import { globalContext } from "../Context/globalContext"
import settings from "../Settings/Settings"

const MyAuctions = () => {
	const { globals, setGlobals } = React.useContext(globalContext);
	const navigate = useNavigate();

	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	React.useEffect(() => {
		getMyAuctions()
		getBiddedAuctions()
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

	const [auctions, setAuctions] = React.useState<Array<auctions>>([])
	const getMyAuctions = () => {
		console.log("getting my auctions")
		let params: string = '?sellerId=' + globals.userId;
		const url: string = ('http://localhost:4941/api/v1/auctions' + params)
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setAuctions(response.data.auctions)
				//console.log("response", response.data.auctions)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const [biddedAuctions, setBiddedAuctions] = React.useState<Array<auctions>>([])
	const getBiddedAuctions = () => {
		console.log("getting my auctions")
		let params: string = '?bidderId=' + globals.userId;
		const url: string = ('http://localhost:4941/api/v1/auctions' + params)
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setBiddedAuctions(response.data.auctions)
				//console.log("response", response.data.auctions)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	

	React.useEffect(() => {
		getAuctionImages()
	}, [auctions, biddedAuctions])
	const [auctionImagesObject, setAuctionImagesObject] = React.useState({} as any)//{}
	const getAuctionImages = async (): Promise<any> => {
		const obj: any = {}//obj of all auctionIds {auctionId:auctionId}
		auctions.map((item: auctions) => {
			obj[(item.auctionId)] = item.auctionId;
		})
		biddedAuctions.map((item: auctions) => {
			obj[(item.auctionId)] = item.auctionId;
		})
		const newAuctionImagesObject: any = {}
		for (let id in obj) {
			const i = await getAuctionImage(parseInt(id))
			newAuctionImagesObject[id] = i
		}
		//console.log(obj,"auction images objcect", JSON.stringify(newAuctionImagesObject))
		setAuctionImagesObject(newAuctionImagesObject)
	}
	const getAuctionImage = async (id: number): Promise<any> => {
		console.log("getting auction image, params:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/image')
		return axios.get(url, { responseType: 'arraybuffer' })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				const image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
				const imageString = `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
				return imageString;
			}, (error) => {
				//setErrorFlag(true)
				//setErrorMessage(error.toString())
				return ""
			})
	}


	const getAuction = async (id:number) : Promise<any> => {
		console.log("getting auction:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id)
		return axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				return (response.data) as auctions
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}



	const [deleteId, setDeleteId] = React.useState(0);
	function deleteAuction() {
		console.log("deleting auction:", deleteId, auctions.filter(x => x.auctionId === deleteId)[0])
		if (auctions.filter(x => x.auctionId === deleteId)[0].numBids !== 0) {
			setErrorFlag(true)
			setErrorMessage("Can't delete auction as there have been bids placed")
			return
		}
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		const url: string = ('http://localhost:4941/api/v1/auctions/' + deleteId)
		axios.delete(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				getMyAuctions()
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const [editId, setEditId] = React.useState(0);//todo
	const [title, setTitle] = React.useState("")
	const [description, setDescription] = React.useState("")
	const [categoryId, setCategoryId] = React.useState(0)
	const [date, setDate] = React.useState("")
	const [time, setTime] = React.useState("")
	const [image, setImage] = React.useState({} as File)
	const [reserve, setReserve] = React.useState(0)
	const editAuction = async (): Promise<void> => {
		console.log("editing auction:", title, categoryId, date, description, reserve)
		if (auctions.filter(x => x.auctionId === editId)[0].numBids !== 0) {
			setErrorFlag(true)
			setErrorMessage("Can't edit auction as there have been bids placed")
			return
		}

		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		const url: string = ('http://localhost:4941/api/v1/auctions/' + editId)

		//first set data to current values than mutate changed values
		let data: postAuction = {} as postAuction;
		for (let i = 0; i < auctions.length; i++) {
			if (auctions.at(i)?.auctionId === editId) {
				if (auctions.at(i)?.highestBid === undefined) {
					setErrorFlag(true)
					setErrorMessage("auction must not have any bids placed to allow editing")
					return
				}
				const a: any = auctions.at(i)
				//console.log("found it", JSON.stringify(a))
				data.categoryId = a.categoryId
				data.description = (await getAuction(a.auctionId)).description//have to query the specific auction to get its description to set it so when submitting the description is kept with the patch

				const d = (new Date(a.endDate))
				if (date.length === 0) {
					if (d.getTime() < Date.now()) {
						setErrorFlag(true)
						setErrorMessage("Date must be in the future")
						return
					}
				}
				data.endDate = "" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes())
				data.reserve = a.reserve
				data.title = a.title
				console.log("data", data.endDate)
			}
		}

		if ((new Date(date)).getTime() < Date.now()) {
			setErrorFlag(true)
			setErrorMessage("Date must be in the future")
			return
		}

		if (title.length > 0) data.title = title
		if (categoryId > 0) data.categoryId = categoryId
		if (date.length > 0) data.endDate = date + " " + time
		if (description.length > 0) data.description = description
		if (reserve > 0) data.reserve = reserve
		console.log(JSON.stringify(data))

		setAuctionImage(editId)
		axios.patch(url, data)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				console.log(response.data)
				navigate("/auctions/" + editId)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})

		setTitle("")
		setDescription("")
		setCategoryId(0)
		setDate("")
		setReserve(0)
	}

	const [imageFile, setImageFile] = React.useState({} as File)
	const setAuctionImage = async (id: number): Promise<any> => {
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/image')
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		console.log("patching image:", imageFile.name, imageFile.type, id)
		if(imageFile.name === undefined) return
		const data = await imageFile.arrayBuffer()
		axios.put(url, data, { headers: { "content-type": imageFile.type } })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				getAuctionImages()
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}



	const days = (date_1: Date, date_2: Date) => {
		/* returns days between two given dates */
		let difference = date_1.getTime() - date_2.getTime();
		let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
		return TotalDays >= 0 ? TotalDays : "-";
	}

	React.useEffect(() => {
		list_of_my_auctions()
		list_of_my_bidded_auctions()
	}, [auctionImagesObject])

	const list_of_my_auctions = () => {
		//console.log("presenting auctions table")
		//let images: any = {}
		//console.log(JSON.stringify(images))
		return auctions.map((item: auctions) =>
			<tr key={item.auctionId}>
				<th scope="row">{item.auctionId}</th>
				<td scope="row" width="100" height="100"><img src={auctionImagesObject[item.auctionId] || settings.defaultImage} className="card-img-top" alt="profile image"></img> </td>
				<td scope="row">{item.title}</td>
				<td scope="row">{days(new Date(item.endDate), new Date()) /*days till closing*/}</td>
				<td scope="row">{categories.filter((obj: category) => obj.categoryId === item.categoryId).length > 0 ? categories.filter((obj: category) => obj.categoryId === item.categoryId)[0].name : "category error??"}</td>
				<td scope="row">{item.sellerFirstName + ", " + item.sellerLastName}</td>
				<td scope="row">{item.highestBid}</td>
				{item.reserve <= item.highestBid ? <td scope="row"><b>{item.reserve}</b></td> : <td scope="row">{item.reserve}</td>}
				<td><Link className="btn btn-primary" to={"/auctions/" + item.auctionId}>View</Link></td>
				<td>
					{item.sellerId === parseInt(globals.userId) ? <button className="btn btn-warning" onClick={() => { setEditId(item.auctionId) }} type="button" data-bs-toggle="modal" data-bs-target="#editUserModal">Edit</button> : false}
				</td>
				<td>
					{item.sellerId === parseInt(globals.userId) ? <button className="btn btn-danger" onClick={() => { setDeleteId(item.auctionId) }} type="button" data-bs-toggle="modal" data-bs-target="#deleteUserModal">Delete</button> : false}
				</td>
			</tr >
		)
	}
	const list_of_my_bidded_auctions = () => {
		//console.log("presenting auctions table")
		//let images: any = {}
		//console.log(JSON.stringify(images))
		return biddedAuctions.map((item: auctions) =>
			<tr key={item.auctionId}>
				<th scope="row">{item.auctionId}</th>
				<td scope="row" width="100" height="100"> <img src={auctionImagesObject[item.auctionId] || settings.defaultImage} className="card-img-top" alt="profile image"></img>  </td>
				<td scope="row">{item.title}</td>
				<td scope="row">{days(new Date(item.endDate), new Date()) /*days till closing*/}</td>
				<td scope="row">{categories.filter((obj: category) => obj.categoryId === item.categoryId).length > 0 ? categories.filter((obj: category) => obj.categoryId === item.categoryId)[0].name : "category error??"}</td>
				<td scope="row">{item.sellerFirstName + ", " + item.sellerLastName}</td>
				<td scope="row">{item.highestBid}</td>
				{item.reserve <= item.highestBid ? <td scope="row"><b>{item.reserve}</b></td> : <td scope="row">{item.reserve}</td>}
				<td><Link className="btn btn-primary" to={"/auctions/" + item.auctionId}>View</Link></td>
				<td>
					{item.sellerId === parseInt(globals.userId) ? <button className="btn btn-warning" onClick={() => { setEditId(item.auctionId) }} type="button" data-bs-toggle="modal" data-bs-target="#editUserModal">Edit</button> : false}
				</td>
				<td>
					{item.sellerId === parseInt(globals.userId) ? <button className="btn btn-danger" onClick={() => { setDeleteId(item.auctionId) }} type="button" data-bs-toggle="modal" data-bs-target="#deleteUserModal">Delete</button> : false}
				</td>
			</tr >
		)
	}

	


	return (

		<div>
			{errorFlag ? <div style={{ color: "red" }}>{errorMessage}</div> : false}
			<br></br>

			<h1>My Auctions</h1>
			<table className="table">
				<thead>
					<tr>
						<th scope="col">#</th>
						<th scope="col">Hero image</th>
						<th scope="col">Title</th>
						<th scope="col">Days Till Closing</th>
						<th scope="col">Category</th>
						<th scope="col">Seller</th>
						<th scope="col">Highest Bid</th>
						<th scope="col">Reserve</th>
						<th scope="col">Details</th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					{list_of_my_auctions()}
				</tbody>
			</table>

			<br></br>

			<h1>Auctions Bidded on</h1>
			<table className="table">
				<thead>
					<tr>
						<th scope="col">#</th>
						<th scope="col">Hero image</th>
						<th scope="col">Title</th>
						<th scope="col">Days Till Closing</th>
						<th scope="col">Category</th>
						<th scope="col">Seller</th>
						<th scope="col">Highest Bid</th>
						<th scope="col">Reserve</th>
						<th scope="col">Details</th>
						<th scope="col"></th>
					</tr>
				</thead>
				<tbody>
					{list_of_my_bidded_auctions()}
				</tbody>
			</table>



			<div className="modal fade" id="deleteUserModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">Delete Auction?</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							Are you sure you want to delete auction: {deleteId}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => { deleteAuction() }}>Delete</button>
						</div>
					</div>
				</div>
			</div>

			<div className="modal fade" id="editUserModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">Edit Auction</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							<input onChange={(e) => { setTitle(e.target.value) }} placeholder="title" type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
							{/*<input onChange={(e) => { setCategoryId(parseInt(e.target.value)) }} placeholder="category id" type="text" className="form-control" aria-describedby="passwordHelpInline"></input>*/}
							<select onChange={(e) => { setCategoryId(parseInt(e.target.value)) }} className="form-select" aria-label="Default select example">
								<option>Category</option>
								{categories.map((item: category) =>
									<option key={item.categoryId} value={item.categoryId}>{item.categoryId + ":" + item.name}</option>
								)}
							</select>
							<input onChange={(e) => { setDate(e.target.value) }} placeholder="end date" type="date" className="form-control" aria-describedby="passwordHelpInline"></input>
							<input onChange={(e) => { setTime(e.target.value) }} placeholder="end time" type="time" className="form-control" aria-describedby="passwordHelpInline"></input>
							<input onChange={(e) => { e.target.files ? setImageFile(e.target.files[0]) : {} as File }} type="file" accept="image/png, image/jpeg, image/gif" className="form-control" aria-describedby="passwordHelpInline"></input>
							<input onChange={(e) => { setDescription(e.target.value) }} placeholder="description" type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
							<input onChange={(e) => { setReserve(parseInt(e.target.value)) }} placeholder="reserve" type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" className="btn btn-warning" data-bs-dismiss="modal" onClick={() => { editAuction() }}>Save Changes</button>
						</div>
					</div>
				</div>
			</div>


		</div>
	)



	//return (<h1>Auctions</h1>)
}
export default MyAuctions;