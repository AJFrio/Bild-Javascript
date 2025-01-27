# Bild JavaScript API Client

## Work in progress

This project is a JavaScript client for interacting with the Bild API. It allows you to manage users, projects, files, and generate file formats like STL and STEP.

## Features

- Authenticate using an API key
- Manage users and projects
- Retrieve files and metadata
- Generate STL and STEP file formats

## Prerequisites

- Node.js installed on your machine
- An API key from Bild

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AJFrio/Bild-Javascript.git
   cd Bild-Javascript
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Configuration

Set your Bild API key in the environment variables. You can do this by creating a `.env` file in the root directory of the project:

```
BILD_API_KEY=your_api_key_here
```

Alternatively, you can pass the API key directly to the `Bild` class constructor.

## Usage

Here's a basic example of how to use the Bild client:

```javascript
const Bild = require('./bild');

const bildClient = new Bild(); // Uses API key from environment variables

async function main() {
  try {
    const users = await bildClient.getAllUsers();
    console.log(users);
  } catch (error) {
    console.error(error.message);
  }
}

main();
```

## Methods

- `getAllUsers()`: Retrieve all users.
- `addUsersToBild(emails, role, projects)`: Add users to Bild.
- `getAllProjects()`: Retrieve all projects.
- `getAllFiles(projectId)`: Retrieve all files in a project.
- `generateSTL(projectId, branchId, fileId, fileVersion)`: Generate an STL file.
- `generateSTEP(projectId, branchId, fileId, fileVersion)`: Generate a STEP file.
- `getAllMetadataFields()`: Retrieve all metadata fields.
- `getMetadataFromFile(projectId, branchId, fileId)`: Retrieve metadata from a file.
- `getLatestFileVersion(projectId, branchId, fileId)`: Retrieve the latest file version.

## Error Handling

The client throws errors for authentication issues, missing paths, and missing tokens. Ensure you handle these errors in your application.

## License

This project is licensed under the MIT License. 
