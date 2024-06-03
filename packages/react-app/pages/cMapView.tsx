import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader,InfoWindow ,Marker, LatLng} from '@react-google-maps/api';
import styles from "./cMapStyles";
import HoldButton from "./longHoldButton";
import { approveAmount,confirmRequest,createRequest } from "./Utils/ContractCalls";
import { postDataToFirestore,RideEntry } from "@/services/firestoreService";
import { addEntryToRealtimeDatabase, RealTimeRideEntry, listenForRideChanges} from "@/services/realtimeService";
import DriverRequests from "@/components/Driver/DriverRequests";


interface CMapView {
    sendRequest: () => Promise<boolean>; // This method is provided by the parent and called on successful hold
    balance: string;
}


const CMapView: React.FC<CMapView> = ({ sendRequest,balance }) =>  {
    const containerStyle = {
        width: '100%',
        height: '100%',
        position: 'inherit'
    };
    
    const center = {
        lat: 6.5244,
        lng: 3.3792
    };

    const mapOptions = {
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false
    };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "" // Replace with your actual API key
    });

    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);

    const [directionsService, setDirectionsService] = React.useState(null);
    const [directionsRenderer, setDirectionRenderer] = React.useState(null);

    const [pickup, setPickup] = useState("");
    const [destination, setDestination] = useState("");
    const [isLoadingRoute,setLoadingRoute] = useState(false);
    const [fullRoute, setFullRoute] = useState(null);

    const [rideCost, setRideCost] = useState(null);

    const [makingRequest, setRequest] = useState(false);
    const [requestState, setRequestState] = useState("");
    const [requestId, setRequestId] = useState(null);

    const [inRide, setInRide]= useState(false);

    const [request, setDriverRequest] = useState<RealTimeRideEntry>({
        txHash: '',
        requestId: '',
        name: '',
        price: 0,
        driver:"",
        endpoint: { lat: 0, lng: 0 },
        startpoint: { lat: 0, lng: 0 },
        status:"",
    });
    

    const [dataR, setData] = useState<RideEntry>({
        txHash: '',
        requestId: '',
        requester: '',
        amount: '',
        endpoint: { lat: 0, lng: 0 },
        startpoint: { lat: 0, lng: 0 },
    });

    const [selectingPickup, setSelectingPickup] = useState(false);
    const [selectingDestination, setSelectingDestination] = useState(false);

    useEffect(() => {
        if (requestId) {

          listenForRideChanges(requestId, (data) => {             
            if (data) {
                const requests = Object.keys(data).map(key => ({
                  ...data[key]
                }));
                const requesterName = data["name"]
                if(data["driver"] !== ""){
                    setRequestState("Driver found wait for pickup!")
                    const driverName = data["driver"]
                    setInRide(true)
                    // get realtime loation with driver address
                    // reverse realtime DB
                }            
              }

            //setRideData(data);
          });
        }
      }, [requestId]);

    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center);
        const directionsServices = new window.google.maps.DirectionsService();
        setDirectionsService(directionsServices);
        const directionsRenderer = new window.google.maps.DirectionsRenderer({suppressMarkers:true});
        directionsRenderer.setMap(map);
        setDirectionRenderer(directionsRenderer);
        map.fitBounds(bounds);
        setMap(map);
    }, []);


    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    
    const handleSubmit = () => {
        if(pickup === "" || destination === "") {
            alert("Must select your locations first before calculating price.")
            return
        }
        setLoadingRoute(true);
        const pickupL = {lat: pickup.lat, lng:  pickup.lng};
        const dropoff = {lat: destination.lat, lng: destination.lng};
        route(pickupL,dropoff)
    };


    /**
     * route
     * Get route details between two locations 
     */
    async function route(pickup,dropoff) {
        directionsService.route(
          {
            origin: pickup,
            destination: dropoff,
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
         
              if(result.routes.length > 0) {
                if(result.routes[0].legs.length > 0){
                    setFullRoute(result.routes[0].legs[0]);
                    getCostForRide(); // get are ride cost
                }
              }
              directionsRenderer.setDirections(result);
            } else {
              console.error(`error fetching directions ${result}`);
            }
          }
        );
      }
    
    function getCostForRide() {
        // Simulate a fetch call
        setTimeout(() => {
            setRideCost(1); // fix cost to one CUSD
            setLoadingRoute(false);
        }, 2000); // 2 seconds delay to mimic data fetching
    }
    
    

    /**
     * onMapClick
     * Handles onclick lister for map clicks
     * @param e 
     */
    const onMapClick = (e) => {
        if(selectingPickup) {
            addPin(e,0)

        }else if(selectingDestination) {
            addPin(e,1)
        }
    };


    const confirmDropOff = async () => {
        setInRide(false);
        const confirmDrop = await confirmRequest(requestId)

        const realTimeRideEntry: RealTimeRideEntry = {
            requestId: request.requestId,
            name: request.name,
            txHash:request.txHash,
            endpoint: request.endpoint,
            startpoint: request.startpoint,
            price: request.price,
            driver: request.driver,
            status:"Payout",
          };
 
        const realTimeResult = await addEntryToRealtimeDatabase(realTimeRideEntry);

        setRequest(false)
    };

    const handleHoldComplete = async () => {
        setRequest(true);
        setRequestState("Approving cUSD for transfer...")
        const approvalResult = await approveAmount();
        if(approvalResult) {
            setRequestState("Sending Ride Request to Network...")
            const requestResult = await createRequest();
            
            if(requestResult[0]){
                //setRequestState("Finding a sutable driver...")
                alert(requestResult)
                const txHash = requestResult[1];
                const requestId = requestResult[2].toString();
                const requester = requestResult[3];
                const amount = requestResult[4].toString();
                
                // FIREBASE TIME
                const endpoint = { lat: destination.lat, lng: destination.lng };
                const startpoint = { lat: pickup.lat, lng: pickup.lng };
                const newRideEntry: RideEntry = {
                    txHash: txHash,
                    requestId: requestId,
                    requester: requester,
                    amount: amount,
                    endpoint: endpoint,
                    startpoint: startpoint
                };
                
                const realTimeRideEntry: RealTimeRideEntry = {
                    requestId: requestId,
                    name: requester,
                    txHash:txHash,
                    endpoint: endpoint,
                    startpoint: startpoint,
                    price:amount,
                    driver:"", // empty driver
                    status:"",
                  };
                setDriverRequest(realTimeRideEntry);
                setData(newRideEntry);
                const firebaseResult = await postDataToFirestore(newRideEntry);
                const realTimeResult = await addEntryToRealtimeDatabase(realTimeRideEntry);
                if(firebaseResult && realTimeResult) {
                    setRequestState("Finding a sutable driver...")
                    setRequestId(requestId) // set request id to 
                    
                }
                //postDataToRealTime(data)
                //
            }else{
                alert("Failed to request ride to network")
            }
            //const requestResult = await sendRequest();
        }else{
            alert("Failed to approve cUSD for transfer")
        }
    };

    /**
     * Geocode
     * @param location long lat of drop pin
     * @param tag id of marker (0 or 1) 
     * fetch's human address from drop long and lat pin
     */
    async function geocode(location: { id?: any; lat: any; lng: any; }, tag: number) {
        const response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+location.lat.toString()+","+location.lng.toString()+"&key=AIzaSyBKG-HXKKG8PoXbvhI2Bb3w9PKxGeX8CMU");
        const data = await response.json();
        if (data.results.length > 0) {
          if(tag === 0) {
            setPickup(
              {
                lng:location.lng,
                lat:location.lat,
                address:data.results[0].formatted_address
              }
            ) 
          }else{
            setDestination(
              {
                lng:location.lng,
                lat:location.lat,
                address:data.results[0].formatted_address
              }
            )
          }

        } else {
          // No address for location
        }
    };

    const addPin = (e, id) => {
        var tmarkers = []
            
        let newMarker = {
            id:id,
            lat:e.latLng.lat(),
            lng:e.latLng.lng()
        }

        tmarkers.push(newMarker)
        geocode(newMarker,id)
        for(let v = 0; v < markers.length; v++) {
            // check if marker exist
            if(markers[v].id != id) {
                // add old markers to new array
                tmarkers.push(markers[v])
            }
        }
        
        setMarkers(tmarkers)
        setSelectingPickup(false);
        setSelectingDestination(false); 
    }
    

    const renderButton = () => {
        if(inRide) {
            return(<button style={styles.submitButton} onClick={confirmDropOff}>Confirm DropOff </button>)
        }
        else if(selectingDestination || selectingPickup) {
            if(selectingDestination) {
                return(<h2 style={styles.gFont}>Select your drop off location</h2>)
            }else if(selectingPickup){
                return(<h2 style={styles.gFont}>Select your pick up location</h2>)
            }else if(route != null){
                return(<h2>BaD</h2>)
            }
        }else if(makingRequest) {
            return(
                <div style={styles.card} className=" flex flex-col justify-center items-center">
                    <h2 >Making Request</h2>
                    <div>{requestState}</div>
                    <>
                        <style>
                                {`
                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                                `}
                            </style>
                    
                    <div style={styles.containerStyle}>
                        <div style={styles.spinnerStyle}></div>
                    </div>
                    </>
                </div>
            )
        }else{
                     
            return(
                    <div className=" flex flex-col justify-center items-center" style={styles.card}>
                        <h2> Where would you like to go?</h2>
                            <div className="flex">
                                <input type="text" placeholder="Pickup" style={styles.inputField} value={pickup.address} readOnly />
                                <button style={styles.button} onClick={() => setSelectingPickup(true)}>S</button>
                            </div>
                            <div className="flex">
                                <input type="text" placeholder="Destination" style={styles.inputField} value={destination.address} readOnly />
                                <button style={styles.button} onClick={() => setSelectingDestination(true)}>S</button>
                            </div>

                            {(fullRoute == null) ? (
                                <div style={styles.buttonContainer}>

                                {isLoadingRoute ? (
                                    <>
                                        <style>
                                                {`
                                                @keyframes spin {
                                                    from { transform: rotate(0deg); }
                                                    to { transform: rotate(360deg); }
                                                }
                                                `}
                                            </style>
                                   
                                    <div style={styles.containerStyle}>
                                        <div style={styles.spinnerStyle}></div>
                                    </div>
                                    </>
                                ):(
                                    <button style={styles.submitButton} onClick={handleSubmit}>Calculate Price</button>
                                )}
                                
                            </div>
                            ):(
                                <div>
                                <div style={styles.container}>
                                <img style={styles.stableIcon} src="../cUSDBlack.png" alt="My Image" />
                                <div style={styles.textBlock}>
                                  <div style={styles.textRow}>
                                    <div>${balance}</div>
                                    <p>: Current Balance</p>
                                  </div>
                                  <div style={styles.textRow}>
                                    <div>$0.01</div>
                                    <p>: Price</p>
                                  </div>
                                  <div style={styles.textRow}>
                                    <div>$2.00</div>
                                    <p>: Remaining Balance</p>
                                  </div>
                                </div>
                                </div>
                                <HoldButton
                                  onHoldComplete={handleHoldComplete}
                                />
                              </div>
                            )}  
                    </div>
            )
        }
    }


    return isLoaded ? (
        <div style={{position: 'relative', width: "100vw", height: "79vh" }}>

            <GoogleMap
                options={mapOptions}
                className="mapView"
                mapContainerStyle={containerStyle}
                zoom={9}
                center={center}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
            >
                {
                    markers.map((marker) => (
                        <Marker 
                            key = {marker.id}
                            position = {{lat: marker.lat, lng: marker.lng}}
                            title = {marker.title}
                        />
                    )) 
                }
            </GoogleMap>
        
            <div style={styles.cardContainer}>{renderButton()}</div>
   
        </div>
    ) : <></>;
}

export default CMapView;
