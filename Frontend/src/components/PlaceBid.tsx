import React from "react";
import axios from "axios"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { globalContext } from "../Context/globalContext"


const PlaceBid = (props: any) => {
	const { globals, setGlobals } = React.useContext(globalContext);
	const navigate = useNavigate();
	const [bid, setBid] = React.useState(0)
	const [auction, setAuction] = React.useState(props.auction as auctions)
	const [errorFlag, setErrorFlag] = React.useState(false)
	const [errorMessage, setErrorMessage] = React.useState("")

	const getAuction = async (id:number) : Promise<any> => {
		console.log("getting auction:", id)
		const url: string = ('http://localhost:4941/api/v1/auctions/' + id)
		return axios.get(url)
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				setAuction(response.data)
				return (response.data as auctions)
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	const placeBid = async() : Promise<any> => {
		axios.defaults.headers.common = { 'X-Authorization': globals.authToken }
		console.log("placing bid: $", bid)

		const latestAuctionData = await getAuction(auction.auctionId)
		if (bid === 0) {
			setErrorFlag(true)
			setErrorMessage("bids must be greather than 0")
			return
		}
		if (bid <= parseInt(latestAuctionData.highestBid)) {
			setErrorFlag(true)
			setErrorMessage("bids must be greather than the current highest bid")
			return
		}
		if (!Number.isInteger(bid)) {//not called since input converts floats to integer
			setErrorFlag(true)
			setErrorMessage("bids must be an integer (whole number like 1 or 2)")
			return
        }

		if (globals.userId === undefined) {
			navigate("/login")
        }

		const url: string = ('http://localhost:4941/api/v1/auctions/' + props.auction.auctionId + '/bids')
		axios.post(url, { amount: bid })
			.then((response) => {
				setErrorFlag(false)
				setErrorMessage("")
				navigate("/auctions/" + auction.auctionId)
				window.location.reload();
			}, (error) => {
				setErrorFlag(true)
				setErrorMessage(error.toString())
			})
	}

	return (
		<div>
			<p style={{ color: "white" }}>.</p>
			<p style={{ color: "white" }}>.</p>
			{errorFlag ? <div style={{ color: "red" }}>{errorMessage}</div> : false}
			<div>			
				<input placeholder="enter any integer" step="1" type="number" pattern="\d+" id={"bidInput" + props.auction.auctionId} defaultValue={(props.auction.highestBid + 1)}></input>
			</div>

			<div>
				<label>enter an integer greater than than the highest bid</label>
				<p style={{ color: "white" }}>.</p>
				<button className="btn btn-primary" onClick={() => { setBid(parseInt((document.getElementById("bidInput" + props.auction.auctionId) as HTMLInputElement).value) || 0) }} type="button" data-bs-toggle="modal" data-bs-target="#bidModal">Place Bid</button>
			</div>
			<p style={{ color: "white" }}>.</p>
			<p style={{color:"white"}}>.</p>
			<div className="modal fade" id="bidModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">Place Bid?</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							Place a bid of ${bid} ?
							</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={() => { placeBid() }}>place bid</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export default PlaceBid;