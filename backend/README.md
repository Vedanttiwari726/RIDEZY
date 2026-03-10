# /user/register Endpoint Documentation

## Description

The `/user/register` endpoint is used to register new users. It accepts user details and creates a new user in the database.

## HTTP Method

`POST`

## URL

`/user/register`

## Request Body

The endpoint expects a JSON payload with the following fields:

- `fullname`: An object containing:
  - `firstname`: A string with a minimum length of 3 characters.
  - `lastname`: A string with a minimum length of 3 characters.
- `email`: A string representing a valid email address. Minimum length of 5 characters.
- `password`: A string with a minimum length of 6 characters.

### Example Request Body

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "secret123"
}
```

## Responses

### Success Response

- **Status Code:** `201 Created`
- **Description:** User is successfully registered.
- **Response Body:** Contains a JSON object with a JWT token and the registered user information.

```json
{
  "token": "<JWT Token>",
  "user": {
    "_id": "<User ID>",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    // ... other user properties ...
  }
}
```

### Client Error Responses

- **Status Code:** `400 Bad Request`
  - **Description:** Validation error. This error is returned if any of the required fields are missing, if the provided values do not match the expected format, or if the email already exists in the system.
  - **Response Body:** Contains an array of error messages detailing the issues.

```json
{
  "errors": [
    { "msg": "Invalid Email", "param": "email" },
    { "msg": "Password must be at least 6 characters", "param": "password" }
  ]
}
```

### Server Error Response

- **Status Code:** `500 Internal Server Error`
  - **Description:** An unexpected error occurred on the server.

## Additional Notes

- The endpoint utilizes express-validator for input validation.
- Duplicate email entries will result in a `400 Bad Request` with a specific error message.

---

This documentation provides an overview of the `/user/register` endpoint detailing how to properly format requests and what responses to expect based on different inputs.

## /user/login Endpoint Documentation

### Description

The `/user/login` endpoint authenticates existing users and returns a JWT token along with the user information on successful authentication.

### HTTP Method

`POST`

### URL

`/user/login`

### Request Body

The endpoint expects a JSON payload with the following fields:

- `email`: A string representing a valid email address.
- `password`: A string with a minimum length of 6 characters.

### Example Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "secret123"
}
```

### Responses

#### Success Response

- **Status Code:** `200 OK`
- **Description:** Authentication successful.
- **Response Body:** Contains a JSON object with a JWT token and the authenticated user information.

```json
{
  "token": "<JWT Token>",
  "user": {
    "_id": "<User ID>",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    // ... other user properties ...
  }
}
```

#### Client Error Responses

- **Status Code:** `400 Bad Request`
  - **Description:** Validation error. Returned if required fields are missing or invalid.
  - **Response Body:** Contains an array of validation error messages.

```json
{
  "errors": [
    { "msg": "Invalid Email", "param": "email" },
    { "msg": "Password is required", "param": "password" }
  ]
}
```

- **Status Code:** `401 Unauthorized`
  - **Description:** Authentication failed due to incorrect email or password.
  - **Response Body:** Contains an error message indicating invalid credentials.

```json
{
  "errors": [ { "msg": "Invalid email or password" } ]
}
```

#### Server Error Response

- **Status Code:** `500 Internal Server Error`

---

## Driver Routes

This section documents the Driver-related API endpoints. Current routes are mounted under `/driver`.

### POST /driver/register

Registers a new driver along with vehicle details.

HTTP Method: `POST`

URL: `/driver/register`

Request Body

The endpoint expects a JSON payload with the following fields:

- `fullname`: An object containing:
  - `firstname`: string, minimum 3 characters
  - `lastname`: string, minimum 3 characters
- `email`: string, valid email address
- `password`: string, minimum 6 characters
- `vehicle`: An object containing vehicle details:
  - `color`: string, minimum 3 characters
  - `plate`: string, minimum 3 characters
  - `capacity`: integer, minimum 1
  - `vehicleType`: enum — one of `car`, `bike`, or `Auto`

Validation rules are enforced using `express-validator` in `routes/Driver.routes.js`.

Example Request Body

```json
{
  "fullname": { "firstname": "Alice", "lastname": "Smith" },
  "email": "alice.driver@example.com",
  "password": "driverpass",
  "vehicle": {
    "color": "red",
    "plate": "ABC123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

Use the JSON below as a stricter example with inline comments describing validation constraints. (Note: JSON does not officially support comments — comments below are for documentation and use `//` style.)

```json
{
  "fullname": {
    "firstname": "Alice", // string, min length 3
    "lastname": "Smith"   // string, min length 3
  },
  "email": "alice.driver@example.com", // must be a valid email
  "password": "driverpass", // string, min length 5
  "vehicle": {
    "color": "red", // string, min length 3
    "plate": "ABC123", // string, min length 3
    "capacity": 4, // integer, min 1
    "vehicleType": "car" // one of ["car", "bike", "Auto"]
  }
}
```

Example Success Response (201 Created)

```json
{
  "driver": {
    "_id": "<Driver ID>",
    "fullname": {
      "firstname": "Alice",
      "lastname": "Smith"
    },
    "email": "alice.driver@example.com",
    "vehicle": {
      "color": "red",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

Example Validation Error Response (400 Bad Request)

```json
{
  "errors": [
    { "msg": "First name must be at least 3 characters long", "param": "fullname.firstname" },
    { "msg": "Invalid Email", "param": "email" },
    { "msg": "Vehicle type must be car, bike, or Auto", "param": "vehicle.vehicleType" }
  ]
}
```

Success Response

- **Status Code:** `201 Created`
- **Description:** Driver successfully registered.
- **Response Body:** Contains the created driver object (may exclude password/hash depending on model selection).

```json
{
  "driver": {
    "_id": "<Driver ID>",
    "fullname": { "firstname": "Alice", "lastname": "Smith" },
    "email": "alice.driver@example.com",
    "vehicle": { "color": "red", "plate": "ABC123", "capacity": 4, "vehicleType": "car" }
  }
}
```

Client Error Responses

- **Status Code:** `400 Bad Request`
  - **Description:** Validation failed (missing/invalid fields).
  - **Response Body:** Array of validation error objects from `express-validator`.

```json
{
  "errors": [
    { "msg": "Invalid Email", "param": "email" },
    { "msg": "Vehicle type must be car, bike, or Auto", "param": "vehicle.vehicleType" }
  ]
}
```

Server Error Response

- **Status Code:** `500 Internal Server Error`
  - **Description:** An unexpected error occurred on the server while creating the driver.

  - **Description:** An unexpected error occurred on the server.

### Additional Notes

- The endpoint uses `express-validator` for request validation (see `routes/user.route.js`).
- On success the returned `user` object may exclude sensitive fields such as the hashed `password` depending on model selection.

---

## /user/profile Endpoint Documentation

### Description

The `/user/profile` endpoint returns the authenticated user's profile information. It requires a valid JWT (sent as a cookie named `token` or an `Authorization: Bearer <token>` header).

### HTTP Method

`GET`

### URL

`/user/profile`

### Authentication

- Requires authentication. The request must include a valid JWT token either in the `token` cookie or in the `Authorization` header as `Bearer <token>`.

### Responses

#### Success Response

- **Status Code:** `200 OK`
- **Description:** Returns the authenticated user's profile.
- **Response Body:** The `user` object associated with the token.

```json
{
  "_id": "<User ID>",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com"
  // ... other user properties ...
}
```

#### Unauthorized Response

- **Status Code:** `401 Unauthorized` or `400 Bad Request`
- **Description:** Returned when the token is missing, invalid, or blacklisted (e.g., after logout).

```json
{ "message": "Unauthorized" }
```

---

## /user/logout Endpoint Documentation

### Description

The `/user/logout` endpoint logs the user out by clearing the authentication cookie and adding the token to a blacklist so it cannot be reused.

### HTTP Method

`GET`

### URL

`/user/logout`

### Authentication

- Requires authentication. The request must include the active JWT token (cookie or `Authorization` header).

### Behavior

- Clears the `token` cookie from the client.
- Stores the current token in the blacklist to prevent reuse.

### Responses

#### Success Response

- **Status Code:** `200 OK`
- **Description:** Logout successful.
- **Response Body:**

```json
{ "message": "Logged out successfully" }
```

#### Unauthorized Response

- **Status Code:** `401 Unauthorized`
- **Description:** Returned when no valid token was provided or token is already blacklisted.

```json
{ "message": "Unauthorized" }
```

#### Server Error Response

- **Status Code:** `500 Internal Server Error`
- **Description:** An unexpected error occurred while processing the logout request.
 -`user`(object):
 -`fullname` (object).
  -`firstname`(string):User's first name (minimun 3 characters).
  -`lastname`(string):User's last name (minimun 3 characters).
  -`email`(string):User's email address (must be a valid email).

