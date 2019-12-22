# Journal Buddy

Try the live application at: [Journal Buddy](https://journal-buddy.cwilliams.now.sh)

This is the API server for the Journal Buddy ([Repo](https://github.com/Williams-Christopher/journal-buddy))

---
### Description
Journal Buddy is here to help you meet your journaling needs and goals. Use Journal Buddy to make entries that recount your challenges, capture your ideas, and note the things you're thankful for in Journal Buddy's easy to use, distraction-free interface. Journaling is most helpful if it's done regularly. Use Journal Buddy's metrics to find out what days of the week you are most likely to journal and see counts of your entries by month or days of the week.

---
## Screenshots
Metrics - Laptop | Metrics - Responsive | Menu | View Entry
-|-|-|-
<img src='https://user-images.githubusercontent.com/26190276/71314060-a338c880-2407-11ea-87f9-aeef456c6b18.png' width='250' /> | <img src='https://user-images.githubusercontent.com/26190276/71314107-4db0eb80-2408-11ea-95df-18e402742d46.png' width='250' /> | <img src='https://user-images.githubusercontent.com/26190276/71314109-5e616180-2408-11ea-9b36-5abdf8027ed6.png' width='250' /> | <img src='https://user-images.githubusercontent.com/26190276/71314135-a7191a80-2408-11ea-8fc3-6ca7ab2746a7.png' width='250' />

---
## API
The API users bearer authorization so be sure to set the ```Authorization``` header with a JWT provided by the API in all private requests.

Path | Method | Authorization | Description | Params / Body | Success | Failure
-|-|-|-|-|-|-
/api/login | POST | Public | Verifies provided credentials, returns JWT | JSON body with the keys listed in _Object Formats_ below | Status 204 and a JSON body containing a JSON Web Token | Status 400 with a JSON formatted error message containing detail sof the failure |
/api/users | POST | Public | Validates and creates a new user | JSON body with the leys listed in _Object Formats_ below | Status 201 | Status 400 with a JSON formatted error message containing details of the failure | 
/api/journal-entries | POST | Private | Validates and creates a new journal entry | JSON body with the leys listed in _Object Formats_ below | Status 201 and the location header set | Status 400 with a JSON formatted error message containing details of the failure |
/api/journal-entries | GET | Private | Gets journal entries for a user | None - the user id is taken from the auth token provided with the request| Status 200 with a JSON body containing a list of the users entries. See _Object Formats_ below | An empty JSON object | 
/api/journal-entries/:id | GET | Private | Gets a specific journal entry for a user | The user id is taken from the auth token provided with the request, the entry id is provided as the UUID of the entry | Status 200 with a JSON formatted body as specified in _Object Formats_ below | Status 400 with a JSON formatted error message containing the details of the failure |
/api/share/:id | GET | Public | Gets a public entry by id for a user for sharing publicly | Provide the UUID of the entry id as the URL parameter | Status 200 with a JSON formatted body. See _Object Formats_ below | Status 400 with a JSON formatted error message containing the details of the failure |
/api/metrics | GET | Private | Gets the metrics object for a user | The user id is taken from the auth token provided with the request | Status 200 with a JSON formatted body containing the metrics for the user. See _Object Formats_ below | Status 400 with a JSON formatted error message containing the details of the failure |

### Object Formats
** All listed fields for POST end points are required unless otherwise noted

Request body for POST /api/login
```
    {
        user_name: <user name>,
        password: <password>
    }
```

Response body for POST /api/login
```
 {authToken: <JWT>}                 // A JSON Web Token
```

Request body for POST /api/users
```
    {
        user_name: <string>,        // The requested user name
        password: <string>,         // 7 to 19 upper and lower characters, one or more special characters, one or more numbers
        first_name: <string>,       // The first name of the user
        email: <string>             // The user's email address
    }
```

Request body for POST /api/journal-entries
```
    {
        user_id: <number>,          // The user ID of the user. Found in req.userRecord for protected routes
        feeling: <number>,          // A number 1 - 5
        title: <string>,            // OPTIONAL - defaults to `Untitled Entry`
        entry_id: <UUID v4>,        // OPTIONAL
        body: <string>,             // The body of the journal entry
        privacy: <number>           // A number, 0 or 1, mapping to private and public
    }
```

Reponse body for GET /api/journal-entries
```
    [
        {
            id: <number>,               // The internal DB id of the entry
            user_id: <number>,          // The user ID that created the entry
            entry_id: <UUID v4>,        // The UUID representing the entry
            feeling: <number>,          // A number 1 to 5
            title: <string>,            // The title of the journal entry
            body: <string>,             // The body of the journal entry
            privacy: <number>,          // A number, 0 or 1, mapping to private and public
            created: <ISO 8601 date>    // The date the entry was created
        },
        ...
    ]
```

Response body for GET /api/journal-entries/:id
```
    {
        id: <number>,               // The internal DB id of the entry
        user_id: <number>,          // The user ID that created the entry
        entry_id: <UUID v4>,        // The UUID representing the entry
        feeling: <number>,          // A number 1 to 5
        title: <string>,            // The title of the journal entry
        body: <string>,             // The body of the journal entry
        privacy: <number>,          // A number, 0 or 1, mapping to private and public
        created: <ISO 8601 date>    // The date the entry was created
    }
```

Response body for GET /api/share/:id
```
    {
        user: <string>,             // The user first name that created the entry
        title: <string>,            // The title of the journal entry
        body: <string>,             // The body of the journal entry
        created: <ISO 8601 date>    // The date the entry was created
    }
```

Response body for GET /api/metrics
```
{
    total_entries: <number>,            // Total entries for the user
    private_entries: <number>,          // Total private entries for the user
    public_entries: <number>,           // Total public entries fotr the user
    total_by_feeling: {                 // Total entries for each `feeling` value
        1: <number>,
        2: <number>,
        3: <number>,
        4: <number>,
        5: <number>
    },
    total_by_day: {                     // Total entries for each day of the week
        Sunday: <number>,
        Monday: <number>,
        Tuesday: <number>,
        Wednesday: <number>,
        Thursday: <number>,
        Friday: <number>,
        Saturday: <number>
    },
    total_by_month: {                  // Total entries for each month of the year
        January: <number>,
        February: <number>,
        March: <number>,
        April: <number>,
        May: <number>,
        June: <number>,
        July: <number>,
        August: <number>,
        September: <number>,
        October: <number>,
        November: <number>,
        December: <number>
    }
}
```

---
### Tech stack
The API server makes use of:
* JavaScript
* Express.js
* PostgreSQL
* JWT
* CORS
* Morgan
* Helmet
* Knex.js
* Postgrator
* Heroku
* Heroku Postgres
