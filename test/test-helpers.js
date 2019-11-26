const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function truncateTables(db) {
    return db.raw(
        `TRUNCATE TABLE
            entries,
            users
            RESTART IDENTITY CASCADE;`
    );
};

function seedUsersTable(db) {
    const bcryptedUsers = createUsersArray().map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));

    return db('users')
        .insert(bcryptedUsers)
        .then(() =>
            db.raw(
                `select setval('users_id_seq', ?)`,
                [bcryptedUsers[bcryptedUsers.length - 1].id]
            )
        )
};

function seedEntriesTable(db) {
    const entries = createEntriesArray();

    return db('entries')
        .insert(entries)
        .then(() =>
            db.raw(
                `select setval('entries_id_seq', ?)`,
                [entries[entries.length - 1].id]
            ))
};

async function seedAllTables(db) {
    await seedUsersTable(db);
    await seedEntriesTable(db);
};

function createUsersArray() {
    return [
        {
            id: 1,
            user_name: 'pstickings0',
            first_name: 'Paul',
            // password: '$2a$12$xwSsS.HYOH9WsPQUN9GqzeM.nEMD.rOtbbK8qDW8fX2bZBvDUphmC', /* password01 */
            password: 'password01',
            email: 'gcowderoy0@rakuten.co.jp',
        },
        {
            id: 2,
            user_name: 'cedgson1',
            first_name: 'Cedric',
            // password: '$2a$12$AkKUIbD/z4zR/YY2jBT6HeAxEs3hC1wlTDiDcBFPkeSYeDmOLmxe6', /* password02 */
            password: 'password02',
            email: 'bfollos1@sfgate.com',
        },
        {
            id: 3,
            user_name: 'kmccurtin2',
            first_name: 'Kevin',
            // password: '$2a$12$g1Ce8Y69.8E5TSOWxW5Ag.c2proYu18PLdNUlOdXIPNUMoRVn8uBq', /* password03 */
            password: 'password03',
            email: 'ldawdary2@utexas.edu',
        },
    ];
};

function createEntriesArray() {
    return [
        {
            id: 1,
            user_id: 1,
            entry_id: '3f4bdc34-1fb5-4a46-9c76-f2aa0fb8351a',
            feeling: 3,
            title: 'Test entry 1',
            body: 'Body for entry 1 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: 0,
            created: '2019-04-16T09:00:03.000Z',
        },
        {
            id: 2,
            user_id: 2,
            entry_id: 'bbb591f7-3a78-4980-8349-e2b741aea226',
            feeling: 2,
            title: 'Test entry 2',
            body: 'Body for entry 2 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: 0,
            created: '2019-04-16T10:00:03.000Z',
        },
        {
            id: 3,
            user_id: 3,
            entry_id: 'bc57a4da-ee11-4b9c-a631-c682c3c3c84f',
            feeling: 4,
            title: 'Test entry 3',
            body: 'Body for entry 3 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: 1,
            created: '2019-04-16T11:00:03.000Z',
        },
        {
            id: 4,
            user_id: 1,
            entry_id: 'ce6f242e-31f5-4cf1-afe3-aeb68a396f1f',
            feeling: 5,
            title: 'Test entry 4',
            body: 'Body for entry 4 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: 0,
            created: '2019-04-17T12:00:03.000Z',
        },
        {
            id: 5,
            user_id: 2,
            entry_id: 'b1416cbf-04d2-409b-9c95-cf36ebdbfafa',
            feeling: 1,
            title: 'Test entry 5',
            body: 'Body for entry 5 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: 0,
            created: '2019-04-18T13:00:03Z',
        },
    ];
};

function createBearerToken(user = {}, secret = process.env.JWT_SECRET) {
    const token = jwt.sign(
        { id: user.id },
        secret,
        { subject: user.user_name, algorithm: 'HS256'}
    );

    return `Bearer ${ token }`;
};

module.exports = {
    truncateTables,
    seedUsersTable,
    seedEntriesTable,
    seedAllTables,
    createUsersArray,
    createEntriesArray,
    createBearerToken,
};
