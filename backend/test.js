require("dotenv").config();
const fetch = require('node-fetch');

const URL = `${process.env.TEST_URL}:${process.env.PORT}`;

async function testAddUser(user) {
    return await fetch(`${URL}/add-user`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    })
    .then(response => {
        if (!response.ok) {
            throw Error(`ERROR: cannot add user. User location: ${user.location}`);
        }
        return response.json();
    })
    .then(data => {
        return data;
    });
};

async function testGetUsers() {
    return await fetch(`${URL}/get-users`, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw Error("ERROR: cannot retrieve all users.");
        }
        return response.json();
    })
    .then(data => {
        return data.results;
    });
};

async function testDeleteUser(id) {
    return await fetch(`${URL}/delete-user/?id=${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw Error(`ERROR: cannot delete user. User ID: ${id}`);
        }
        return response.json();
    })
    .then(data => {
        return data;
    });
};

test_users = [
    {
        location: 'Moffitt Library',
        rating: 2,
    },
    {
        location: 'Haas Courtyard',
        rating: 3,
    },
    {
        location: 'East Asian Library',
        rating: 1,
    }
];

async function testAdding() {
    console.log("\nTEST ADDING USERS")
    for (let i = 0; i < test_users.length; i++) {
        console.log(`Adding user ${i+1}...`);
        console.log(test_users[i]);
        console.log(await testAddUser(test_users[i]));
    }
    return 0;
}

async function testGetting() {
    console.log("\nTEST GETTING USERS")
    console.log(await testGetUsers());
    return 0;
}

async function testDeleting() {
    console.log("\nTEST DELETING USERS")
    for (let i = 0; i < test_users.length; i++) {
        console.log(`Deleting user ${i+1}...`);
        console.log(await testDeleteUser((i+1)));
    }
    return 0;
}

async function main() {
    await testAdding();
    await testGetting();
    await testDeleting();
}

main().then(() => {console.log('\nALL TESTS COMPLETED')});