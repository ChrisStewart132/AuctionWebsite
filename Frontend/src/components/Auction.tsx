import React from "react";
import axios from "axios"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { globalContext } from "../Context/globalContext"
import PlaceBid from "./PlaceBid";
import settings from "../Settings/Settings"
import translateDate from "../Utils/translateDate";

const Auction = () => {
	const AUCTION_IMAGE_WIDTH = 200
	const AUCTION_IMAGE_HEIGHT = 200
	const { globals, setGlobals } = React.useContext(globalContext);
	const navigate = useNavigate();
	const { id } = useParams();
	//const [bid, setBid] = React.useState(0)
	const [auction, setAuction] = React.useState({} as auctions)
	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	React.useEffect(() => {
		getAuction()
		getBids()		
		//getUserImage(1)
	}, [])
	const getAuction = () => {
		console.log("getting auction:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id)
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setAuction(response.data)
				console.log(response.data)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	

	React.useEffect(() => {
		getCategories()
	}, [auction])
	const [categories, setCategories] = React.useState<Array<category>>([])
	const [category, setCategory] = React.useState("loading..")
	const getCategories = () => {
		console.log("getting categories")
		const url: string = ('http://localhost:4941/api/v1/auctions/categories')
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setCategories(response.data)
				const a: Array<category> = response.data
				a.map((c: category) => { if (c.categoryId === auction.categoryId) setCategory(c.name) })
				console.log(category)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const [bids, setBids] = React.useState<Array<bid>>([])
	const getBids = async (): Promise<any>  => {
		console.log("getting bids:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/bids')
		axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setBids(response.data)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
    }

	React.useEffect(() => {
		if (bids.toString()) {
			getUserImages()//once the bids list is known retrieves the list of bidders and then retrieves each bidders image and saves state
		}
	}, [bids])
	const [userImageDict, setUserImageDict] = React.useState({} as any);
	const getUserImages = async (): Promise<any> => {
		/* is called once bids array populated, gets unique bidderIds then creates temp array of bidder images, then maps the images to the bids object */
		console.log("getUserImages",bids.toString())
		let bidderIds: any = {}// {bidderId: bidderId}
		bids.map((item: bid) => {
			bidderIds[item.bidderId] = item.bidderId
		})
		//console.log(JSON.stringify(bidderIds))

		const newUserImageDict: any = {}
		for (let id in bidderIds) {
			//console.log("id",id)
			const imageString: string = await getUserImage(parseInt(id))
			//console.log("????????imageString??????", imageString)
			if (imageString) {
				newUserImageDict[id] = imageString
            }
		}
		//console.log("userImageDict",JSON.stringify(newUserImageDict))
		setUserImageDict(newUserImageDict)
	}

	React.useEffect(() => {
		list_of_bids()
	}, [userImageDict])
	React.useEffect(() => {	
		if (auction.auctionId) {
			console.log("auctions recvd, getting auction and seller image")
			setAuctionSellerImage()//sets sellerImage state whenever the auction changes
			setAuctionHeroImage()
		}
	}, [auction])

	const setAuctionHeroImage = async (): Promise<any> => {
		const ai = await getAuctionImage(auction.auctionId)
		setAuctionImage(ai)
		console.log(auctionImage)
	}
	const [auctionImage, setAuctionImage] = React.useState("");
	const getAuctionImage = async (id: number): Promise<any> => {
		console.log("getting auction image, params:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id + '/image')
		return axios.get(url, { responseType: 'arraybuffer' })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				const image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
				const imageString = `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
				//console.log("auctionImage", imageString)
				//setAuctionImage(imageString)
				return imageString;			
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
				return ""
			})
	}

	const setAuctionSellerImage = async (): Promise<any> => {
		setSellerImage(await getUserImage(auction.sellerId))
    }
	const [sellerImage, setSellerImage] = React.useState("");
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

	const days = (date_1: Date, date_2: Date) => {
		/* returns days between two given dates if date1 is ahead of date 2, otherwise - */
		let difference = date_1.getTime() - date_2.getTime();
		let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
		return difference >= 0 ? TotalDays : "-";
	} 

	const list_of_bids = () => {
		console.log("presenting bidders table", bids.toString())
		return bids.map((item: bid) =>
			<tr key={item.bidderId + item.timestamp}>
				<th scope="row">{item.amount}</th>
				<td scope="row" width="100" height="100"> <img src={userImageDict[item.bidderId] || settings.defaultImage} className="card-img-top" alt="profile image" width="100" height="100"></img> </td>
				<td scope="row">{item.timestamp}</td>
				<td scope="row">{item.firstName + ", " + item.lastName}</td>
			</tr>
		)
	}



		return (
			<div>
				{errorFlag ? <div style={{ color: "red" }}>{errorMessage}</div> : false}
				<div className="row">
					<div className="col-sm">
						<h2>{auction.title}</h2>
						<p> {"Category: " + category} </p>
						<p> {"close date: " + translateDate(auction.endDate) || auction.endDate} </p>
					</div>
					<div className="col-sm">
						<div className="auctionDetails">
							
							<img src={auctionImage || settings.defaultImage} alt="auction hero image" width={AUCTION_IMAGE_WIDTH} height={AUCTION_IMAGE_HEIGHT}></img>
						</div>
					</div>
					<div className="col-sm">
						<div className="auctionDetails">																			
							<p> {"Description: " + auction.description} </p>
							{bids[0] !== undefined ? <p> {`Highest bid: ${auction.highestBid}`} {bids[0] !== undefined ? `(${bids[0].firstName}, ${bids[0].lastName})` : ""}</p> : false}
							{bids[0] !== undefined ? <p> {`Total bids: ${auction.numBids},`}</p> : false}							
							<p>	{`Reserve: ${auction.reserve}`} </p>
						</div>
					</div>
					<div className="col-sm">
						<div className="auctionDetails">
							<p> {`seller: ${auction.sellerFirstName}, ${auction.sellerLastName}`} </p>
							<img src={sellerImage || settings.defaultImage} alt="seller profile image" width="100" height="100"></img>
						</div>
					</div>
				</div>


				{globals.userId === undefined ? <div><br></br><p>you must log in to place bids</p><Link to="/register">register</Link><br></br><Link to="/login">log in</Link></div> :
					auction.sellerId === parseInt(globals.userId) ? <div><br></br><p>cannot bid on own auction</p></div> :
						days(new Date(auction.endDate), new Date()) >= 0 ?	<PlaceBid auction={auction} /> : <div><br></br><p> auction closed</p></div>
						}

				<table className="table">
					<thead>
						<tr>
							<th scope="col">amount</th>
							<th scope="col">profile image</th>
							<th scope="col">timestamp</th>
							<th scope="col">name</th>
						</tr>
					</thead>
					<tbody>
						{list_of_bids()}
					</tbody>
				</table>
			</div>
		)
}
export default Auction;