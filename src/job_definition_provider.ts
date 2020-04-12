import * as vscode from "vscode";
import { JobHierarchyParser } from "./job_hierarchy_parser";
import { JobParser } from "./job_parser";

export class JobDefinitionProvider implements vscode.DefinitionProvider {
	private job_hierarchy_provider = new JobHierarchyParser();

	constructor(parser: JobHierarchyParser) {
		this.job_hierarchy_provider = parser;
	}
	provideDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
		let range = document.getWordRangeAtPosition(position);
		if (range) {
			// Make sure we are at a parent
			let parent_name = new JobParser().parse_parent_name_from_line_number(document, position.line);
			if (parent_name) {
				let parent_job = this.job_hierarchy_provider.getJobManager().get_a_single_job_with_name(parent_name).pop();
				if (parent_job) {
					return new vscode.Location(parent_job.document.uri, parent_job.job_name_location);
				}
			}
		}
		return undefined;
	}
}