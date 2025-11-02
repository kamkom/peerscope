import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { MarkdownViewer } from "../../components/MarkdownViewer";
import type { FC } from "react";

interface AnalysisAccordionProps {
  analysisResult: {
    analysis: string;
    objective_evaluation: string;
    generated_summary: string;
  };
}

export const AnalysisAccordion: FC<AnalysisAccordionProps> = ({ analysisResult }) => {
  return (
    <Accordion type="multiple" defaultValue={["generated_summary"]} className="w-full">
      <AccordionItem value="generated_summary">
        <AccordionTrigger>Opis sytuacji</AccordionTrigger>
        <AccordionContent>
          <MarkdownViewer content={analysisResult.generated_summary ?? ""} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="analysis">
        <AccordionTrigger>Analiza mediatora</AccordionTrigger>
        <AccordionContent>
          <MarkdownViewer content={analysisResult.analysis ?? ""} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="objective_evaluation">
        <AccordionTrigger>Ocena obiektywna i rekomendacje</AccordionTrigger>
        <AccordionContent>
          <MarkdownViewer content={analysisResult.objective_evaluation ?? ""} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
