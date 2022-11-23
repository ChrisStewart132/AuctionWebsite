import React from "react";
import axios from "axios"
import { Link, useNavigate } from 'react-router-dom'
import { globalContext } from "../Context/globalContext"
import PlaceBid from "./PlaceBid";
import settings from "../Settings/Settings"

const Auctions = () => {
	const { globals, setGlobals } = React.useContext(globalContext);
	const navigate = useNavigate();
	const [query, setQuery] = React.useState("");
	const [auctionSearchQuery, setAuctionSearchQuery] = React.useState({ q: query } as auctionSearchQuery);
	const [auctionDescriptions, setAuctionDescriptions] = React.useState<Array<auctions>>([])
	const [auctions, setAuctions] = React.useState<Array<auctions>>([])
	const [advancedSearch, setAdvancedSearch] = React.useState(false)
	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	//pagination
	const MAX_AUCTIONS_PPAGE: number = 10
	const [page, setPage] = React.useState(0);
	var auctionCount = 0

	React.useEffect(() => {
		getAuctions()
		getCategories()//
	}, [])
	const getAuctions = async () : Promise<void> => {	
		console.log("getting auctions, params:", JSON.stringify(auctionSearchQuery))	
		setPage(0)
		let params: string = '';
		params += "?q=" + auctionSearchQuery.q
		await setAdvancedSearch(true)

			const categoryFilterValue = parseInt((document.getElementById("categoryFilter") as HTMLOptionElement).value)
			if (categoryFilterValue > 0) {
				params += "&categoryIds=" + categoryFilterValue
			}
			const sortByValue = (document.getElementById("sortBy") as HTMLOptionElement).value
			if (sortByValue) {
				params += "&sortBy=" + sortByValue
			}
			//console.log(categoryFilterValue, sortByValue, params)

		const url: string = ('http://localhost:4941/api/v1/auctions' + params)
		//console.log(url)
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setAuctions(response.data.auctions)			
				//console.log("response",response.data.auctions)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})

	}

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

	React.useEffect(() => {
		getUserImages()
	}, [auctions])
	const [userImageDict, setUserImageDict] = React.useState({} as any);
	const getUserImages = async (): Promise<any> => {
		console.log("getting user images")
		let sellerIds: any = {}// {bidderId: bidderId}
		auctions.map((item: auctions) => {
			sellerIds[item.sellerId] = item.sellerId
		})
		//console.log(JSON.stringify(sellerIds))

		const newUserImageDict: any = {}
		for (let id in sellerIds) {
			//console.log("id", id)
			const imageString: string = await getUserImage(parseInt(id))
			//console.log("????????imageString??????", imageString)
			if (imageString) {
				newUserImageDict[id] = imageString
			}
		}
		//console.log("userImageDict", JSON.stringify(newUserImageDict))
		setUserImageDict(newUserImageDict)
	}
	const getUserImage = async (id: number): Promise<any> => {
		const config: any = {
			responseType: 'arraybuffer'
		};
		//console.log("getting user image???????:", id)
		const url: string = ('http://localhost:4941/api/v1/users/' + id + '/image')
		return axios.get(url, config)
			.then((response) => {
				//console.log("resp recvd")
				setErrorFlag(false)
				setErrorMessage("")
				const image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
				const imageString = `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
				return imageString
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
				return ""
			})
	}

	React.useEffect(() => {
		getAuctionImages()
	}, [auctions])


	const getAuction = async (id: number): Promise<auctions> => {
		//console.log("getting auction:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id)
		return axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				//console.log("response auction:",response.data)
				return response.data as auctions
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
				return {} as auctions
			})
	}

	const [deleteId, setDeleteId] = React.useState(0);
	function deleteAuction(){
		console.log("deleting auction:", deleteId)
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
				getAuctions()
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
	//const [image, setImage] = React.useState({} as File)
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
				//console.log("data", data.endDate)
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
		//console.log(JSON.stringify(data))

		setAuctionImage(editId)
		axios.patch(url, data)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				//console.log(response.data)
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
	const setAuctionImage = async (id:number): Promise<any> => {
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/image')
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		console.log("patching image:", imageFile.name, imageFile.type,id)
		const data = await imageFile.arrayBuffer()
		axios.put(url, data, { headers: { "content-type": imageFile.type } })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				getAuctionImages()
				navigate("/auctions/" + editId)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
    }

	const [auctionImagesObject, setAuctionImagesObject] = React.useState({} as any)//{}
	/* after getting all auctions, get each auctions image and save them in an object {auctionId : imageString} */
	const getAuctionImages = async (): Promise<any> => {
		const obj: any = {}//obj of all auctionIds {auctionId:auctionId}
		auctions.map((item: auctions) => {
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
	//const [imageData, setImageData] = React.useState<Array<string>>([])
	const getAuctionImage = async (id: number) : Promise<any> => {
		//console.log("getting auction image, params:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/image')
		return axios.get(url, { responseType: 'arraybuffer' })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				const image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
				const imageString = `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
				//setImageData(imageData => [...imageData, imageString]);
				//console.log(id,imageString)
				return imageString;
				//console.log(response.data)
			}, (error) => {
				//console.log(id, "error/////////")
				//setErrorFlag(true)
				//setErrorMessage(error.toString())
				return ""
			})		    }


	const days = (date_1: Date, date_2: Date) => {
		/* returns days between two given dates if date1 is ahead of date 2, otherwise - */
		let difference = date_1.getTime() - date_2.getTime();
		let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
		return difference >= 0 ? TotalDays : "-";
	} 


	React.useEffect(() => {
		list_of_auctions()
	}, [userImageDict, auctionImagesObject, page])
	const list_of_auctions = () => {
		console.log("updating auctions table")
		//let images: any = {}
		//console.log(JSON.stringify(images))
		let numAuctions = 0//keeps track how many auctions have been added to stop at MAX_AUCTIONS_PPAGE
		const filteredAuctions = auctions.map((item: auctions, index: number) => { 
			const viewingClosedValue = parseInt((document.getElementById("closedFilter") as HTMLOptionElement).value)
			const viewingClosed = viewingClosedValue === 2
			const neither = viewingClosedValue === 0//do not filter open/closed if neither is selected
			const daysUntilClosed = days(new Date(item.endDate), new Date())
			const result = (viewingClosed ? daysUntilClosed === "-" : daysUntilClosed !== "-")
			const notFiltered = (neither || result)
			if (notFiltered) numAuctions += 1
			if (notFiltered && ((MAX_AUCTIONS_PPAGE * (page + 1)) >= numAuctions) && (numAuctions > (MAX_AUCTIONS_PPAGE * page)) ) {return (
				<tr key={item.auctionId}>
					{/*<th scope="row">{index}</th>*/}
					<th scope="row">{item.auctionId}</th>
					<td scope="row" width="100" height="100"><img src={auctionImagesObject[item.auctionId] || settings.defaultImage} alt={`auction ${item.auctionId} image`} width="100" height="100"></img> </td>
					<td scope="row">{item.title}</td>
					<td scope="row">{days(new Date(item.endDate), new Date()) === "-" ? "closed" : "closes in " + days(new Date(item.endDate), new Date()) + " day(s)"}</td>
					<td scope="row">{categories.filter((obj: category) => obj.categoryId === item.categoryId).length > 0 ? categories.filter((obj: category) => obj.categoryId === item.categoryId)[0].name : "category error??"}</td>
					<td scope="row"><img src={userImageDict[item.sellerId] ? userImageDict[item.sellerId] : settings.defaultImage} alt={`auction ${item.auctionId} image`} width="100" height="100"></img></td>
					<td scope="row">{item.sellerFirstName + ", " + item.sellerLastName}</td>					
					<td scope="row">{item.highestBid}</td>
					{item.reserve <= item.highestBid ? <td scope="row"><b className="text-danger">{item.reserve} (reserve met)</b></td> : <td scope="row">{item.reserve}</td>}
					<td><Link className="btn btn-primary" to={"/auctions/" + item.auctionId}>View</Link></td>
					<td>
						{false && globals.userId !== undefined && item.sellerId !== parseInt(globals.userId) && days(new Date(item.endDate), new Date()) >= 0 ? <PlaceBid auction={item} /> : false}
					</td>
					<td>
						{item.sellerId === parseInt(globals.userId) ? <button className="btn btn-warning" onClick={() => { setEditId(item.auctionId) }} type="button" data-bs-toggle="modal" data-bs-target="#editUserModal">Edit</button> : false}
					</td>
					<td>
						{item.sellerId === parseInt(globals.userId) ? <button className="btn btn-danger" onClick={() => { setDeleteId(item.auctionId) }} type="button" data-bs-toggle="modal" data-bs-target="#deleteUserModal">Delete</button> : false}
					</td>
				</tr >
			)}
		}
		)
		auctionCount = numAuctions
		return filteredAuctions
	}

	const handleSubmit = () => {
		console.log("handling submit", query)
		auctionSearchQuery.q = query
		setAuctionSearchQuery(auctionSearchQuery);
		getAuctions()
    }

	
		return (

			<div>		
				{false && errorFlag ? <div style={{ color: "red" }}>{errorMessage}</div> : false}
				<h1>Auctions</h1>

				
				<div >
					<div className="row">
						<div className="col-sm">
							<label>Search</label>
							<input className="m-1 p-1" type='text' onChange={(e) => setQuery(e.target.value) }>		
							</input>
							<button className="btn btn-primary m-1" onClick={() => handleSubmit()}> submit </button>
						</div>
					</div>
					<div className="row">
						<div className="col-sm">
						</div>
						<div className="col-sm">
						</div>
						<div className="col-sm">
						</div>
						{false?
							<div className="col-sm">
								<div className="form-check">
									<label className="form-check-label" htmlFor="defaultCheck1">Advanced Search</label>
									<input className="form-check-input r-10" type="checkbox" onClick={(e) => { setAdvancedSearch(!advancedSearch) }} value="" id="defaultCheck1"></input>
								</div>
							</div>
							:false
						}
						<div className="col-sm">
						</div>
						<div className="col-sm">
						</div>
						<div className="col-sm">
						</div>
					</div>										
				</div>
				

				{true || advancedSearch ?
				<div>
					<div className="row">
						<div className="col-sm">
						</div>		
							
						<div className="col-sm p-1 m-2">
								<select id="categoryFilter" className="form-select" aria-label="Default select example">
								<option selected>Filter by category</option>
								{categories.map((item: category) =>
									<option key={item.categoryId} value={item.categoryId}>{item.name}</option>
								)}	
							</select>
						</div>
						<div className="col-sm p-1 m-2">
								<select id="closedFilter" className="form-select" aria-label="Default select example">
								<option value="0" selected>Filter by open/closed</option>
								<option value="1">Open</option>
								<option value="2">Closed</option>
							</select>
							</div>
							<div className="col-sm p-1 m-2">
								<select id="sortBy" className="form-select" aria-label="Default select example">
								<option value="CLOSING_SOON" selected>Sort By closing soon (default)</option>
								<option value="CLOSING_LAST">closing later</option>
								<option value="ALPHABETICAL_ASC">Ascending alphabetically</option>
								<option value="ALPHABETICAL_DESC">Descending by alphabetically</option>
								<option value="BIDS_ASC">Ascending by current bid</option>
								<option value="BIDS_DESC">Descending by current bid</option>
								<option value="RESERVE_ASC">Ascending by reserve price</option>
								<option value="RESERVE_DESC">Descending by reserve price</option>						
							</select>
						</div>

						<div className="col-sm">
						</div>
					</div>				
				</div>
				: false}

				

				<table className="table">
					<thead>
						<tr>
							{/*<th scope="col">index</th>*/}
							<th scope="col">#</th>
							<th scope="col">Hero image</th>
							<th scope="col">Title</th>
							<th scope="col">Days Till Closing</th>
							<th scope="col">Category</th>
							<th scope="col">Seller</th>
							<th scope="col"></th>
							<th scope="col">Highest Bid</th>
							<th scope="col">Reserve</th>
							<th scope="col">Details</th>
							<th scope="col"></th>
						</tr>
					</thead>
					<tbody>
						{list_of_auctions()}
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
								Are you sure you want to delete auction: { deleteId }
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
								<select onChange={(e) => { setCategoryId(parseInt(e.target.value)) }} className="form-select" aria-label="Default select example">
									<option selected>Category</option>
									{categories.map((item: category) =>
										<option key={item.categoryId} value={item.categoryId}>{item.name}</option>
									)}
								</select>
								<input onChange={(e) => { setDate(e.target.value) }} placeholder="end date" type="date" className="form-control" aria-describedby="passwordHelpInline"></input>
								<input onChange={(e) => { setTime(e.target.value) }} placeholder="end time" type="time" className="form-control" aria-describedby="passwordHelpInline"></input>
								<input onChange={(e) => { e.target.files ? setImageFile(e.target.files[0]) : {} as File }} type="file" accept="image/png, image/jpeg, image/gif" className="form-control" aria-describedby="passwordHelpInline"></input>
								<input onChange={(e) => { setDescription(e.target.value) }} placeholder="description" type="text" className="form-control" aria-describedby="passwordHelpInline"></input>
								<input onChange={(e) => { setReserve(parseInt(e.target.value)) }} placeholder="reserve" type="number" className="form-control" aria-describedby="passwordHelpInline"></input>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
								<button type="button" className="btn btn-warning" data-bs-dismiss="modal" onClick={() => { editAuction() }}>Save Changes</button>
							</div>
						</div>
					</div>
				</div>


				<div className="row">
					<div className="col-sm"></div>	
					<div className="col-sm"></div>	
					<div className="col-sm"></div>	
					<div className="col-sm"></div>
					<div className="col-sm">
						<button className={page===0 ? "btn btn-secondary" : "btn btn-primary"} onClick={() => { setPage(0) }} type="button">first</button>
					</div>	
					<div className="col-sm">
						<button className="btn btn-primary" onClick={() => { setPage(Math.max(0, page - 1)) }} type="button">previous </button>
					</div>		
					<div className="col-sm">
						<h3>{page+1}</h3>
						<p>{auctionCount !== 0 ? (page * MAX_AUCTIONS_PPAGE + 1) : 0} - {Math.min(auctions.length, (page * MAX_AUCTIONS_PPAGE + MAX_AUCTIONS_PPAGE))}</p>
					</div>	
					<div className="col-sm">
						<button className="btn btn-primary" onClick={() => { setPage( Math.min( Math.floor( (auctionCount - 1)/MAX_AUCTIONS_PPAGE), page + 1) ) }} type="button">next</button>
					</div>	
					<div className="col-sm">
						<button className={page === Math.floor((auctionCount - 1) / MAX_AUCTIONS_PPAGE) ? "btn btn-secondary": "btn btn-primary"} onClick={() => { setPage(Math.floor((auctionCount-1) / MAX_AUCTIONS_PPAGE)) }} type="button">last</button>
					</div><div className="col-sm"></div>
					<div className="col-sm"></div>	
					<div className="col-sm"></div>
					<div className="col-sm"></div>	
				</div>	
				

			</div>
		)
	


	//return (<h1>Auctions</h1>)
}
export default Auctions;