import { HighlightArea } from "@react-pdf-viewer/highlight"

export enum AnnotationType {
    Highlight = "Highlight",
    Underline = "Underline",
    Text = "Text"
}

export type Annotation = {
    id: string;
    type: AnnotationType;
    color: string;
    opacity: number;
    popoverTop: string;
    popoverLeft: string;
    areas: HighlightArea[];
}