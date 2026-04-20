// Fetch inventory from the database
function fetchInventory() {
    fetch('get_inventory.php')
        .then(response => response.json())
        .then(data => {
            // Update UI with fetched data
            console.log(data);
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

// Function to add inventory items to the database
function addInventory(item) {
    fetch('add_inventory.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(data => {
            // Handle response from adding inventory
            console.log(data);
            // Fetch updated inventory after adding
            fetchInventory();
        })
        .catch(error => console.error('Error adding inventory:', error));
}

// Call fetchInventory on page load
fetchInventory();
