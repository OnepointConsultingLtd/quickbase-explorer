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
        await configuration.update('realm', realm, vscode.ConfigurationTarget.Global);

        const appId = await vscode.window.showInputBox({ prompt: 'Quickbase application ID.' });
        await configuration.update('applicationId', appId, vscode.ConfigurationTarget.Global);

        // const userToken = await vscode.window.showInputBox({ prompt: 'Quickbase user token.' });
        // await configuration.update('userToken', userToken, vscode.ConfigurationTarget.Global);

        const secretStorage: SecretStorage = context.secrets;
        const userToken: string = await vscode.window.showInputBox({
            password: false,
            title: "User token"
        }) ?? '';

        secretStorage.store("quickbaseApp.conf.userToken", userToken);
    });

    // vscode.commands.registerCommand('quickbase-explorer.configureUserToken', async () => {

    //     const secretStorage: vscode.SecretStorage = context.secrets;
    //     const userToken: string = await vscode.window.showInputBox({
    //         password: true,
    //         title: "User token"
    //     }) ?? '';
    
    //     secretStorage.store("quickbaseApp.conf.userToken", userToken);
    // });
    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }