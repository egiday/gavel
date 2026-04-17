import { Suspense } from "react";
import { CaseCreationForm } from "./form";

export const metadata = {
  title: "File a case",
};

export default function NewCasePage() {
  return (
    <Suspense fallback={null}>
      <CaseCreationForm />
    </Suspense>
  );
}
