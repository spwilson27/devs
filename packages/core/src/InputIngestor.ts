import type { StateRepository } from "./persistence/state_repository.js";

export interface IngestOptions {
  projectName: string;
  brief?: string;
  userJourneys?: string | object;
}

export class InputIngestor {
  private repo: StateRepository;

  constructor(repo: StateRepository) {
    this.repo = repo;
  }

  /**
   * Ingests an initial project brief and user journeys into the Flight Recorder.
   * Creates or updates the project and writes the brief + journeys as documents.
   */
  ingest(opts: IngestOptions): number {
    const projectId = this.repo.upsertProject({ name: opts.projectName });

    if (opts.brief) {
      this.repo.addDocument({
        project_id: projectId,
        name: "Project Brief",
        content: String(opts.brief),
      });
    }

    if (opts.userJourneys !== undefined) {
      const content =
        typeof opts.userJourneys === "string"
          ? opts.userJourneys
          : JSON.stringify(opts.userJourneys, null, 2);

      this.repo.addDocument({
        project_id: projectId,
        name: "User Journeys",
        content,
      });
    }

    return projectId;
  }
}
