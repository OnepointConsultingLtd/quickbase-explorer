/*
 * Created Date: Tuesday November 22nd 2022
 * Author: Allan Schweitz
 * -----
 * Last Modified: Sunday, 2022-11-27 12:01
 * Modified By: Allan Schweitz
 * -----
 * Copyright (c) 2022 Onepoint
 */
import * as vscode from 'vscode';
import { SecretStorage } from 'vscode';
import { QuickbaseTablesProvider } from './QuickbaseTablesProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "quickbase-explorer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('quickbase-explorer.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Quickbase Explorer loaded');

        // vscode.window.createTreeView('nodeDependencies', {
        //     treeDataProvider: new NodeDependenciesProvider(rootPath)
        //   });
    });
    const rootPath =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;
    vscode.window.registerTreeDataProvider(
        'quickbaseTables',
        new QuickbaseTablesProvider(context.secrets)
    );

    vscode.commands.registerCommand('quickbase-explorer.configureQuickbaseApp', async () => {
        const configuration = vscode.workspace.getConfiguration('quickbaseApp.conf');

        const realm = await vscode.window.showInputBox({ prompt: 'Quickbase realm host name.' });
        if (realm) {
            await configuration.update('realm', realm, vscode.ConfigurationTarget.Global);
        }

        const appId = await vscode.window.showInputBox({ prompt: 'Quickbase application ID.' });
        if (appId) {
            await configuration.update('applicationId', appId, vscode.ConfigurationTarget.Global);
        }

        const secretStorage: SecretStorage = context.secrets;
        const userToken: string = await vscode.window.showInputBox({
            password: false,
            title: "User token"
        }) ?? '';

        if (userToken) {
            secretStorage.store("quickbaseApp.conf.userToken", userToken);
        }
    });

    vscode.commands.registerCommand('quickbase-explorer.editField', (field: Entry) => {
        vscode.window.showInputBox({ prompt: `Edit Field: ${field.name}`, value: field.description })
            .then(newValue => {
                if (newValue !== undefined) {
                    // Implement the logic to update the field with newValue
                    vscode.window.showInformationMessage(`Field ${field.name} updated to ${newValue}`);
                }
            });
    });

    vscode.commands.registerCommand('quickbase-explorer.editFormulaField', async (field: Entry) => {
        if (field.type === "field" && field.contextValue === "formulaField") {
            const userToken: string = await context.secrets.get("quickbaseApp.conf.userToken") ?? '';
            const url = `https://api.quickbase.com/v1/fields/${field.objectId}?tableId=${field.tableId}`;

            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "QB-Realm-Hostname": vscode.workspace.getConfiguration('quickbaseApp.conf').get("realm"),
                        "Authorization": `QB-USER-TOKEN ${userToken}`,
                        "Content-Type": "application/json",
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error fetching formula: ${response.statusText}`);
                }

                const fieldData = await response.json();
                console.log("Field Data:", JSON.stringify(fieldData, null, 2));

                const formulaText = fieldData.properties?.formula;

                if (formulaText) {
                    // Create a URI for the untitled document with the desired name
                    const documentUri = vscode.Uri.parse(`untitled:${field.name} (formula).txt`);
                    
                    // Create and show the document
                    const document = await vscode.workspace.openTextDocument(documentUri);
                    const editor = await vscode.window.showTextDocument(document, { 
                        preview: false, 
                        viewColumn: vscode.ViewColumn.One 
                    });
                    
                    // Insert the formula text and set the language
                    await editor.edit(editBuilder => {
                        editBuilder.insert(new vscode.Position(0, 0), formulaText);
                    });
                    
                    // Set the language mode to quickbase-formula
                    await vscode.languages.setTextDocumentLanguage(document, 'quickbase-formula');
                } else {
                    vscode.window.showErrorMessage("Formula text is empty or not found.");
                }

            } catch (err) {
                vscode.window.showErrorMessage(`Failed to fetch formula: ${err.message}`);
            }
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }