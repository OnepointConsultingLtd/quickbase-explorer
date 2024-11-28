/*
 * Created Date: Saturday November 26th 2022
 * Author: Allan Schweitz
 * -----
 * Last Modified: Sunday, 2022-11-27 15:36
 * Modified By: Allan Schweitz
 * -----
 * Copyright (c) 2022 Onepoint
 */
import * as vscode from 'vscode';
import * as path from 'path';
import fetch from 'node-fetch';
import { SecretStorage } from 'vscode';

export class QuickbaseTablesProvider implements vscode.TreeDataProvider<Entry> {

    realm: string = vscode.workspace.getConfiguration('quickbaseApp.conf').get("realm");
    applicationId: string = vscode.workspace.getConfiguration('quickbaseApp.conf').get("applicationId");

    constructor(private secretStorage: SecretStorage) { }

    getTreeItem(element: Entry): vscode.TreeItem {
        return element;
    }

    getChildren(e?: Entry): Thenable<Entry[]> {
        if (e) {
            if (e.type === "tables") {
                return this.getTableEntries(e);
            }
            else if (e.type === "fields") {
                return this.getTableFields(e);
            }
            else if (e.type === "relationships") {
                return this.getTableRelationships(e);
            }
            else if (e.type === "field") {
                return this.getFieldProperties(e);
            }

        }
        else {
            return this.getApplicationTables();

        }
        return Promise.resolve([]);
        // if (!this.workspaceRoot) {
        //   vscode.window.showInformationMessage('No dependency in empty workspace');
        //   return Promise.resolve([]);
        // }
    }

    private async getTableEntries(table: Entry): Promise<Entry[]> {
        console.log("Calling table entries!");
        let ee: Entry[] = [new Entry("Fields", vscode.TreeItemCollapsibleState.Collapsed, "fields", "fields", table.tableId), new Entry("Relationships", vscode.TreeItemCollapsibleState.Collapsed, "relationships", "relationships", table.tableId)];
        //return new Promise(() => {return ee;});
        return Promise.resolve(ee);
    }

    private async getTableRelationships(table: Entry): Promise<Entry[]> {
        const url: string = `https://api.quickbase.com/v1/tables/${table.id}/relationships?skip=0`;
        const userToken: string = await this.secretStorage.get("quickbaseApp.conf.userToken") ?? '';
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "QB-Realm-Hostname": this.realm,
                    "Authorization": `QB-USER-TOKEN ${userToken}`,
                    "Content-Type": "application/json",
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching relationships: ${response.statusText}`);
            }

            const body = await response.json();
            console.log("Relationships JSON: ", body);
            return [];
        } catch (err) {
            console.error("Failed to fetch relationships:", err);
            return [];
        }
    }

    private async getTableFields(table: Entry): Promise<Entry[]> {
        const url: string = "https://api.quickbase.com/v1/fields?tableId=" + table.tableId + "&includeFieldPerms=false";
        console.log("Item: ", JSON.stringify(table));
        console.log("Get field at: ", url);
        const userToken: string = await this.secretStorage.get("quickbaseApp.conf.userToken");
        let res: string = await fetch(url, {
            "method": "GET",
            "headers": {
                "QB-Realm-Hostname": this.realm,
                "Authorization": "QB-USER-TOKEN " + userToken,
                "Content-Type": "application/json",
                'Accept': 'application/json'
            }
        }).then(response => response.text())
            .then(body => {
                console.log("Fields JSON: " + body);
                return body;
            }
            ).catch(err => {
                console.log(err);
                return "";
            });
        let jsonFields: any[] = JSON.parse(res);
        let fields: Entry[] = [];
        jsonFields.forEach(f => {
            const contextValue = f.mode === "formula" ? "formulaField" : "field";
            fields.push(new Entry(f.label, vscode.TreeItemCollapsibleState.Collapsed, "field", f.id, table.tableId, contextValue));
            console.log(f.label);
        });
        return fields;
    }

    private async getFieldProperties(field: Entry): Promise<Entry[]> {
        console.log("Fetch field!");

        const userToken: string = await this.secretStorage.get("quickbaseApp.conf.userToken");
        let res: string = await fetch("https://api.quickbase.com/v1/fields/" + field.objectId + "?tableId=" + field.tableId + "&includeFieldPerms=false", {
            "method": "GET",
            "headers": {
                "QB-Realm-Hostname": this.realm,
                "Authorization": "QB-USER-TOKEN " + userToken,
                "Content-Type": "application/json",
                'Accept': 'application/json'
            }
        }).then(response => response.text())
            .then(body => {
                console.log("Field JSON: " + body);
                return body;
            }
            ).catch(err => {
                console.log(err);
                return "";
            });
        let jsonProperties: any = JSON.parse(res);
        let properties: Entry[] = [];
        //jsonProperties.forEach(t => {
        properties.push(new Entry("id: " + jsonProperties.id, vscode.TreeItemCollapsibleState.None, "property"));
        properties.push(new Entry("label: " + jsonProperties.label, vscode.TreeItemCollapsibleState.None, "property"));
        properties.push(new Entry("fieldType: " + jsonProperties.fieldType, vscode.TreeItemCollapsibleState.None, "property"));
        properties.push(new Entry("mode: " + jsonProperties.mode, vscode.TreeItemCollapsibleState.None, "property"));
        properties.push(new Entry("required: " + jsonProperties.required, vscode.TreeItemCollapsibleState.None, "property"));
        properties.push(new Entry("unique: " + jsonProperties.unique, vscode.TreeItemCollapsibleState.None, "property"));
        //console.log(t.name);
        //});

        //https://api.quickbase.com/v1/fields/{fieldId}?tableId={tableId}&includeFieldPerms={includeFieldPerms}'
        return Promise.resolve(properties);
    }

    private async getApplicationTables(): Promise<Entry[]> {
        console.log("Fetch tables!");
        console.log("Realm: " + this.realm);
        console.log("Application ID: " + this.applicationId);
        //console.log("User token: " + await this.secretStorage.get("quickbaseApp.conf.userToken"));
        //return await this.secretStorage.get("fancycolor_token")
        const userToken: string = await this.secretStorage.get("quickbaseApp.conf.userToken");
        let res: string = await fetch("https://api.quickbase.com/v1/tables?appId=" + this.applicationId, {
            "method": "GET",
            "headers": {
                "QB-Realm-Hostname": this.realm,
                "Authorization": "QB-USER-TOKEN " + userToken,
                "Content-Type": "application/json",
                'Accept': 'application/json'
            }
        }).then(response => response.text())
            .then(body => {
                console.log("Table JSON: " + body);
                return body;
            }
            ).catch(err => {
                console.log(err);
                return "";
            });
        let jsonTables: any[] = JSON.parse(res);
        let tables: Entry[] = [];
        jsonTables.forEach(t => {
            tables.push(new Entry(t.name, vscode.TreeItemCollapsibleState.Collapsed, "tables", t.id, t.id));
            console.log(t.name);
        });
        return tables;
    }
}


class Entry extends vscode.TreeItem {

    constructor(
        public readonly name: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: string,
        public readonly objectId?: string,
        public readonly tableId?: string,
        contextValue?: string
    ) {
        super(name, collapsibleState);
        this.tooltip = `${this.label}-${this.id}`;
        this.description = this.objectId;
        this.contextValue = contextValue || type;
        if (type !== "property") {
            this.iconPath = {
                light: path.join(__filename, '..', '..', 'resources', 'light', this.type + '.png'),
                dark: path.join(__filename, '..', '..', 'resources', 'dark', this.type + '.png')
            };
        }
    }

    iconPath;
}

class TablesEntry extends Entry {
}

class RelationShipsEntry extends Entry {
}