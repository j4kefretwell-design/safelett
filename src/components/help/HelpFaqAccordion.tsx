"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How do I add a new property?",
    answer:
      "Click Add Property in the sidebar menu and fill in the property details.",
  },
  {
    question: "How do email alerts work?",
    answer:
      "Alerts are sent automatically to your registered email address 60, 30 and 7 days before a certificate expires.",
  },
  {
    question: "Can I share compliance information with my landlord clients?",
    answer:
      "Yes. On any property page click Share with Landlord to generate a unique read-only link.",
  },
  {
    question: "How do I add a contractor?",
    answer:
      "Go to the Contractors section in the sidebar. Add their details and select which certificate types they handle.",
  },
  {
    question: "Can I import multiple properties at once?",
    answer:
      "Yes. Use the Bulk Import feature in the sidebar to upload a CSV file with all your properties.",
  },
  {
    question: "What happens when a certificate expires?",
    answer:
      "The property is marked Overdue on your dashboard and reminders page. You will also receive an email alert.",
  },
  {
    question: "How do I generate a compliance report?",
    answer:
      "Click Generate Annual Report on the dashboard to download a professional PDF report of your entire portfolio.",
  },
  {
    question: "Can I edit a certificate after adding it?",
    answer:
      "Yes. On the property page click Edit next to any certificate to update the details.",
  },
] as const;

export default function HelpFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gold/40 border-y border-gold/40">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 py-5 text-left transition hover:text-raspberry"
            >
              <span className="font-serif text-lg tracking-wide text-text">
                {item.question}
              </span>
              <ChevronDown
                className={`mt-1 h-4 w-4 shrink-0 text-leather transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <p className="pb-5 text-base leading-relaxed text-leather">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
