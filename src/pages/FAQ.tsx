
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQ() {
  const faqs = [
    {
      question: "How does ChoreChart work?",
      answer: "ChoreChart uses an automated system to distribute chores fairly among roommates. You can create tasks, assign them to household members, and verify completion with photos. The system ensures an even distribution of responsibilities."
    },
    {
      question: "How do I create a household?",
      answer: "You can create a household by clicking the 'Create Household' button after signing in. You'll become the household manager and can invite your roommates using their email addresses."
    },
    {
      question: "Why do I need to upload photos of completed chores?",
      answer: "Photo verification helps ensure accountability and proper task completion. It provides visual confirmation that chores have been done correctly and maintains transparency among roommates."
    },
    {
      question: "Can I customize chore schedules?",
      answer: "Yes! As a household manager, you can create custom chores, set schedules, and adjust assignments based on your household's needs and preferences."
    },
    {
      question: "How is the chore distribution kept fair?",
      answer: "ChoreChart tracks task assignments and completion history to ensure an equitable distribution of responsibilities among all household members over time."
    }
  ];

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
