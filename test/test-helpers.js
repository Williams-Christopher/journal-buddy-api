const jwt = require('jsonwebtoken');

function truncateTables(db) {
    return db.raw(
        `TRUNCATE TABLE
            entries,
            users
            RESTART IDENTITY CASCADE;`
    );
};

function seedUsersTable(db) {
    return db('users').insert(createUsersArray());
};

function seedEntriesTable(db) {
    return db('entries').insert(createEntriesArray());
};

async function seedAllTables(db) {
    await seedUsersTable(db);
    await seedEntriesTable(db);
};

function createUsersArray() {
    return [
        {
            //id: 1,
            user_name: 'pstickings0',
            first_name: 'Paul',
            password: '$2a$12$xwSsS.HYOH9WsPQUN9GqzeM.nEMD.rOtbbK8qDW8fX2bZBvDUphmC', /* password01 */
            email: 'gcowderoy0@rakuten.co.jp',
        },
        {
            // id: 2,
            user_name: 'cedgson1',
            first_name: 'Cedric',
            password: '$2a$12$AkKUIbD/z4zR/YY2jBT6HeAxEs3hC1wlTDiDcBFPkeSYeDmOLmxe6', /* password02 */
            email: 'bfollos1@sfgate.com',
        },
        {
            // id: 3,
            user_name: 'kmccurtin2',
            first_name: 'Kevin',
            password: '$2a$12$g1Ce8Y69.8E5TSOWxW5Ag.c2proYu18PLdNUlOdXIPNUMoRVn8uBq', /* password03 */
            email: 'ldawdary2@utexas.edu',
        },
    ];
};

function createEntriesArray() {
    return [
        {
            // id: 1,
            user_id: '1',
            feeling: '3',
            title: 'Test entry 1',
            body: 'Body for entry 1 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: '0',
            created: '2019-04-16T09:00:03Z',
        },
        {
            // id: 2,
            user_id: '2',
            feeling: '2',
            title: 'Test entry 2',
            body: 'Body for entry 2 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: '0',
            created: '2019-04-16T10:00:03Z',
        },
        {
            // id: 3,
            user_id: '3',
            feeling: '4',
            title: 'Test entry 3',
            body: 'Body for entry 3 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: '1',
            created: '2019-04-16T11:00:03Z',
        },
        {
            // id: 4,
            user_id: '1',
            feeling: '5',
            title: 'Test entry 4',
            body: 'Body for entry 4 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: '0',
            created: '2019-04-17T12:00:03Z',
        },
        {
            // id: 5,
            user_id: '2',
            feeling: '1',
            title: 'Test entry 5',
            body: 'Body for entry 5 - Quisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.\nPhasellus in felis. Donec semper sapien a libero. Nam dui.',
            privacy: '0',
            created: '2019-04-18T13:00:03Z',
        },
    ];
};

module.exports = {
    truncateTables,
    seedUsersTable,
    seedEntriesTable,
    seedAllTables,
    createUsersArray,
    createEntriesArray,
};
