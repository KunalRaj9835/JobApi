# User Registration Endpoint

## Endpoint: `/user/register`

### Method: POST

### Description:
Registers a new user by creating a user account with provided information.

### Request Body:
The request body should be a JSON object with the following fields:

- `fullname`: An object containing:
  - `firstname`: A string with a minimum length of 3 characters (required).
  - `lastname`: A string with a minimum length of 3 characters (optional).
- `email`: A string representing the user's email address with a minimum length of 5 characters (required).
- `password`: A string with a minimum length of 6 characters (required).

### Example:

- `user`:(object):
  - `fullname`: (object).
    - `firstname`: ( string,required ): A string with a minimum length of 3 characters (required).
    - `lastname`: ( string,optional ): A string with a minimum length of 3 characters (optional).
  - `email`: ( string, required )A string representing the user's email address with a minimum length of 5 characters (required).
  - `password`: ( string,required)A string with a minimum length of 6 characters (required).
- `token`(string): JWT Token

# User Login Endpoint

## Endpoint: `/user/login`

### Method: POST

### Description:
Logs in an existing user by validating their email and password.

### Request Body:
The request body should be a JSON object with the following fields:

- `email`: A string representing the user's email address (required).
- `password`: A string with a minimum length of 6 characters (required).

### Example Response:

- `user`:(object):
  - `fullname`: (object).
    - `firstname`: ( string,required ): A string with a minimum length of 3 characters (required).
    - `lastname`: ( string,optional ): A string with a minimum length of 3 characters (optional).
  - `email`: ( string, required )A string representing the user's email address with a minimum length of 5 characters (required).
  - `password`: ( string,required)A string with a minimum length of 6 characters (required).
- `token`(string): JWT Token

# User Profile Endpoint

## Endpoint: `/user/profile`

### Method: GET

### Description:
Retrieves the profile information of the currently authenticated user.

### Authentication:
Requires a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

### Example Response:
- `user` (object): User object containing user details
  - `fullname`: (object)
    - `firstname`: (string) User's first name
    - `lastname`: (string) User's last name
  - `email`: (string) User's email address

# User Logout Endpoint

## Endpoint: `/user/logout`

### Method: POST

### Description:
Logs out the current user and blacklist the token provided in cookie or header.

### Authentication:
Requires a valid JWT token in the Authorization header or cookie:
`Authorization: Bearer <token>`

# Captain Endpoints

## Captain Registration

### Endpoint: `/captain/register`

#### Method: POST

#### Description:
Registers a new captain with vehicle and license details.

#### Request Body:
-`captain`:(object)
  - `fullname`: (object)
    - `firstname`: (string, required) Minimum 3 characters
    - `lastname`: (string, optional)
  - `email`: (string, required) Valid email address
  - `password`: (string, required) Minimum 6 characters
  - `vehicle`: (object)
    - `color`: (string,required) Minimum 3 characters
    -`capacity`:(number,required) Minimum capacity of 1
    - `vehicleType`: (string, required) Type of vehicle (e.g., "car", "auto")
    - `plate`: (string, required) Minimum 6 characters

#### Example Response:
- `token`: (string) JWT Token
- `captain`: (object) Captain details

## Captain Login

### Endpoint: `/captain/login`

#### Method: POST

#### Description:
Authenticates a captain and provides access token.

#### Request Body:
- `email`: (string, required) Captain's registered email
- `password`: (string, required) Captain's password

#### Example Response:
- `token`: (string) JWT Token
- `captain`: (object) Captain details

## Captain Profile

### Endpoint: `/captain/profile`

#### Method: GET

#### Description:
Retrieves the profile information of the authenticated captain.

#### Authentication:
Requires JWT token in Authorization header:
`Authorization: Bearer <token>`

#### Example Response:
- `captain`: (object)
  - All captain details including vehicle and license information

## Captain Status Update

### Endpoint: `/captain/status`

#### Method: PATCH

#### Description:
Updates the captain's current status.

#### Authentication:
Requires JWT token in Authorization header

#### Request Body:
- `status`: (string, required) New status ("available", "busy", "offline")

#### Example Response:
- `message`: (string) Success message
- `status`: (string) Updated status

## Captain Logout

### Endpoint: `/captain/logout`

#### Method: POST

#### Description:
Logs out the captain and invalidates the current token.

#### Authentication:
Requires JWT token in Authorization header

#### Example Response:
- `message`: (string) Logout confirmation message

# JobApi
