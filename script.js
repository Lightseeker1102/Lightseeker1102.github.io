const CLIENT_ID = "14d3b6938e2e48bbbc2892ff2410f497";
const CLIENT_SECRET = "a028c430e4bf44f2befb76712d788c50";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const artistInput = document.getElementById('artistInput');
    const columnsContainer = document.querySelector('.columns-container');
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.textContent = 'Searching for artist...';
    loadingElement.style.display = 'none';
    document.body.appendChild(loadingElement);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.style.display = 'none';
    document.body.appendChild(errorElement);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const artistName = artistInput.value.trim();
        
        if (!artistName) {
            showError("Please enter an artist name");
            return;
        }

        showLoading();
        hideError();
        hideResults();

        try {
            const accessToken = await getAccessToken();
            await fetchArtistInfo(artistName, accessToken);
            showResults();
        } catch (error) {
            console.error("Error:", error);
            showError("Artist not found or error fetching data. Please try again.");
        } finally {
            hideLoading();
        }
    });

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
        const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=5`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const data = await res.json();
    
        const artistAlbums = document.getElementById("artistalbums");
        if (data.items && data.items.length > 0) {
            artistAlbums.innerHTML = `<h2>Albums & Singles</h2>` + 
                data.items.map(album => `
                    <div class="album-card">
                        <h3>${album.name}</h3>
                        <p>${album.release_date.split('-')[0]} • ${album.album_type}</p>
                        <img src="${album.images[0]?.url}" width="200" alt="${album.name} cover">
                        <iframe style="border-radius:12px; margin-top:15px;" 
                                src="https://open.spotify.com/embed/album/${album.id}" 
                                width="100%" 
                                height="352" 
                                frameborder="0" 
                                allow="encrypted-media">
                        </iframe>
                    </div>
                `).join("");
        } else {
            artistAlbums.innerHTML = "<p>No albums found for this artist.</p>";
        }
    }

   // Update the fetchArtistInfo function in your script.js
async function fetchArtistInfo(artistName, accessToken) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    const artist = data.artists.items[0];
    
    if (!artist) throw new Error("Artist not found");
    
    document.getElementById("artistinfo").innerHTML = `
        <div class="artist-header">
            <h3>${artist.name}</h3>
            ${artist.images?.[0]?.url ? 
                `<img src="${artist.images[0].url}" alt="${artist.name}" style="max-height: 200px; object-fit: contain;">` : ''}
        </div>
        <div class="artist-details">
            ${artist.genres?.length ? 
                `<p><strong>Genres:</strong><br>${artist.genres.slice(0, 3).join(", ")}</p>` : ''}
            <p><strong>Followers:</strong><br>${artist.followers.total.toLocaleString()}</p>
            ${artist.external_urls?.spotify ? 
                `<a href="${artist.external_urls.spotify}" target="_blank" style="color:#6A00FF; display: inline-block; margin-top: 10px;">▶️ Open in Spotify</a>` : ''}
        </div>
    `;
    
    await fetchArtistAlbums(artist.id, accessToken);
}

    // Helper functions
    function showLoading() {
        loadingElement.style.display = 'block';
    }

    function hideLoading() {
        loadingElement.style.display = 'none';
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError() {
        errorElement.style.display = 'none';
    }

    function showResults() {
        columnsContainer.classList.add('visible');
    }

    function hideResults() {
        columnsContainer.classList.remove('visible');
        document.getElementById("artistinfo").innerHTML = '';
        document.getElementById("artistalbums").innerHTML = '';
    }
});