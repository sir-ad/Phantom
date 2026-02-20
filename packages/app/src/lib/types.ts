export interface PhantomArtifact {
    id: string;
    type: 'markdown' | 'mermaid' | 'json' | 'component';
    title: string;
    content: string;
    version: number;
    status: 'draft' | 'synced';
}
