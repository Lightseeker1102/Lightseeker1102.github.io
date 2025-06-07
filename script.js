function logArtistName(artistName) {
    if (artistName) {
        console.log(`Artist Name: ${artistName}`);
    } else {
        console.log("No artist name provided.");
    }
}

function waitForArtistName() {
    return new Promise((resolve) => {
        document.getElementById("artistnamesubmit").addEventListener("click", (event) => {
            event.preventDefault(); // Prevent form reload if any
            const artistname = document.getElementById("artistInput").value.trim();
            resolve(artistname);
        });
    });
}

async function getartistname(callback) {
    console.log("Waiting for user input...");
    const artistName = await waitForArtistName();
    callback(artistName);
    return artistName;
}


getartistname(logArtistName)
    .then(artistName => {
        console.log("Process completed for:", artistName);
    });