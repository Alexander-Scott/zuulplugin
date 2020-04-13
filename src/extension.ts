import * as vscode from "vscode";
import { JobHierarchyProvider } from "./providers/job_hierarchy_provider";
import { JobDefinitionparser } from "./job_definition_parser";
import { JobDefinitionProvider } from "./providers/job_definition_provider";
import { JobHoverProvider } from "./providers/job_hover_provider";
import { JobReferencesProvider } from "./providers/job_references_provider";
import { JobManager } from "./job_manager";
import { JobSymbolWorkspaceDefinitionsProvider } from "./providers/job_symbol_workspace_definitions_provider";
import { JobSymbolDocumentDefinitionsProvider } from "./providers/job_symbol_document_definitions_provider";

const job_manager = new JobManager();

export function activate(context: vscode.ExtensionContext) {
	build_job_hierarchy();

	context.subscriptions.push(
		vscode.languages.registerCallHierarchyProvider("yaml", new JobHierarchyProvider(job_manager))
	);
	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider("yaml", new JobDefinitionProvider(job_manager))
	);
	context.subscriptions.push(vscode.languages.registerHoverProvider("yaml", new JobHoverProvider(job_manager)));
	context.subscriptions.push(
		vscode.languages.registerReferenceProvider("yaml", new JobReferencesProvider(job_manager))
	);
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider("yaml", new JobSymbolDocumentDefinitionsProvider(job_manager))
	);
	// Disabled as this doesn't seem to work for now
	// context.subscriptions.push(
	// 	vscode.languages.registerWorkspaceSymbolProvider(new JobSymbolWorkspaceDefinitionsProvider(job_manager))
	// );

	context.subscriptions.push(
		vscode.commands.registerCommand("zuulplugin.rebuild-hierarchy", () => {
			build_job_hierarchy();
		})
	);
}

function build_job_hierarchy() {
	job_manager.remove_all_jobs();
	const workspace = vscode.workspace.workspaceFolders![0];
	if (workspace) {
		vscode.workspace.findFiles(new vscode.RelativePattern(workspace, "**/zuul.d/*.yaml")).then((results) => {
			results.forEach(async (doc_uri) => {
				let document = await vscode.workspace.openTextDocument(doc_uri);
				JobDefinitionparser.parse_job_definitions_in_document(document, job_manager);
				vscode.workspace.onDidSaveTextDocument((doc) => update_job_hierarchy_after_file_changed(doc_uri));
			});
		});
	}
	console.log("Finished building job hierarchy");
}

function update_job_hierarchy_after_file_changed(doc_uri: vscode.Uri) {
	console.log("FILE CHANGED!!! - " + doc_uri);
	// TODO: Only parse the changed file
	build_job_hierarchy();
}
function update_job_hierarchy_after_file_deleted(document: vscode.TextDocument) {
	console.log("FILE DELETED!!! - " + document.uri);
}
function update_job_hierarchy_after_file_renamed(document: vscode.TextDocument) {
	console.log("FILE RENAMED!!! - " + document.uri);
}

// this method is called when your extension is deactivated
export function deactivate() {}
