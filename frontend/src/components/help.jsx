function Help({onClose}) {
    return (
        <div id="overlay">
           <div id='helppg'>
                <h2>Help</h2>
                <ul>
                    <li>Enter both the batch and serial numbers to check their authenticity.</li>
                    <li>If the numbers are valid, an immediate response will be displayed.</li>
                    <li>If any of the numbers are invalid, extra compulsory input fields will be shown for further check.</li>
                    <li>Also, if the numbers are valid, there is an option to provide compulsory information, regardless if you still want a deeper check.</li>
                </ul>


                <button id='back' onClick={onClose}>Back</button>
            </div> 
        </div>
    )
}

export default Help;