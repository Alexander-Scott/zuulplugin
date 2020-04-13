import * as vscode from "vscode";
import { JobParser } from "./job_parser";
import { JobManager } from "./job_manager";

export class JobHoverProvider implements vscode.HoverProvider {
	private job_manager = new JobManager();

	constructor(job_manager: JobManager) {
		this.job_manager = job_manager;
	}
	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Hover> {
		let range = document.getWordRangeAtPosition(position);
		if (range) {
			// Make sure we are at a parent
			let job = new JobParser().parse_job_from_line_number(document, position.line);
			if (job) {
				let markdown = new vscode.MarkdownString();
				job.job_attributes.forEach((attribute) => {
					markdown.appendMarkdown(attribute.attribute_key + ":" + attribute.attribute_value + "\n");
				});
				return new vscode.Hover(markdown);
			}
		}
		return undefined;
	}
}