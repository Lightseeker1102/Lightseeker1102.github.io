const CLIENT_ID = "14d3b6938e2e48bbbc2892ff2410f497";
const CLIENT_SECRET = "a028c430e4bf44f2befb76712d788c50";

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();
  return data.access_token;
}

async function fetchArtistAlbums(artistId, accessToken) {
    const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=5`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const data = await res.json();
  
    const albums = data.items;
    const albumHTML = albums.map(album => `
      <div style="margin-bottom:10px; font-family:'Montserrat', sans-serif; font-size:14px;">
        <strong>${album.name}</strong> (${album.release_date})<br>
        <img src="${album.images[0]?.url}" width="150"><br>
        <iframe style="border-radius:12px" src="https://open.spotify.com/embed/album/${album.id}" width="600" height="auto" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
      </div>
    `).join("");
  
    document.getElementById("artistalbums").innerHTML = `<h3>Top Albums</h3>` + albumHTML;
  }
  

  async function fetchArtistInfo(artistName, accessToken) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  
    const data = await response.json();
    const artist = data.artists.items[0];
    console.log(artist);
    if (artist) {
      const infoHTML = `<div style="font-family:'Montserrat', sans-serif; font-size:14px;">
        🎤 <strong>Artist Info</strong><br>
        <strong>Name:</strong> ${artist.name}<br>
        <img src="${artist.images?.[0]?.url || ''}" alt="Artist Image" width="200"><br>
        <strong>Genres:</strong> ${artist.genres.join(", ")}<br>
        <strong>Followers:</strong> ${artist.followers.total}<br>
        </div>
      `;
  
      document.getElementById("artistinfo").innerHTML = infoHTML;
  

      await fetchArtistAlbums(artist.id, accessToken);
  
    } else {
      console.log("No artist found 😢");
      document.getElementById("artistinfo").innerText = "No artist found.";
      document.getElementById("artistalbums").innerHTML = "";
    }
  }
  

function waitForArtistName() {
  return new Promise((resolve) => {
    document.getElementById("artistnamesubmit").addEventListener("click", (event) => {
      event.preventDefault();
      const artistName = document.getElementById("artistInput").value.trim();
      resolve(artistName);
    });
  });
}

async function getartistname(callback) {
  console.log("Waiting for user input...");
  const artistName = await waitForArtistName();
  callback(artistName);
  return artistName;
}

function logArtistName(name) {
  console.log(`Artist Name: ${name}`);
}

getartistname(logArtistName)
  .then(async artistName => {
    const accessToken = await getAccessToken();
    await fetchArtistInfo(artistName, accessToken);
  });