# Quickbase Explorer

Quickbase Explorer is a Visual Studio Code extension that allows you to explore Quickbase databases directly from your editor. It provides a tree view of your Quickbase tables, fields, and relationships, making it easier to navigate and manage your data.

## Features

- **List Application Tables**: View all tables within a Quickbase application.
- **View Table Fields**: Explore fields within each table.
- **Explore Relationships**: Understand relationships between tables.
- **Configure Quickbase Application**: Easily configure your Quickbase realm, application ID, and user token.

## Requirements

- Visual Studio Code version 1.73.0 or higher.
- A Quickbase account with access to the desired application.
- A valid Quickbase user token for authentication.

## Build, Run and Debug

1. **Clone the Repository**: Clone the repository to your local machine.
2. **Install Dependencies**: Run `npm install` to install the necessary dependencies.
3. **Build the Extension**: Use `npm run compile` to build the extension.
4. **Run the Extension**: Press `F5` in Visual Studio Code to start a new Extension Development Host.
5. **Debugging**: Use the built-in debugger in Visual Studio Code to set breakpoints and inspect variables.

## Extension Settings

This extension contributes the following settings:

- `quickbaseApp.conf.realm`: Your Quickbase realm.
- `quickbaseApp.conf.applicationId`: Your Quickbase application ID.
- `quickbaseApp.conf.userToken`: Your Quickbase user token (stored securely).

## Known Issues

- The extension currently does not support multi-factor authentication.
- Error messages from the Quickbase API are not always user-friendly.

## Release Notes

### 0.0.1

- Initial release with basic functionality to explore tables, fields, and relationships.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure that your code follows the existing style and includes tests where applicable.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Quickbase team for their API and documentation.
- Inspired by the need for better database management tools within VS Code.