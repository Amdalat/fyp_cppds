import { useState } from 'react'
import '../index.css'
import Help from './help';

const API_URL = import.meta.env.VITE_API_URL;

function Pg1() {
    const [showHelp, setShowHelp] = useState(false);
    const [isTyping, setIsTyping] = useState(true);
    const [error, setErrors] = useState({});
    const [result, setResult] = useState({});
    const [first, setFirst] = useState(true);
    const [dbCheck, setDbCheck] = useState(false);


    const [bn, setBn] = useState("");
    const [sn, setSn] = useState("");
    const [manuf, setManuf] = useState("");
    const [mdate, setMdate] = useState("");
    const [edate, setEdate] = useState("");
    const [nafdac, setNafdac] = useState("");

    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const handleDeepCheck = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!bn) {
            newErrors.bn = "Batch Number is required";
        }

        if (!sn) {
            newErrors.sn = "Serial Number is required";
        }

        if (!first) {
            if (!manuf) {
                newErrors.manuf = "Manufacturer is required";
            }

            if (!mdate) {
                newErrors.mdate = "Manufacturing Date is required";
            }

            if (!edate) {
                newErrors.edate = "Expiry Date is required";
            }

            if (!nafdac) {
                newErrors.nafdac = "NAFDAC Registration Number is required";
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const response = await fetch(`${API_URL}/drug/db`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                batch_number: bn?.trim()?.toUpperCase() || "",
                serial_number: sn?.trim()?.toUpperCase() || "",
                manufacturer: toTitleCase(manuf || ""),
                manuf_date: mdate || "",
                expiry_date: edate || "",
                nafdac_reg: nafdac?.trim()?.toUpperCase() || ""
            }),
        });

        const result = await response.json();

        if (!result.status) {
            setFirst(false);
        }

        console.log(result);

        setResult(result)
        
        setIsTyping(false)
    }

    const handleReset = async (e) => {
        e.preventDefault();

        setErrors({});
        setFirst(true)
        setDbCheck(false)
        setIsTyping(true)
        console.log(first)
    }
    
    const handleClear = async (e) => {
        e.preventDefault();

        setBn("");
        setSn("");
        setManuf("");
        setMdate("");
        setEdate("");
        setNafdac("");
        
        setIsTyping(true);
    }
    
    const handleSubmit = async (e) => {
        console.log(bn, sn, manuf, mdate, edate, nafdac);

        e.preventDefault();

        const newErrors = {};

        if (!bn) {
            newErrors.bn = "Batch Number is required";
        }

        if (!sn) {
            newErrors.sn = "Serial Number is required";
        }

        if (!first) {
            if (!manuf) {
                newErrors.manuf = "Manufacturer is required";
            }

            if (!mdate) {
                newErrors.mdate = "Manufacturing Date is required";
            }

            if (!edate) {
                newErrors.edate = "Expiry Date is required";
            }

            if (!nafdac) {
                newErrors.nafdac = "NAFDAC Registration Number is required";
            }
        }

        

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const response =await fetch(`${API_URL}/drug`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // const payload = {
                batch_number: bn?.trim()?.toUpperCase() || "",
                serial_number: sn?.trim()?.toUpperCase() || "",
                manufacturer: toTitleCase(manuf || ""),
                manuf_date: mdate || "",
                expiry_date: edate || "",
                nafdac_reg: nafdac?.trim()?.toUpperCase() || "",
// };
                // batch_number: bn.toUpperCase(),
                // serial_number: sn.toUpperCase(),
                // manufacturer: toTitleCase(manuf),
                // manuf_date: mdate,
                // expiry_date: edate,
                // nafdac_reg: nafdac.toUpperCase(),
            }),
        });

        const result = await response.json();

        if (!result.status) {
            setFirst(false);
        }

        console.log(result);

        setResult(result)
        
        setIsTyping(false)
    }

    return (
        <div className='hero'>
            {showHelp && (
                <Help onClose={() => setShowHelp(false)}/>
            )}
            <div className='left'>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>Drug Checker</h2> 
                    <button id="help" onClick={() => setShowHelp(true)}>?</button>
                </div>
                

                <form>
                    <label htmlFor="">Batch Number : <input className='input' value={bn} onChange={(e) => {setBn(e.target.value); setIsTyping(true)}}
                    /></label>
                    {error.bn && (
                        <p className="error">
                            {error.bn}
                        </p>
                    )}

                    <label htmlFor="">Serial Number : <input  id='serialNo' className='input' value={sn} onChange={(e) => {setSn(e.target.value); setIsTyping(true)}}/></label>
                    {error.sn && (
                        <p className="error">
                            {error.sn}
                        </p>
                    )}

                    {!first && (
                        <>
                            <label htmlFor="">Manufacturer : <input id='manufacturer' className='input' value={manuf} onChange={(e) => {setManuf(e.target.value); setIsTyping(true)}} /></label>
                            {error.manuf && (
                                <p className="error">
                                    {error.manuf}
                                </p>
                            )}

                            <label htmlFor="">Manuf. Date : <input type="date" id='manufDate' className='input' value={mdate} onChange={(e) => {setMdate(e.target.value); setIsTyping(true)}} /></label>
                            {error.mdate && (
                                <p className="error">
                                    {error.mdate}
                                </p>
                            )}

                            <label htmlFor="">Expiry Date : <input type="date" id='expiryDate' className='input' value={edate} onChange={(e) => {setEdate(e.target.value); setIsTyping(true)}} /></label>
                            {error.edate && (
                                <p className="error">
                                    {error.edate}
                                </p>
                            )}

                            <label htmlFor="">NAFDAC Reg. No. : <input id='nafdacReg' className='input' value={nafdac} onChange={(e) => {setNafdac(e.target.value); setIsTyping(true)}} /></label>
                            {error.nafdac && (
                                <p className="error">
                                    {error.nafdac}
                                </p>
                            )}
                        </>
                    )}

                    <br />
                    
                    
                </form>
                
                {dbCheck ? (
                    <button type='submit'  onClick={handleDeepCheck}>Check Drugg</button>
                ):(<button type='submit'  onClick={handleSubmit}>Check Drug</button>)}
                
                <div style={{ display: "flex", width: "320px", flexWrap: "wrap", justifyContent: "space-between", gap: "10px" }}>
                    <button onClick={handleReset}>Reset Form</button>
                    <button onClick={handleClear}>Clear Form</button>
                </div>               
            </div>

            {!isTyping? result?.status && (
                <div className='right'>
                    <h3>Probability of being Fake: {result.probability_fake}%</h3>


                    <h3>Source: {result.db_match ? "Database" : "ML Model"}</h3>

                    <h3 style={{ color: result.status === "Genuine" ? "green" : "red", margin: "5px 0" }}>
                    {result.status.toUpperCase()}
                    </h3>

                    {result.db_match && ( !dbCheck &&
                        (<button onClick={()=>{setFirst(false), setDbCheck(true)}}>Deep Check</button>)

                    )}
                </div>
                ): null}
        </div>
    )
}

export default Pg1
