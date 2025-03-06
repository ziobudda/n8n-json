# n8n-nodes-json-storage

This is an n8n community node for storing and retrieving key-value pairs in a JSON file.

## Features

- Save key-value pairs in a JSON file
- Read values by key from the JSON file
- Values are stored in base64 format for security
- Simple and easy to use
- Custom file path support
- Consistent JSON output format

## Operations

### Save

Saves a key-value pair to the JSON file. If the key already exists, its value will be updated.

Parameters:
- **Key**: The key to save
- **Value**: The value to save
- **File Path**: Full path to the JSON file where data will be stored

Output format:
```json
{
  "success": true,
  "key": "your-key",
  "value": "your-value"
}
```

### Read

Reads a value by key from the JSON file.

Parameters:
- **Key**: The key to retrieve
- **File Path**: Full path to the JSON file where data is stored

Output format (key found):
```json
{
  "success": true,
  "key": "your-key",
  "value": "stored-value"
}
```

Output format (key not found):
```json
{
  "success": false,
  "key": "your-key",
  "value": ""
}
```

## Installation

Follow these steps to install this node in your n8n instance:

1. Go to the directory of your n8n installation
2. Run the following command:
   ```
   npm install n8n-nodes-json-storage
   ```
3. Restart n8n

## Usage Examples

### Save a value

1. Create a new workflow
2. Add a "JSON Storage" node
3. Select the "Save" operation
4. Enter a key and a value
5. Configure the file path (default is `[working-directory]/data/custom_json.json`)
6. Execute the node

### Read a value

1. Create a new workflow
2. Add a "JSON Storage" node
3. Select the "Read" operation
4. Enter the key to retrieve
5. Ensure the file path matches the one used for saving
6. Execute the node

## Notes

- By default, data is stored in a "data" directory in your specified path
- Directories will be created automatically if they don't exist
- Values are encoded in base64 before saving to the file
- The operation will fail if the JSON file exists but has invalid format

## Developer Notes

### Managing the "this" context in JavaScript

When developing n8n nodes, it's important to understand how the `this` context works in JavaScript. 

#### Problem

The error `this.someMethod is not a function` typically occurs when a method loses its binding to the class instance. This happens in the following scenarios:

1. When methods are passed as callbacks
2. When methods are called from a different context
3. When using separated method implementations that rely on the class context

#### Solutions

There are several ways to solve this issue:

1. **Inline implementation**: Define the logic directly in the main method (like we did in v0.1.4)
   ```javascript
   async execute() {
     // Implement logic directly here instead of in separate methods
   }
   ```

2. **Bind methods in constructor**:
   ```javascript
   constructor() {
     this.saveOperation = this.saveOperation.bind(this);
     this.readOperation = this.readOperation.bind(this);
   }
   ```

3. **Use arrow functions** (which preserve the lexical `this`):
   ```javascript
   saveOperation = async (items, returnData, storage, filePath) => {
     // Method implementation
   }
   ```

4. **Pass `this` explicitly**:
   ```javascript
   await this.saveOperation.call(this, items, returnData, storage, filePath);
   ```

For n8n nodes, the safest approach is either using inline implementations or explicitly binding methods in the constructor.

## Version History

- 0.1.6 - Standardized JSON output format for both save and read operations
- 0.1.5 - Simplified read output when key is not found
- 0.1.4 - Fixed "this.readOperation is not a function" error by implementing functions inline
- 0.1.3 - Added custom file path support, automatic directory creation
- 0.1.2 - Added working directory and home directory information
- 0.1.1 - Fixed compatibility issues
- 0.1.0 - Initial release
